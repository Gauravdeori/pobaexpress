/**
 * The bits of Firebase Admin this project actually needs, over REST.
 *
 * Deliberately not the `firebase-admin` package: it pulls in gRPC and protobuf
 * files that a Vite/nitro SSR bundle has to be taught to leave alone, for three
 * calls we can make ourselves. Everything here is WebCrypto and fetch, so it
 * runs unchanged on Node and on an edge runtime.
 *
 * NEVER import this from a component. It reads the service-account key, and
 * anything it touches must stay on the server — server functions import it
 * dynamically inside their handler for exactly that reason.
 */

type ServiceAccount = {
  project_id: string;
  client_email: string;
  private_key: string;
};

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const IDENTITY_AUDIENCE =
  "https://identitytoolkit.googleapis.com/google.identity.identitytoolkit.v1.IdentityToolkit";
const SCOPES = [
  "https://www.googleapis.com/auth/datastore",
  "https://www.googleapis.com/auth/identitytoolkit",
].join(" ");

/** Thrown when the server is missing its credentials, so callers can say so. */
export class NotConfiguredError extends Error {}

let cached: ServiceAccount | null = null;

/**
 * The service account, from `FIREBASE_SERVICE_ACCOUNT`.
 *
 * Accepts the raw JSON from the console or a base64 copy of it, because a
 * private key full of newlines survives some dashboards and not others.
 */
export function serviceAccount(): ServiceAccount {
  if (cached) return cached;

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT?.trim();
  if (!raw) {
    throw new NotConfiguredError("FIREBASE_SERVICE_ACCOUNT is not set");
  }

  const json = raw.startsWith("{") ? raw : Buffer.from(raw, "base64").toString("utf8");
  const parsed = JSON.parse(json) as ServiceAccount;
  if (!parsed.project_id || !parsed.client_email || !parsed.private_key) {
    throw new NotConfiguredError("FIREBASE_SERVICE_ACCOUNT is missing fields");
  }

  // Dashboards that store the key as a single line escape the newlines.
  parsed.private_key = parsed.private_key.replace(/\\n/g, "\n");
  cached = parsed;
  return parsed;
}

function base64url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function encodeSegment(value: object): string {
  return base64url(new TextEncoder().encode(JSON.stringify(value)));
}

function pemToPkcs8(pem: string): ArrayBuffer {
  const body = pem.replace(/-----[A-Z ]+-----/g, "").replace(/\s+/g, "");
  const binary = atob(body);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

async function signJwt(claims: Record<string, unknown>): Promise<string> {
  const account = serviceAccount();
  const unsigned = `${encodeSegment({ alg: "RS256", typ: "JWT" })}.${encodeSegment(claims)}`;

  const key = await crypto.subtle.importKey(
    "pkcs8",
    pemToPkcs8(account.private_key),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    new TextEncoder().encode(unsigned),
  );

  return `${unsigned}.${base64url(new Uint8Array(signature))}`;
}

// Access tokens last an hour; re-minting one per request would add a round trip
// to every code we send.
let accessToken: { value: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (accessToken && accessToken.expiresAt > Date.now() + 60_000) return accessToken.value;

  const account = serviceAccount();
  const now = Math.floor(Date.now() / 1000);
  const assertion = await signJwt({
    iss: account.client_email,
    scope: SCOPES,
    aud: TOKEN_URL,
    iat: now,
    exp: now + 3600,
  });

  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });

  if (!response.ok) {
    throw new Error(`Google token exchange failed: ${response.status} ${await response.text()}`);
  }

  const body = (await response.json()) as { access_token: string; expires_in: number };
  accessToken = { value: body.access_token, expiresAt: Date.now() + body.expires_in * 1000 };
  return accessToken.value;
}

