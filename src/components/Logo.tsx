interface LogoMarkProps {
  className?: string;
}

/**
 * Mark DompetKos: dompet bergaya dengan aksen koin amber.
 * Identitas visual sendiri — bukan logo aplikasi lain.
 */
export function LogoMark({ className = "h-9 w-9" }: LogoMarkProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <rect x="2" y="6" width="20" height="14" rx="4" fill="#0F766E" />
      <rect x="2" y="6" width="20" height="14" rx="4" fill="url(#dk-g)" fillOpacity="0.35" />
      <path
        d="M14.5 11.2h6a1 1 0 0 1 1 1v3.6a1 1 0 0 1-1 1h-6a2.8 2.8 0 0 1 0-5.6Z"
        fill="#14B8A6"
      />
      <circle cx="17.6" cy="14" r="1.15" fill="#FBBF24" />
      <path
        d="M6.5 10.2h4"
        stroke="#5EEAD4"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <defs>
        <linearGradient id="dk-g" x1="2" y1="6" x2="22" y2="20">
          <stop stopColor="#14B8A6" />
          <stop offset="1" stopColor="#0F766E" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}
