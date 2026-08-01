import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LOGO_SRC, logoRef, onLogoError } from "@/lib/assets";
import { isFirebaseConfigured } from "@/lib/firebase";
import { useAccount } from "@/lib/account";
import { AccountMenu } from "./AccountMenu";
import { InstallButton } from "./InstallButton";

const links = [
  { label: "Home", href: "#home" },
  { label: "Services", href: "#services" },
  { label: "About", href: "#about" },
  { label: "Partners", href: "#partners" },
  { label: "Order", href: "#order" },
  { label: "Contact", href: "#contact" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { user } = useAccount();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // The panel is `md:hidden`, so a menu left open while widening the window
  // would silently reappear on the way back to a phone width.
  useEffect(() => {
    if (!open) return;
    const desktop = window.matchMedia("(min-width: 768px)");
    const onChange = () => desktop.matches && setOpen(false);
    const onKeyDown = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    desktop.addEventListener("change", onChange);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      desktop.removeEventListener("change", onChange);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-background/85 backdrop-blur-xl shadow-soft border-b border-border"
          : "bg-transparent",
      )}
    >
      {/* Tall enough to give the near-square logo lockup room to stay legible. */}
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 py-2 lg:px-8">
        {/* The logo's wordmark is dark green, so it needs a light backing to stay
            readable over the hero photo. On the scrolled (near-white) bar the
            chip blends into the background and reads as no chip at all. */}
        <a href="#home" className="flex items-center gap-2 rounded-xl bg-white/92 p-1.5">
          <img
            ref={logoRef}
            src={LOGO_SRC}
            onError={onLogoError}
            alt="Poba Express"
            className="h-12 w-auto"
          />
        </a>

        <ul className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <li key={l.label}>
              <a
                href={l.href}
                className={cn(
                  "relative text-sm font-medium transition-colors after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-full after:origin-bottom-right after:scale-x-0 after:bg-accent after:transition-transform after:duration-300 hover:after:origin-bottom-left hover:after:scale-x-100",
                  scrolled
                    ? "text-foreground hover:text-primary"
                    : "text-primary-foreground/90 hover:text-primary-foreground",
                )}
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-1 sm:gap-2">
          {/* Renders only where the browser can actually install. */}
          <InstallButton onDark={!scrolled} />
          {/* Optional: ordering never depends on being signed in. */}
          {isFirebaseConfigured && <AccountMenu user={user} onDark={!scrolled} />}
          <Button variant="accent" size="lg" className="hidden rounded-full sm:inline-flex" asChild>
            <a href="#order">Order Now</a>
          </Button>
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
            className={cn(
              "flex size-11 items-center justify-center rounded-full transition-colors md:hidden",
              scrolled ? "text-foreground" : "text-primary-foreground",
            )}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-border bg-background/95 backdrop-blur-xl md:hidden"
          >
            <ul className="flex flex-col gap-1 px-5 py-4">
              {links.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-xl px-3 py-2.5 text-sm font-medium text-foreground hover:bg-secondary"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
              <li className="pt-2">
                <Button variant="accent" className="w-full rounded-full" asChild>
                  <a href="#order" onClick={() => setOpen(false)}>
                    Order Now
                  </a>
                </Button>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
