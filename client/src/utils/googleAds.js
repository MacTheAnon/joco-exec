export const trackConversion = (label) => {
  if (window.gtag) window.gtag('event', 'conversion', { 'send_to': `AW-YOUR_ID/${label}` });
};
export const trackPageView = (url) => {
  if (window.gtag) window.gtag('event', 'page_view', { page_path: url });
};