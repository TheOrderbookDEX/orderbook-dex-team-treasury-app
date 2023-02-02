export function setAsyncCallback(
  setCallback: (_: () => () => void) => void,
  setRunningFlag: (_: boolean) => void,
  callback: (abortSignal: AbortSignal) => Promise<void>,
  onError: (error: unknown) => void
) {
  const abortController = new AbortController();
  const abortSignal = abortController.signal;

  setCallback(() => () => {
    setRunningFlag(true);

    void (async () => {
      try {
        await callback(abortSignal);

      } catch (error) {
        if (error !== abortSignal.reason) {
          onError(error);
        }

      } finally {
        setRunningFlag(false);
      }
    })();
  });

  return () => abortController.abort();
}
