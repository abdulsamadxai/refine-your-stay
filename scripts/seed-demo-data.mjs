/**
 * Private Rooms by TRG — production-like demo seed (Supabase)
 *
 * Requires in .env (or environment):
 *   VITE_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY  (never expose to the browser; Dashboard → Settings → API)
 *
 * Creates 3 hosts, 5 guests, 10 properties, 12+ bookings, conversations, messages, reviews, notifications.
 * Demo login password (all accounts): PrivateRooms2026!
 *
 * Run: node scripts/seed-demo-data.mjs
 */

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

dotenv.config({ path: resolve(root, ".env"), quiet: true });
dotenv.config({ path: resolve(root, ".env.local"), quiet: true });

const DEMO_PASSWORD = "PrivateRooms2026!";

const HOSTS = [
  { email: "host.marcus@privaterooms-demo.trg", full_name: "Marcus Chen", superhost: true, joined_year: 2018, response_rate: 99 },
  { email: "host.elena@privaterooms-demo.trg", full_name: "Elena Vasquez", superhost: true, joined_year: 2019, response_rate: 97 },
  { email: "host.james@privaterooms-demo.trg", full_name: "James Whitaker", superhost: false, joined_year: 2021, response_rate: 94 },
];

const GUESTS = [
  { email: "guest.sophie@privaterooms-demo.trg", full_name: "Sophie Turner" },
  { email: "guest.daniel@privaterooms-demo.trg", full_name: "Daniel Okonkwo" },
  { email: "guest.mia@privaterooms-demo.trg", full_name: "Mia Patel" },
  { email: "guest.ryan@privaterooms-demo.trg", full_name: "Ryan Brooks" },
  { email: "guest.chloe@privaterooms-demo.trg", full_name: "Chloe Nguyen" },
];

