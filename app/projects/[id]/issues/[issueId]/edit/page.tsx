import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AppSidebar } from "@/app/app-sidebar";
import { updateIssueAction } from "@/app/projects/[id]/issues/[issueId]/edit/actions";
import { IssueForm } from "@/app/projects/[id]/issues/new/issue-form";
import { getProjectIssue, IssueError } from "@/lib/issues";
import { getProjectForUser, ProjectError } from "@/lib/projects";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "Edycja usterki - RemontRaport",
  description: "Edycja usterki projektu RemontRaport.",
};

type EditIssuePageProps = {
  params: Promise<{ id: string; issueId: string }>;
};

type IconName = "bell" | "chevron" | "wrench";

async function getEditIssuePageUser() {
  try {
    const supabase = await getSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    return user;
  } catch {
    return null;
  }
}

async function getProject(projectId: string, userId: string) {
  try {
    const supabase = await getSupabaseServerClient();

    return await getProjectForUser(supabase, projectId, userId);
  } catch (error) {
    if (error instanceof ProjectError && error.status === 404) {
      notFound();
    }

    throw error;
  }
}

async function getIssue(projectId: string, issueId: string) {
  try {
    return await getProjectIssue(projectId, issueId);
  } catch (error) {
    if (error instanceof IssueError && error.status === 404) {
      notFound();
    }

    throw error;
  }
}

function Icon({
  name,
  className = "",
}: {
  name: IconName;
  className?: string;
}) {
  const common = {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.85,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  switch (name) {
    case "bell":
      return (
        <svg {...common}>
          <path d="M18 8a6 6 0 1 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
          <path d="M10 21h4" />
        </svg>
      );
    case "chevron":
      return (
        <svg {...common}>
          <path d="m9 18 6-6-6-6" />
        </svg>
      );
    case "wrench":
      return (
        <svg {...common}>
          <path d="M14.7 6.3a4 4 0 0 0-5 5L4 17v3h3l5.7-5.7a4 4 0 0 0 5-5l-2.8 2.8-3-3Z" />
        </svg>
      );
  }
}

function Topbar({
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
      <Link
        aria-label="RemontRaport"
        className="flex items-center gap-2.5"
        href="/"
      >
        <span className="grid size-8 place-items-center text-blue-600">
          <svg viewBox="0 0 28 28" className="size-7" fill="none" aria-hidden>
            <path
              d="m5 12 9-8 9 8v11H5Z"
              stroke="currentColor"
              strokeLinejoin="round"
              strokeWidth="2.3"
            />
            <path
              d="M10 23v-8h4v8M18 23V11"
              stroke="#0f9f8f"
              strokeLinejoin="round"
              strokeWidth="2.3"
            />
          </svg>
        </span>
        <span className="text-[25px] font-extrabold tracking-[-0.045em] text-slate-950">
          Remont<span className="text-blue-600">Raport</span>
        </span>
      </Link>
      <div className="flex items-center gap-5">
        <button
          aria-label="Powiadomienia"
          className="relative hidden text-slate-600 transition hover:text-blue-600 sm:block"
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

export default async function EditIssuePage({ params }: EditIssuePageProps) {
  const { id, issueId } = await params;
  const user = await getEditIssuePageUser();

  if (!user) {
    redirect("/login");
  }

  const [project, issue] = await Promise.all([
    getProject(id, user.id),
    getIssue(id, issueId),
  ]);
  const email = user.email ?? "uzytkownik@remontraport.pl";
  const fullName =
    typeof user.user_metadata?.full_name === "string" &&
    user.user_metadata.full_name
      ? user.user_metadata.full_name
      : (email.split("@")[0]?.split(".")[0] ?? "Alicja");
  const displayName = fullName.slice(0, 1).toUpperCase() + fullName.slice(1);
  const initials = displayName.slice(0, 1).toUpperCase();

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <AppSidebar activeItem="projects" />
      <section className="min-h-screen px-5 py-6 lg:ml-[270px] lg:px-10 xl:px-12">
        <Topbar email={email} initials={initials} name={displayName} />

        <div className="mt-10">
          <Link
            className="inline-flex items-center gap-2 text-sm font-extrabold text-blue-600"
            href={`/projects/${project.id}`}
          >
            <Icon name="chevron" className="size-4 rotate-180" />
            Wróć do projektu
          </Link>
          <div className="mt-5 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-[0.12em] text-orange-600">
                <Icon name="wrench" className="size-5" />
                Usterka
              </p>
              <h1 className="mt-2 text-[34px] font-extrabold tracking-[-0.045em] text-slate-950">
                Edytuj usterkę
              </h1>
              <p className="mt-2 max-w-2xl text-[15px] leading-6 text-slate-500">
                Projekt: <span className="font-extrabold">{project.name}</span>
                {project.location ? ` · ${project.location}` : ""}
              </p>
            </div>
            <span className="w-fit rounded-[8px] bg-orange-50 px-4 py-2 text-sm font-extrabold text-orange-600">
              Edycja zgłoszenia
            </span>
          </div>
        </div>

        <div className="mt-7">
          <IssueForm
            action={updateIssueAction.bind(null, project.id, issue.id)}
            issue={issue}
            mode="edit"
          />
        </div>
      </section>
    </main>
  );
}
