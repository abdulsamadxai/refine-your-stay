import property1 from "@/assets/property-1.jpg";
import property2 from "@/assets/property-2.jpg";
import property3 from "@/assets/property-3.jpg";
import property4 from "@/assets/property-4.jpg";
import property5 from "@/assets/property-5.jpg";
import property6 from "@/assets/property-6.jpg";

/**
 * Types are now defined in `@/types/index.ts`.
 * Re-exported here for backward compatibility during the migration.
 * Once all imports are updated to `@/types`, these re-exports can be removed.
 */
export type {
  Property,
  Host,
  Booking,
  Message,
  Conversation,
  Notification,
  PropertyType,
  PropertyStatus,
  BookingStatus,
  NotificationType,
  ManagedProperty,
} from "@/types";

import type { Property, Host, Booking, Conversation, Notification as AppNotification } from "@/types";

const hosts: Host[] = [
  { name: "Michael Johnson", avatar: "MJ", verified: true, superhost: true, joinedYear: 2019, responseRate: 99 },
  { name: "Sarah Williams", avatar: "SW", verified: true, superhost: true, joinedYear: 2020, responseRate: 97 },
  { name: "David Miller", avatar: "DM", verified: true, superhost: false, joinedYear: 2021, responseRate: 95 },
  { name: "Jennifer Martinez", avatar: "JM", verified: true, superhost: true, joinedYear: 2018, responseRate: 98 },
  { name: "Robert Anderson", avatar: "RA", verified: true, superhost: true, joinedYear: 2020, responseRate: 100 },
  { name: "Ashley Thompson", avatar: "AT", verified: true, superhost: false, joinedYear: 2022, responseRate: 94 },
];

export const properties: Property[] = [
  {
    id: "1",
    title: "Skyline Penthouse in Midtown Manhattan",
    location: "Manhattan, New York, NY",
    price: 650,
    rating: 4.97,
    reviews: 124,
    image: property1,
    images: [property1, property2, property3],
    type: "Penthouse",
    minStay: 3,
    maxGuests: 6,
    bedrooms: 3,
    bathrooms: 3,
    verified: true,
    instantBook: true,
    host: hosts[0],
    amenities: ["Pool", "Gym", "Concierge", "Parking", "WiFi", "Kitchen", "Washer", "Air Conditioning", "Workspace", "EV Charger"],
    description: "Experience unparalleled luxury in this stunning penthouse perched above Midtown Manhattan. Floor-to-ceiling windows reveal breathtaking panoramic views of the Empire State Building and Central Park. Every detail has been curated for the discerning traveler — from Carrara marble countertops to smart home automation throughout.",
  },
  {
    id: "2",
    title: "Modern Villa in Beverly Hills",
    location: "Beverly Hills, Los Angeles, CA",
    price: 890,
    rating: 4.93,
    reviews: 89,
    image: property2,
    images: [property2, property1, property4],
    type: "Villa",
    minStay: 5,
    maxGuests: 8,
    bedrooms: 4,
    bathrooms: 4,
    verified: true,
    instantBook: false,
    host: hosts[1],
    amenities: ["Private Pool", "Hot Tub", "Chef Service", "WiFi", "Kitchen", "Garden", "BBQ", "Outdoor Shower"],
    description: "A California dream retreat in the heart of Beverly Hills. This contemporary villa features an infinity-edge pool, mature palm tree-lined gardens, and seamless indoor-outdoor living. Minutes from Rodeo Drive, yet feels like a private oasis.",
  },
  {
    id: "3",
    title: "Oceanfront Luxury Condo in South Beach",
    location: "South Beach, Miami, FL",
    price: 520,
    rating: 4.98,
    reviews: 67,
    image: property3,
    images: [property3, property5, property1],
    type: "Condo",
    minStay: 4,
    maxGuests: 4,
    bedrooms: 2,
    bathrooms: 2,
    verified: true,
    instantBook: true,
    host: hosts[2],
    amenities: ["Ocean View", "Pool", "Beach Access", "Gym", "WiFi", "Kitchen", "Concierge", "Valet Parking"],
    description: "Wake up to breathtaking Atlantic Ocean views in this designer condo on the iconic Collins Avenue. Steps from South Beach's white sand and turquoise waters, with world-class dining and nightlife at your doorstep. Resort-style amenities include a rooftop pool and 24/7 concierge.",
  },
  {
    id: "4",
    title: "Industrial-Chic Loft in Downtown Chicago",
    location: "River North, Chicago, IL",
    price: 380,
    rating: 4.95,
    reviews: 156,
    image: property4,
    images: [property4, property1, property6],
    type: "Apartment",
    minStay: 2,
    maxGuests: 4,
    bedrooms: 2,
    bathrooms: 2,
    verified: true,
    instantBook: true,
    host: hosts[3],
    amenities: ["Skyline View", "Rooftop Terrace", "Concierge", "WiFi", "Kitchen", "Washer", "Air Conditioning", "Workspace"],
    description: "A stunning industrial-chic loft in Chicago's coveted River North neighborhood. Original exposed brick, 16-foot timber ceilings, and massive factory windows frame spectacular views of the Chicago skyline. Walking distance to Magnificent Mile, top restaurants, and the Art Institute.",
  },
  {
    id: "5",
    title: "Bay View Tech Loft in Pacific Heights",
    location: "Pacific Heights, San Francisco, CA",
    price: 480,
    rating: 4.91,
    reviews: 78,
    image: property5,
    images: [property5, property2, property3],
    type: "Apartment",
    minStay: 3,
    maxGuests: 2,
    bedrooms: 1,
    bathrooms: 1,
    verified: true,
    instantBook: false,
    host: hosts[4],
    amenities: ["Bay View", "Smart Home", "Workspace", "WiFi", "Kitchen", "Gym", "Parking", "EV Charger"],
    description: "A sleek, minimalist retreat with jaw-dropping Golden Gate Bridge and Bay views from Pacific Heights. This tech-forward apartment features smart home controls, a dedicated workspace, and clean Scandinavian-inspired design — perfect for remote workers and design enthusiasts.",
  },
  {
    id: "6",
    title: "Contemporary Townhouse in South Austin",
    location: "South Congress, Austin, TX",
    price: 340,
    rating: 4.96,
    reviews: 42,
    image: property6,
    images: [property6, property2, property5],
    type: "Townhouse",
    minStay: 2,
    maxGuests: 6,
    bedrooms: 3,
    bathrooms: 2,
    verified: true,
    instantBook: true,
    host: hosts[5],
    amenities: ["Pool", "Hot Tub", "Outdoor Kitchen", "WiFi", "Kitchen", "Firepit", "Parking", "Workspace"],
    description: "A beautifully designed contemporary townhouse in Austin's vibrant South Congress district. Features a resort-style pool, native Texas landscaping, and an outdoor kitchen perfect for entertaining. Steps from SoCo's legendary live music venues, boutiques, and food trucks.",
  },
];

