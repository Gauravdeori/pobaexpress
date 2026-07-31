import { useState, type FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  UtensilsCrossed,
  Pill,
  Cake,
  ShoppingCart,
  Package,
  Paperclip,
  Send,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { whatsappLink } from "@/lib/contact";
import { Reveal, SectionHeading } from "./Reveal";

const categories = [
  {
    id: "food",
    label: "Food",
    icon: UtensilsCrossed,
    hint: "e.g. 2x Chicken Thali from Jonai Dhaba",
  },
  { id: "medicine", label: "Medicine", icon: Pill, hint: "e.g. Paracetamol 650mg — 1 strip" },
  {
    id: "cake",
    label: "Cake",
    icon: Cake,
    hint: "e.g. 1kg chocolate truffle, write 'Happy Birthday Ritu'",
  },
  {
    id: "grocery",
    label: "Grocery",
    icon: ShoppingCart,
    hint: "e.g. 5kg rice, 1L mustard oil, eggs",
  },
  {
    id: "parcel",
    label: "Parcel",
    icon: Package,
    hint: "e.g. Small documents parcel, pickup from Main Market",
  },
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
  const [error, setError] = useState<string | null>(null);

  const active = categories.find((c) => c.id === category)!;

  // Any edit clears a stale validation message so it can't linger after a fix.
  const bind = (set: (value: string) => void) => (value: string) => {
    set(value);
    setError(null);
  };

  const handleOrder = (event: FormEvent) => {
    event.preventDefault();

    if (!name.trim() || !phone.trim() || !location.trim() || !items.trim()) {
      setError("Please fill in your name, phone number, delivery location and what you need.");
      return;
    }
    if (phone.replace(/\D/g, "").length < 10) {
      setError("Please enter a valid phone number so we can confirm your order.");
      return;
    }
    setError(null);

    const lines = [
      "*New Order — Poba Express*",
      "",
      `*Category:* ${active.label}`,
      `*Name:* ${name.trim()}`,
      `*Phone:* ${phone.trim()}`,
      `*Delivery location:* ${location.trim()}`,
      `*Order details:* ${items.trim()}`,
    ];
    if (notes.trim()) lines.push(`*Extra notes:* ${notes.trim()}`);
    if (category === "medicine") {
      lines.push(
        prescription
          ? `*Prescription:* attaching photo (${prescription.name}) in this chat.`
          : "*Prescription:* no photo attached.",
      );
    }

    const url = whatsappLink(lines.join("\n"));
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
          subtitle="Pick a category, fill in a few details and send it straight to our WhatsApp. No app, no signup."
        />

        <Reveal>
          <form
            onSubmit={handleOrder}
            noValidate
            className="mt-12 rounded-4xl border border-border bg-card/80 p-6 shadow-soft backdrop-blur-xl sm:p-9"
          >
            {/* Category picker */}
            <div className="flex flex-wrap gap-2.5">
              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategory(c.id)}
                  className={cn(
                    "flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium transition-all duration-300",
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

            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="order-name">Your name</Label>
                <Input
                  id="order-name"
                  value={name}
                  onChange={(e) => bind(setName)(e.target.value)}
                  autoComplete="name"
                  placeholder="Ritu Pegu"
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
                  placeholder="+91 98765 43210"
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
                <Label htmlFor="order-items">What do you want? ({active.label})</Label>
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
                      Choose your prescription here, then attach the same photo in the WhatsApp chat
                      that opens — pharmacies need it before dispatch.
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
                        onChange={(e) => setPrescription(e.target.files?.[0] ?? null)}
                      />
                      {prescription && (
                        <span className="flex items-center gap-2 rounded-full bg-background px-3 py-2 text-xs text-muted-foreground">
                          {prescription.name}
                          <button
                            type="button"
                            aria-label="Remove prescription"
                            onClick={() => setPrescription(null)}
                            className="text-accent"
                          >
                            <X className="size-3.5" />
                          </button>
                        </span>
                      )}
                    </div>
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
              <Button variant="accent" size="xl" type="submit" className="w-full sm:w-auto">
                <Send className="size-4" />
                Order Now on WhatsApp
              </Button>
              <p className="text-xs text-muted-foreground">
                Your details open in WhatsApp ready to send — we confirm within minutes.
              </p>
            </div>
          </form>
        </Reveal>
      </div>
    </section>
  );
}
