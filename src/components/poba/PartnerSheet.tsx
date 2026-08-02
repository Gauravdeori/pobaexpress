import { useEffect, useState, type FormEvent } from "react";
import { Store, User, Phone, CheckCircle2 } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/**
 * Partner sign-up, in a side panel rather than a section of the page.
 *
 * The page is for customers; merchant recruitment is a different audience and
 * was taking a full screen of scroll away from ordering.
 *
 * Opening is driven by the `#partners` hash, so every existing link — header,
 * hero, footer, the countdown, the closing call to action — keeps working with
 * no changes, and the panel stays shareable as a URL.
 */
export function PartnerSheet() {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  useEffect(() => {
    const sync = () => setOpen(window.location.hash === "#partners");
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    // Clear the hash on close, otherwise clicking the same link again is a
    // no-op — the hash never changes, so no hashchange fires.
    if (!next && window.location.hash === "#partners") {
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("submitting");

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setStatus("success");
        form.reset();
      } else {
        setStatus("error");
      }
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      {/* Wider than the default sm:max-w-sm — the form is two columns. */}
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="text-2xl text-primary">Grow Your Business With Poba</SheetTitle>
          <SheetDescription>
            Reach more customers in Jonai by joining our delivery network. Tell us about your
            business and we&apos;ll get in touch.
          </SheetDescription>
        </SheetHeader>

        {status === "success" ? (
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-gradient-green text-white shadow-lg">
              <CheckCircle2 className="size-8" />
            </div>
            <h3 className="mt-6 text-xl font-bold text-primary">Application received</h3>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Thank you for your interest. Our team will contact you shortly to discuss the next
              steps.
            </p>
            <Button
              variant="outline"
              className="mt-8 rounded-full"
              onClick={() => setStatus("idle")}
            >
              Submit another application
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <input type="hidden" name="access_key" value="1da10f27-6791-403f-a336-559ac471cd68" />
            <input type="hidden" name="subject" value="New Partner Application - Poba Express" />
            <input type="hidden" name="redirect" value="false" />

            <div className="space-y-2">
              <label htmlFor="partner-name" className="text-sm font-medium text-foreground">
                Your Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="partner-name"
                  name="name"
                  required
                  autoComplete="name"
                  className="h-12 rounded-2xl pl-10"
                  placeholder="e.g. Rahul Sharma"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="partner-phone" className="text-sm font-medium text-foreground">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="partner-phone"
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  required
                  className="h-12 rounded-2xl pl-10"
                  placeholder="e.g. 9876543210"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="partner-business" className="text-sm font-medium text-foreground">
                Business Name
              </label>
              <div className="relative">
                <Store className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="partner-business"
                  name="business_name"
                  required
                  className="h-12 rounded-2xl pl-10"
                  placeholder="e.g. Jonai Bakers"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="partner-type" className="text-sm font-medium text-foreground">
                Business Type
              </label>
              <Input
                id="partner-type"
                name="business_type"
                required
                className="h-12 rounded-2xl"
                placeholder="e.g. Restaurant, Grocery, Pharmacy"
              />
            </div>

            {status === "error" && (
              <p role="alert" className="text-sm font-medium text-destructive">
                Something went wrong. Please try again later.
              </p>
            )}

            <Button
              type="submit"
              size="xl"
              variant="accent"
              className="w-full rounded-2xl"
              disabled={status === "submitting"}
            >
              {status === "submitting" ? "Submitting…" : "Apply to Partner"}
            </Button>
          </form>
        )}
      </SheetContent>
    </Sheet>
  );
}
