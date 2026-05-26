import React from "react";
import { motion, useAnimation, type Variants } from "framer-motion";

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

interface HeroBadgeProps {
  href?: string;
  text: string;
  icon?: React.ReactNode;
  endIcon?: React.ReactNode;
  className?: string;
  onClick?: () => void;
  size?: "sm" | "md" | "lg";
}

const sizeStyles: Record<string, string> = {
  sm: "px-3 py-1 text-xs gap-1.5",
  md: "px-4 py-1.5 text-sm gap-2",
  lg: "px-5 py-2 text-base gap-2.5",
};

const iconAnimate: Variants = {
  initial: { rotate: 0 },
  hover: { rotate: -10 },
};

export default function HeroBadge({
  href,
  text,
  icon,
  endIcon,
  className = "",
  onClick,
  size = "md",
}: HeroBadgeProps) {
  const controls = useAnimation();

  const baseClasses = [
    "inline-flex items-center rounded-full border transition-colors select-none",
    sizeStyles[size],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const inner = (
    <motion.div
      className={baseClasses}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease }}
      onHoverStart={() => controls.start("hover")}
      onHoverEnd={() => controls.start("initial")}
    >
      {icon && (
        <motion.span
          variants={iconAnimate}
          initial="initial"
          animate={controls}
          transition={{ type: "spring", stiffness: 300, damping: 10 }}
        >
          {icon}
        </motion.span>
      )}
      <span>{text}</span>
      {endIcon && <span className="opacity-60">{endIcon}</span>}
    </motion.div>
  );

  if (href) {
    return (
      <a href={href} className="no-underline cursor-pointer inline-flex group">
        {inner}
      </a>
    );
  }

  return (
    <button onClick={onClick} className="inline-flex p-0 bg-transparent border-0 cursor-pointer group">
      {inner}
    </button>
  );
}
