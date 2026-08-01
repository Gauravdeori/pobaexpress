import { useState, type FormEvent } from "react";
import { Store, User, Phone, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SectionHeading, Reveal } from "./Reveal";
import { cn } from "@/lib/utils";

export function PartnerForm() {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

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
    <section id="partners" className="py-24 lg:py-32 bg-secondary/30">
      <div className="mx-auto max-w-3xl px-5 lg:px-8">
        <SectionHeading
          eyebrow="Partner With Us"
          title="Grow Your Business With Poba"
          subtitle="Reach more customers in Jonai by joining our delivery network. Tell us about your business and we'll get in touch."
        />

        <div className="mt-14 relative">
          <div className="absolute -inset-4 bg-gradient-to-r from-accent/20 to-primary/20 blur-3xl rounded-[3rem] opacity-50" />
          <Reveal delay={0.1}>
            <div className="relative rounded-[2rem] border border-border/50 bg-background/80 p-6 shadow-xl backdrop-blur-xl sm:p-10">
              {status === "success" ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="flex size-16 items-center justify-center rounded-full bg-gradient-green text-white shadow-lg">
                    <CheckCircle2 className="size-8" />
                  </div>
                  <h3 className="mt-6 text-2xl font-bold text-primary">Application Received!</h3>
                  <p className="mt-2 text-muted-foreground max-w-sm">
                    Thank you for your interest. Our team will contact you shortly to discuss the next steps.
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
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Web3Forms Access Key */}
                  <input type="hidden" name="access_key" value="1da10f27-6791-403f-a336-559ac471cd68" />
                  
                  {/* Optional: Add a subject to the email */}
                  <input type="hidden" name="subject" value="New Partner Application - Poba Express" />
                  
                  {/* Optional: Add a redirect or disable it so we handle state via fetch */}
                  <input type="hidden" name="redirect" value="false" />

                  <div className="grid gap-6 sm:grid-cols-2">
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
                          required
                          className="h-12 rounded-2xl pl-10"
                          placeholder="e.g. 9876543210"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-6 sm:grid-cols-2">
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
                  </div>

                  {status === "error" && (
                    <p className="text-sm font-medium text-destructive">
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
                    {status === "submitting" ? "Submitting..." : "Apply to Partner"}
                  </Button>
                </form>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