export const bookings: Booking[] = [
  { id: "b1", propertyId: "4", property: properties[3], checkIn: "2026-04-15", checkOut: "2026-04-22", guests: 2, status: "confirmed", total: 2993 },
  { id: "b2", propertyId: "1", property: properties[0], checkIn: "2026-05-01", checkOut: "2026-05-05", guests: 4, status: "pending", total: 2912 },
  { id: "b3", propertyId: "3", property: properties[2], checkIn: "2026-02-10", checkOut: "2026-02-17", guests: 2, status: "completed", total: 4074 },
];

export const conversations: Conversation[] = [
  {
    id: "c1",
    propertyTitle: "Industrial-Chic Loft in Downtown Chicago",
    propertyImage: property4,
    hostName: "Jennifer Martinez",
    hostAvatar: "JM",
    lastMessage: "Your booking in Chicago has been confirmed! Looking forward to hosting you.",
    lastMessageTime: "2h ago",
    unread: 1,
    messages: [
      { id: "m1", senderId: "guest", senderName: "You", senderAvatar: "YO", text: "Hi Jennifer! I'm really excited about my upcoming stay in Chicago. Could you recommend any nearby restaurants?", timestamp: "Yesterday, 3:45 PM", isOwn: true },
      { id: "m2", senderId: "host", senderName: "Jennifer Martinez", senderAvatar: "JM", text: "Hello! Absolutely — I'll send you my curated list of the best restaurants within walking distance. There's an amazing steakhouse just around the corner on Michigan Avenue.", timestamp: "Yesterday, 4:12 PM", isOwn: false },
      { id: "m3", senderId: "guest", senderName: "You", senderAvatar: "YO", text: "That would be amazing, thank you! Also, is early check-in possible?", timestamp: "Today, 9:30 AM", isOwn: true },
      { id: "m4", senderId: "host", senderName: "Jennifer Martinez", senderAvatar: "JM", text: "Your booking in Chicago has been confirmed! Looking forward to hosting you.", timestamp: "Today, 10:15 AM", isOwn: false },
    ],
  },
  {
    id: "c2",
    propertyTitle: "Skyline Penthouse in Midtown Manhattan",
    propertyImage: property1,
    hostName: "Michael Johnson",
    hostAvatar: "MJ",
    lastMessage: "The concierge will arrange your airport transfer from JFK.",
    lastMessageTime: "1d ago",
    unread: 0,
    messages: [
      { id: "m5", senderId: "guest", senderName: "You", senderAvatar: "YO", text: "Hello Michael, do you provide airport transfers from JFK?", timestamp: "2 days ago, 2:00 PM", isOwn: true },
      { id: "m6", senderId: "host", senderName: "Michael Johnson", senderAvatar: "MJ", text: "The concierge will arrange your airport transfer from JFK.", timestamp: "1 day ago, 9:00 AM", isOwn: false },
    ],
  },
];

export const notifications: AppNotification[] = [
  { id: "n1", type: "booking", title: "Booking Confirmed", description: "Your stay at the Chicago Loft has been confirmed for Apr 15–22.", time: "2 hours ago", read: false },
  { id: "n2", type: "message", title: "New Message", description: "Jennifer Martinez sent you a message about your upcoming stay.", time: "2 hours ago", read: false },
  { id: "n3", type: "payment", title: "Payment Received", description: "$2,993 payment processed for booking #B-4821.", time: "3 hours ago", read: true },
  { id: "n4", type: "system", title: "Verify Your Identity", description: "Complete verification to unlock all features.", time: "1 day ago", read: true },
];