/** @type {Array<{ title: string; location: string; description: string; price_per_night: number; property_type: string; min_stay: number; max_guests: number; bedrooms: number; bathrooms: number; amenities: string[]; instant_book: boolean; verified: boolean; status: string; hostIndex: number; images: string[] }>} */
const PROPERTY_SEEDS = [
  {
    title: "Glasshouse Loft — SoHo",
    location: "New York, NY",
    description:
      "Floor-to-ceiling windows, chef's kitchen, and walkable to galleries and dining. Designed for extended stays with premium linens and a dedicated workspace.",
    price_per_night: 425,
    property_type: "Penthouse",
    min_stay: 3,
    max_guests: 4,
    bedrooms: 2,
    bathrooms: 2,
    amenities: ["WiFi", "Kitchen", "Workspace", "Air Conditioning", "Gym"],
    instant_book: true,
    verified: true,
    status: "live",
    hostIndex: 0,
    images: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1584622650111-993a426fbf47?auto=format&fit=crop&q=80&w=1200",
    ],
  },
  {
    title: "Pacific Heights Victorian Suite",
    location: "San Francisco, CA",
    description:
      "Restored Victorian with bay views, original moldings, and a private deck. Quiet residential block minutes from the Presidio.",
    price_per_night: 389,
    property_type: "Townhouse",
    min_stay: 2,
    max_guests: 6,
    bedrooms: 3,
    bathrooms: 2.5,
    amenities: ["WiFi", "Kitchen", "Parking", "Air Conditioning", "Workspace"],
    instant_book: false,
    verified: true,
    status: "live",
    hostIndex: 0,
    images: [
      "https://images.unsplash.com/photo-1600596542815-ffad4b1533a9?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200",
    ],
  },
  {
    title: "Lakeside Modern — Austin",
    location: "Austin, TX",
    description:
      "Open-plan living overlooking the water, heated pool, and outdoor kitchen. Ideal for SXSW or a relaxed Hill Country base.",
    price_per_night: 512,
    property_type: "Villa",
    min_stay: 4,
    max_guests: 8,
    bedrooms: 4,
    bathrooms: 3,
    amenities: ["WiFi", "Pool", "Kitchen", "Parking", "EV Charger", "Workspace"],
    instant_book: true,
    verified: true,
    status: "live",
    hostIndex: 1,
    images: [
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=1200",
    ],
  },
  {
    title: "Brick & Beam — West Loop",
    location: "Chicago, IL",
    description:
      "Industrial loft with 14-foot ceilings, exposed brick, and in-unit laundry. Steps from Restaurant Row and the United Center.",
    price_per_night: 268,
    property_type: "Apartment",
    min_stay: 2,
    max_guests: 3,
    bedrooms: 1,
    bathrooms: 1,
    amenities: ["WiFi", "Kitchen", "Workspace", "Air Conditioning", "Gym"],
    instant_book: true,
    verified: true,
    status: "live",
    hostIndex: 1,
    images: [
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=1200",
    ],
  },
  {
    title: "Desert Ridge Casita",
    location: "Scottsdale, AZ",
    description:
      "Single-level casita with private courtyard, outdoor shower, and mountain views. Golf carts to nearby resorts on request.",
    price_per_night: 298,
    property_type: "Bungalow",
    min_stay: 3,
    max_guests: 4,
    bedrooms: 2,
    bathrooms: 2,
    amenities: ["WiFi", "Pool", "Parking", "Air Conditioning", "Kitchen"],
    instant_book: false,
    verified: true,
    status: "live",
    hostIndex: 2,
    images: [
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&q=80&w=1200",
    ],
  },
  {
    title: "Capitol Hill Rowhome",
    location: "Washington, DC",
    description:
      "Historic rowhome two blocks from Eastern Market. Two working desks, fast fiber, and a landscaped patio for evening unwinds.",
    price_per_night: 312,
    property_type: "Townhouse",
    min_stay: 2,
    max_guests: 5,
    bedrooms: 3,
    bathrooms: 2,
    amenities: ["WiFi", "Kitchen", "Workspace", "Air Conditioning"],
    instant_book: true,
    verified: true,
    status: "live",
    hostIndex: 2,
    images: [
      "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?auto=format&fit=crop&q=80&w=1200",
    ],
  },
  {
    title: "Seattle Floating Home",
    location: "Seattle, WA",
    description:
      "True houseboat on Lake Union with kayaks included. Watch seaplanes from the deck; 12 minutes to downtown by water taxi.",
    price_per_night: 445,
    property_type: "Condo",
    min_stay: 3,
    max_guests: 4,
    bedrooms: 2,
    bathrooms: 1.5,
    amenities: ["WiFi", "Kitchen", "Workspace", "Air Conditioning"],
    instant_book: false,
    verified: true,
    status: "live",
    hostIndex: 0,
    images: [
      "https://images.unsplash.com/photo-1600585154084-4e5fe7c39198?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1600566752355-35792bedcfe1?auto=format&fit=crop&q=80&w=1200",
    ],
  },
  {
    title: "Nashville Songwriter Cottage",
    location: "Nashville, TN",
    description:
      "Sound-treated writing room, vintage piano, and a wraparound porch. Short drive to Broadway and recording studios.",
    price_per_night: 229,
    property_type: "Bungalow",
    min_stay: 2,
    max_guests: 4,
    bedrooms: 2,
    bathrooms: 1,
    amenities: ["WiFi", "Kitchen", "Parking", "Workspace"],
    instant_book: true,
    verified: true,
    status: "live",
    hostIndex: 1,
    images: [
      "https://images.unsplash.com/photo-1605276373954-0a4f16ec36b8?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&q=80&w=1200",
    ],
  },
  {
    title: "Miami Beach Sky Residence",
    location: "Miami Beach, FL",
    description:
      "Corner unit with Atlantic views, concierge, and spa access. Direct beach path; valet and two parking spots included.",
    price_per_night: 589,
    property_type: "Penthouse",
    min_stay: 4,
    max_guests: 6,
    bedrooms: 3,
    bathrooms: 3,
    amenities: ["WiFi", "Pool", "Gym", "Parking", "Kitchen", "Air Conditioning", "Workspace"],
    instant_book: true,
    verified: true,
    status: "live",
    hostIndex: 0,
    images: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80&w=1200",
    ],
  },
  {
    title: "Aspen Slope-Side Chalet",
    location: "Aspen, CO",
    description:
      "Ski-in access, heated floors, dry room for gear, and a stone fireplace. Concierge can arrange lessons and reservations.",
    price_per_night: 890,
    property_type: "Chalet",
    min_stay: 5,
    max_guests: 10,
    bedrooms: 5,
    bathrooms: 4,
    amenities: ["WiFi", "Kitchen", "Parking", "Air Conditioning", "Workspace"],
    instant_book: false,
    verified: true,
    status: "live",
    hostIndex: 2,
    images: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&q=80&w=1200",
    ],
  },
];

