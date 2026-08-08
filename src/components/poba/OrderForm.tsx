import { useEffect, useState, type FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  UtensilsCrossed,
  Pill,
  Cake,
  Clock,
  Minus,
  Paperclip,
  Plus,
  Send,
  Store,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { whatsappLink } from "@/lib/contact";
import {
  deliveryFee,
  getMenu,
  getMenuSections,
  itemLabel,
  rupees,
  type MenuItem,
} from "@/lib/menu";
import { isFirebaseConfigured } from "@/lib/firebase";
import { accountLabel, useAccount, saveProfile } from "@/lib/account";
import { LAUNCH_DATE_LABEL, useLaunched } from "@/lib/launch";
import { recordOrder, type OrderLine } from "@/lib/orders";
import { uploadPrescription } from "@/lib/uploads";
import { Reveal, SectionHeading } from "./Reveal";

/** Anything bigger than this is likely a mistake and won't share cleanly. */
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

/** One row of the price list. Tapping anywhere on the name adds one. */
function MenuItemCard({
  item,
  quantity,
  onChange,
}: {
  item: MenuItem;
  quantity: number;
  onChange: (quantity: number) => void;
}) {
  return (
    <li>
      <div
        className={cn(
          "flex items-center gap-3 rounded-2xl border p-3 transition-colors duration-200",
          quantity ? "border-accent bg-accent/5" : "border-border bg-background",
        )}
      >
        <button
          type="button"
          onClick={() => onChange(quantity + 1)}
          className="min-w-0 flex-1 text-left flex items-center gap-3"
          aria-label={`Add ${itemLabel(item)}, ${rupees(item.price)}`}
        >
          {item.image && (
            <img
              src={item.image}
              alt={item.name}
              className="size-12 shrink-0 rounded-lg object-cover shadow-sm"
            />
          )}
          <div className="min-w-0">
            <span className="block truncate text-sm font-medium text-primary">{item.name}</span>
            <span className="block truncate text-xs text-muted-foreground">
              {item.variant ? `${item.variant} · ` : ""}
              {rupees(item.price)}
            </span>
          </div>
        </button>

        {quantity > 0 ? (
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={() => onChange(quantity - 1)}
              aria-label={`Remove one ${itemLabel(item)}`}
              className="flex size-11 items-center justify-center rounded-full border border-border bg-background text-primary transition-colors hover:border-accent sm:size-9"
            >
              <Minus className="size-4" />
            </button>
            <span aria-live="polite" className="w-6 text-center text-sm font-semibold text-primary">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => onChange(quantity + 1)}
              aria-label={`Add one more ${itemLabel(item)}`}
              className="flex size-11 items-center justify-center rounded-full bg-gradient-accent text-accent-foreground sm:size-9"
            >
              <Plus className="size-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onChange(1)}
            aria-label={`Add ${itemLabel(item)}`}
            className="flex size-11 shrink-0 items-center justify-center rounded-full border border-border bg-background text-primary transition-colors hover:border-accent hover:text-accent sm:size-9"
          >
            <Plus className="size-4" />
          </button>
        )}
      </div>
    </li>
  );
}

const categories = [
  {
    id: "food",
    label: "Food",
    icon: UtensilsCrossed,
    hint: "Anything else you need from the kitchen",
  },
  {
    id: "cake",
    label: "Cake",
    icon: Cake,
    hint: "e.g. write 'Happy Birthday Ritu' on top, eggless",
  },
  { id: "medicine", label: "Medicine", icon: Pill, hint: "e.g. Paracetamol 650mg — 1 strip" },
] as const;

type CategoryId = (typeof categories)[number]["id"];

