import { createServerFn } from "@tanstack/react-start";

/**
 * Telling the shop an order has arrived, over Telegram.
 *
 * WhatsApp is the customer's channel and always has been, but it only fires
 * when the customer actually sends the message it opened — a tab dismissed,
 * a popup blocked, a phone that rang, and the order sits in Firestore with
 * nobody looking at it. This is the other half: the moment an order is
 * recorded, the shop's Telegram gets it, whatever the customer does next.
 *
 * A server function, not a fetch from the page: the bot token would otherwise
 * be in the browser bundle, and anyone holding a bot token can post to the
 * chat as the shop.
 *
 * Best effort throughout. A notification that fails must never take an order
 * with it — the order is already saved by the time this runs.
 */

export type OrderAlert = {
  customerName: string;
  phone: string;
  address: string;
  locationUrl: string | null;
  category: string;
  lines: string[];
  total: string;
  discountCode: string | null;
  notes: string | null;
  prescriptionUrl: string | null;
};

/** Telegram's HTML mode: these four would otherwise break the message. */
function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function buildMessage(order: OrderAlert): string {
  const rows = [
    `<b>🛵 New ${escapeHtml(order.category)} order</b>`,
    "",
    ...order.lines.map((line) => `• ${escapeHtml(line)}`),
    "",
    `<b>Total: ${escapeHtml(order.total)}</b>`,
  ];
  if (order.discountCode) rows.push(`Code used: ${escapeHtml(order.discountCode)}`);
  rows.push(
    "",
    `👤 ${escapeHtml(order.customerName)}`,
    // Wrapped so a phone number is one tap to call from the Telegram app.
    `📞 <a href="tel:${escapeHtml(order.phone)}">${escapeHtml(order.phone)}</a>`,
    `📍 ${escapeHtml(order.address)}`,
  );
  if (order.locationUrl) rows.push(`🗺 <a href="${escapeHtml(order.locationUrl)}">Map pin</a>`);
  if (order.prescriptionUrl) {
    rows.push(`💊 <a href="${escapeHtml(order.prescriptionUrl)}">Prescription</a>`);
  }
  if (order.notes) rows.push("", `📝 ${escapeHtml(order.notes)}`);
  return rows.join("\n");
}

export const notifyOrder = createServerFn({ method: "POST" })
  .validator((data: OrderAlert) => data)
  .handler(async ({ data }): Promise<{ sent: boolean }> => {
    const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
    const chatId = process.env.TELEGRAM_CHAT_ID?.trim();
    // Unset is a valid state, not a fault: the site worked without this and
    // still does. Say nothing and carry on.
    if (!token || !chatId) return { sent: false };

    try {
      const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        signal: AbortSignal.timeout(6000),
        body: JSON.stringify({
          chat_id: chatId,
          text: buildMessage(data),
          parse_mode: "HTML",
          disable_web_page_preview: true,
        }),
      });
      if (!response.ok) {
        // The body names the real fault — a revoked token, a chat the bot was
        // removed from — and belongs in the server log, never the browser.
        console.error("Telegram rejected the alert", response.status, await response.text());
        return { sent: false };
      }
      return { sent: true };
    } catch (error) {
      console.error("Could not reach Telegram", error);
      return { sent: false };
    }
  });
