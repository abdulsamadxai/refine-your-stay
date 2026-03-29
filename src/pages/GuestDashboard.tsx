import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, MessageSquare, User, MapPin, XCircle, Loader2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useApp } from "@/contexts/AppContext";
import ProfileSettings from "@/components/dashboard/ProfileSettings";

const tabs = [
  { id: "bookings", label: "My Bookings", icon: CalendarDays },
  { id: "messages", label: "Messages", icon: MessageSquare },
  { id: "profile", label: "Profile", icon: User },
];

const statusColors: Record<string, string> = {
  confirmed: "bg-green-100 text-green-700",
  pending: "bg-accent/20 text-accent-foreground",
  completed: "bg-secondary text-muted-foreground",
  cancelled: "bg-destructive/10 text-destructive",
};

const GuestDashboard = () => {
  const [activeTab, setActiveTab] = useState("bookings");
  const [cancelingId, setCancelingId] = useState<string | null>(null);
  const [cancelError, setCancelError] = useState("");
  const { bookings, cancelBooking, fetchBookings, user, conversations } = useApp();

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchBookings().finally(() => setIsLoading(false));
    }
  }, [user, fetchBookings]);

  const handleCancel = async (id: string) => {
    setCancelError("");
    setCancelingId(id);
  };

  const confirmCancel = async () => {
    if (!cancelingId) return;
    const { error } = await cancelBooking(cancelingId);
    if (error) {
      setCancelError(error.message);
    } else {
      setCancelingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-foreground">My Dashboard</h1>

        <div className="mt-6 flex gap-1 rounded-xl bg-secondary p-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors font-body ${
                activeTab === t.id ? "bg-card text-foreground shadow-soft" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <t.icon className="h-4 w-4" /> {t.label}
            </button>
          ))}
        </div>

        {activeTab === "bookings" && (
          <div className="mt-8 space-y-4">
            {isLoading ? (
              <div className="flex h-40 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : bookings.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card py-16 text-center">
                <CalendarDays className="h-10 w-10 text-muted-foreground" />
                <p className="mt-4 text-sm font-semibold text-foreground font-body">No bookings yet</p>
                <p className="mt-1 text-xs text-muted-foreground font-body">Start exploring properties to make your first booking.</p>
                <Link to="/search"><Button className="mt-4 rounded-xl gradient-navy text-primary-foreground shadow-none hover:opacity-90 font-body">Explore Properties</Button></Link>
              </div>
            ) : bookings.map((b) => (
              <div key={b.id} className="flex gap-4 rounded-2xl border border-border bg-card p-5 card-3d shadow-3d">
                <img 
                  src={b.property.image || "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=600"} 
                  alt={b.property.title} 
                  onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=600"; }}
                  className="h-24 w-24 rounded-xl object-cover shrink-0" 
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-foreground font-body">{b.property.title}</h3>
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground font-body">
                        <MapPin className="h-3 w-3" /> {b.property.location}
                      </p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${statusColors[b.status]} font-body`}>{b.status}</span>
                  </div>
                  <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground font-body">
                    <span>
                      {format(parseISO(b.checkIn), "MMM d, yyyy")} → {format(parseISO(b.checkOut), "MMM d, yyyy")}
                    </span>
                    <span>{b.guests} guests</span>
                    <span className="font-semibold text-foreground">${b.total}</span>
                  </div>
                  {(b.status === "confirmed" || b.status === "pending") && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCancel(b.id)}
                      className="mt-2 h-7 gap-1 text-xs text-destructive hover:bg-destructive/10 font-body"
                    >
                      <XCircle className="h-3 w-3" /> Cancel Booking
                    </Button>
                  )}
                  {cancelingId === b.id && (
                    <div className="mt-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4">
                      <p className="text-sm font-medium text-destructive font-body">Are you sure you want to cancel this booking?</p>
                      {cancelError && <p className="mt-1 text-xs text-destructive font-body">{cancelError}</p>}
                      <div className="mt-3 flex gap-2">
                        <Button size="sm" variant="ghost" onClick={() => setCancelingId(null)} className="h-7 text-xs font-body">Keep Booking</Button>
                        <Button size="sm" onClick={confirmCancel} className="h-7 text-xs bg-destructive text-white hover:bg-destructive/90 font-body">Yes, Cancel</Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "messages" && (
          <div className="mt-8 space-y-4">
            {conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card py-16 text-center">
                <MessageSquare className="h-10 w-10 text-muted-foreground" />
                <p className="mt-4 text-sm font-semibold text-foreground font-body">Your Messages</p>
                <Link to="/messages"><Button className="mt-4 rounded-xl gradient-navy text-primary-foreground shadow-none hover:opacity-90 font-body">Open Messages</Button></Link>
              </div>
            ) : (
              <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-3d">
                {conversations.map((c, idx) => (
                  <Link
                    key={c.id}
                    to="/messages"
                    className={`flex items-center gap-4 p-4 transition-colors hover:bg-secondary ${
                      idx !== conversations.length - 1 ? "border-b border-border" : ""
                    }`}
                  >
                    <img
                      src={c.propertyImage || "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=600"}
                      alt=""
                      onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=600"; }}
                      className="h-14 w-14 rounded-xl object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-foreground truncate font-body">
                          {c.hostName}
                        </span>
                        {c.lastMessageTime && (
                          <span className="text-xs text-muted-foreground font-body shrink-0">
                            {c.lastMessageTime}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 truncate text-xs text-muted-foreground font-body">
                        {c.lastMessage || "No messages yet"}
                      </p>
                    </div>
                    {c.unread > 0 && (
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full gradient-gold text-[10px] font-bold text-accent-foreground font-body shadow-sm">
                        {c.unread}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            )}
            {conversations.length > 0 && (
              <div className="flex justify-center mt-4">
                <Link to="/messages">
                  <Button variant="outline" className="rounded-xl font-body">View Full Inbox</Button>
                </Link>
              </div>
            )}
          </div>
        )}

        {activeTab === "profile" && (
          <div className="mt-8 overflow-hidden rounded-2xl">
            <ProfileSettings />
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default GuestDashboard;
