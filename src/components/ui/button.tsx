import { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "danger" | "ghost";
type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  loading?: boolean;
};

const styles: Record<Variant, string> = {
  primary: "bg-primary text-white hover:bg-primary-hover",
  danger:  "bg-danger text-white hover:opacity-90",
  ghost:   "text-muted hover:text-foreground hover:bg-surface-2",
};

export default function Button({
  variant = "primary", loading, disabled, children, className = "", ...rest
}: Props) {
  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-md
        px-4 py-2 text-sm font-medium transition-colors
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary
        disabled:opacity-50 disabled:cursor-not-allowed
        ${styles[variant]} ${className}`}
      {...rest}
    >
      {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
      {children}
    </button>
  );
}