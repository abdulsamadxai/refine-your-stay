import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, ShieldCheck, Clock, ChevronLeft, ChevronRight, MapPin, Users, BedDouble, Bath, Wifi, Car, Dumbbell, Waves, UtensilsCrossed, Snowflake, Laptop, Zap, AlertCircle, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useApp } from "@/contexts/AppContext";
import type { ManagedProperty } from "@/types";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";

const amenityIcons: Record<string, React.ReactNode> = {
  WiFi: <Wifi className="h-4 w-4" />,
  Parking: <Car className="h-4 w-4" />,
  Pool: <Waves className="h-4 w-4" />,
  Gym: <Dumbbell className="h-4 w-4" />,
  Kitchen: <UtensilsCrossed className="h-4 w-4" />,
  "Air Conditioning": <Snowflake className="h-4 w-4" />,
  Workspace: <Laptop className="h-4 w-4" />,
  "EV Charger": <Zap className="h-4 w-4" />,
};

const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchPropertyById, startConversation, user } = useApp();
  const [property, setProperty] = useState<ManagedProperty | null>(null);
  const isOwnProperty = user?.id === property?.hostId;
  const [loading, setLoading] = useState(true);
  const [imgIdx, setImgIdx] = useState(0);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  // FIX 2: Guest count state — defaults to 1, bounded by property.maxGuests
  const [guests, setGuests] = useState(1);

  useEffect(() => {
    const loadProperty = async () => {
      if (!id) return;
      setLoading(true);
      const data = await fetchPropertyById(id);
      setProperty(data);
      setLoading(false);
    };
    loadProperty();
  }, [id, fetchPropertyById]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex h-[60vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <h1 className="text-2xl font-bold text-foreground font-body">Property not found</h1>
          <Button variant="outline" className="mt-4 rounded-full font-body" onClick={() => navigate("/search")}>Back to Search</Button>
        </div>
      </div>
    );
  }

  const images =
    property.images?.length > 0 ? property.images : property.image ? [property.image] : [];
  const galleryIdx = images.length > 0 ? imgIdx % images.length : 0;
  const checkIn = dateRange?.from;
  const checkOut = dateRange?.to;
  const nights = checkIn && checkOut ? Math.ceil((checkOut.getTime() - checkIn.getTime()) / 86400000) : 0;
  const meetsMinStay = nights >= property.minStay;
  const subtotal = property.price * (nights || property.minStay);
  const serviceFee = Math.round(subtotal * 0.12);
  const total = subtotal + serviceFee;

  const disabledDates = (date: Date) => {
    // FIX 8: Normalize today to midnight so the current date is not incorrectly disabled at 11:59 PM
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return true;
    const iso = date.toISOString().split("T")[0];
    return property.blockedDates?.includes(iso) || false;
  };

  const handleBook = () => {
    if (!checkIn || !checkOut) return;
    const params = new URLSearchParams({
      checkIn: checkIn.toISOString(),
      checkOut: checkOut.toISOString(),
      nights: nights.toString(),
      guests: guests.toString(),
    });
    navigate(`/booking/${property.id}?${params.toString()}`);
  };

  const handleContactHost = async () => {
    const convoId = await startConversation(property.id, property.hostId);
    if (convoId) navigate("/messages");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Image gallery */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative overflow-hidden rounded-3xl">
          <div className="aspect-[16/9] sm:aspect-[2/1]">
            <img
              src={images[galleryIdx] || "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=600"}
              alt={property.title}
              onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=600"; }}
              className="h-full w-full object-cover"
            />
          </div>
          <button
            type="button"
            disabled={images.length < 2}
            onClick={() => setImgIdx((i) => (i - 1 + Math.max(images.length, 1)) % Math.max(images.length, 1))}
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-card/80 p-2 backdrop-blur-sm transition-colors hover:bg-card disabled:opacity-40"
          >
            <ChevronLeft className="h-5 w-5 text-foreground" />
          </button>
          <button
            type="button"
            disabled={images.length < 2}
            onClick={() => setImgIdx((i) => (i + 1) % Math.max(images.length, 1))}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-card/80 p-2 backdrop-blur-sm transition-colors hover:bg-card disabled:opacity-40"
          >
            <ChevronRight className="h-5 w-5 text-foreground" />
          </button>
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
            {images.map((_, i) => (
              <button key={i} onClick={() => setImgIdx(i)} className={`h-2 w-2 rounded-full transition-colors ${i === imgIdx ? "bg-card" : "bg-card/50"}`} />
            ))}
          </div>
        </motion.div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
          {/* Left */}
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground font-body">{property.type}</span>
              {property.verified && (
                <span className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary font-body">
                  <ShieldCheck className="h-3 w-3" /> Verified
                </span>
              )}
              {property.instantBook ? (
                <span className="flex items-center gap-1 rounded-full gradient-gold px-3 py-1 text-xs font-semibold text-accent-foreground font-body">⚡ Instant Book</span>
              ) : (
                <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground font-body">Request to Book</span>
              )}
            </div>
            <h1 className="mt-4 text-3xl font-bold text-foreground sm:text-4xl">{property.title}</h1>
            <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground font-body">
              <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {property.location}</span>
              <span className="flex items-center gap-1"><Star className="h-4 w-4 fill-accent text-accent" /> {property.rating} ({property.reviews} reviews)</span>
            </div>
            <div className="mt-6 flex flex-wrap gap-4">
              {[
                { icon: Users, label: `${property.maxGuests} guests` },
                { icon: BedDouble, label: `${property.bedrooms} bedrooms` },
                { icon: Bath, label: `${property.bathrooms} bathrooms` },
                { icon: Clock, label: `Min ${property.minStay} nights` },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-2 rounded-xl border border-border px-4 py-2.5">
                  <s.icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground font-body">{s.label}</span>
                </div>
              ))}
            </div>

            {/* Host */}
            <div className="mt-8 flex items-center justify-between gap-4 rounded-2xl border border-border p-5 card-3d shadow-3d">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full gradient-navy text-sm font-bold text-primary-foreground font-body">{property.host.avatar}</div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground font-body">{property.host.name}</span>
                    {property.host.superhost && <span className="rounded-full gradient-gold px-2 py-0.5 text-[10px] font-bold text-accent-foreground font-body">SUPERHOST</span>}
                  </div>
                  <p className="text-xs text-muted-foreground font-body">Hosting since {property.host.joinedYear} · {property.host.responseRate}% response rate</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={handleContactHost} className="rounded-xl border-border px-4 font-body text-xs font-semibold hover:bg-secondary">
                Contact Host
              </Button>
            </div>

            <div className="mt-8">
              <h2 className="text-xl font-bold text-foreground font-body">About this property</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground font-body">{property.description}</p>
            </div>

            <div className="mt-8">
              <h2 className="text-xl font-bold text-foreground font-body">Amenities</h2>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {property.amenities.map((a) => (
                  <div key={a} className="flex items-center gap-3 rounded-xl border border-border px-4 py-3">
                    <span className="text-muted-foreground">{amenityIcons[a] || <span className="text-sm">✓</span>}</span>
                    <span className="text-sm text-foreground font-body">{a}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews (loaded from Supabase `reviews` table on this property) */}
            <div className="mt-8">
              <h2 className="text-xl font-bold text-foreground font-body">Reviews <span className="text-muted-foreground font-normal">({property.reviews})</span></h2>
              <div className="mt-4 space-y-4">
                {property.reviewEntries && property.reviewEntries.length > 0 ? (
                  property.reviewEntries.map((r) => (
                    <div key={r.id} className="rounded-2xl border border-border p-5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground font-body">
                            {r.reviewerInitials}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground font-body">{r.reviewerName}</p>
                            <p className="text-xs text-muted-foreground font-body">
                              {format(new Date(r.createdAt), "MMMM yyyy")}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-0.5">
                          {Array.from({ length: r.rating }).map((_, i) => (
                            <Star key={i} className="h-3.5 w-3.5 fill-accent text-accent" />
                          ))}
                        </div>
                      </div>
                      {r.comment && (
                        <p className="mt-3 text-sm text-muted-foreground leading-relaxed font-body">{r.comment}</p>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground font-body">No written reviews yet for this listing.</p>
                )}
              </div>
            </div>
          </div>

          {/* Booking sidebar */}
          <div>
            <div className="sticky top-24 rounded-2xl glass-strong p-6 shadow-3d-float">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-foreground font-body">${property.price}</span>
                <span className="text-sm text-muted-foreground font-body">/ night</span>
              </div>
              <div className="mt-1 flex items-center gap-2">
                <span className="flex items-center gap-1 text-sm text-foreground font-body"><Star className="h-3.5 w-3.5 fill-accent text-accent" /> {property.rating}</span>
                <span className="text-sm text-muted-foreground font-body">· {property.reviews} reviews</span>
              </div>

              <div className="mt-4 flex items-center gap-2 rounded-xl bg-accent/10 px-3 py-2">
                <Clock className="h-4 w-4 text-accent" />
                <span className="text-xs font-medium text-accent-foreground font-body">Minimum stay: {property.minStay} nights</span>
              </div>

              {/* FIX 2: Guest count selector */}
              <div className="mt-4">
                <p className="text-xs font-medium text-foreground font-body mb-2">Guests</p>
                <div className="flex items-center gap-3 rounded-xl border border-border px-4 py-2">
                  <button
                    type="button"
                    onClick={() => setGuests((g) => Math.max(1, g - 1))}
                    disabled={guests <= 1}
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-secondary disabled:opacity-30"
                    aria-label="Decrease guests"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="flex-1 text-center text-sm font-semibold text-foreground font-body">
                    {guests} {guests === 1 ? "guest" : "guests"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setGuests((g) => Math.min(property.maxGuests, g + 1))}
                    disabled={guests >= property.maxGuests}
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-secondary disabled:opacity-30"
                    aria-label="Increase guests"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
                <p className="mt-1 text-[10px] text-muted-foreground font-body">Max {property.maxGuests} guests</p>
              </div>

              {/* Date range picker */}
              <div className="mt-4">
                <p className="text-xs font-medium text-foreground font-body mb-2">Select dates</p>
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={setDateRange}
                  disabled={disabledDates}
                  numberOfMonths={1}
                  className="rounded-xl border border-border p-3 pointer-events-auto"
                />
              </div>

              {/* Date display */}
              {checkIn && checkOut && (
                <div className="mt-3 flex gap-2">
                  <div className="flex-1 rounded-xl border border-border px-3 py-2 text-center">
                    <p className="text-[10px] text-muted-foreground font-body">CHECK-IN</p>
                    <p className="text-sm font-semibold text-foreground font-body">{format(checkIn, "MMM d")}</p>
                  </div>
                  <div className="flex-1 rounded-xl border border-border px-3 py-2 text-center">
                    <p className="text-[10px] text-muted-foreground font-body">CHECK-OUT</p>
                    <p className="text-sm font-semibold text-foreground font-body">{format(checkOut, "MMM d")}</p>
                  </div>
                </div>
              )}

              {/* Min stay warning */}
              {nights > 0 && !meetsMinStay && (
                <div className="mt-3 flex items-center gap-2 rounded-xl bg-destructive/10 px-3 py-2">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  <span className="text-xs font-medium text-destructive font-body">Minimum stay is {property.minStay} nights</span>
                </div>
              )}

              {/* Price breakdown */}
              {nights > 0 && meetsMinStay && (
                <div className="mt-4 space-y-2 border-t border-border pt-4">
                  <div className="flex justify-between text-sm font-body">
                    <span className="text-muted-foreground">${property.price} × {nights} nights</span>
                    <span className="text-foreground">${property.price * nights}</span>
                  </div>
                  <div className="flex justify-between text-sm font-body">
                    <span className="text-muted-foreground">Service fee</span>
                    <span className="text-foreground">${serviceFee}</span>
                  </div>
                  <div className="flex justify-between border-t border-border pt-2 text-sm font-semibold font-body">
                    <span className="text-foreground">Total</span>
                    <span className="text-foreground">${total}</span>
                  </div>
                </div>
              )}

              <Button
                onClick={handleBook}
                disabled={!checkIn || !checkOut || !meetsMinStay}
                className="mt-4 w-full rounded-xl gradient-navy py-3 text-sm font-semibold text-primary-foreground shadow-none hover:opacity-90 font-body disabled:opacity-50"
              >
                {!checkIn || !checkOut
                  ? "Select dates to book"
                  : !meetsMinStay
                  ? `Min ${property.minStay} nights required`
                  : property.instantBook
                  ? "Instant Book"
                  : "Request to Book"}
              </Button>
              {!isOwnProperty && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleContactHost} 
                  className="mt-2 w-full rounded-xl py-3 text-xs font-medium text-muted-foreground hover:bg-secondary/50 font-body"
                >
                  Question? Contact Host
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PropertyDetail;
