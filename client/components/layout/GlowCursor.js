"use client";
import { useEffect, useRef } from "react";

export default function GlowCursor() {
  const glowRef = useRef(null);

  useEffect(() => {
    const glow = glowRef.current;

    const move = (e) => {
      glow.style.left = `${e.clientX}px`;
      glow.style.top = `${e.clientY}px`;
    };

    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

    return (
    <div
        ref={glowRef}
        style={{
        position: "fixed",
        width: 340,
        height: 340,
        pointerEvents: "none",
        borderRadius: "50%",
        background:
            "radial-gradient(circle, rgba(0,150,255,0.28) 0%, rgba(0,0,0,0) 70%)",
        filter: "blur(40px)",
        transform: "translate(-50%, -50%)",
        zIndex: 1,                // keep under content
        }}
    />
  );
}