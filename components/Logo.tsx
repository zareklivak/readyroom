// ReadyRoom mark — a small inline SVG (an open doorway in white on the
// accent square), self-contained so there's no image asset to manage and it
// inherits the accent token. Sits beside the ReadyRoom wordmark.
export function Logo({ size = 22, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      role="img"
      aria-label="ReadyRoom"
    >
      <rect width="24" height="24" rx="5.5" fill="var(--color-accent)" />
      <g
        fill="none"
        stroke="#ffffff"
        strokeWidth="1.4"
        strokeLinejoin="round"
        strokeLinecap="round"
      >
        {/* door frame */}
        <path d="M7 19 V5 H17 V19" />
        {/* open door panel */}
        <path d="M7 5 L13 7 V19 L7 19" />
        {/* handle */}
        <path d="M11.2 12.5 V13.5" />
        {/* floor */}
        <path d="M5 19 H19" />
      </g>
    </svg>
  );
}
