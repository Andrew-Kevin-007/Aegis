"use client";

import { forwardRef, useState } from "react";
import { motion } from "framer-motion";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      icon,
      fullWidth = true,
      className = "",
      onFocus,
      onBlur,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
      <div className={`${fullWidth ? "w-full" : ""}`}>
        {label && (
          <label className="block text-sm font-medium text-text-secondary mb-2">
            {label}
          </label>
        )}
        <motion.div
          animate={{
            borderColor: error
              ? "rgba(239, 68, 68, 0.5)"
              : isFocused
              ? "rgba(255, 255, 255, 0.3)"
              : "rgba(255, 255, 255, 0.1)",
          }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className={`
            relative flex items-center
            bg-white/[0.05] backdrop-blur-xl
            border rounded-[12px]
            transition-all duration-200
            ${error ? "border-danger/50" : "border-white/10"}
            ${isFocused && !error ? "shadow-lg shadow-primary/10" : ""}
          `}
        >
          {icon && (
            <span className="pl-4 text-text-muted flex-shrink-0">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            onFocus={(e) => {
              setIsFocused(true);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              onBlur?.(e);
            }}
            className={`
              w-full bg-transparent
              px-4 py-3
              text-text-primary placeholder:text-text-muted
              outline-none
              text-base
              ${icon ? "pl-2" : ""}
              ${className}
            `}
            {...props}
          />
        </motion.div>
        {(error || helperText) && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className={`mt-2 text-sm ${
              error ? "text-danger" : "text-text-muted"
            }`}
          >
            {error || helperText}
          </motion.p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
