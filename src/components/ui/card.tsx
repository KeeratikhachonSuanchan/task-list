export default function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-card border border-border bg-surface
      shadow-card ${className}`}>{children}</div>
  );
}