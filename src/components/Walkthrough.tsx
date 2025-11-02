import React, { useEffect, useLayoutEffect, useState } from "react";

export type TourStep = {
  id: string;
  title: string;
  body: string;
  anchor: string; // CSS selector
};

type Rect = { top:number; left:number; width:number; height:number } | null;

export function Walkthrough({
  steps,
  open,
  onClose,
}: {
  steps: TourStep[];
  open: boolean;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState<Rect>(null);
  const step = steps[index];

  // Keep hooks un-conditional; guard inside
  useEffect(() => { if (open) setIndex(0); }, [open]);

  useLayoutEffect(() => {
    function compute() {
      if (!open || !step) { setRect(null); return; }
      const el = document.querySelector(step.anchor) as HTMLElement | null;
      if (!el) { setRect(null); return; }
      const r = el.getBoundingClientRect();
      setRect({
        top: r.top + window.scrollY,
        left: r.left + window.scrollX,
        width: r.width,
        height: r.height,
      });
      // Optional: auto-scroll into view if partially hidden
      // el.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
    compute();
    const opts = { passive: true } as AddEventListenerOptions;
    window.addEventListener("scroll", compute, opts);
    window.addEventListener("resize", compute, opts);
    return () => { window.removeEventListener("scroll", compute); window.removeEventListener("resize", compute); };
  }, [open, step]);

  if (!open || !step || !rect) return null;

  // --- BELOW positioning ---
  const POPOVER_WIDTH = 280;
  const GAP = 8;
  const top = rect.top + rect.height + GAP;
  const minLeft = window.scrollX + 8;
  const maxLeft = window.scrollX + window.innerWidth - POPOVER_WIDTH - 8;
  const left = Math.max(minLeft, Math.min(rect.left, maxLeft));

  // highlight around anchor
  const highlight: React.CSSProperties = {
    position: "absolute",
    top: rect.top - 4,
    left: rect.left - 4,
    width: rect.width + 8,
    height: rect.height + 8,
    borderRadius: 8,
    border: "2px solid #0ea5e9",
    zIndex: 9998,
    pointerEvents: "none",
  };

  // bubble + arrow
  const popover: React.CSSProperties = {
    position: "absolute",
    top, left, width: POPOVER_WIDTH,
    background: "#fff", color: "#0f172a",
    border: "1px solid #e2e8f0",
    borderRadius: 10, padding: "12px 14px",
    zIndex: 9999, boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
  };
  const arrowLeft = Math.min(rect.left + 16, left + POPOVER_WIDTH - 24) - left;
  const arrowBorder: React.CSSProperties = {
    position: "absolute", top: -6, left: arrowLeft, width: 0, height: 0,
    borderLeft: "6px solid transparent",
    borderRight: "6px solid transparent",
    borderBottom: "6px solid #e2e8f0",
  };
  const arrowFill: React.CSSProperties = {
    position: "absolute", top: -5, left: arrowLeft + 1, width: 0, height: 0,
    borderLeft: "5px solid transparent",
    borderRight: "5px solid transparent",
    borderBottom: "5px solid #fff",
  };

  return (
    <>
      <div style={highlight} />
      <div style={popover}>
        <div style={arrowBorder} />
        <div style={arrowFill} />
        <div style={{ fontWeight: 600, marginBottom: 6 }}>{step.title}</div>
        <div style={{ fontSize: 13, marginBottom: 12, opacity: 0.85 }}>{step.body}</div>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 6 }}>
          <button className="button ghost inline" onClick={onClose} style={{ padding: "6px 10px" }}>Close</button>
          <div style={{ display: "flex", gap: 6 }}>
            <button className="button inline" onClick={() => setIndex(i => Math.max(0, i - 1))} disabled={index===0} style={{ padding: "6px 10px" }}>Back</button>
            <button className="button inline" onClick={() => index===steps.length-1 ? onClose() : setIndex(i => i + 1)} style={{ padding: "6px 10px" }}>
              {index===steps.length-1 ? "Finish" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
