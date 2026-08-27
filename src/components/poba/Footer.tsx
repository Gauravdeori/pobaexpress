import { Clock, Facebook, Instagram, MessageCircle, Phone, Mail, MapPin } from "lucide-react";
import { motion } from "motion/react";
import { Link } from "@tanstack/react-router";
import { LOGO_SRC, logoRef, onLogoError } from "@/lib/assets";
import {
  ADDRESS,
  EMAIL,
  EMAIL_HREF,
  PHONE_DISPLAY,
  PHONE_HREF,
  SOCIAL,
  WHATSAPP_DISPLAY,
  whatsappLink,
} from "@/lib/contact";
import { DELIVERY_HOURS_LABEL } from "@/lib/launch";

const quickLinks = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Why Us", href: "#why-us" },
  { label: "Order Now", href: "#order" },
];

const services = ["Food Delivery", "Cake Delivery", "Medicine Delivery"];

const legalLinks = [
  { label: "Privacy Policy", to: "/privacy" },
  { label: "Terms & Conditions", to: "/terms" },
  { label: "Refund & Cancellation", to: "/refunds" },
] as const;

// Profiles without a URL in src/lib/contact.ts are dropped, so the row never
// renders an icon that links nowhere.
const socials = [
  { icon: MessageCircle, label: "Chat with Poba Express on WhatsApp", href: whatsappLink() },
  { icon: Facebook, label: "Poba Express on Facebook", href: SOCIAL.facebook },
  { icon: Instagram, label: "Poba Express on Instagram", href: SOCIAL.instagram },
].filter((s) => s.href);

export function Footer() {
  return (
    <footer id="contact" className="bg-primary-deep text-primary-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div>
          <div className="inline-block">
            <motion.img
              ref={logoRef}
              src={LOGO_SRC}
              onError={onLogoError}
              alt="Poba Express"
              // Arrives when the footer does, rather than sitting there already.
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: "some" }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ scale: 1.04 }}
              className="h-20 w-auto"
              loading="lazy"
            />
          </div>
          <p className="mt-4 text-sm text-primary-foreground/70">Jonai's Own Delivery Service</p>
          <div className="mt-5 flex gap-3">
            {socials.map(({ icon: Icon, label, href }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                target="_blank"
                rel="noopener noreferrer"
                className="glass flex size-11 items-center justify-center rounded-full transition-colors hover:bg-accent"
              >
                <Icon className="size-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-accent-light">
            Quick Links
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm text-primary-foreground/75">
            {quickLinks.map((l) => (
              <li key={l.label}>
                <a href={l.href} className="transition-colors hover:text-accent-light">
                  {l.label}
                </a>
              </li>
            ))}
            {/* The app is the installed PWA's start_url, but iPhones install
                by hand and some browsers never offer it at all, so it needs a
                way in that does not depend on installing anything. */}
            <li>
              <Link to="/app" className="font-medium transition-colors hover:text-accent-light">
                Open the app
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-accent-light">
            Services
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm text-primary-foreground/75">
            {services.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-accent-light">
            Contact
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm text-primary-foreground/75">
            <li className="flex items-center gap-2">
              <MapPin className="size-4 shrink-0 text-accent-light" /> {ADDRESS}
            </li>
            {/* The hours belong beside the address and the phone number: they
                are the same kind of fact, and this is where people look for
                them once the page has stopped selling. */}
            <li className="flex items-start gap-2">
              <Clock className="mt-0.5 size-4 shrink-0 text-accent-light" />
              <span>
                {DELIVERY_HOURS_LABEL}
                <span className="block text-xs text-primary-foreground/55">
                  Delivery hours, every day
                </span>
              </span>
            </li>
            <li>
              <a
                href={PHONE_HREF}
                className="flex items-center gap-2 transition-colors hover:text-accent-light"
              >
                <Phone className="size-4 shrink-0 text-accent-light" /> {PHONE_DISPLAY}
              </a>
            </li>
            <li>
              <a
                href={whatsappLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-2 transition-colors hover:text-accent-light"
              >
                <MessageCircle className="mt-0.5 size-4 shrink-0 text-accent-light" />
                <span>
                  {WHATSAPP_DISPLAY}
                  <span className="block text-xs text-primary-foreground/55">
                    WhatsApp — messages only
                  </span>
                </span>
              </a>
            </li>
            <li>
              <a
                href={EMAIL_HREF}
                className="flex items-center gap-2 transition-colors hover:text-accent-light"
              >
                <Mail className="size-4 shrink-0 text-accent-light" /> {EMAIL}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 py-5 text-center text-xs text-primary-foreground/60">
        <nav aria-label="Legal" className="mb-3 flex flex-wrap justify-center gap-x-5 gap-y-2">
          {legalLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="min-h-8 transition-colors hover:text-accent-light"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        © {new Date().getFullYear()} Poba Express. All Rights Reserved.
      </div>
    </footer>
  );
}
