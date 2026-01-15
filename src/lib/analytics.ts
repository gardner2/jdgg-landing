type PlausibleEventProps = Record<string, string | number | boolean>;

declare global {
  interface Window {
    plausible?: (eventName: string, options?: { props?: PlausibleEventProps }) => void;
  }
}

export function trackEvent(eventName: string, props?: PlausibleEventProps) {
  if (typeof window === 'undefined') {
    return;
  }

  if (typeof window.plausible === 'function') {
    window.plausible(eventName, props ? { props } : undefined);
  }
}
