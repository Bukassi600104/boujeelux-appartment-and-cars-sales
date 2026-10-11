"use client";
import { useEffect } from "react";

export function ScrollEntrances() {
  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motion.matches || !("IntersectionObserver" in window)) return;
    const contents = document.querySelectorAll<HTMLElement>(".page-shell > section:not(.editorial-hero) > .content-width, .editorial-service-page > section > .content-width");
    const reveal = (node: HTMLElement) => {
      node.dataset.entrance = "visible";
      observer.unobserve(node);
    };
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) reveal(entry.target as HTMLElement); });
    }, { threshold: .04, rootMargin: "0px 0px -24px 0px" });
    contents.forEach(node => {
      // Visible or deep-linked sections never disappear during hydration.
      if (node.getBoundingClientRect().top >= window.innerHeight) {
        node.dataset.entrance = "pending";
        observer.observe(node);
      }
    });
    const focus = (event: FocusEvent) => {
      if (event.target instanceof Element) {
        const content = event.target.closest<HTMLElement>('[data-entrance="pending"]');
        if (content) reveal(content);
      }
    };
    const restore = () => { if (motion.matches) contents.forEach(reveal); };
    document.addEventListener("focusin", focus);
    motion.addEventListener("change", restore);
    return () => {
      observer.disconnect();
      contents.forEach(node => { delete node.dataset.entrance; });
      document.removeEventListener("focusin", focus);
      motion.removeEventListener("change", restore);
    };
  }, []);
  return null;
}
