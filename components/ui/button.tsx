import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

const baseStyles =
  "inline-flex items-center justify-center whitespace-nowrap text-sm transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay/30 disabled:pointer-events-none disabled:opacity-50";

const variants = {
  primary:
    "rounded-full border border-ink bg-ink px-5 text-white shadow-sm hover:-translate-y-0.5 hover:bg-[#2D2A25] dark:border-ink-light dark:bg-surface-dark dark:hover:bg-surface-dark-hover",
  secondary:
    "group gap-2 rounded-none border-b border-transparent px-0 text-ink/72 hover:border-clay/40 hover:text-ink dark:text-ink-light/70 dark:hover:text-ink-light",
  ghost:
    "rounded-none border-b border-transparent px-0 text-ink/60 hover:border-ink/20 hover:text-ink dark:text-ink-light/60 dark:hover:text-ink-light",
};

const sizes = {
  sm: "py-1.5 text-sm",
  md: "py-2 text-sm",
  lg: "py-2.5 text-[15px]",
};

interface ButtonProps {
  children: ReactNode;
  className?: string;
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
}

interface ButtonAsButtonProps extends ButtonProps {
  disabled?: boolean;
  onClick?: () => void | Promise<void>;
  type?: "button" | "submit" | "reset";
}

interface ButtonLinkProps extends ButtonProps {
  href: string;
}

export function Button({
  children,
  className,
  disabled,
  variant = "primary",
  size = "md",
  onClick,
  type = "button",
}: ButtonAsButtonProps) {
  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled}
      onClick={onClick}
      type={type}
    >
      {children}
    </button>
  );
}

export function ButtonLink({
  children,
  className,
  href,
  variant = "primary",
  size = "md",
}: ButtonLinkProps) {
  return (
    <Link
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      href={href}
    >
      {children}
    </Link>
  );
}
