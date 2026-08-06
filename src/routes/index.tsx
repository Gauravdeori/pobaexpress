import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Navbar } from "@/components/poba/Navbar";
import { Hero } from "@/components/poba/Hero";
import { LaunchCountdown } from "@/components/poba/LaunchCountdown";
import { Services } from "@/components/poba/Services";
import { About } from "@/components/poba/About";
import { WhyChooseUs } from "@/components/poba/WhyChooseUs";
import { OrderForm } from "@/components/poba/OrderForm";
import { CallToAction } from "@/components/poba/CallToAction";
import { Footer } from "@/components/poba/Footer";
import { MobileOrderBar } from "@/components/poba/MobileOrderBar";
import { PartnerSheet } from "@/components/poba/PartnerSheet";

const title = "Poba Express — Jonai's Own Delivery Service";
const description =
  "Food, cake and medicine delivery in Jonai, Assam. Order on WhatsApp — flat ₹20 delivery, no app, no signup.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const navigate = useNavigate();

  // Someone who installed the app and opened it lands on its start_url, but a
  // launcher icon created before that changed — or a tap on an old link —
  // still arrives here. In a standalone window the marketing page is the wrong
  // thing to show, so hand them straight to the app. Replace, not push, so Back
  // doesn't bounce them between the two.
  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true;
    if (standalone) void navigate({ to: "/app", replace: true });
  }, [navigate]);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <OrderForm />
        <LaunchCountdown />
        <Services />
        <About />
        <WhyChooseUs />
        <CallToAction />
      </main>
      <Footer />
      <MobileOrderBar />
      <PartnerSheet />
    </div>
  );
}
