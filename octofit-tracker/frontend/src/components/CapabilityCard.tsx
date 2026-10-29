import type { ReactNode } from 'react';
import type { CapabilityState } from './useCapabilityData.js';

type Props<T> = {
  title: string;
  description: string;
  emptyMessage: string;
  renderItem: (item: T) => ReactNode;
  state: CapabilityState<T>;
};

export function CapabilityCard<T>({ title, description, emptyMessage, renderItem, state }: Props<T>) {
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
