import { useEffect, useState, type ReactNode } from 'react';
import { getJson } from '../api/client.js';

type Props<T> = {
  title: string;
  description: string;
  endpoint: string;
  dataKey: string;
  emptyMessage: string;
  renderItem: (item: T) => ReactNode;
};

type LoadState<T> =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; items: T[] };

export function CapabilityCard<T>({ title, description, endpoint, dataKey, emptyMessage, renderItem }: Props<T>) {
  const [state, setState] = useState<LoadState<T>>({ status: 'loading' });

  useEffect(() => {
    let active = true;
    setState({ status: 'loading' });

    getJson<Record<string, T[]>>(endpoint)
      .then((response) => {
        const items = response[dataKey];
        if (!Array.isArray(items)) throw new Error(`The response did not include ${dataKey}.`);
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
  }, [dataKey, endpoint, title]);

  return (
    <section className="card h-100">
      <div className="card-body">
        <h2 className="h4">{title}</h2>
        <p>{description}</p>
        {state.status === 'loading' && <p role="status">Loading {title.toLowerCase()}...</p>}
        {state.status === 'error' && <p role="alert">{state.message}</p>}
        {state.status === 'success' && state.items.length === 0 && <p role="status">{emptyMessage}</p>}
        {state.status === 'success' && state.items.length > 0 && (
          <>
            <p role="status">{title} loaded.</p>
            <ul className="list-group">
              {state.items.map((item, index) => <li className="list-group-item" key={index}>{renderItem(item)}</li>)}
            </ul>
          </>
        )}
      </div>
    </section>
  );
}
