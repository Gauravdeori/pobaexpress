import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/poba/Navbar";
import { Hero } from "@/components/poba/Hero";
import { Services } from "@/components/poba/Services";
import { About } from "@/components/poba/About";
import { WhyChooseUs } from "@/components/poba/WhyChooseUs";
import { OrderForm } from "@/components/poba/OrderForm";
import { CallToAction } from "@/components/poba/CallToAction";
import { Footer } from "@/components/poba/Footer";

const title = "Poba Express — Jonai's Own Delivery Service";
const description =
  "Food, grocery, medicine and parcel delivery in Jonai, Assam. Fast, affordable and reliable local delivery by Poba Express.";

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
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <Services />
        <About />
        <WhyChooseUs />
        <OrderForm />
        <CallToAction />
      </main>
      <Footer />
    </div>
  );
}
