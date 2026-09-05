import { getTeamMembers } from "./actions";
import { getCMSSection } from "@/app/dashboard/media/cms/queries";
import MeetPageClient from "./MeetPageClient";

export const dynamic = "force-dynamic";

export default async function MeetPage() {
  const [team, heroData, missionData] = await Promise.all([
    getTeamMembers(),
    getCMSSection("meet_hero"),
    getCMSSection("meet_mission"),
  ]);

  return (
    <MeetPageClient
      team={team}
      cms={{ hero: heroData, mission: missionData }}
    />
  );
}
