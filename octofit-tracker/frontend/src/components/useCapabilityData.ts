import { useEffect, useState } from 'react';

export type CapabilityState<T> =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; items: T[] };

type JsonLoader = (path: string) => Promise<unknown>;

export function useCapabilityData<T>(
  getJson: JsonLoader,
  endpoint: string,
  dataKey: string,
  title: string,
): CapabilityState<T> {
  const [state, setState] = useState<CapabilityState<T>>({ status: 'loading' });

  useEffect(() => {
    let active = true;
    setState({ status: 'loading' });

    getJson(endpoint)
      .then((response) => {
        if (typeof response !== 'object' || response === null || Array.isArray(response)) {
          throw new Error(`The response did not include ${dataKey}.`);
        }
        const items = (response as Record<string, unknown>)[dataKey];
        if (!Array.isArray(items)) throw new Error(`The response did not include ${dataKey}.`);
        if (active) setState({ status: 'success', items: items as T[] });
      })
      .catch((error: unknown) => {
        if (!active) return;
        const detail = error instanceof Error ? error.message : 'Please try again.';
        setState({ status: 'error', message: `Unable to load ${title.toLowerCase()}: ${detail}` });
      });

    return () => {
      active = false;
    };
  }, [dataKey, endpoint, getJson, title]);

  return state;
}
