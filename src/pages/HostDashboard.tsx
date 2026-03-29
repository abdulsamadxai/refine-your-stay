import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, CalendarDays, DollarSign, Plus, TrendingUp, Eye, Star, Clock, CheckCircle, AlertCircle, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useApp } from "@/contexts/AppContext";
import ProfileSettings from "@/components/dashboard/ProfileSettings";
import type { PropertyStatus } from "@/types";

const statusConfig: Record<PropertyStatus, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: "Pending Approval", color: "bg-accent/20 text-accent-foreground", icon: Clock },
  approved: { label: "Approved", color: "bg-blue-100 text-blue-700", icon: CheckCircle },
  live: { label: "Live", color: "bg-green-100 text-green-700", icon: CheckCircle },
};

const HostDashboard = () => {
  const { properties, bookings, toggleBlockedDate, updatePropertyStatus, fetchBookings, updateBookingStatus, user } = useApp();
  const [activeSection, setActiveSection] = useState("properties");
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);

  useEffect(() => {
    if (user) fetchBookings();
  }, [user, fetchBookings]);

  // FIX: Isolated Host Data - Only show properties and bookings owned by this user
  const hostProperties = properties.filter(p => p.hostId === user?.id);
  const hostBookings = bookings.filter(b => b.hostId === user?.id);

  const sections = [
    { id: "properties", label: "Properties", icon: Home },
    { id: "bookings", label: "Bookings", icon: CalendarDays },
    { id: "earnings", label: "Earnings", icon: DollarSign },
    { id: "calendar", label: "Calendar", icon: CalendarDays },
    { id: "profile", label: "Profile", icon: User },
  ];

  const selectedProperty = selectedPropertyId ? properties.find(p => p.id === selectedPropertyId) : null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Host Dashboard</h1>
          <Link to="/host/add-property">
            <Button className="gap-2 rounded-xl gradient-gold text-accent-foreground shadow-none hover:opacity-90 font-body font-semibold">
              <Plus className="h-4 w-4" /> Add Property
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            { icon: TrendingUp, label: "Total Earnings", value: `$${hostBookings.reduce((s, b) => s + b.total, 0).toLocaleString()}`, sub: `${hostBookings.length} bookings` },
            { icon: Eye, label: "Properties", value: hostProperties.length.toString(), sub: `${hostProperties.filter(p => p.status === "live").length} live` },
            { icon: Star, label: "Avg Rating", value: "4.95", sub: "From reviews" },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="card-3d rounded-2xl border border-border bg-card p-6 shadow-3d">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <s.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-body">{s.label}</p>
                  <p className="text-xl font-bold text-foreground font-body">{s.value}</p>
                </div>
              </div>
              <p className="mt-2 text-xs text-muted-foreground font-body">{s.sub}</p>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="mt-8 flex gap-1 rounded-xl bg-secondary p-1">
          {sections.map((s) => (
            <button key={s.id} onClick={() => setActiveSection(s.id)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors font-body ${
                activeSection === s.id ? "bg-card text-foreground shadow-soft" : "text-muted-foreground hover:text-foreground"
              }`}>
              <s.icon className="h-4 w-4" /> {s.label}
            </button>
          ))}
        </div>

        {/* Properties */}
        {activeSection === "properties" && (
          <div className="mt-8 space-y-4">
            {hostProperties.map((p) => {
              const sc = statusConfig[p.status];
              return (
                <div key={p.id} className="flex gap-4 rounded-2xl border border-border bg-card p-5">
                  <img src={p.image} alt={p.title} className="h-20 w-28 rounded-xl object-cover shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <h3 className="text-sm font-semibold text-foreground font-body">{p.title}</h3>
                      <span className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-medium ${sc.color} font-body`}>
                        <sc.icon className="h-3 w-3" /> {sc.label}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground font-body">{p.location}</p>
                    <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground font-body">
                      <span>${p.price}/night</span>
                      <span>Min {p.minStay} nights</span>
                      {p.rating > 0 && <span className="flex items-center gap-1"><Star className="h-3 w-3 fill-accent text-accent" /> {p.rating}</span>}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    {p.status === "pending" && (
                      <Button size="sm" className="rounded-lg font-body text-xs gradient-navy text-primary-foreground" onClick={() => updatePropertyStatus(p.id, "live")}>
                        Approve
                      </Button>
                    )}
                    <Button variant="outline" size="sm" className="rounded-lg font-body text-xs" onClick={() => { setSelectedPropertyId(p.id); setActiveSection("calendar"); }}>
                      Calendar
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Bookings */}
        {activeSection === "bookings" && (
          <div className="mt-8 space-y-4">
            {hostBookings.length === 0 ? (
              <div className="rounded-2xl border border-border bg-card p-12 text-center">
                <CalendarDays className="mx-auto h-12 w-12 text-muted-foreground opacity-20" />
                <p className="mt-4 text-sm font-semibold text-foreground font-body">No bookings yet.</p>
                <p className="mt-1 text-xs text-muted-foreground font-body">When guests book your properties, they'll appear here.</p>
              </div>
            ) : hostBookings.map((b) => (
              <div key={b.id} className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-3d sm:flex-row sm:items-center sm:justify-between">
                <div className="flex gap-4">
                  <img src={b.property.image} alt="" className="h-16 w-16 rounded-xl object-cover shrink-0" />
                  <div>
                    <h3 className="text-sm font-semibold text-foreground font-body">{b.property.title}</h3>
                    <p className="text-xs text-muted-foreground font-body">{b.checkIn} → {b.checkOut}</p>
                    <div className="mt-2 flex items-center gap-2">
                       <div className="flex -space-x-2">
                          <img src={(b as any).guest?.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"} className="h-6 w-6 rounded-full border-2 border-background object-cover" />
                       </div>
                       <span className="text-xs font-medium text-foreground font-body">{(b as any).guest?.full_name || "Guest User"} · {b.guests} guests</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-6 border-t border-border pt-4 sm:border-0 sm:pt-0">
                  <div className="text-left sm:text-right">
                    <p className="text-sm font-bold text-foreground font-body">${b.total}</p>
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider font-body ${
                      b.status === "confirmed" ? "bg-green-100 text-green-700" : 
                      b.status === "pending" ? "bg-accent/10 text-accent" : 
                      b.status === "cancelled" ? "bg-destructive/10 text-destructive" : 
                      "bg-secondary text-muted-foreground"
                    }`}>
                      {b.status}
                    </span>
                  </div>
                  
                  {b.status === "pending" && (
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-8 rounded-lg text-xs text-destructive hover:bg-destructive/10 font-body"
                        onClick={() => updateBookingStatus(b.id, "cancelled")}
                      >
                        Reject
                      </Button>
                      <Button 
                        size="sm" 
                        className="h-8 rounded-lg gradient-gold text-xs font-bold text-accent-foreground shadow-none hover:opacity-90 font-body"
                        onClick={() => updateBookingStatus(b.id, "confirmed")}
                      >
                        Approve Stay
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Earnings */}
        {activeSection === "earnings" && (
          <div className="mt-8 rounded-2xl border border-border bg-card p-8">
            <h2 className="text-xl font-bold text-foreground font-body">Earnings Summary</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {[
                { label: "This Month", value: `$${hostBookings.filter(b => b.status === "confirmed").reduce((s, b) => s + b.total, 0).toLocaleString()}` },
                { label: "Pending", value: `$${hostBookings.filter(b => b.status === "pending").reduce((s, b) => s + b.total, 0).toLocaleString()}` },
                { label: "Total Payouts", value: `$${hostBookings.reduce((s, b) => s + b.total, 0).toLocaleString()}` },
              ].map((e) => (
                <div key={e.label} className="rounded-xl border border-border p-4 text-center">
                  <p className="text-xs text-muted-foreground font-body">{e.label}</p>
                  <p className="mt-1 text-2xl font-bold text-foreground font-body">{e.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Calendar */}
        {activeSection === "calendar" && (
          <div className="mt-8 rounded-2xl border border-border bg-card p-8">
            <h2 className="text-xl font-bold text-foreground font-body">Availability Calendar</h2>
            <p className="mt-1 text-sm text-muted-foreground font-body">Click dates to block/unblock availability.</p>
            {!selectedPropertyId && (
              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium text-foreground font-body">Select a property:</p>
                {hostProperties.filter(p => p.status === "live").map(p => (
                  <button key={p.id} onClick={() => setSelectedPropertyId(p.id)}
                    className="block w-full text-left rounded-xl border border-border px-4 py-3 text-sm hover:bg-secondary transition-colors font-body">
                    {p.title}
                  </button>
                ))}
              </div>
            )}
            {selectedProperty && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-semibold text-foreground font-body">{selectedProperty.title}</p>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedPropertyId(null)} className="text-xs font-body">Change</Button>
                </div>
                <div className="flex gap-3 mb-4 text-xs font-body">
                  <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-destructive/20" /> Blocked</span>
                  <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-green-100" /> Available</span>
                </div>
                <Calendar
                  mode="single"
                  onSelect={(date) => {
                    if (date) toggleBlockedDate(selectedProperty.id, date.toISOString().split("T")[0]);
                  }}
                  modifiers={{
                    blocked: (selectedProperty.blockedDates || []).map(d => new Date(d)),
                  }}
                  modifiersStyles={{
                    blocked: { backgroundColor: "hsl(0 72% 51% / 0.15)", color: "hsl(0 72% 51%)" },
                  }}
                  disabled={(date) => date < new Date()}
                  className="rounded-xl border border-border p-3 pointer-events-auto"
                />
              </div>
            )}
          </div>
        )}

        {/* Profile */}
        {activeSection === "profile" && (
          <div className="mt-8 overflow-hidden rounded-2xl">
            <ProfileSettings />
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default HostDashboard;
