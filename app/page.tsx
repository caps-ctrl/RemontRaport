import { AudienceSection } from "@/components/HomePage/AudienceSection";
import { Hero } from "@/components/HomePage/Hero";
import {
  FinalCta,
  HomeHeader,
  type HomeUser,
} from "@/components/HomePage/HomePageUi";
import { PricingSection } from "@/components/HomePage/PricingSection";
import { ProblemSection } from "@/components/HomePage/ProblemSection";
import { SolutionSection } from "@/components/HomePage/SolutionSection";
import { StepsSection } from "@/components/HomePage/StepsSection";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function getHomeUser(): Promise<HomeUser> {
  try {
    const supabase = await getSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    return user?.email ? { email: user.email } : null;
  } catch {
    return null;
  }
}

export default async function Home() {
  const user = await getHomeUser();

  return (
    <main className="min-h-screen bg-white text-slate-950">
      <HomeHeader user={user} />
      <Hero />
      <ProblemSection />
      <SolutionSection />
      <AudienceSection />
      <StepsSection />
      <PricingSection />
      <FinalCta />
    </main>
  );
}
