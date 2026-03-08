import React, { useRef, useCallback } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionStyle,
} from "framer-motion";
import { gsap } from "gsap";
import { cn } from "@/lib/utils";

interface TiltCardProps extends React.PropsWithChildren {
  className?: string;
  /** Maximum tilt angle in degrees */
  maxTilt?: number;
  /** Perspective distance in px */
  perspective?: number;
  /** Scale on hover */
  hoverScale?: number;
  /** Glare effect */
  glare?: boolean;
  style?: React.CSSProperties;
}

const springConfig = { stiffness: 300, damping: 20, mass: 0.5 };

export const TiltCard: React.FC<TiltCardProps> = ({
  children,
  className,
  maxTilt = 8,
  perspective = 800,
  hoverScale = 1.02,
  glare = true,
  style,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);

  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const scale = useMotionValue(1);

  const springRotateX = useSpring(rotateX, springConfig);
  const springRotateY = useSpring(rotateY, springConfig);
  const springScale = useSpring(scale, springConfig);

  const glareOpacity = useTransform(springScale, [1, hoverScale], [0, 0.15]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const normalX = (e.clientX - centerX) / (rect.width / 2);
      const normalY = (e.clientY - centerY) / (rect.height / 2);

      rotateX.set(-normalY * maxTilt);
      rotateY.set(normalX * maxTilt);
      scale.set(hoverScale);

      if (glare && glareRef.current) {
        const angle = Math.atan2(normalY, normalX) * (180 / Math.PI) + 90;
        gsap.to(glareRef.current, {
          background: `linear-gradient(${angle}deg, rgba(0,212,170,0.12) 0%, transparent 60%)`,
          duration: 0.3,
          ease: "power2.out",
        });
      }
    },
    [maxTilt, hoverScale, rotateX, rotateY, scale, glare],
  );

  const handleMouseLeave = useCallback(() => {
    rotateX.set(0);
    rotateY.set(0);
    scale.set(1);

    if (glare && glareRef.current) {
      gsap.to(glareRef.current, {
        opacity: 0,
        duration: 0.4,
        ease: "power2.out",
      });
    }
  }, [rotateX, rotateY, scale, glare]);

  const handleMouseEnter = useCallback(() => {
    if (glare && glareRef.current) {
      gsap.to(glareRef.current, { opacity: 1, duration: 0.3 });
    }
  }, [glare]);

  const motionStyle: MotionStyle = {
    perspective,
    rotateX: springRotateX,
    rotateY: springRotateY,
    scale: springScale,
    transformStyle: "preserve-3d" as const,
    ...style,
  };

  return (
    <motion.div
      ref={cardRef}
      className={cn("relative", className)}
      style={motionStyle}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
    >
      {children}
      {glare && (
        <motion.div
          ref={glareRef}
          className="pointer-events-none absolute inset-0 z-20 rounded-lg opacity-0"
          style={{ opacity: glareOpacity }}
        />
      )}
    </motion.div>
  );
};
