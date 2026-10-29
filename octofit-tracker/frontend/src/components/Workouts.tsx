import { CapabilityCard } from './CapabilityCard.js';
import { getJson } from '../api/client.js';
import { useCapabilityData } from './useCapabilityData.js';

type WorkoutSuggestion = { title: string; reason: string };

function loadWorkoutSuggestions() {
  return getJson<{ suggestions: WorkoutSuggestion[] }>(
    `/api/workouts/suggestions/${encodeURIComponent('mona@example.com')}`,
  ).then(({ suggestions }) => suggestions);
}

export default function Workouts() {
  const state = useCapabilityData(loadWorkoutSuggestions, 'Workout suggestions');

  return (
    <CapabilityCard<WorkoutSuggestion>
      title="Workout suggestions"
      description="Recommend workouts from activity patterns."
      emptyMessage="No workout suggestions yet."
      renderItem={(suggestion) => <><strong>{suggestion.title}</strong>: {suggestion.reason}</>}
      state={state}
    />
  );
}
