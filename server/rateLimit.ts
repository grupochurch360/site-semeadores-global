interface AttemptRecord {
  count: number;
  resetAt: number;
}

export class LoginRateLimiter {
  private attempts = new Map<string, AttemptRecord>();
  private maxAttempts: number;
  private windowMs: number;

  constructor(maxAttempts = 10, windowMs = 15 * 60 * 1000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }

  public check(key: string): { allowed: boolean; retryAfterSeconds?: number } {
    const now = Date.now();
    const record = this.attempts.get(key);
    if (!record || record.resetAt <= now) {
      return { allowed: true };
    }
    if (record.count >= this.maxAttempts) {
      return {
        allowed: false,
        retryAfterSeconds: Math.max(1, Math.ceil((record.resetAt - now) / 1000)),
      };
    }
    return { allowed: true };
  }

  public recordFailure(key: string): void {
    const now = Date.now();
    const record = this.attempts.get(key);
    if (!record || record.resetAt <= now) {
      this.attempts.set(key, { count: 1, resetAt: now + this.windowMs });
    } else {
      record.count += 1;
    }
  }

  public clear(key: string): void {
    this.attempts.delete(key);
  }

  public resetAll(): void {
    this.attempts.clear();
  }
}
