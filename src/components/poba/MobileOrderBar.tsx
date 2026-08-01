import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ShoppingBag } from "lucide-react";

import { LAUNCH_DATE_LABEL, useLaunched } from "@/lib/launch";

/**
 * Phone-only sticky call to action. The order form sits two thirds down a very
 * long page, so on a phone it stays one tap away instead of a long scroll.
 * It appears once the hero is behind you and steps aside when the form itself
 * is on screen, so it never covers the thing it points at.
 */
export function MobileOrderBar() {
  const [visible, setVisible] = useState(false);
  const launched = useLaunched();

  useEffect(() => {
    const order = document.getElementById("order");
    const footer = document.getElementById("contact");

    // Anything the bar would obscure counts as a reason to hide it.
    const obscured = new Set<Element>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) obscured.add(entry.target);
          else obscured.delete(entry.target);
        }
        update();
      },
      { rootMargin: "0px 0px -20% 0px" },
    );
    if (order) observer.observe(order);
    if (footer) observer.observe(footer);

    // Past roughly the first screen the hero's own buttons are gone.
    const update = () => {
      setVisible(window.scrollY > window.innerHeight * 0.75 && obscured.size === 0);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 90, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 90, opacity: 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 30 }}
          className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/90 px-4 pt-3 backdrop-blur-xl md:hidden"
          style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
        >
          <a
            href="#order"
            className="flex h-14 items-center justify-center gap-2.5 rounded-full bg-gradient-accent text-base font-semibold text-accent-foreground shadow-lift"
          >
            <ShoppingBag className="size-5" />
            {launched ? "Order Now on WhatsApp" : "See the menu & prices"}
          </a>
          <p className="mt-1.5 text-center text-[11px] text-muted-foreground">
            {launched
              ? "Food from ₹29 · delivery from ₹10 · no app needed"
              : `Ordering opens ${LAUNCH_DATE_LABEL} · food from ₹29`}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
