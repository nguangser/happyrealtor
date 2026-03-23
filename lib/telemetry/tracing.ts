export type TraceContext = {
    traceName: string;
    traceId: string;
    startedAt: number;
  };
  
  export function createTraceContext(traceName: string): TraceContext {
    const random =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  
    return {
      traceName,
      traceId: random,
      startedAt: Date.now(),
    };
  }