import { CapabilityCard } from './CapabilityCard.js';
import { getJson } from '../api/client.js';
import { useCapabilityData } from './useCapabilityData.js';

type Team = { name: string; members: unknown[] };

function loadTeams() {
  return getJson<{ teams: Team[] }>('/api/teams').then(({ teams }) => teams);
}

export default function Teams() {
  const state = useCapabilityData(loadTeams, 'Teams');

  return (
    <CapabilityCard<Team>
      title="Teams"
      description="Manage teams and members."
      emptyMessage="No teams yet."
      renderItem={(team) => `${team.name} (${team.members.length} members)`}
      state={state}
    />
  );
}
