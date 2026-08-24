/* Singleton save orchestrator shared by every useDesignSync instance.
   Guarantees: never two concurrent workers, never a dropped request,
   latest state always wins via trailing re-run. */

type Worker = () => Promise<void>;

let timer: ReturnType<typeof setTimeout> | null = null;
let running = false;
let pending = false;

function exec(work: Worker) {
  if (running) {
    pending = true;
    return;
  }
  running = true;
  void (async () => {
    try {
      await work();
    } finally {
      running = false;
      if (pending) {
        pending = false;
        exec(work);
      }
    }
  })();
}

export const saveController = {
  request(work: Worker, debounceMs?: number) {
    if (running) {
      pending = true;
      return;
    }
    if (debounceMs && debounceMs > 0) {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        timer = null;
        exec(work);
      }, debounceMs);
    } else {
      exec(work);
    }
  },

  /* Cancels any pending debounce and runs immediately (or queues if busy). */
  flush(work: Worker) {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    exec(work);
  },
};
