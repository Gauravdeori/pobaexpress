import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Mail, MapPin, MessageCircle, Phone } from "lucide-react";

import {
  ADDRESS_FULL,
  EMAIL,
  EMAIL_HREF,
  PHONE_DISPLAY,
  PHONE_HREF,
  POLICY_EFFECTIVE_DATE,
  WHATSAPP_DISPLAY,
  whatsappLink,
} from "@/lib/contact";
import { LOGO_SRC, logoRef, onLogoError } from "@/lib/assets";

/** One numbered clause of a policy. */
export function Clause({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-10 first:mt-0">
      <h2 className="text-lg font-semibold text-primary sm:text-xl">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
        {children}
      </div>
    </section>
  );
}

/** Bulleted list inside a clause. */
export function Points({ items }: { items: ReactNode[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3">
          <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

/** Contact block that closes each policy, filled from src/lib/contact.ts. */
export function ContactDetails() {
  return (
    <address className="mt-3 space-y-2 text-sm not-italic text-muted-foreground sm:text-base">
      <p className="font-medium text-primary">Poba Express</p>
      <p className="flex gap-2">
        <MapPin className="mt-0.5 size-4 shrink-0 text-accent" />
        {ADDRESS_FULL}
      </p>
      <p className="flex gap-2">
        <Phone className="mt-0.5 size-4 shrink-0 text-accent" />
        <a href={PHONE_HREF} className="transition-colors hover:text-accent">
          {PHONE_DISPLAY}
        </a>
      </p>
      <p className="flex gap-2">
        <MessageCircle className="mt-0.5 size-4 shrink-0 text-accent" />
        <span>
          <a
            href={whatsappLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-accent"
          >
            {WHATSAPP_DISPLAY}
          </a>{" "}
          <span className="text-muted-foreground/70">(WhatsApp, messages only)</span>
        </span>
      </p>
      <p className="flex gap-2">
        <Mail className="mt-0.5 size-4 shrink-0 text-accent" />
        <a href={EMAIL_HREF} className="transition-colors hover:text-accent">
          {EMAIL}
        </a>
      </p>
    </address>
  );
}

/**
 * Shell for the legal pages. Deliberately plain — no parallax or reveals, so
 * the text is readable and printable, and nothing depends on JavaScript to
 * become visible.
 */
export function LegalLayout({
  title,
  intro,
  children,
}: {
  title: string;
  intro?: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex h-20 max-w-3xl items-center justify-between gap-4 px-5 lg:px-8">
          <Link to="/" className="flex items-center gap-2">
            <img
              ref={logoRef}
              src={LOGO_SRC}
              onError={onLogoError}
              alt="Poba Express"
              className="h-12 w-auto"
            />
          </Link>
          <Link
            to="/"
            className="flex min-h-11 items-center gap-2 text-sm font-medium text-accent transition-opacity hover:opacity-80"
          >
            <ArrowLeft className="size-4" />
            Back to site
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-12 lg:px-8 lg:py-16">
        <h1 className="text-3xl font-bold text-primary sm:text-4xl">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Effective date: {POLICY_EFFECTIVE_DATE}
        </p>
        {intro && (
          <p className="mt-6 text-sm leading-relaxed text-muted-foreground sm:text-base">{intro}</p>
        )}

        <div className="mt-10">{children}</div>

        <div className="mt-14 flex flex-wrap gap-x-6 gap-y-2 border-t border-border pt-6 text-sm">
          <Link to="/privacy" className="text-accent transition-opacity hover:opacity-80">
            Privacy Policy
          </Link>
          <Link to="/terms" className="text-accent transition-opacity hover:opacity-80">
            Terms &amp; Conditions
          </Link>
          <Link to="/refunds" className="text-accent transition-opacity hover:opacity-80">
            Refund &amp; Cancellation Policy
          </Link>
        </div>
      </main>

      <footer className="border-t border-border bg-secondary/40 py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Poba Express. All Rights Reserved.
      </footer>
    </div>
  );
}
