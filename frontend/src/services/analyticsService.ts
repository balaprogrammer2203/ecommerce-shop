class AnalyticsService {
  logEvent(eventName: string, payload?: Record<string, unknown>) {
    if (import.meta.env.DEV) {
      console.info('[analytics]', eventName, payload);
    }
    // Integrate Segment/GA/etc here.
  }
}

export const analyticsService = new AnalyticsService();
