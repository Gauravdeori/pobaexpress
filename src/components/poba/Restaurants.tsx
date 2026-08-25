import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { ArrowRight, Clock, Store, Tag, UtensilsCrossed } from "lucide-react";

import { listActiveOffers, type Offer } from "@/lib/admin";
import { offerSummary } from "@/lib/promo-rules";
import { useLaunched } from "@/lib/launch";
import { rupees } from "@/lib/menu";
import { Reveal, SectionHeading } from "./Reveal";
import { partners, type Partner } from "./HeroSlides";

/**
 * The shops, on the marketing page.
 *
 * The app has its own rail of these cards; this is the same list in the
 * website's own language — cream card, soft shadow, one accent — so a visitor
 * scrolling the landing page meets every partner without being handed the app
 * shell, which is a different product with a different chrome.
 *
 * Built from `partners()` rather than a second hand-written list, so a kitchen
 * added to `RESTAURANTS` appears here, in the hero and in the app at once.
 */

/** A real offer, written in the admin panel. Absent means nothing is shown. */
function OfferCard({ offer }: { offer: Offer }) {
  return (
    <motion.article
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className="flex h-full flex-col rounded-3xl bg-gradient-green p-6 shadow-soft"
    >
      <span className="inline-flex w-max items-center gap-1.5 rounded-full bg-accent-light/20 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-accent-light">
        <Tag className="size-3" />
        Offer
      </span>
      <h3 className="mt-3 text-lg font-bold leading-tight text-primary-foreground">
        {offer.headline}
      </h3>
      <p className="mt-1.5 text-sm leading-relaxed text-primary-foreground/75">{offer.detail}</p>
      <p className="mt-3 text-xs font-semibold text-primary-foreground/70">{offerSummary(offer)}</p>
      {offer.code && (
        <p className="mt-auto pt-4 text-sm font-bold text-accent-light">
          Code <span className="tracking-[0.12em]">{offer.code}</span>
        </p>
      )}
    </motion.article>
  );
}

/** "See the menu", pointed at whichever screen this partner lives on. */
function ShopCard({ shop, launched }: { shop: Partner; launched: boolean }) {
  const inner = (
    <>
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-secondary">
        {shop.image ? (
          <img
            src={shop.image}
            alt=""
            aria-hidden
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <span className="flex size-full items-center justify-center text-accent">
            <UtensilsCrossed className="size-9" />
          </span>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-primary/70 via-primary/10 to-transparent" />

        <span className="absolute bottom-3 left-3 rounded-full bg-background/90 px-3 py-1 text-xs font-bold text-primary shadow-sm backdrop-blur">
          from {rupees(shop.from)}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="text-lg font-semibold text-primary transition-colors duration-300 group-hover:text-accent">
          {shop.name}
        </h3>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{shop.cuisine}</p>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-semibold">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1 text-accent">
            <Clock className="size-3" />
            {shop.eta[0]}–{shop.eta[1]} min
          </span>
          {/* No rating is invented here. Poba Express has not started
              delivering, so nobody has rated anything — a star beside a shop
              that has never taken an order is a review we made up. */}
          <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-muted-foreground">
            <Store className="size-3" />
            New on Poba
          </span>
        </div>

        {shop.hours && (
          <p className="mt-3 text-xs font-semibold text-muted-foreground">{shop.hours}</p>
        )}

        <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-semibold text-accent">
          {launched ? "Order now" : "See the menu"}
          <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
        </span>
      </div>
    </>
  );

  const className =
    "group flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-card/70 shadow-soft backdrop-blur-xl transition-colors duration-300 hover:border-accent";

  return shop.isCake ? (
    <Link to="/app/cake" className={className}>
      {inner}
    </Link>
  ) : (
    <Link to="/app/r/$slug" params={{ slug: shop.slug }} className={className}>
      {inner}
    </Link>
  );
}

export function Restaurants() {
  const launched = useLaunched();
  const shops = partners();

  // Offers are written by hand in the admin panel and are usually none, so
  // this reads once instead of holding a listener open on every visitor.
  const [offers, setOffers] = useState<Offer[]>([]);
  useEffect(() => {
    let cancelled = false;
    void listActiveOffers().then((live) => {
      if (!cancelled) setOffers(live);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section id="restaurants" className="relative py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <SectionHeading
          eyebrow="Our Partners"
          title="The Kitchens and Bakeries of Jonai"
          subtitle="Every shop delivering with Poba Express, with what they cook and what it starts at."
        />

        {offers.length > 0 && (
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {offers.map((offer, i) => (
              <Reveal key={offer.id} delay={i * 0.08} className="h-full">
                <OfferCard offer={offer} />
              </Reveal>
            ))}
          </div>
        )}

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {shops.map((shop, i) => (
            <Reveal key={shop.slug} delay={i * 0.08} className="h-full">
              <motion.div
                whileHover={{ y: -10 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="h-full"
              >
                <ShopCard shop={shop} launched={launched} />
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
