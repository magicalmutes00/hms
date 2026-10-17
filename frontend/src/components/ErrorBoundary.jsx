import { useState } from 'react';

export default function ErrorBoundary({ children }) {
  const [err, setErr] = useState(null);
  if (err) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-12 text-center">
        <h1 className="text-2xl font-semibold">Something went wrong</h1>
        <p className="mt-2 text-slate-600">{String(err.message || err)}</p>
        <button className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm text-white" onClick={() => location.reload()}>Reload</button>
      </div>
    );
  }
  return <WithBoundary>{children}</WithBoundary>;
}

function WithBoundary({ children }) {
  try { return children; } catch (e) { throw e; }
}
