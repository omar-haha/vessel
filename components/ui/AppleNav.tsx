"use client";

import { useState, useRef } from "react";
import { flushSync } from "react-dom";
import { useTheme } from "@/components/providers/ThemeProvider";
import { useCart } from "@/components/providers/CartProvider";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { Moon, Sun, ShoppingBag, Menu, X } from "lucide-react";
import { BrandLogo } from "./BrandLogo";

export function AppleNav() {
  const { theme, toggleTheme } = useTheme();
  const { cartCount, setCartOpen } = useCart();
  const { lang, toggle: toggleLang, t } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);

  const animTokenRef = useRef({ active: false });

  const handleThemeToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(rect.left + rect.width / 2);
    const y = Math.round(rect.top + rect.height / 2);
    const root = document.documentElement;

    const newTheme = theme === "dark" ? "light" : "dark";
    const newBg = newTheme === "dark" ? "#000000" : "#ffffff";

    // Circle of the NEW theme expands from the button outward
    const overlay = document.createElement("div");
    overlay.style.cssText = `position:fixed;inset:0;z-index:9998;pointer-events:none;background-color:${newBg};clip-path:circle(0px at ${x}px ${y}px)`;
    document.body.appendChild(overlay);

    // Exact radius to reach the farthest screen corner from the button.
    // Animating to this (not 200vmax) means .finished fires the instant
    // the screen is fully covered — zero premature coverage, zero hold.
    const maxR = Math.ceil(
      Math.sqrt(
        Math.max(x, window.innerWidth  - x) ** 2 +
        Math.max(y, window.innerHeight - y) ** 2
      )
    ) + 2;

    overlay.animate(
      [
        { clipPath: `circle(0px at ${x}px ${y}px)` },
        { clipPath: `circle(${maxR}px at ${x}px ${y}px)` },
      ],
      { duration: 750, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "forwards" }
    ).finished.then(() => {
      // Snap the new theme in while the overlay still covers the screen,
      // so the browser paints the correct colours before we lift the overlay.
      const noTransition = document.createElement("style");
      noTransition.textContent = "*{transition:none!important}";
      document.head.appendChild(noTransition);

      root.setAttribute("data-theme", newTheme);
      flushSync(() => toggleTheme());

      // Wait one frame so the browser renders the new theme under the overlay,
      // then lift the overlay — eliminates the old-theme flash.
      requestAnimationFrame(() => {
        overlay.remove();
        requestAnimationFrame(() => noTransition.remove());
      });
    });
  };

  const handleLangToggle = () => {
    const TICK = 16; // ms per character (~700ms for a 40-char change)

    const getVisibleNodes = (): Map<Text, string> => {
      const map = new Map<Text, string>();
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let n: Node | null;
      while ((n = walker.nextNode())) {
        const t = n as Text;
        const v = t.nodeValue ?? "";
        if (!v.trim()) continue;
        const p = t.parentElement;
        if (!p) continue;
        const r = p.getBoundingClientRect();
        if (r.bottom < 0 || r.top > window.innerHeight) continue;
        const st = getComputedStyle(p);
        if (st.display === "none" || st.visibility === "hidden") continue;
        map.set(t, v);
      }
      return map;
    };

    // Cancel any in-progress animation
    animTokenRef.current.active = false;
    const token = { active: true };
    animTokenRef.current = token;

    // Snapshot old text, switch language, then compare
    const before = getVisibleNodes();
    flushSync(() => toggleLang());

    type Anim = { node: Text; prefix: string; del: string; ins: string };
    const anims: Anim[] = [];

    before.forEach((oldText, node) => {
      if (!node.parentNode) return;
      const newText = node.nodeValue ?? "";
      if (newText === oldText) return;

      // Common prefix — only animate the differing suffix
      let pLen = 0;
      while (pLen < oldText.length && pLen < newText.length && oldText[pLen] === newText[pLen]) pLen++;
      const del = oldText.slice(pLen);
      const ins = newText.slice(pLen);

      // Skip very long changes (paragraphs) — they already show correct via flushSync
      if (del.length + ins.length > 44) return;

      anims.push({ node, prefix: oldText.slice(0, pLen), del, ins });
      node.nodeValue = oldText; // restore old text so animation starts from it
    });

    anims.forEach(({ node, prefix, del, ins }) => {
      const total = del.length + ins.length;
      if (total === 0) return;
      let step = 0;

      const tick = () => {
        if (!token.active) { node.nodeValue = prefix + ins; return; }
        if (!node.parentNode) return;

        if (step < del.length) {
          node.nodeValue = prefix + del.slice(0, del.length - step);
        } else {
          node.nodeValue = prefix + ins.slice(0, step - del.length);
        }

        step++;
        if (step <= total) setTimeout(tick, TICK);
        else node.nodeValue = prefix + ins;
      };

      setTimeout(tick, TICK);
    });
  };

  const NAV_LINKS = [
    { label: t("nav_store"),   href: "/#store" },
    { label: t("nav_reviews"), href: "/reviews" },
    { label: t("nav_faq"),     href: "/faq" },
    { label: t("nav_contact"), href: "/contact" },
  ];

  return (
    <>
      <nav
        className="fixed top-8 left-0 right-0 z-[1000] h-[44px] nav-blur transition-colors duration-300"
        style={{ backgroundColor: "var(--nav-bg)", borderBottom: "1px solid var(--border)" }}
      >
        <div className="w-full h-full px-5 md:px-8 flex items-center justify-between">
          {/* Logo */}
          <div className="flex-1 flex justify-start">
            <a href="/" className="hover:opacity-80 transition-opacity no-underline flex items-center">
              <BrandLogo className="h-[16px] w-auto text-logo" />
            </a>
          </div>

          {/* Desktop links */}
          <div className="hidden md:flex items-center justify-center gap-8 text-[12px] font-normal tracking-wide flex-1">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-primary opacity-80 hover:opacity-100 transition-opacity duration-300 no-underline"
              >
                {l.label}
              </a>
            ))}
          </div>

          {/* Right actions */}
          <div className="flex-1 flex items-center justify-end gap-4">
            {/* Language toggle */}
            <button
              onClick={handleLangToggle}
              className="text-primary opacity-70 hover:opacity-100 transition-opacity cursor-pointer bg-transparent border-none flex items-center justify-center p-0 text-[11px] font-semibold tracking-widest"
              aria-label="Toggle language"
            >
              {lang === "en" ? "FR" : "EN"}
            </button>

            <button
              onClick={handleThemeToggle}
              className="text-primary opacity-80 hover:opacity-100 transition-opacity cursor-pointer bg-transparent border-none flex items-center justify-center p-0"
              aria-label="Toggle Theme"
            >
              {theme === "dark" ? <Sun size={16} strokeWidth={1.5} /> : <Moon size={16} strokeWidth={1.5} />}
            </button>

            <button
              onClick={() => setCartOpen(true)}
              className="relative text-primary opacity-80 hover:opacity-100 transition-opacity cursor-pointer bg-transparent border-none flex items-center justify-center p-0"
              aria-label="Open bag"
            >
              <ShoppingBag size={16} strokeWidth={1.5} />
              {cartCount > 0 && (
                <span className="absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 bg-accent rounded-full text-[9px] font-bold flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Hamburger — mobile only */}
            <button
              onClick={() => setMobileOpen((o) => !o)}
              className="md:hidden text-primary opacity-80 hover:opacity-100 transition-opacity cursor-pointer bg-transparent border-none flex items-center justify-center p-0"
              aria-label="Menu"
            >
              {mobileOpen ? <X size={18} strokeWidth={1.5} /> : <Menu size={18} strokeWidth={1.5} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile dropdown */}
      <div
        className="fixed top-[76px] left-0 right-0 z-[999] md:hidden overflow-hidden transition-all duration-300"
        style={{
          backgroundColor: "var(--bg)",
          borderBottom: mobileOpen ? "1px solid var(--border)" : "none",
          maxHeight: mobileOpen ? "220px" : "0px",
          opacity: mobileOpen ? 1 : 0,
        }}
      >
        <div className="flex flex-col px-6 py-4 gap-4">
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setMobileOpen(false)}
              className="text-primary text-[15px] font-normal opacity-80 hover:opacity-100 transition-opacity no-underline"
            >
              {l.label}
            </a>
          ))}
        </div>
      </div>
    </>
  );
}
