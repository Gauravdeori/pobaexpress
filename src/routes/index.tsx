import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { InstallBanner } from "@/components/poba/InstallBanner";
import { Navbar } from "@/components/poba/Navbar";
import { Hero } from "@/components/poba/Hero";
import { LaunchCountdown } from "@/components/poba/LaunchCountdown";
import { Restaurants } from "@/components/poba/Restaurants";
import { Services } from "@/components/poba/Services";
import { About } from "@/components/poba/About";
import { WhyChooseUs } from "@/components/poba/WhyChooseUs";
import { OrderCta } from "@/components/poba/OrderCta";
import { OrderForm } from "@/components/poba/OrderForm";
import { CallToAction } from "@/components/poba/CallToAction";
import { Footer } from "@/components/poba/Footer";
import { MobileOrderBar } from "@/components/poba/MobileOrderBar";
import { PartnerSheet } from "@/components/poba/PartnerSheet";
import { LiveAnnouncementModal } from "@/components/poba/LiveAnnouncementModal";

const title = "Poba Express — Jonai's Own Delivery Service";
const description =
  "Food, cake and medicine delivery in Jonai, Assam. Download the free Poba Express app to order.";

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

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true;
    if (standalone) void navigate({ to: "/app", replace: true });
  }, [navigate]);

  return (
    <div className="min-h-screen">
      <InstallBanner />
      {/* The strip is fixed, so this is the space it takes. Zero-height until
          the browser actually offers installation. */}
      <div aria-hidden style={{ height: "var(--install-bar)" }} />
      <Navbar />
      <main>
        <Hero />
        <OrderCta />
        <OrderForm />
        <LaunchCountdown />
        <Restaurants />
        <Services />
        <About />
        <WhyChooseUs />
        <CallToAction />
      </main>
      <Footer />
      <MobileOrderBar />
      <PartnerSheet />
      <LiveAnnouncementModal />
    </div>
  );
}
