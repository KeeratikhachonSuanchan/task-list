import { InputHTMLAttributes } from "react";

export default function Input({ className = "", ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full rounded-md border border-border bg-surface
        px-4 py-2 text-sm text-foreground placeholder:text-muted
        transition-colors focus-visible:outline-none
        focus-visible:ring-2 focus-visible:ring-primary ${className}`}
      {...rest}
    />
  );
}