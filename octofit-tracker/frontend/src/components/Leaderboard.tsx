import { CapabilityCard } from './CapabilityCard.js';
import { getJson } from '../api/client.js';
import { useCapabilityData } from './useCapabilityData.js';

type LeaderboardEntry = { teamName: string; totalPoints: number; rank: number };

function loadLeaderboard() {
  return getJson<{ leaderboard: LeaderboardEntry[] }>('/api/leaderboard').then(({ leaderboard }) => leaderboard);
}

export default function Leaderboard() {
  const state = useCapabilityData(loadLeaderboard, 'Leaderboard');

  return (
    <CapabilityCard<LeaderboardEntry>
      title="Leaderboard"
      description="Compare team point totals."
      emptyMessage="No leaderboard rankings yet."
      renderItem={(entry) => `#${entry.rank} ${entry.teamName}: ${entry.totalPoints} points`}
      state={state}
    />
  );
}
