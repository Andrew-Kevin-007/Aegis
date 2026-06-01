"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { forwardRef } from "react";

type CardVariant = "default" | "elevated" | "interactive";
type CardPadding = "none" | "sm" | "md" | "lg";

interface CardProps extends Omit<HTMLMotionProps<"div">, "ref"> {
  variant?: CardVariant;
  padding?: CardPadding;
  children?: React.ReactNode;
}

const variantStyles: Record<CardVariant, string> = {
  default:
    "bg-[#0A0A0A] shadow-inner-border rounded-[12px]",
  elevated:
    "bg-[#0A0A0A] shadow-inner-border rounded-[12px] shadow-glow",
  interactive:
    "bg-[#0A0A0A] shadow-inner-border rounded-[12px] hover:bg-[#111111] hover:shadow-inner-border-hover transition-all duration-200 cursor-pointer",
};

const paddingStyles: Record<CardPadding, string> = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = "default",
      padding = "md",
      children,
      className = "",
      ...props
    },
    ref
  ) => {
    return (
      <motion.div
        ref={ref}
        className={`
          ${variantStyles[variant]}
          ${paddingStyles[padding]}
          ${className}
        `}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

Card.displayName = "Card";

export default Card;
