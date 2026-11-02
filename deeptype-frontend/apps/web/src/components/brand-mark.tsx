/** The DeepType D waveform mark (vector master). ponytail: inline SVG, no extra request. */
export default function BrandMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden role="img">
      <defs>
        <linearGradient
          id="deeptype-mark-gradient"
          x1="14"
          y1="82"
          x2="88"
          y2="18"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#321078" />
          <stop offset="0.52" stopColor="#6420D6" />
          <stop offset="1" stopColor="#9B4DFF" />
        </linearGradient>
      </defs>
      <path
        d="M29 21 H57 C74 21 85 33 85 50 C85 67 74 79 57 79 H29"
        fill="none"
        stroke="url(#deeptype-mark-gradient)"
        strokeWidth="15"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <g fill="url(#deeptype-mark-gradient)">
        <rect x="43" y="44" width="7" height="12" rx="3.5" />
        <rect x="55" y="35" width="7" height="30" rx="3.5" />
        <rect x="67" y="41" width="7" height="18" rx="3.5" />
      </g>
    </svg>
  );
}
