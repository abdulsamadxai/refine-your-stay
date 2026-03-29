/**
 * constants.ts
 * -----------
 * Single source of truth for all magic numbers, rates, and configuration
 * values used throughout the application.
 *
 * Phase 1 — Foundation: replaces all hardcoded literals scattered across
 * BookingFlow, PropertyDetail, Navbar, Messages, HostDashboard, and AppContext.
 */

// ─── Pricing ────────────────────────────────────────────────────────────────

/** Platform service fee rate applied to every booking subtotal (12%) */
export const SERVICE_FEE_RATE = 0.12;

// ─── UI / Layout ─────────────────────────────────────────────────────────────

/** Height of the sticky Navbar in pixels. Used by Messages page for layout math. */
export const NAVBAR_HEIGHT_PX = 65;

/** Maximum number of notifications rendered in the bell dropdown */
export const NOTIFICATION_DISPLAY_LIMIT = 10;

// ─── Messaging ───────────────────────────────────────────────────────────────

/**
 * Delay in milliseconds before the simulated host auto-reply fires.
 * Will be replaced by Supabase Realtime in Phase 7.
 */
export const AUTO_REPLY_DELAY_MS = 2000;

// ─── Search / Listings ────────────────────────────────────────────────────────

/** Default maximum price shown in the search price-range slider */
export const SEARCH_MAX_PRICE = 1000;

/** Step size for the price-range slider */
export const SEARCH_PRICE_STEP = 50;

/** Number of property cards shown on the homepage featured section */
export const FEATURED_PROPERTY_COUNT = 4;