const FIRST_DEMO_TITLE = PROPERTY_SEEDS[0].title;

let supabase;

async function ensureUser(profileRow) {
  const { data: existing } = await supabase.from("profiles").select("id").eq("email", profileRow.email).maybeSingle();
  if (existing?.id) return existing.id;

  const { data: created, error: createErr } = await supabase.auth.admin.createUser({
    email: profileRow.email,
    password: DEMO_PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: profileRow.full_name },
  });
  if (createErr) throw createErr;
  const id = created.user.id;

  const { error: upErr } = await supabase.from("profiles").upsert(
    {
      id,
      email: profileRow.email,
      full_name: profileRow.full_name,
      role: profileRow.role,
      verified: profileRow.verified ?? true,
      superhost: profileRow.superhost ?? false,
      joined_year: profileRow.joined_year ?? 2020,
      response_rate: profileRow.response_rate ?? 96,
      avatar_initials: profileRow.full_name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase(),
    },
    { onConflict: "id" }
  );
  if (upErr) throw upErr;
  return id;
}

function money(n) {
  return Math.round(n * 100) / 100;
}

async function main() {
  console.log("Seeding Private Rooms demo data…\n");

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (supabaseUrl && anonKey) {
    const anon = createClient(supabaseUrl, anonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data: dupProp } = await anon.from("properties").select("id").eq("title", FIRST_DEMO_TITLE).maybeSingle();
    const { data: dupHost } = await anon
      .from("profiles")
      .select("id")
      .eq("email", HOSTS[0].email)
      .maybeSingle();
    const { count: propCount } = await anon.from("properties").select("*", { count: "exact", head: true });
    if (dupProp?.id || dupHost?.id || (propCount ?? 0) >= 10) {
      console.log(
        "Demo data already present (marker property, host profile, or 10+ listings). Skip re-seed or remove rows to run again."
      );
      console.log("Seeded account password (if created by this script):", DEMO_PASSWORD);
      console.log("Host / guest emails are listed in scripts/seed-demo-data.mjs (HOSTS / GUESTS).");
      return;
    }
  }

  const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !SERVICE_KEY) {
    console.error("Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
    process.exit(1);
  }

  supabase = createClient(supabaseUrl, SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const hostIds = [];
  for (const h of HOSTS) {
    const id = await ensureUser({ ...h, role: "host" });
    hostIds.push(id);
    console.log("Host:", h.email, id);
  }

  const guestIds = [];
  for (const g of GUESTS) {
    const id = await ensureUser({ ...g, role: "guest" });
    guestIds.push(id);
    console.log("Guest:", g.email, id);
  }

  const propertyIds = [];
  for (let i = 0; i < PROPERTY_SEEDS.length; i++) {
    const p = PROPERTY_SEEDS[i];
    const host_id = hostIds[p.hostIndex];
    const { data: prop, error: pErr } = await supabase
      .from("properties")
      .insert({
        host_id,
        title: p.title,
        location: p.location,
        description: p.description,
        price_per_night: p.price_per_night,
        property_type: p.property_type,
        min_stay: p.min_stay,
        max_guests: p.max_guests,
        bedrooms: p.bedrooms,
        bathrooms: p.bathrooms,
        amenities: p.amenities,
        instant_book: p.instant_book,
        verified: p.verified,
        status: p.status,
        rating: 4.7 + (i % 3) * 0.1,
        review_count: 0,
      })
      .select("id")
      .single();
    if (pErr) throw pErr;
    propertyIds.push(prop.id);

    const imgRows = p.images.map((url, j) => ({
      property_id: prop.id,
      image_url: url,
      is_primary: j === 0,
      display_order: j,
    }));
    const { error: imgErr } = await supabase.from("property_images").insert(imgRows);
    if (imgErr) throw imgErr;
    console.log("Property:", p.title, prop.id);
  }

  /** @type {any[]} */
  const bookingRows = [];
  const bookingSpecs = [
    { pi: 0, gi: 0, check_in: "2026-04-10", check_out: "2026-04-14", guests: 2, status: "confirmed" },
    { pi: 1, gi: 1, check_in: "2026-05-02", check_out: "2026-05-06", guests: 4, status: "confirmed" },
    { pi: 2, gi: 2, check_in: "2026-04-18", check_out: "2026-04-25", guests: 6, status: "pending" },
    { pi: 3, gi: 3, check_in: "2026-06-01", check_out: "2026-06-04", guests: 2, status: "confirmed" },
    { pi: 4, gi: 4, check_in: "2026-05-12", check_out: "2026-05-15", guests: 3, status: "confirmed" },
    { pi: 5, gi: 0, check_in: "2026-07-04", check_out: "2026-07-08", guests: 4, status: "pending" },
    { pi: 6, gi: 1, check_in: "2026-04-22", check_out: "2026-04-26", guests: 2, status: "confirmed" },
    { pi: 7, gi: 2, check_in: "2026-05-20", check_out: "2026-05-23", guests: 3, status: "cancelled" },
    { pi: 8, gi: 3, check_in: "2026-08-01", check_out: "2026-08-07", guests: 5, status: "confirmed" },
    { pi: 9, gi: 4, check_in: "2026-12-20", check_out: "2026-12-28", guests: 8, status: "pending" },
    { pi: 0, gi: 4, check_in: "2026-09-10", check_out: "2026-09-13", guests: 2, status: "confirmed" },
    { pi: 4, gi: 1, check_in: "2026-03-15", check_out: "2026-03-18", guests: 2, status: "completed" },
  ];

  for (const spec of bookingSpecs) {
    const property_id = propertyIds[spec.pi];
    const guest_id = guestIds[spec.gi];
    const { data: prop } = await supabase.from("properties").select("host_id, price_per_night").eq("id", property_id).single();
    if (!prop) throw new Error("property");
    const host_id = prop.host_id;
    const cin = new Date(spec.check_in);
    const cout = new Date(spec.check_out);
    const nights = Math.ceil((cout - cin) / 86400000);
    const price_per_night = Number(prop.price_per_night);
    const subtotal = money(price_per_night * nights);
    const service_fee = money(subtotal * 0.12);
    const total = money(subtotal + service_fee);

    const { data: b, error: bErr } = await supabase
      .from("bookings")
      .insert({
        property_id,
        guest_id,
        host_id,
        check_in: spec.check_in,
        check_out: spec.check_out,
        guests: spec.guests,
        nights,
        price_per_night,
        subtotal,
        service_fee,
        total,
        status: spec.status,
      })
      .select("id")
      .single();
    if (bErr) throw bErr;
    bookingRows.push({ ...spec, id: b.id, property_id, guest_id, host_id });
  }

  console.log("\nBookings inserted:", bookingRows.length);

  // Conversations + messages
  const convoSpecs = [
    { pi: 0, gi: 0, lines: [
      { fromGuest: true, text: "Hi Marcus — is early check-in possible on the 10th?" },
      { fromGuest: false, text: "Absolutely. I can do 1pm if that works for you." },
      { fromGuest: true, text: "Perfect. See you then!" },
    ]},
    { pi: 2, gi: 2, lines: [
      { fromGuest: true, text: "Is the pool heated year-round?" },
      { fromGuest: false, text: "Yes — 82°F in winter. Enjoy!" },
    ]},
    { pi: 8, gi: 3, lines: [
      { fromGuest: true, text: "Do you allow one small dog?" },
      { fromGuest: false, text: "Sorry, this building is no-pets. Happy to suggest pet-friendly options nearby." },
    ]},
  ];

  for (const c of convoSpecs) {
    const property_id = propertyIds[c.pi];
    const guest_id = guestIds[c.gi];
    const { data: prop } = await supabase.from("properties").select("host_id").eq("id", property_id).single();
    const host_id = prop.host_id;
    const last = c.lines[c.lines.length - 1];
    const lastText = last.text;
    const { data: convo, error: cErr } = await supabase
      .from("conversations")
      .insert({
        property_id,
        guest_id,
        host_id,
        last_message_text: lastText,
        last_message_at: new Date().toISOString(),
      })
      .select("id")
      .single();
    if (cErr) throw cErr;

    for (const line of c.lines) {
      const sender_id = line.fromGuest ? guest_id : host_id;
      const { error: mErr } = await supabase.from("messages").insert({
        conversation_id: convo.id,
        sender_id,
        text: line.text,
        read: true,
      });
      if (mErr) throw mErr;
    }
    console.log("Conversation:", convo.id);
  }

  // Reviews (confirmed / completed bookings only)
  const reviewSpecs = [
    { bi: 0, text: "Flawless stay — quiet, stylish, and exactly as pictured. Would book again.", rating: 5 },
    { bi: 1, text: "Great for our family. Host was responsive and the neighborhood felt very safe.", rating: 5 },
    { bi: 3, text: "Perfect work trip base. Fast Wi‑Fi and comfortable desks.", rating: 5 },
    { bi: 4, text: "Lovely desert retreat — mornings on the patio were unforgettable.", rating: 5 },
    { bi: 6, text: "Houseboat experience was unique. Minor dock noise but worth it for the views.", rating: 4 },
    { bi: 8, text: "Luxury high-rise living. Beach access and concierge were top tier.", rating: 5 },
    { bi: 10, text: "Second time booking here — consistent quality.", rating: 5 },
    { bi: 11, text: "Wonderful cottage for writing — piano was a nice touch.", rating: 5 },
  ];

  for (const r of reviewSpecs) {
    const b = bookingRows[r.bi];
    const spec = bookingSpecs[r.bi];
    if (!b || !["confirmed", "completed"].includes(spec.status)) continue;
    const { error: rErr } = await supabase.from("reviews").insert({
      booking_id: b.id,
      property_id: b.property_id,
      reviewer_id: b.guest_id,
      rating: r.rating,
      comment: r.text,
    });
    if (rErr) throw rErr;
  }

  // Aggregate review_count + rating on properties
  for (const pid of propertyIds) {
    const { data: revs } = await supabase.from("reviews").select("rating").eq("property_id", pid);
    if (!revs?.length) continue;
    const avg = revs.reduce((s, x) => s + x.rating, 0) / revs.length;
    await supabase
      .from("properties")
      .update({ review_count: revs.length, rating: money(avg) })
      .eq("id", pid);
  }

  // Notifications
  const notifs = [
    { user_index: "host", hi: 0, title: "New booking request", description: "Sophie requested Apr 10–14 at Glasshouse Loft.", type: "booking" },
    { user_index: "guest", gi: 2, title: "Message from host", description: "Yes — 82°F in winter. Enjoy!", type: "message" },
    { user_index: "host", hi: 1, title: "Inquiry on Lakeside Modern", description: "A guest asked about pool heating.", type: "message" },
    { user_index: "guest", gi: 3, title: "Booking confirmed", description: "Your Miami stay is confirmed for Aug 1–7.", type: "booking" },
  ];

  for (const n of notifs) {
    let uid;
    if (n.user_index === "host") uid = hostIds[n.hi];
    else uid = guestIds[n.gi];
    await supabase.from("notifications").insert({
      user_id: uid,
      title: n.title,
      description: n.description,
      type: n.type,
      read: false,
    });
  }

  console.log("\n✅ Seed complete.");
  console.log("\nDemo password (all accounts):", DEMO_PASSWORD);
  console.log("Hosts:", HOSTS.map((h) => h.email).join(", "));
  console.log("Guests:", GUESTS.map((g) => g.email).join(", "));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
