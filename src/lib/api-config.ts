// ─── API Configuration ───────────────────────────────────────────
// Override these via environment variables in a .env file.
// See README.md for setup instructions.

export const API_CONFIG = {
  WORKFLOW_1_URL:
    import.meta.env.VITE_N8N_WORKFLOW1_URL ||
    "https://prabin-free-trial.app.n8n.cloud/webhook/recruit-ai-screening",

  WORKFLOW_2_URL:
    import.meta.env.VITE_N8N_WORKFLOW2_URL ||
    "https://prabin-free-trial.app.n8n.cloud/webhook/email-scheduling",

  DEFAULT_HIRING_MANAGER_EMAIL:
    import.meta.env.VITE_DEFAULT_HIRING_MANAGER_EMAIL || "hr@company.com",

  /** Request timeout in milliseconds */
  TIMEOUT: 60_000,

  /** Number of automatic retries on failure */
  MAX_RETRIES: 1,

  /** Delay between retries in milliseconds */
  RETRY_DELAY: 2_000,
} as const;

// ─── Fetch with timeout + retry ──────────────────────────────────

export async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries: number = API_CONFIG.MAX_RETRIES
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);

    if (retries > 0 && !(error instanceof DOMException && error.name === "AbortError")) {
      await new Promise((r) => setTimeout(r, API_CONFIG.RETRY_DELAY));
      return fetchWithRetry(url, options, retries - 1);
    }

    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("Request timed out. The server took too long to respond.");
    }

    throw error;
  }
}

// ─── Analytics event placeholders ────────────────────────────────
// Uncomment and wire to your analytics provider (e.g. Google Analytics, Mixpanel).
//
// export function trackEvent(event: string, data?: Record<string, unknown>) {
//   // gtag('event', event, data);
//   // mixpanel.track(event, data);
//   console.debug('[analytics]', event, data);
// }
//
// Usage:
// trackEvent('analysis_started', { mode: 'single' });
// trackEvent('analysis_completed', { score: 85, recommendation: 'Interview' });
// trackEvent('analysis_failed', { error: 'timeout' });
// trackEvent('pdf_exported', { candidateName: 'Jane Doe' });
// trackEvent('template_saved', { templateName: 'Software Engineer' });
