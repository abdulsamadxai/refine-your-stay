import { useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Check, CreditCard, Calendar, ShieldCheck, Clock as ClockIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import { useApp } from "@/contexts/AppContext";
import { format } from "date-fns";

const steps = ["Summary", "Payment", "Confirmed"];

const BookingFlow = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { properties, createBooking, user } = useApp();
  const property = properties.find((p) => p.id === id) || properties[0];
  const [step, setStep] = useState(0);
  const [booking, setBooking] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const checkInDate = searchParams.get("checkIn") ? new Date(searchParams.get("checkIn")!) : null;
  const checkOutDate = searchParams.get("checkOut") ? new Date(searchParams.get("checkOut")!) : null;
  const isMinStayMet = property && checkInDate && checkOutDate ? Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / 86400000) >= property.minStay : true;

  // FIX 3: Read real guest count from URL params instead of hardcoding 2
  const guestCount = parseInt(searchParams.get("guests") || "2", 10);

  // FIX 4: If date params are missing, redirect user back to property page
  if (!checkInDate || !checkOutDate) {
    navigate(`/property/${id}`, { replace: true });
    return null;
  }

  const nights = Math.max(1, Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / 86400000));
  const subtotal = property.price * nights;
  const serviceFee = Math.round(subtotal * 0.12);
  const total = subtotal + serviceFee;
  const isInstant = property.instantBook;

  const handlePay = async () => {
    setIsSubmitting(true);
    setBookingError("");
    try {
      const { data, error } = await createBooking(
        property.id,
        property.hostId,
        checkInDate!,
        checkOutDate!,
        guestCount,
        property.price,
        property.instantBook
      );
      
      if (error) throw error;
      
      setBooking(data);
      setStep(2);
    } catch (err: any) {
      console.error("Booking error:", err);
      setBookingError(err.message || "Failed to create booking. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        {/* Progress */}
        <div className="mb-10 flex items-center justify-center gap-2">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-colors font-body ${
                i < step ? "bg-primary text-primary-foreground" :
                i === step ? "gradient-navy text-primary-foreground" :
                "bg-secondary text-muted-foreground"
              }`}>
                {i < step ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <span className={`hidden text-xs font-medium sm:block font-body ${i === step ? "text-foreground" : "text-muted-foreground"}`}>{s}</span>
              {i < steps.length - 1 && <div className="mx-1 h-px w-8 bg-border" />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Step 0: Summary */}
            {step === 0 && (
              <div className="rounded-2xl glass-strong p-8 shadow-3d-float">
                <h2 className="text-2xl font-bold text-foreground">Booking Summary</h2>
                {!isInstant && (
                  <div className="mt-3 flex items-center gap-2 rounded-xl bg-accent/10 px-4 py-3">
                    <ClockIcon className="h-4 w-4 text-accent" />
                    <span className="text-sm font-medium text-accent-foreground font-body">This is a Request to Book — the host will need to approve</span>
                  </div>
                )}
                <div className="mt-6 flex gap-4 rounded-xl border border-border p-4">
                  <img src={property.image} alt={property.title} className="h-20 w-20 rounded-xl object-cover" />
                  <div>
                    <h3 className="text-sm font-semibold text-foreground font-body">{property.title}</h3>
                    <p className="text-xs text-muted-foreground font-body">{property.location}</p>
                    <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground font-body">
                      <span>{format(checkInDate, "MMM d, yyyy")}</span>
                      <span>→</span>
                      <span>{format(checkOutDate, "MMM d, yyyy")}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 rounded-xl bg-accent/10 px-4 py-3">
                  <p className="text-sm text-accent-foreground font-body">{nights} nights · {guestCount} {guestCount === 1 ? "guest" : "guests"} {isMinStayMet ? "✓" : "❌"}</p>
                </div>
 
                {!isMinStayMet && (
                  <div className="mt-4 rounded-xl bg-destructive/10 px-4 py-3 border border-destructive/20">
                    <p className="text-sm font-bold text-destructive font-body">Minimum Stay Not Met</p>
                    <p className="text-xs text-destructive/80 font-body mt-1">
                      This property requires a minimum stay of {property.minStay} nights. 
                      Please go back and select a longer duration.
                    </p>
                    <Button 
                      variant="link" 
                      onClick={() => navigate(`/property/${id}`)}
                      className="text-xs text-destructive p-0 font-bold h-auto mt-2"
                    >
                      ← Back to Property
                    </Button>
                  </div>
                )}
 
                <div className="mt-6 space-y-3 border-t border-border pt-4">
                  <div className="flex justify-between text-sm font-body">
                    <span className="text-muted-foreground">${property.price} × {nights} nights</span>
                    <span className="text-foreground">${subtotal}</span>
                  </div>
                  <div className="flex justify-between text-sm font-body">
                    <span className="text-muted-foreground">Service fee</span>
                    <span className="text-foreground">${serviceFee}</span>
                  </div>
                  <div className="flex justify-between border-t border-border pt-3 text-base font-bold font-body">
                    <span className="text-foreground">Total</span>
                    <span className="text-foreground">${total}</span>
                  </div>
                </div>
                <Button 
                  onClick={() => setStep(1)} 
                  disabled={!isMinStayMet}
                  className="mt-6 w-full rounded-xl gradient-navy py-3 text-sm font-semibold text-primary-foreground shadow-none hover:opacity-90 font-body disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isMinStayMet ? "Continue to Payment" : "Minimum Stay Not Met"}
                </Button>
              </div>
            )}

            {/* Step 1: Payment */}
            {step === 1 && (
              <div className="rounded-2xl glass-strong p-8 shadow-3d-float">
                <h2 className="text-2xl font-bold text-foreground">Payment Details</h2>
                <p className="mt-2 text-sm text-muted-foreground font-body">Your payment is secured and encrypted.</p>
                <div className="mt-6 space-y-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground font-body">Card Number</label>
                    <div className="relative mt-1">
                      <Input placeholder="4242 4242 4242 4242" className="rounded-xl pl-10 font-body" />
                      <CreditCard className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground font-body">Expiry</label>
                      <Input placeholder="MM / YY" className="mt-1 rounded-xl font-body" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground font-body">CVC</label>
                      <Input placeholder="123" className="mt-1 rounded-xl font-body" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground font-body">Name on Card</label>
                    <Input placeholder="Full name" defaultValue={user?.name || ""} className="mt-1 rounded-xl font-body" />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 rounded-xl bg-secondary px-4 py-3">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  <span className="text-xs text-muted-foreground font-body">Secured by 256-bit SSL encryption</span>
                </div>
                {bookingError && (
                  <div className="mt-4 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive font-body">
                    {bookingError}
                  </div>
                )}
                
                <div className="mt-6 flex gap-3">
                  <Button variant="outline" onClick={() => setStep(0)} disabled={isSubmitting} className="flex-1 rounded-xl font-body">Back</Button>
                  <Button onClick={handlePay} disabled={isSubmitting} className="flex-1 rounded-xl gradient-gold text-accent-foreground shadow-none hover:opacity-90 font-body font-semibold">
                    {isSubmitting ? "Processing..." : (isInstant ? `Pay $${total}` : `Submit Request · $${total}`)}
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Confirmation */}
            {step === 2 && (
              <div className="rounded-2xl glass-strong p-8 shadow-3d-float text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${isInstant ? "gradient-gold" : "gradient-navy"}`}
                >
                  {isInstant ? <Check className="h-8 w-8 text-accent-foreground" /> : <ClockIcon className="h-8 w-8 text-primary-foreground" />}
                </motion.div>
                <h2 className="mt-6 text-2xl font-bold text-foreground">
                  {isInstant ? "Booking Confirmed!" : "Request Submitted!"}
                </h2>
                <p className="mt-2 text-sm text-muted-foreground font-body">
                  {isInstant
                    ? `Your reservation at ${property.title} has been confirmed.`
                    : `Your booking request for ${property.title} has been sent. Awaiting host approval.`}
                </p>
                {!isInstant && (
                  <div className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-accent/10 px-4 py-3">
                    <ClockIcon className="h-4 w-4 text-accent" />
                    <span className="text-sm font-medium text-accent-foreground font-body">Status: Pending host approval</span>
                  </div>
                )}
                <div className="mx-auto mt-6 max-w-xs rounded-xl border border-border p-4 text-left">
                  <div className="space-y-2 text-sm font-body">
                    <div className="flex justify-between"><span className="text-muted-foreground">Booking ID</span><span className="text-foreground font-medium">{booking?.id || "#TRG-NEW"}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Check-in</span><span className="text-foreground">{format(checkInDate, "MMM d, yyyy")}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Check-out</span><span className="text-foreground">{format(checkOutDate, "MMM d, yyyy")}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Status</span><span className={`font-medium ${isInstant ? "text-green-600" : "text-accent"}`}>{isInstant ? "Confirmed" : "Pending"}</span></div>
                    <div className="flex justify-between border-t border-border pt-2 font-semibold"><span className="text-foreground">Total</span><span className="text-foreground">${total}</span></div>
                  </div>
                </div>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                  <Button onClick={() => navigate("/dashboard")} className="rounded-xl gradient-navy text-primary-foreground shadow-none hover:opacity-90 font-body">View My Bookings</Button>
                  <Button variant="outline" onClick={() => navigate("/messages")} className="rounded-xl font-body">Message Host</Button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default BookingFlow;
