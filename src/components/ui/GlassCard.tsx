"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  delay?: number;
}

export function GlassCard({ children, className, title, subtitle, delay = 0 }: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={cn("glass-card group", className)}
    >
      {(title || subtitle) && (
        <div className="mb-4 space-y-1">
          {title && (
            <h3 className="text-sm font-semibold tracking-wider text-surgical-blue uppercase flex items-center gap-2">
              <span className="w-1 h-3 bg-surgical-blue rounded-full inline-block" />
              {title}
            </h3>
          )}
          {subtitle && <p className="text-xs text-white/40">{subtitle}</p>}
        </div>
      )}
      {children}
    </motion.div>
  );
}
