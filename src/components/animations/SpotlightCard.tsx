import React, { useRef, useState, useCallback } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";

gsap.registerPlugin(useGSAP);

interface Position {
  x: number;
  y: number;
}

interface SpotlightCardProps extends React.PropsWithChildren {
  className?: string;
  spotlightColor?: string;
  strokeColor?: string;
  /** Animate entrance with gsap */
  animateIn?: boolean;
}

export const SpotlightCard: React.FC<SpotlightCardProps> = ({
  children,
  className,
  spotlightColor = "rgba(0, 212, 170, 0.15)",
  strokeColor = "rgba(0, 212, 170, 0.4)",
  animateIn = true,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  useGSAP(
    () => {
      if (!animateIn || !cardRef.current) return;
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 24, scale: 0.97 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          ease: "power3.out",
          scrollTrigger: {
            trigger: cardRef.current,
            start: "top 90%",
            once: true,
          },
        },
      );
    },
    { scope: cardRef, dependencies: [animateIn] },
  );

  const handleMouseMove: React.MouseEventHandler<HTMLDivElement> = useCallback(
    (e) => {
      if (!cardRef.current || isFocused) return;
      const rect = cardRef.current.getBoundingClientRect();
      setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    },
    [isFocused],
  );

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    setOpacity(0.6);
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    setOpacity(0);
  }, []);

  const handleMouseEnter = useCallback(() => setOpacity(0.6), []);
  const handleMouseLeave = useCallback(() => setOpacity(0), []);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "spotlight-card relative overflow-hidden rounded-lg border border-border bg-card transition-shadow duration-300",
        className,
      )}
      style={{
        boxShadow:
          opacity > 0
            ? `0 0 0 1px ${strokeColor}, 0 0 20px -5px ${spotlightColor}`
            : undefined,
      }}
    >
      {/* Spotlight radial gradient overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-500 ease-in-out"
        style={{
          opacity,
          background: `radial-gradient(circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 80%)`,
        }}
      />
      {/* Spotlight stroke border overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-10 rounded-lg transition-opacity duration-500"
        style={{
          opacity,
          boxShadow: `inset 0 0 0 1px ${strokeColor}`,
        }}
      />
      <div className="relative z-0">{children}</div>
    </div>
  );
};
