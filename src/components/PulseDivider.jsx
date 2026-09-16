export default function PulseDivider({ className = "" }) {
  return (
    <svg
      className={`pulse-divider ${className}`}
      viewBox="0 0 1200 28"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M0 14 H430 L455 14 L468 4 L482 24 L496 14 L510 14 H1200" />
    </svg>
  );
}
