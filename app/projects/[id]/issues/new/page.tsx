import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AppSidebar } from "@/app/app-sidebar";
import { createIssueAction } from "@/app/projects/[id]/issues/new/actions";
import { IssueForm } from "@/app/projects/[id]/issues/new/issue-form";
import { getProjectForUser, ProjectError } from "@/lib/projects";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { Icon } from "@/components/ui/Icon";
import { Topbar } from "@/components/ui/TopBar";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "Nowa usterka - RemontRaport",
  description: "Dodawanie usterki projektu RemontRaport.",
};

type NewIssuePageProps = {
  params: Promise<{ id: string }>;
};

async function getIssuePageUser() {
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

export default async function NewIssuePage({ params }: NewIssuePageProps) {
  const { id } = await params;
  const user = await getIssuePageUser();

  if (!user) {
    redirect("/login");
  }

  const project = await getProject(id, user.id);
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
                Dodaj usterkę
              </h1>
              <p className="mt-2 max-w-2xl text-[15px] leading-6 text-slate-500">
                Projekt: <span className="font-extrabold">{project.name}</span>
                {project.location ? ` · ${project.location}` : ""}
              </p>
            </div>
            <span className="w-fit rounded-[8px] bg-orange-50 px-4 py-2 text-sm font-extrabold text-orange-600">
              Nowe zgłoszenie
            </span>
          </div>
        </div>

        <div className="mt-7">
          <IssueForm action={createIssueAction.bind(null, project.id)} />
        </div>
      </section>
    </main>
  );
}
