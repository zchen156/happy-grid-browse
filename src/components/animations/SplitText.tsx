import { useMemo } from "react";
import { motion, type Variants } from "framer-motion";

type SplitType = "chars" | "words";

interface SplitTextProps {
  text: string;
  className?: string;
  /** Delay between each element in seconds */
  staggerDelay?: number;
  duration?: number;
  splitType?: SplitType;
  tag?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span";
  /** Animate when scrolled into viewport */
  animateOnScroll?: boolean;
  /** Viewport margin for scroll trigger */
  viewportMargin?: string;
}

const containerVariants: Variants = {
  hidden: {},
  visible: (staggerDelay: number) => ({
    transition: {
      staggerChildren: staggerDelay,
    },
  }),
};

const charVariants: Variants = {
  hidden: { opacity: 0, y: 20, filter: "blur(4px)" },
  visible: (duration: number) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  }),
};

export const SplitText: React.FC<SplitTextProps> = ({
  text,
  className,
  staggerDelay = 0.03,
  duration = 0.5,
  splitType = "chars",
  tag = "p",
  animateOnScroll = true,
  viewportMargin = "-80px",
}) => {
  const Tag = motion[tag] as typeof motion.p;

  const elements = useMemo(() => {
    if (splitType === "words") {
      return text.split(/(\s+)/).map((word, i) => ({
        key: `${word}-${i}`,
        content: word,
        isSpace: /^\s+$/.test(word),
      }));
    }
    return text.split("").map((char, i) => ({
      key: `${char}-${i}`,
      content: char,
      isSpace: char === " ",
    }));
  }, [text, splitType]);

  return (
    <Tag
      className={className}
      variants={containerVariants}
      initial="hidden"
      {...(animateOnScroll
        ? { whileInView: "visible", viewport: { once: true, margin: viewportMargin } }
        : { animate: "visible" })}
      custom={staggerDelay}
      aria-label={text}
      style={{ display: "flex", flexWrap: "wrap" }}
    >
      {elements.map((el) =>
        el.isSpace ? (
          <span key={el.key} style={{ width: splitType === "chars" ? "0.3em" : undefined }}>
            {el.content}
          </span>
        ) : (
          <motion.span
            key={el.key}
            variants={charVariants}
            custom={duration}
            className="inline-block"
          >
            {el.content}
          </motion.span>
        ),
      )}
    </Tag>
  );
};
