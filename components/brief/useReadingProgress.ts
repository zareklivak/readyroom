"use client";

import { useEffect, useState } from "react";
import { SECTIONS } from "@/lib/brief-meta";

/** Tracks overall scroll progress (0–1) and the section currently in view.
 *  Drives both the top progress bar and the rail's "5:00" meter from one
 *  listener, so they never disagree. */
export function useReadingProgress() {
  const [progress, setProgress] = useState(0);
  const [activeId, setActiveId] = useState(SECTIONS[0]?.id ?? "");

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 1);

      // Active section = the last one whose top has crossed a line ~a third down.
      const line = window.scrollY + window.innerHeight * 0.35;
      let current = SECTIONS[0]?.id ?? "";
      for (const s of SECTIONS) {
        const el = document.getElementById(s.id);
        if (el && el.offsetTop <= line) current = s.id;
      }
      setActiveId(current);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return { progress, activeId };
}
