// src/googleAds.js

// ✅ Your Real Google Ads ID
const ADS_ID = 'AW-859941505'; 

export const trackConversion = (conversionLabel, value = 0, transactionId = '') => {
  if (window.gtag) {
    console.log(`📢 Tracking Conversion: ${conversionLabel} | Value: $${value}`);
    
    window.gtag('event', 'conversion', { 
      'send_to': `${ADS_ID}/${conversionLabel}`, // Combines ID + Label
      'value': value,
      'currency': 'USD',
      'transaction_id': transactionId
    });
  } else {
    console.warn("⚠️ Google Tags not loaded yet.");
  }
};

export const trackPageView = (url) => {
  if (window.gtag) {
    window.gtag('event', 'page_view', { page_path: url });
  }
};