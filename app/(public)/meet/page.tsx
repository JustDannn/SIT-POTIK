import { getTeamMembers } from "./actions";
import { getCMSSection } from "@/app/dashboard/media/cms/actions";
import MeetPageClient from "./MeetPageClient";

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
