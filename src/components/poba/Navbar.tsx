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
          ? "bg-background/85 backdrop-blur-xl shadow-soft border-b border-border"
          : "bg-transparent",
      )}
    >
      {/* Tall enough to give the near-square logo lockup room to stay legible. */}
      <nav className="flex h-20 items-center justify-between py-2 mx-auto max-w-[120rem] px-5 lg:px-12 2xl:px-20">
        <a href="#home" className="group flex items-center gap-2">
          <motion.img
            ref={logoRef}
            src={LOGO_SRC}
            onError={onLogoError}
            alt="Poba Express"
            whileHover={{ scale: 1.06, rotate: -2 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            className="h-12 w-auto"
          />
        </a>

        <ul className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <li key={l.label}>
              <a
                href={l.href}
                className="relative text-sm font-medium text-foreground transition-colors after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-full after:origin-bottom-right after:scale-x-0 after:bg-accent after:transition-transform after:duration-300 hover:text-accent hover:after:origin-bottom-left hover:after:scale-x-100"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-1 sm:gap-2">
          {/* Renders only where the browser can actually install. */}
          <InstallButton />
          {/* Optional: ordering never depends on being signed in. */}
          {isFirebaseConfigured && <AccountMenu user={user} />}
          <Button variant="accent" size="lg" className="hidden rounded-full sm:inline-flex" asChild>
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
                <Button variant="accent" className="w-full rounded-full" asChild>
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
