import { useEffect, useState } from 'react';

export type CapabilityState<T> =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; items: T[] };

export function useCapabilityData<T>(load: () => Promise<T[]>, title: string): CapabilityState<T> {
  const [state, setState] = useState<CapabilityState<T>>({ status: 'loading' });

  useEffect(() => {
    let active = true;
    setState({ status: 'loading' });

    load()
      .then((items) => {
        if (!Array.isArray(items)) throw new Error('The server returned an invalid response.');
        if (active) setState({ status: 'success', items });
      })
      .catch((error: unknown) => {
        if (!active) return;
        const detail = error instanceof Error ? error.message : 'Please try again.';
        setState({ status: 'error', message: `Unable to load ${title.toLowerCase()}: ${detail}` });
      });

    return () => {
      active = false;
    };
  }, [load, title]);

  return state;
}
