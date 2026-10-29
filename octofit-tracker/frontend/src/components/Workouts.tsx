import { CapabilityCard } from './CapabilityCard.js';
import { getJson } from '../api/client.js';
import { useCapabilityData } from './useCapabilityData.js';

type WorkoutSuggestion = { title: string; reason: string };

export default function Workouts() {
  const state = useCapabilityData<WorkoutSuggestion>(
    getJson,
    `/api/workouts/suggestions/${encodeURIComponent('mona@example.com')}`,
    'suggestions',
    'Workout suggestions',
  );

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
