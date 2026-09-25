import { EXPIRY_STATUS } from '../config/constants.js';

/**
 * Calculate remaining days and status for a single date
 * @param {string|Date|null} targetDate
 * @returns {{ daysRemaining: number|null, status: string|null, date: string|null }}
 */
export function calculateExpiry(targetDate) {
  if (!targetDate) {
    return {
      daysRemaining: null,
      status: null,
      date: null,
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiry = new Date(targetDate);
  expiry.setHours(0, 0, 0, 0);

  if (isNaN(expiry.getTime())) {
    return {
      daysRemaining: null,
      status: null,
      date: null,
    };
  }

  const diffTime = expiry.getTime() - today.getTime();
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let status = EXPIRY_STATUS.SAFE;
  if (daysRemaining < 0) {
    status = EXPIRY_STATUS.EXPIRED;
  } else if (daysRemaining <= 30) {
    status = EXPIRY_STATUS.WARNING;
  }

  return {
    daysRemaining,
    status,
    date: expiry.toISOString().split('T')[0],
  };
}

/**
 * Compute the consolidated overall status for a website across all 5 renewal items
 * @param {Object} websiteData
 */
export function computeWebsiteHealth(websiteData) {
  const domain = calculateExpiry(websiteData.domain_expiry_date || websiteData.domain?.expiry_date);
  const hosting = calculateExpiry(websiteData.hosting_renewal_date || websiteData.hosting?.renewal_date);
  const ssl = calculateExpiry(websiteData.ssl_expiry_date || websiteData.ssl?.expiry_date);
  const email = calculateExpiry(websiteData.email_expiry_date || websiteData.email_cdn?.email_expiry_date);
  const cdn = calculateExpiry(websiteData.cdn_expiry_date || websiteData.email_cdn?.cdn_expiry_date);

  const allStatuses = [domain.status, hosting.status, ssl.status, email.status, cdn.status].filter(Boolean);

  let overallStatus = EXPIRY_STATUS.SAFE;
  if (allStatuses.includes(EXPIRY_STATUS.EXPIRED)) {
    overallStatus = EXPIRY_STATUS.EXPIRED;
  } else if (allStatuses.includes(EXPIRY_STATUS.WARNING)) {
    overallStatus = EXPIRY_STATUS.WARNING;
  }

  // Find the nearest upcoming expiry or most critical overdue item
  const validDays = [
    { service: 'Domain', ...domain },
    { service: 'Hosting', ...hosting },
    { service: 'SSL', ...ssl },
    { service: 'Business Email', ...email },
    { service: 'CDN', ...cdn },
  ].filter((item) => item.daysRemaining !== null);

  validDays.sort((a, b) => a.daysRemaining - b.daysRemaining);
  const nearestExpiry = validDays[0] || null;

  return {
    overallStatus,
    nearestExpiry,
    services: {
      domain,
      hosting,
      ssl,
      email,
      cdn,
    },
  };
}

export default { calculateExpiry, computeWebsiteHealth };