export function OrderForm() {
  const [category, setCategory] = useState<CategoryId>("food");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [items, setItems] = useState("");
  const [notes, setNotes] = useState("");
  const [prescription, setPrescription] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const { user, profile } = useAccount();
  const launched = useLaunched();

  const active = categories.find((c) => c.id === category)!;
  const menu = getMenu(category);
  const sections = getMenuSections(category);
  const fee = deliveryFee(category);

  const picked = (menu ?? []).filter((item) => cart[item.id] > 0);
  const subtotal = picked.reduce((sum, item) => sum + item.price * cart[item.id], 0);
  const total = subtotal + fee;

  // Honours ?category=cake, which is how the installed app's home-screen
  // shortcuts jump straight to the right menu. Read on the client only, so the
  // server-rendered markup stays identical for every visitor.
  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get("category");
    if (categories.some((c) => c.id === requested)) setCategory(requested as CategoryId);
  }, []);

  // Prefill from the saved profile, but never overwrite something already
  // typed — the profile can arrive after the customer has started filling in.
  useEffect(() => {
    if (!profile) return;
    if (profile.fullName) setName((current) => current || profile.fullName!);
    if (profile.phone) setPhone((current) => current || profile.phone!);
    if (profile.address) setLocation((current) => current || profile.address!);
  }, [profile]);

  // Object URLs leak until revoked, so tie each one to the file it previews.
  useEffect(() => {
    if (!prescription || !prescription.type.startsWith("image/")) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(prescription);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [prescription]);

  const attachPrescription = (file: File | null) => {
    if (file && file.size > MAX_UPLOAD_BYTES) {
      setError("That file is over 10 MB. Please pick a smaller photo.");
      return;
    }
    setPrescription(file);
    setError(null);
  };

  // Any edit clears a stale validation message so it can't linger after a fix.
  const bind = (set: (value: string) => void) => (value: string) => {
    set(value);
    setError(null);
  };

  // Menus differ per category, so a half-built basket must not survive a switch.
  const pickCategory = (id: CategoryId) => {
    setCategory(id);
    setCart({});
    setError(null);
  };

  const setQuantity = (id: string, quantity: number) => {
    setCart((current) => {
      const next = { ...current };
      if (quantity > 0) next[id] = quantity;
      else delete next[id];
      return next;
    });
    setError(null);
  };

  const handleOrder = async (event: FormEvent) => {
    event.preventDefault();

    // The button is disabled before launch; this guards the Enter key and any
    // other route to submit.
    if (!launched) {
      setError(`Ordering opens on ${LAUNCH_DATE_LABEL}. Browse the menu in the meantime.`);
      return;
    }

    if (!user) {
      setError(
        "You must be signed in to place an order. Please use the Sign in button at the top.",
      );
      return;
    }

    if (!name.trim() || !phone.trim() || !location.trim()) {
      setError("Please fill in your name, phone number and delivery location.");
      return;
    }
    if (phone.replace(/\D/g, "").length < 10) {
      setError("Please enter a valid phone number so we can confirm your order.");
      return;
    }
    // With a menu on screen, either a tapped item or a written request will do.
    if (!picked.length && !items.trim()) {
      setError(
        menu
          ? "Please pick at least one item from the menu, or write what you need."
          : "Please tell us what you need.",
      );
      return;
    }
    setError(null);

    const buildMessage = (prescriptionLine: string | null) => {
      const lines = [
        "*New Order — Poba Express*",
        "",
        `*Category:* ${active.label}`,
        `*Name:* ${name.trim()}`,
        `*Phone:* ${phone.trim()}`,
        `*Delivery location:* ${location.trim()}`,
      ];

      if (picked.length) {
        lines.push("", "*Items:*");
        for (const item of picked) {
          lines.push(
            `• ${itemLabel(item)} x${cart[item.id]} — ${rupees(item.price * cart[item.id])}`,
          );
        }
        lines.push(
          "",
          `*Subtotal:* ${rupees(subtotal)}`,
          `*Delivery:* ${rupees(fee)}`,
          `*Total:* ${rupees(total)}`,
        );
      }
      // Without a basket the free text is the whole order, not an addition to it.
      if (items.trim()) {
        lines.push("", `*${picked.length ? "Also needed" : "Order details"}:* ${items.trim()}`);
      }
      if (!picked.length) lines.push("", `*Delivery:* ${rupees(fee)} flat`);
      if (notes.trim()) lines.push("", `*Extra notes:* ${notes.trim()}`);
      if (prescriptionLine) lines.push("", prescriptionLine);
      return lines.join("\n");
    };

    const uid = user?.uid ?? null;
    const orderLines: OrderLine[] = picked.map((item) => ({
      id: item.id,
      label: itemLabel(item),
      quantity: cart[item.id],
      price: item.price,
    }));

    /** Best-effort record keeping. Never blocks or fails the order. */
    const persist = async (upload: { publicId: string; url: string } | null) => {
      await recordOrder(
        {
          category,
          customerName: name.trim(),
          phone: phone.trim(),
          address: location.trim(),
          lines: orderLines,
          subtotal,
          deliveryFee: fee,
          total,
          extraRequest: items.trim() || null,
          notes: notes.trim() || null,
          prescriptionId: upload?.publicId ?? null,
          prescriptionUrl: upload?.url ?? null,
        },
        uid,
      );
      if (uid) {
        await saveProfile(uid, {
          fullName: name.trim(),
          phone: phone.trim(),
          address: location.trim(),
        });
      }
    };

    // Every order goes to the one number in src/lib/contact.ts. This used to
    // hand the prescription to navigator.share() instead, which opens the OS
    // share sheet with no recipient — the customer picked both the app and the
    // contact, so an order could land anywhere. The photo travels as an
    // uploaded link now, so the wa.me link is always the way out.
    //
    // The upload must not hold the order hostage: a slow or failing network
    // would leave the customer staring at a dead button. Give it a brief head
    // start, long enough that a small photo on a decent connection still puts
    // a link in the message, then send the order regardless and let the upload
    // finish in the background.
    const uploading = prescription ? uploadPrescription(prescription) : Promise.resolve(null);
    // Record the order once the upload truly settles, however long that takes.
    void uploading.then(persist);

    setSending(true);
    const raced = await Promise.race([
      uploading,
      new Promise<"pending">((resolve) => setTimeout(() => resolve("pending"), 3_500)),
    ]);
    setSending(false);
    const upload = raced === "pending" ? null : raced;

    let prescriptionLine: string | null = null;
    if (category === "medicine") {
      if (!prescription) prescriptionLine = "*Prescription:* no photo attached.";
      else if (upload) prescriptionLine = `*Prescription:* ${upload.url}`;
      else
        prescriptionLine = `*Prescription:* photo to follow in this chat (${prescription.name}).`;
    }

    const url = whatsappLink(buildMessage(prescriptionLine));
    // Popup blockers and in-app browsers can refuse window.open — fall back to
    // navigating this tab so the order is never silently dropped.
    const opened = window.open(url, "_blank", "noopener,noreferrer");
    if (!opened) window.location.href = url;
  };

  return (
    <section id="order" className="relative py-24 lg:py-32">
      <div className="mx-auto max-w-5xl px-5 lg:px-8">
        <SectionHeading
          eyebrow="Place an Order"
          title="Tell Us What You Need — We'll Bring It"
          subtitle="Pick a category, fill in a few details and send it straight to our WhatsApp. Sign in to place your order."
        />

        {/* The form is taller than the viewport once a menu is open, so it
            reveals as soon as any of it is on screen. */}
        <Reveal amount="some">
          <form
            onSubmit={handleOrder}
            noValidate
            className="mt-12 rounded-4xl border border-border bg-card/80 p-6 shadow-soft backdrop-blur-xl sm:p-9"
          >
            {/* Status only — signing in lives in the header. We require it now to order. */}
            {isFirebaseConfigured && (
              <p className="mb-6 rounded-2xl border border-border bg-secondary/50 px-4 py-3 text-sm text-muted-foreground">
                {user ? (
                  <>
                    Signed in as{" "}
                    <span className="font-medium text-primary">{accountLabel(user)}</span> — your
                    details are filled in below and saved when you order.
                  </>
                ) : (
                  <>
                    You must be signed in to place an order. Use{" "}
                    <span className="font-medium text-primary">Sign in</span> at the top to
                    continue.
                  </>
                )}
              </p>
            )}

            {/* Category picker */}
            <div className="flex flex-wrap gap-2.5">
              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => pickCategory(c.id)}
                  className={cn(
                    "flex min-h-11 items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium transition-all duration-300",
                    category === c.id
                      ? "border-transparent bg-gradient-accent text-accent-foreground shadow-soft"
                      : "border-border bg-background text-muted-foreground hover:border-accent hover:text-primary",
                  )}
                >
                  <c.icon className="size-4" />
                  {c.label}
                </button>
              ))}
            </div>

            {/* The fee differs per category, so state it wherever you are. */}
            <p className="mt-3 text-xs text-muted-foreground">
              Delivery for {active.label.toLowerCase()}:{" "}
              <span className="font-semibold text-accent">{rupees(fee)}</span> flat, per order.
            </p>

            {/* Menu — only the categories with a fixed price list get one */}
            <AnimatePresence initial={false} mode="wait">
              {sections && (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="mt-8">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                        {active.label} menu
                      </h3>
                      <p className="text-xs text-muted-foreground">Prices exclude delivery</p>
                    </div>

                    <div className="mt-5 space-y-7">
                      {sections.map((section, index) => (
                        <div key={section.restaurant ?? index}>
                          {/* A named partner gets a heading. The single unnamed
                              section a category falls back to renders bare, so
                              cake looks exactly as it did. */}
                          {section.restaurant && (
                            <div className="mb-3 flex items-center gap-2.5">
                              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
                                <Store className="size-4" />
                              </span>
                              <div className="min-w-0">
                                <h4 className="truncate text-sm font-semibold text-primary">
                                  {section.restaurant}
                                </h4>
                                <p className="text-xs text-muted-foreground">
                                  {section.items.length} items
                                </p>
                              </div>
                            </div>
                          )}

                          <ul className="grid gap-2.5 sm:grid-cols-2">
                            {section.items.map((item) => (
                              <MenuItemCard
                                key={item.id}
                                item={item}
                                quantity={cart[item.id] ?? 0}
                                onChange={(next) => setQuantity(item.id, next)}
                              />
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>

                    {/* Running total */}
                    <AnimatePresence initial={false}>
                      {picked.length > 0 && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-5 rounded-3xl border border-border bg-secondary/60 p-5">
                            <ul className="space-y-1.5 text-sm">
                              {picked.map((item) => (
                                <li key={item.id} className="flex justify-between gap-3">
                                  <span className="text-muted-foreground">
                                    {itemLabel(item)} × {cart[item.id]}
                                  </span>
                                  <span className="shrink-0 font-medium text-primary">
                                    {rupees(item.price * cart[item.id])}
                                  </span>
                                </li>
                              ))}
                            </ul>
                            <div className="mt-3 space-y-1.5 border-t border-border pt-3 text-sm">
                              <div className="flex justify-between gap-3 text-muted-foreground">
                                <span>Subtotal</span>
                                <span>{rupees(subtotal)}</span>
                              </div>
                              <div className="flex justify-between gap-3 text-muted-foreground">
                                <span>Delivery</span>
                                <span>{rupees(fee)}</span>
                              </div>
                              <div className="flex justify-between gap-3 text-base font-bold text-primary">
                                <span>Total</span>
                                <span>{rupees(total)}</span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="order-name">Your name</Label>
                <Input
                  id="order-name"
                  value={name}
                  onChange={(e) => bind(setName)(e.target.value)}
                  autoComplete="name"
                  className="h-12 rounded-2xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="order-phone">Phone number</Label>
                <Input
                  id="order-phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) => bind(setPhone)(e.target.value)}
                  className="h-12 rounded-2xl"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="order-location">Delivery location</Label>
                <Input
                  id="order-location"
                  value={location}
                  onChange={(e) => bind(setLocation)(e.target.value)}
                  placeholder="House / landmark, area, Jonai"
                  className="h-12 rounded-2xl"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="order-items">
                  {menu
                    ? "Anything not on the menu? (optional)"
                    : `What do you want? (${active.label})`}
                </Label>
                <Textarea
                  id="order-items"
                  value={items}
                  onChange={(e) => bind(setItems)(e.target.value)}
                  placeholder={active.hint}
                  rows={3}
                  className="rounded-2xl"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="order-notes">Extra notes (optional)</Label>
                <Textarea
                  id="order-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Delivery time preference, payment mode, gate code…"
                  rows={2}
                  className="rounded-2xl"
                />
              </div>
            </div>

            <AnimatePresence initial={false}>
              {category === "medicine" && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-6 rounded-3xl border border-dashed border-accent/50 bg-accent/5 p-5">
                    <Label htmlFor="order-prescription" className="text-primary">
                      Prescription photo
                    </Label>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Pharmacies need this before they dispatch. It&apos;s uploaded with your order
                      and a link goes into the WhatsApp message — no need to attach it yourself.
                    </p>
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <label
                        htmlFor="order-prescription"
                        className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                      >
                        <Paperclip className="size-4" />
                        {prescription ? "Change photo" : "Choose photo"}
                      </label>
                      <input
                        id="order-prescription"
                        type="file"
                        accept="image/*,.pdf"
                        className="sr-only"
                        onChange={(e) => attachPrescription(e.target.files?.[0] ?? null)}
                      />
                    </div>

                    {prescription && (
                      <div className="mt-4 flex items-center gap-3 rounded-2xl border border-border bg-background p-3">
                        {preview ? (
                          <img
                            src={preview}
                            alt="Selected prescription"
                            className="size-14 shrink-0 rounded-xl object-cover"
                          />
                        ) : (
                          <span className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-secondary text-muted-foreground">
                            <Paperclip className="size-5" />
                          </span>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-primary">
                            {prescription.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {Math.max(1, Math.round(prescription.size / 1024))} KB
                          </p>
                        </div>
                        <button
                          type="button"
                          aria-label="Remove prescription"
                          onClick={() => attachPrescription(null)}
                          className="flex size-8 shrink-0 items-center justify-center rounded-full text-accent transition-colors hover:bg-secondary"
                        >
                          <X className="size-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {error && (
              <p role="alert" className="mt-5 text-sm font-medium text-destructive">
                {error}
              </p>
            )}

            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
              <Button
                variant="accent"
                size="xl"
                type="submit"
                disabled={sending || !launched || !user}
                className="w-full sm:w-auto"
              >
                {launched ? <Send className="size-4" /> : <Clock className="size-4" />}
                {!launched
                  ? `Ordering opens ${LAUNCH_DATE_LABEL}`
                  : !user
                    ? "Sign in to Order"
                    : sending
                      ? "Uploading photo…"
                      : "Order Now on WhatsApp"}
              </Button>
              <p className="text-xs text-muted-foreground">
                {launched ? (
                  "Your details open in WhatsApp ready to send — we confirm within minutes."
                ) : (
                  <>
                    We start delivering on {LAUNCH_DATE_LABEL}. Have a look at the menu and prices —
                    ordering switches on by itself that morning.
                  </>
                )}
              </p>
            </div>
          </form>
        </Reveal>
      </div>
    </section>
  );
}
