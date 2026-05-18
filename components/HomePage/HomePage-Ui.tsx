export type IconName =
  | "user"
  | "arrow"
  | "play"
  | "check"
  | "shield"
  | "lock"
  | "image"
  | "message"
  | "users"
  | "folder"
  | "camera"
  | "alert"
  | "file"
  | "building"
  | "helmet"
  | "drill"
  | "investor"
  | "download"
  | "gift";

type IconProps = {
  name: IconName;
  className?: string;
};

export function SectionHeading({
  children,
  id,
}: {
  children: React.ReactNode;
  id: string;
}) {
  return (
    <h2
      id={id}
      className="scroll-mt-28 text-center text-[28px] font-extrabold tracking-[-0.04em] text-slate-950"
    >
      {children}
    </h2>
  );
}

export function Icon({ name, className = "" }: IconProps) {
  const common = {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.9,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  switch (name) {
    case "user":
      return (
        <svg {...common}>
          <path d="M19 20a7 7 0 0 0-14 0" />
          <circle cx="12" cy="8" r="3.5" />
        </svg>
      );
    case "arrow":
      return (
        <svg {...common}>
          <path d="M5 12h14" />
          <path d="m13 6 6 6-6 6" />
        </svg>
      );
    case "play":
      return (
        <svg {...common}>
          <path d="m9 7 8 5-8 5Z" />
        </svg>
      );
    case "check":
      return (
        <svg {...common}>
          <path d="m5 12 4 4L19 6" />
        </svg>
      );
    case "shield":
      return (
        <svg {...common}>
          <path d="M12 3 5 6v5c0 4.2 2.7 7.7 7 10 4.3-2.3 7-5.8 7-10V6Z" />
          <path d="m9 12 2 2 4-5" />
        </svg>
      );
    case "lock":
      return (
        <svg {...common}>
          <rect x="6" y="10" width="12" height="10" rx="2" />
          <path d="M9 10V7a3 3 0 0 1 6 0v3" />
        </svg>
      );
    case "image":
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="14" rx="2.5" />
          <circle cx="8.5" cy="10" r="1.5" />
          <path d="m3 16 4.2-4.2a2 2 0 0 1 2.8 0l1.6 1.6 2.1-2.1a2 2 0 0 1 2.8 0L21 15.8" />
        </svg>
      );
    case "message":
      return (
        <svg {...common}>
          <path d="M8.4 18.6a8 8 0 1 0-2.9-3l-1 3.9Z" />
          <path d="M8.6 9.2c.8 2.7 2.6 4.5 5.2 5.2l1.4-1.4-2-1-1 .7c-.9-.5-1.6-1.2-2.1-2.1l.7-1-1-2Z" />
        </svg>
      );
    case "users":
      return (
        <svg {...common}>
          <path d="M16 19a5 5 0 0 0-10 0" />
          <circle cx="11" cy="8" r="3" />
          <path d="M21 19a4 4 0 0 0-4-4" />
          <path d="M17 5.2a3 3 0 0 1 0 5.6" />
        </svg>
      );
    case "folder":
      return (
        <svg {...common}>
          <path d="M3.5 7.5A2.5 2.5 0 0 1 6 5h4l2 2h6a2.5 2.5 0 0 1 2.5 2.5V17A2.5 2.5 0 0 1 18 19.5H6A2.5 2.5 0 0 1 3.5 17Z" />
          <path d="M4 10h16" />
        </svg>
      );
    case "camera":
      return (
        <svg {...common}>
          <path d="M5 8h3l1.5-2h5L16 8h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2Z" />
          <circle cx="12" cy="13.5" r="3.2" />
        </svg>
      );
    case "alert":
      return (
        <svg {...common}>
          <path d="m12 3 10 18H2Z" />
          <path d="M12 9v5" />
          <path d="M12 17h.01" />
        </svg>
      );
    case "file":
      return (
        <svg {...common}>
          <path d="M7 3h7l4 4v14H7Z" />
          <path d="M14 3v5h5" />
          <path d="M9.5 12h5" />
          <path d="M9.5 16h5" />
        </svg>
      );
    case "building":
      return (
        <svg {...common}>
          <path d="M4 21V5l8-2 8 2v16" />
          <path d="M9 21v-5h6v5" />
          <path d="M8 8h.01M12 8h.01M16 8h.01M8 12h.01M12 12h.01M16 12h.01" />
        </svg>
      );
    case "helmet":
      return (
        <svg {...common}>
          <path d="M4 14a8 8 0 0 1 16 0" />
          <path d="M3 14h18" />
          <path d="M8 14v-3a4 4 0 0 1 8 0v3" />
          <path d="M6 18h12" />
        </svg>
      );
    case "drill":
      return (
        <svg {...common}>
          <path d="M4 8h10v5H4Z" />
          <path d="M14 10.5h4l3-2v4l-3-2" />
          <path d="M8 13v6h4v-6" />
          <path d="M6 6V4h5v2" />
        </svg>
      );
    case "investor":
      return (
        <svg {...common}>
          <path d="M7 20a5 5 0 0 1 10 0" />
          <circle cx="12" cy="9" r="3" />
          <path d="M8.5 7.5 12 4l3.5 3.5" />
          <path d="M5 11h14" />
        </svg>
      );
    case "download":
      return (
        <svg {...common}>
          <path d="M12 4v10" />
          <path d="m8 10 4 4 4-4" />
          <path d="M5 20h14" />
        </svg>
      );
    case "gift":
      return (
        <svg {...common}>
          <path d="M4 11h16v10H4Z" />
          <path d="M12 11v10" />
          <path d="M3 7h18v4H3Z" />
          <path d="M12 7H8.8A2.3 2.3 0 1 1 12 3.8Z" />
          <path d="M12 7h3.2A2.3 2.3 0 1 0 12 3.8Z" />
        </svg>
      );
  }
}

export function LogoMini() {
  return (
    <div className="flex items-center gap-1.5 text-[13px] font-extrabold tracking-[-0.03em] text-slate-950">
      <span className="grid size-5 place-items-center text-blue-600">
        <svg viewBox="0 0 28 28" className="size-5" fill="none" aria-hidden>
          <path
            d="m5 12 9-8 9 8v11H5Z"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <path
            d="M10 23v-8h4v8M18 23V11"
            stroke="#0f9f8f"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      Remont<span className="-ml-1 text-blue-600">Raport</span>
    </div>
  );
}

export function RoomThumb({
  variant = 0,
  className = "h-[50px]",
}: {
  variant?: number;
  className?: string;
}) {
  const gradients = [
    "bg-[linear-gradient(135deg,#d8cbbb_0_48%,#b39c83_49_60%,#f5f1eb_61_100%)]",
    "bg-[linear-gradient(135deg,#c9b8a5_0_34%,#efe8dd_35_70%,#a88f74_71_100%)]",
    "bg-[linear-gradient(135deg,#eee8de_0_42%,#b79c7f_43_56%,#d6c7b5_57_100%)]",
  ];

  return (
    <div
      className={`relative overflow-hidden rounded-md ${className} ${gradients[variant]}`}
    >
      <span className="absolute bottom-1.5 left-1.5 h-3 w-6 rounded-sm bg-white/55" />
      <span className="absolute right-1.5 top-1.5 h-5 w-3 rounded-sm bg-slate-900/10" />
    </div>
  );
}
