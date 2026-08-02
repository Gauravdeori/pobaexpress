import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LOGO_SRC, logoRef, onLogoError } from "@/lib/assets";
import { useLaunched } from "@/lib/launch";
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
  const launched = useLaunched();

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
          ? "bg-background/95 backdrop-blur-xl shadow-sm border-b border-border/40"
          : "bg-transparent",
      )}
    >
      {/* The nav sits centred by giving both flanks equal flex space rather
          than a fixed share of the width: at md the six links need every pixel
          they can get, and a hard w-1/4 on each side starves them. */}
      <nav className="mx-auto flex h-24 max-w-[120rem] items-center justify-between px-6 lg:px-12 2xl:px-20">
        <div className="flex flex-1 justify-start">
          <a href="#home" className="group flex items-center gap-2">
            <motion.img
              ref={logoRef}
              src={LOGO_SRC}
              onError={onLogoError}
              alt="Poba Express"
              whileHover={{ scale: 1.06, rotate: -2 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              className="h-10 w-auto lg:h-12"
            />
          </a>
        </div>

        <div className="hidden shrink-0 justify-center md:flex">
          <ul className="flex items-center gap-6 lg:gap-8">
            {links.map((l) => (
              <li key={l.label}>
                <a
                  href={l.href}
                  className="relative text-sm font-semibold text-foreground transition-colors hover:text-accent"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-1 items-center justify-end gap-1 sm:gap-2">
          {/* Renders only where the browser can actually install. */}
          <InstallButton />
          {/* Optional: ordering never depends on being signed in. */}
          {isFirebaseConfigured && <AccountMenu user={user} />}
          <Button
            variant="hero"
            size="lg"
            className="hidden rounded-full px-8 font-semibold sm:inline-flex"
            asChild
          >
            <a href="#order">{launched ? "Order Now" : "See the Menu"}</a>
          </Button>
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
            className="flex size-11 items-center justify-center rounded-full text-foreground transition-colors md:hidden"
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
                <Button variant="hero" className="w-full rounded-full font-semibold" asChild>
                  <a href="#order" onClick={() => setOpen(false)}>
                    {launched ? "Order Now" : "See the Menu"}
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
