export function triggerAlert(
    name: string,
    payload?: Record<string, unknown>,
  ) {
    console.error(
      JSON.stringify({
        type: "alert",
        name,
        payload: payload ?? {},
        timestamp: new Date().toISOString(),
      }),
    );
  }