/**
 * types/index.ts
 * --------------
 * Single source of truth for ALL application-level TypeScript interfaces.
 *
 * Phase 1 — Foundation: these were previously co-located with mock data
 * in `lib/data.ts`. Separating them allows the types to be imported
 * independently of the mock data — critical for backend integration.
 */

// ─── Property Types ──────────────────────────────────────────────────────────

export type PropertyType =
  | "Villa"
  | "Apartment"
  | "Chalet"
  | "Penthouse"
  | "Bungalow"
  | "Condo"
  | "Townhouse";

export type PropertyStatus = "pending" | "approved" | "live";

export interface Host {
  name: string;
  avatar: string;
  verified: boolean;
  superhost: boolean;
  joinedYear: number;
  responseRate: number;
}

export interface Property {
  id: string;
  title: string;
  location: string;
  price: number;
  rating: number;
  reviews: number;
  image: string;
  images: string[];
  type: PropertyType;
  minStay: number;
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  verified: boolean;
  instantBook: boolean;
  host: Host;
  hostId: string;
  amenities: string[];
  description: string;
  /** Added in Phase 0 Fix 8 — dates the host has blocked */
  blockedDates?: string[];
}

// ─── Managed Property (Host Dashboard) ───────────────────────────────────────

export interface ManagedProperty extends Property {
  status: PropertyStatus;
  blockedDates: string[];
}

// ─── Booking Types ───────────────────────────────────────────────────────────

export type BookingStatus = "confirmed" | "pending" | "completed" | "cancelled";

export interface Booking {
  id: string;
  propertyId: string;
  hostId: string;
  guestId: string;
  property: Property;
  checkIn: string;
  checkOut: string;
  guests: number;
  status: BookingStatus;
  total: number;
}

// ─── Messaging Types ─────────────────────────────────────────────────────────

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  timestamp: string;
  isOwn: boolean;
}

export interface Conversation {
  id: string;
  propertyTitle: string;
  propertyImage: string;
  hostName: string;
  hostAvatar: string;
  lastMessage: string;
  lastMessageTime: string;
  unread: number;
  messages: Message[];
}

// ─── Notification Types ──────────────────────────────────────────────────────

export type NotificationType = "booking" | "message" | "payment" | "system";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  time: string;
  read: boolean;
}

// ─── User / Auth Types ───────────────────────────────────────────────────────

export type UserRole = "guest" | "host";

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  verified: boolean;
  joinedYear: number;
}
