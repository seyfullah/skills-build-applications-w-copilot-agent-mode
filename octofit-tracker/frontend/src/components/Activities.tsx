import { CapabilityCard } from './CapabilityCard.js';
import { getJson } from '../api/client.js';
import { useCapabilityData } from './useCapabilityData.js';

type Activity = { type: string; minutes: number; points: number };

export default function Activities() {
  const state = useCapabilityData<Activity>(getJson, '/api/activities', 'activities', 'Activities');

  return (
    <CapabilityCard<Activity>
      title="Activities"
      description="Track student activity minutes and points."
      emptyMessage="No activities yet."
      renderItem={(activity) => `${activity.type}: ${activity.minutes} minutes, ${activity.points} points`}
      state={state}
    />
  );
}
