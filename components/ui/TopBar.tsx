import { BrandLogo } from "./BrandLogo";
import { Icon } from "./Icon";

export function Topbar({
  email,
  initials,
  name,
}: {
  email: string;
  initials: string;
  name: string;
}) {
  return (
    <header className="flex items-center justify-between gap-4">
      <BrandLogo />
      <div className="flex items-center gap-5">
        <button
          className="relative hidden text-slate-600 transition hover:text-blue-600 sm:block"
          aria-label="Powiadomienia"
        >
          <Icon name="bell" className="size-7" />
          <span className="absolute -right-1 -top-2 grid size-5 place-items-center rounded-full bg-blue-600 text-[11px] font-extrabold text-white">
            3
          </span>
        </button>
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-full bg-blue-100 text-sm font-extrabold text-blue-700 ring-4 ring-slate-100">
            {initials}
          </span>
          <div className="hidden md:block">
            <p className="text-[15px] font-extrabold text-slate-950">{name}</p>
            <p className="max-w-[190px] truncate text-sm text-slate-500">
              {email}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
