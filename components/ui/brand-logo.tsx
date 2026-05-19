import Link from "next/link";

type BrandLogoProps = {
  ariaLabel?: string;
  className?: string;
  framed?: boolean;
  href?: string;
  iconClassName?: string;
  textClassName?: string;
  variant?: "default" | "mini";
};

export function BrandLogo({
  ariaLabel = "RemontRaport",
  className = "",
  framed = false,
  href,
  iconClassName = "",
  textClassName = "",
  variant = "default",
}: BrandLogoProps) {
  const isMini = variant === "mini";
  const content = (
    <>
      <span
        className={`grid place-items-center text-blue-600 ${
          framed ? "rounded-[9px] ring-1 ring-blue-100" : ""
        } ${isMini ? "size-5" : "size-8"} ${iconClassName}`}
      >
        <svg
          viewBox="0 0 28 28"
          className={isMini ? "size-5" : "size-7"}
          fill="none"
          aria-hidden
        >
          <path
            d="m5 12 9-8 9 8v11H5Z"
            stroke="currentColor"
            strokeLinejoin="round"
            strokeWidth={isMini ? "2.5" : "2.3"}
          />
          <path
            d="M10 23v-8h4v8M18 23V11"
            stroke="#0f9f8f"
            strokeLinejoin="round"
            strokeWidth={isMini ? "2.5" : "2.3"}
          />
        </svg>
      </span>
      <span
        className={
          textClassName ||
          (isMini
            ? "text-[13px] font-extrabold tracking-[-0.03em] text-slate-950"
            : "text-[24px] font-extrabold tracking-[-0.04em] text-slate-950")
        }
      >
        Remont<span className={isMini ? "-ml-1 text-blue-600" : "text-blue-600"}>Raport</span>
      </span>
    </>
  );
  const classes = `flex items-center gap-2.5 ${isMini ? "gap-1.5" : ""} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes} aria-label={ariaLabel}>
        {content}
      </Link>
    );
  }

  return (
    <div className={classes} aria-label={ariaLabel}>
      {content}
    </div>
  );
}
