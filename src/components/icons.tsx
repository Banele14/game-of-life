import type { SVGProps } from "react";

const base: SVGProps<SVGSVGElement> = {
  viewBox: "0 0 24 24",
  width: 20,
  height: 20,
  fill: "currentColor",
  "aria-hidden": true,
  focusable: false,
};

export const PlayIcon = () => (
  <svg {...base}>
    <path d="M8 5.6v12.8a1 1 0 0 0 1.53.85l10.04-6.4a1 1 0 0 0 0-1.7L9.53 4.75A1 1 0 0 0 8 5.6z" />
  </svg>
);

export const PauseIcon = () => (
  <svg {...base}>
    <rect x="6.5" y="5" width="4" height="14" rx="1.2" />
    <rect x="13.5" y="5" width="4" height="14" rx="1.2" />
  </svg>
);

export const StepIcon = () => (
  <svg {...base}>
    <path d="M5 6.3v11.4a1 1 0 0 0 1.55.83l8.4-5.7a1 1 0 0 0 0-1.66l-8.4-5.7A1 1 0 0 0 5 6.3z" />
    <rect x="16.5" y="5.5" width="3" height="13" rx="1" />
  </svg>
);

export const RandomIcon = () => (
  <svg {...base}>
    <rect
      x="4"
      y="4"
      width="16"
      height="16"
      rx="4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    />
    <circle cx="8.8" cy="8.8" r="1.5" />
    <circle cx="12" cy="12" r="1.5" />
    <circle cx="15.2" cy="15.2" r="1.5" />
  </svg>
);

export const ClearIcon = () => (
  <svg
    {...base}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4.5 7h15M9.5 7V4.8h5V7M6.8 7l.9 12.2h8.6l.9-12.2" />
  </svg>
);

export const ChevronIcon = () => (
  <svg
    {...base}
    width={14}
    height={14}
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M7 10l5 5 5-5" />
  </svg>
);
