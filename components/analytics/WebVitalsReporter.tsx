"use client";

import { useReportWebVitals } from "next/web-vitals";

declare global {
  interface Window {
    gtag?: (
      command: "event",
      eventName: string,
      params: Record<string, unknown>
    ) => void;
  }
}

export function WebVitalsReporter() {
  useReportWebVitals((metric) => {
    if (typeof window === "undefined" || typeof window.gtag !== "function") {
      return;
    }
    window.gtag("event", metric.name, {
      value: Math.round(
        metric.name === "CLS" ? metric.value * 1000 : metric.value
      ),
      event_label: metric.id,
      event_category: "Web Vitals",
      non_interaction: true,
      metric_id: metric.id,
      metric_rating: metric.rating,
      metric_value: metric.value,
      metric_delta: metric.delta,
    });
  });
  return null;
}
