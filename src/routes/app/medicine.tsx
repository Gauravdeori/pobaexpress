import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Paperclip, X } from "lucide-react";

import { ScreenHeading } from "@/components/app/Shared";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { rupees } from "@/lib/menu";
import { useDeliveryQuote } from "@/lib/use-delivery";
import { saveMedicineRequest } from "@/lib/medicine-request";
import { isUploadConfigured, uploadPrescription } from "@/lib/uploads";

export const Route = createFileRoute("/app/medicine")({
  component: MedicineScreen,
});

/** Anything bigger than this is likely a mistake and won't share cleanly. */
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

/**
 * Medicine has no price list — what a strip costs depends on the brand the
 * pharmacy has in stock — so this collects the request and the total is
 * confirmed on WhatsApp before dispatch. The request is parked in storage and
 * picked up by checkout.
 *
 * The prescription is uploaded here rather than carried forward, because a File
 * survives neither `sessionStorage` nor the navigation to checkout.
 */
function MedicineScreen() {
  const navigate = useNavigate();
  const [request, setRequest] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Quoted through the same conditions as every other screen: this line was
  // the base rate, so it read ₹30 to someone about to be charged ₹50 on a
  // wet night.
  const quote = useDeliveryQuote("medicine");

  // Object URLs leak until revoked, so tie each one to the file it previews.
  useEffect(() => {
    if (!photo || !photo.type.startsWith("image/")) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(photo);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [photo]);

  const attach = (file: File | null) => {
    if (file && file.size > MAX_UPLOAD_BYTES) {
      setError("That file is over 10 MB. Please pick a smaller photo.");
      return;
    }
    setPhoto(file);
    setError(null);
  };

  const submit = async () => {
    if (!request.trim()) return;
    setSending(true);

    // Never fatal: `uploadPrescription` answers null rather than throwing, and
    // an order that cannot carry its photo is still an order — the message asks
    // for it in the chat instead.
    const upload = photo ? await uploadPrescription(photo) : null;

    saveMedicineRequest({
      request: request.trim(),
      prescriptionId: upload?.publicId ?? null,
      prescriptionUrl: upload?.url ?? null,
      photoName: photo && !upload ? photo.name : null,
    });

    setSending(false);
    void navigate({ to: "/app/checkout", search: { kind: "medicine" } });
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-5">
      <div className="mb-4 flex items-center justify-between rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/60 via-teal-900/30 to-card p-3.5 shadow-md">
        <div className="flex items-center gap-3">
          <span className="relative flex size-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
            <span className="absolute -top-1 -right-1 flex size-3">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex size-3 rounded-full bg-cyan-400" />
            </span>
            💊
          </span>
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-cyan-300">
              ⚡ 24/7 Priority Medicine Delivery
            </h4>
            <p className="text-[11px] text-muted-foreground font-medium">
              Verified Jonai Pharmacies • Rapid Prescription Dispatch
            </p>
          </div>
        </div>
      </div>

      <ScreenHeading
        title="Medicine"
        subtitle="List what you need and attach the prescription — we confirm the total on WhatsApp before the rider collects."
      />

      <div className="rounded-2xl border border-border bg-card p-4">
        <Label htmlFor="medicine-request">What do you need?</Label>
        <Textarea
          id="medicine-request"
          value={request}
          onChange={(event) => setRequest(event.target.value)}
          rows={5}
          placeholder="e.g. Paracetamol 650mg — 1 strip&#10;Cetirizine — 1 strip"
          className="mt-2"
        />
        <p className="mt-3 text-xs text-muted-foreground">
          Prices depend on the brand in stock, so we confirm the total on WhatsApp before the rider
          collects. Delivery is {rupees(quote.fee)}
          {quote.surcharge > 0
            ? `, including ${rupees(quote.surcharge)} for ${quote.reason.toLowerCase()}`
            : " flat"}
          .
        </p>
      </div>

      <div className="mt-3 rounded-2xl border border-dashed border-accent/50 bg-accent/5 p-4">
        <Label htmlFor="medicine-prescription" className="text-primary">
          Prescription photo
        </Label>
        <p className="mt-1 text-xs text-muted-foreground">
          {isUploadConfigured
            ? "Pharmacies need this before they dispatch. It goes up with your order and a link lands in the WhatsApp message — no need to attach it yourself."
            : "Pharmacies need this before they dispatch. Send it in the WhatsApp chat once your order opens."}
        </p>

        <label
          htmlFor="medicine-prescription"
          className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          <Paperclip className="size-4" />
          {photo ? "Change photo" : "Choose photo"}
        </label>
        <input
          id="medicine-prescription"
          type="file"
          accept="image/*,.pdf"
          className="sr-only"
          onChange={(event) => attach(event.target.files?.[0] ?? null)}
        />

        {photo && (
          <div className="mt-3 flex items-center gap-3 rounded-2xl border border-border bg-background p-3">
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
              <p className="truncate text-sm font-medium text-primary">{photo.name}</p>
              <p className="text-xs text-muted-foreground">
                {Math.max(1, Math.round(photo.size / 1024))} KB
              </p>
            </div>
            <button
              type="button"
              aria-label="Remove prescription"
              onClick={() => attach(null)}
              className="flex size-8 shrink-0 items-center justify-center rounded-full text-accent transition-colors hover:bg-secondary"
            >
              <X className="size-4" />
            </button>
          </div>
        )}
      </div>

      {error && (
        <p role="alert" className="mt-3 text-sm font-medium text-destructive">
          {error}
        </p>
      )}

      <Button
        variant="accent"
        className="mt-4 h-12 w-full rounded-2xl"
        disabled={!request.trim() || sending}
        onClick={() => void submit()}
      >
        {sending ? "Attaching photo…" : "Continue"}
      </Button>
    </div>
  );
}
