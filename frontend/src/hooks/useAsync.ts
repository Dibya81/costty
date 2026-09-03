import { useCallback, useEffect, useRef, useState } from "react";

interface AsyncState<T> {
  data: T | undefined;
  loading: boolean;
  error: Error | undefined;
}

/**
 * Runs an async fetcher on mount (and whenever deps change), tracking
 * loading/error state and ignoring stale responses if the component
 * unmounts or deps change again before the promise settles.
 */
export function useAsync<T>(fetcher: () => Promise<T>, deps: unknown[] = []) {
  const [state, setState] = useState<AsyncState<T>>({ data: undefined, loading: true, error: undefined });
  const alive = useRef(true);

  const run = useCallback(() => {
    setState((s) => ({ ...s, loading: true, error: undefined }));
    fetcher()
      .then((data) => {
        if (alive.current) setState({ data, loading: false, error: undefined });
      })
      .catch((error: Error) => {
        if (alive.current) setState((s) => ({ ...s, loading: false, error }));
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    alive.current = true;
    run();
    return () => {
      alive.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { ...state, reload: run, setData: (data: T) => setState((s) => ({ ...s, data })) };
}
