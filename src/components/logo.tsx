export function Logo({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect height="20" rx="6" stroke="currentColor" strokeWidth="1.75" width="20" x="2" y="2" />
      <line stroke="currentColor" strokeLinecap="round" strokeWidth="1.75" x1="12" x2="12" y1="5.5" y2="18.5" />
      <line stroke="currentColor" strokeLinecap="round" strokeWidth="1.75" x1="5" x2="9.5" y1="9" y2="9" />
      <line stroke="currentColor" strokeLinecap="round" strokeWidth="1.75" x1="5" x2="8" y1="14.5" y2="14.5" />
    </svg>
  );
}
