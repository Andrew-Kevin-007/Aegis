"use client";

import { motion } from "framer-motion";

type BadgeVariant =
  | "upcoming"
  | "overdue"
  | "paid"
  | "neutral";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  upcoming: "text-text-secondary",
  overdue: "text-danger",
  paid: "text-success",
  neutral: "text-text-muted",
};

export default function Badge({
  variant = "neutral",
  children,
  className = "",
}: BadgeProps) {
  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`
        inline-flex items-center
        font-mono text-[10px] tracking-widest uppercase
        ${variantStyles[variant]}
        ${className}
      `}
    >
      [ {children} ]
    </motion.span>
  );
}
