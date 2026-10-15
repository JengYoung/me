import { Queue } from "../../data-structure/queue/index";

const createTimeoutError = () => new Error("Mutex lock timeout");
const createAbortError = () => new Error("Mutex lock aborted");

type LockOptions = {
  timeout?: number; // ms
  signal?: AbortSignal;
};

export class Mutex<T> {
  private waitOrderQueue = new Queue<(value?: unknown) => void>();
  private locked = false;

  /**
   * register promiseQueue
   */
  private wait() {
    return new Promise((resolve) => {
      this.waitOrderQueue.enqueue(resolve);
    });
  }

  /**
   * 다음 작업 실행
   */
  private next() {
    const nextResolve = this.waitOrderQueue.dequeue();
    if (nextResolve) {
      nextResolve();
    } else {
      this.locked = false;
    }
  }

  /**
   * run with locked: true
   */
  public async lock<T>(callback: () => Promise<T>, { timeout, signal }: LockOptions = {}): Promise<T> {
    if (this.locked) {
      const wait = this.wait();

      if (timeout != null || signal) {
        await Promise.race([
          wait,
          ...(timeout != null ? [this.createTimeout(timeout)] : []),
          ...(signal ? [this.createAbort(signal)] : []),
        ]);
      } else {
        await wait;
      }
    }

    this.locked = true;

    try {
      return await callback();
    } finally {
      this.next();
    }
  }

  /**
   * locked true: return null
   * locked false: locked + run callback
   */
  public async spinLock<T>(callback: () => Promise<T>): Promise<T | null> {
    if (this.locked) return null;

    this.locked = true;

    try {
      return await callback();
    } finally {
      this.next();
    }
  }

  /**
   * timeout helper
   */
  private createTimeout(ms: number): Promise<never> {
    return new Promise((_, reject) => {
      const id = setTimeout(() => {
        clearTimeout(id);
        reject(createTimeoutError());
      }, ms);
    });
  }

  /**
   * abort helper
   */
  private createAbort(signal: AbortSignal): Promise<never> {
    return new Promise((_, reject) => {
      if (signal.aborted) {
        reject(createAbortError());
        return;
      }

      const abort = () => {
        signal.removeEventListener("abort", abort);
        reject(createAbortError());
      };

      signal.addEventListener("abort", abort);
    });
  }
}
