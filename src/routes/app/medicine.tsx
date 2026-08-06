import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { ScreenHeading } from "@/components/app/Shared";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { deliveryFee, rupees } from "@/lib/menu";

export const Route = createFileRoute("/app/medicine")({
  component: MedicineScreen,
});

const STORAGE_KEY = "poba.medicine.v1";

/**
 * Medicine has no price list — what a strip costs depends on the brand the
 * pharmacy has in stock — so this collects the request and the total is
 * confirmed on WhatsApp before dispatch. The request is parked in storage and
 * picked up by checkout.
 */
function MedicineScreen() {
  const navigate = useNavigate();
  const [request, setRequest] = useState("");
  const fee = deliveryFee("medicine");

  const submit = () => {
    if (!request.trim()) return;
    try {
      window.sessionStorage.setItem(STORAGE_KEY, request.trim());
    } catch {
      // Storage can be unavailable; checkout falls back to an empty request
      // and the customer retypes it there.
    }
    void navigate({ to: "/app/checkout", search: { kind: "medicine" } });
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-5">
      <ScreenHeading
        title="Medicine"
        subtitle="List what you need, or send a photo of the prescription on WhatsApp after ordering."
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
          collects. Delivery is {rupees(fee)} flat.
        </p>
      </div>

      <Button
        variant="accent"
        className="mt-4 h-12 w-full rounded-2xl"
        disabled={!request.trim()}
        onClick={submit}
      >
        Continue
      </Button>
    </div>
  );
}