async function googleFetch(url: string, init: RequestInit = {}): Promise<Response> {
  const token = await getAccessToken();
  return fetch(url, {
    ...init,
    headers: {
      ...init.headers,
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
  });
}

/* ------------------------------------------------------------- accounts --- */

/**
 * The Firebase user for an email, created on first sign-in.
 *
 * Looked up by email rather than minted fresh every time, so someone who
 * already has a password or Google account on this address signs into that
 * same account instead of quietly acquiring a second one.
 */
export async function findOrCreateUser(email: string, displayName: string): Promise<string> {
  const { project_id: projectId } = serviceAccount();
  const base = `https://identitytoolkit.googleapis.com/v1/projects/${projectId}/accounts`;

  const lookup = await googleFetch(`${base}:lookup`, {
    method: "POST",
    body: JSON.stringify({ email: [email] }),
  });
  if (!lookup.ok) throw new Error(`Account lookup failed: ${await lookup.text()}`);

  const found = (await lookup.json()) as {
    users?: Array<{ localId: string; displayName?: string }>;
  };
  const existing = found.users?.[0];

  if (existing) {
    // The code proved the address, so mark it verified. Only fill the name in
    // if the account hasn't got one — this must not overwrite a name the
    // customer set themselves.
    const patch: Record<string, unknown> = { localId: existing.localId, emailVerified: true };
    if (!existing.displayName && displayName) patch.displayName = displayName;
    await googleFetch(`${base}:update`, { method: "POST", body: JSON.stringify(patch) });
    return existing.localId;
  }

  const created = await googleFetch(base, {
    method: "POST",
    body: JSON.stringify({ email, displayName, emailVerified: true }),
  });
  if (!created.ok) throw new Error(`Account create failed: ${await created.text()}`);

  const { localId } = (await created.json()) as { localId: string };
  return localId;
}

/** A one-hour token the browser swaps for a real session via `signInWithCustomToken`. */
export async function createCustomToken(uid: string): Promise<string> {
  const account = serviceAccount();
  const now = Math.floor(Date.now() / 1000);
  return signJwt({
    iss: account.client_email,
    sub: account.client_email,
    aud: IDENTITY_AUDIENCE,
    iat: now,
    exp: now + 3600,
    uid,
  });
}

/* ------------------------------------------------------------ firestore --- */

type FirestoreValue = { stringValue: string } | { integerValue: string } | { nullValue: null };

export type CodeRecord = {
  hash: string;
  name: string;
  email: string;
  expiresAt: number;
  sentAt: number;
  attempts: number;
};

function documentUrl(id: string): string {
  const { project_id: projectId } = serviceAccount();
  return `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/emailCodes/${id}`;
}

export async function readCode(id: string): Promise<CodeRecord | null> {
  const response = await googleFetch(documentUrl(id));
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Code read failed: ${await response.text()}`);

  const { fields } = (await response.json()) as { fields?: Record<string, FirestoreValue> };
  if (!fields) return null;

  const text = (key: string) => {
    const field = fields[key];
    return field && "stringValue" in field ? field.stringValue : "";
  };
  const number = (key: string) => {
    const field = fields[key];
    return field && "integerValue" in field ? Number(field.integerValue) : 0;
  };

  return {
    hash: text("hash"),
    name: text("name"),
    email: text("email"),
    expiresAt: number("expiresAt"),
    sentAt: number("sentAt"),
    attempts: number("attempts"),
  };
}

export async function writeCode(id: string, record: CodeRecord): Promise<void> {
  const response = await googleFetch(documentUrl(id), {
    method: "PATCH",
    body: JSON.stringify({
      fields: {
        hash: { stringValue: record.hash },
        name: { stringValue: record.name },
        email: { stringValue: record.email },
        expiresAt: { integerValue: String(record.expiresAt) },
        sentAt: { integerValue: String(record.sentAt) },
        attempts: { integerValue: String(record.attempts) },
      },
    }),
  });
  if (!response.ok) throw new Error(`Code write failed: ${await response.text()}`);
}

export async function deleteCode(id: string): Promise<void> {
  await googleFetch(documentUrl(id), { method: "DELETE" });
}
