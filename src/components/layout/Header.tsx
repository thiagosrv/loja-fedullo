"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCartStore } from "@/store/cartStore";
import { BrandsSubmenu } from "./BrandsSubmenu";
import { MobileMenu } from "./MobileMenu";
import { CATEGORIES } from "@/constants/categories";
import { ShoppingBag } from "lucide-react";
import { UserMenu } from "./UserMenu";
import { SearchBar } from "./SearchBar";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const NAV_LINKS = CATEGORIES.map((c) => ({ label: c.name, href: `/${c.slug}` }));

export function Header() {
  const headerRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLAnchorElement>(null);
  const navItemsRef = useRef<HTMLElement>(null);
  const cartRef = useRef<HTMLAnchorElement>(null);
  const borderRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const totalItems = useCartStore((s) => s.totalItems());
  // SSR safety: Zustand persist lê localStorage só no cliente.
  // Usar 0 no servidor evita hydration mismatch.
  const displayCount = mounted ? totalItems : 0;

  /* ── Marca montagem no cliente (evita hydration mismatch no cart) ── */
  useEffect(() => { setMounted(true); }, []);

  /* ── Register ScrollTrigger ── */
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
  }, []);

  /* ── Entrance animation on mount ── */
  useEffect(() => {
    const header = headerRef.current;
    const logo = logoRef.current;
    const navItems = navItemsRef.current?.querySelectorAll("a, button") ?? [];
    const cart = cartRef.current;

    // Set initial hidden states
    gsap.set([header, logo, cart], { autoAlpha: 0 });
    gsap.set(navItems, { autoAlpha: 0, y: -8 });
    gsap.set(header, { y: -60 });

    const tl = gsap.timeline({ delay: 0.1, defaults: { ease: "power3.out" } });

    tl.to(header, { autoAlpha: 1, y: 0, duration: 0.75 })
      .to(logo, { autoAlpha: 1, duration: 0.45 }, "-=0.45")
      .to(navItems, { autoAlpha: 1, y: 0, stagger: 0.07, duration: 0.4 }, "-=0.35")
      .to(cart, { autoAlpha: 1, duration: 0.35 }, "-=0.35");

    return () => { tl.kill(); };
  }, []);

  /* ── Scroll detection ── */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ── Animate background + border on scroll ── */
  useEffect(() => {
    const bg = bgRef.current;
    const border = borderRef.current;
    if (!bg || !border) return;

    gsap.to(bg, {
      opacity: scrolled ? 1 : 0,
      duration: 0.4,
      ease: "power2.out",
    });
    gsap.to(border, {
      opacity: scrolled ? 1 : 0,
      duration: 0.4,
      ease: "power2.out",
    });
  }, [scrolled]);

  return (
    <header
      ref={headerRef}
      className="fixed top-0 left-0 right-0 z-40 h-[52px]"
    >
      {/* Solid background — always visible on mobile so hamburger/logo are always readable */}
      <div className="absolute inset-0 pointer-events-none md:hidden bg-[#000000]" />

      {/* Blurred background layer — shown on scroll (desktop) */}
      <div
        ref={bgRef}
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: 0,
          background: "rgba(0,0,0,0.82)",
          backdropFilter: "blur(22px) saturate(180%)",
          WebkitBackdropFilter: "blur(22px) saturate(180%)",
        }}
      />

      {/* Content */}
      <div className="relative mx-auto max-w-7xl h-full px-5 sm:px-8 flex items-center justify-between gap-6">

        {/* Mobile menu */}
        <div className="md:hidden">
          <MobileMenu />
        </div>

        {/* Logo */}
        <Link
          ref={logoRef}
          href="/"
          className="flex-shrink-0 flex flex-col items-start gap-[3px] group relative z-10"
        >
          <Image
            src="/fedullo.png"
            alt="Fedullo"
            width={600}
            height={350}
            priority
            className="h-[26px] w-auto transition-opacity duration-300 group-hover:opacity-80"
          />
          <span
            className="hidden sm:block text-[#dc2626] uppercase leading-none tracking-[0.28em]"
            style={{ fontSize: "7px", fontWeight: 700 }}
          >
            Motorsport Wiring
          </span>
        </Link>

        {/* Desktop nav */}
        <nav ref={navItemsRef} className="hidden md:flex items-center gap-7">
          {NAV_LINKS.map((link) => (
            <NavLink key={link.href} href={link.href} label={link.label} />
          ))}
          <BrandsSubmenu />
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-1">
          <SearchBar />
          <UserMenu />

          {/* Cart */}
          <Link
            ref={cartRef}
            href="/carrinho"
            aria-label={`Carrinho${displayCount > 0 ? ` (${displayCount})` : ""}`}
            className="relative flex items-center justify-center w-11 h-11 rounded-full hover:bg-white/5 transition-colors duration-200"
          >
            <ShoppingBag size={17} strokeWidth={1.4} className="text-white" />
            {displayCount > 0 && (
              <span
                className="absolute -top-0.5 -right-0.5 flex h-[16px] w-[16px] items-center justify-center rounded-full bg-[#dc2626] text-white leading-none"
                style={{ fontSize: "8.5px", fontWeight: 700 }}
              >
                {displayCount > 9 ? "9+" : displayCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Hairline border — fades in on scroll */}
      <div
        ref={borderRef}
        className="absolute bottom-0 left-0 right-0 h-px pointer-events-none"
        style={{
          opacity: 0,
          background:
            "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 15%, rgba(220,38,38,0.3) 50%, rgba(255,255,255,0.06) 85%, transparent 100%)",
        }}
      />
    </header>
  );
}

/* ── Single nav link — GSAP underline on hover ── */
function NavLink({ href, label }: { href: string; label: string }) {
  const lineRef = useRef<HTMLSpanElement>(null);

  const handleEnter = () => {
    gsap.fromTo(
      lineRef.current,
      { scaleX: 0, transformOrigin: "left center" },
      { scaleX: 1, duration: 0.28, ease: "power2.out", transformOrigin: "left center" }
    );
  };

  const handleLeave = () => {
    gsap.to(lineRef.current, {
      scaleX: 0,
      duration: 0.22,
      ease: "power2.in",
      transformOrigin: "right center",
    });
  };

  return (
    <Link
      href={href}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      className="relative text-[13px] font-medium tracking-wide text-[#a1a1aa] hover:text-white transition-colors duration-200 py-1"
    >
      {label}
      <span
        ref={lineRef}
        className="absolute bottom-0 left-0 right-0 h-px bg-[#dc2626]"
        style={{ transform: "scaleX(0)" }}
      />
    </Link>
  );
}
