import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Bell, Menu, MessageSquare, User, X, Search, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/contexts/AppContext";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, notifications, markNotificationRead, logout } = useApp();
  const unreadCount = notifications.filter((n) => !n.read).length;

  const navLinks = [
    { label: "Explore", to: "/search" },
    { label: "Messages", to: "/messages" },
    ...(user?.role === "host"
      ? [{ label: "Host Dashboard", to: "/host" }]
      : [{ label: "My Bookings", to: "/dashboard" }]),
  ];

  return (
    <nav className="sticky top-0 z-50 glass-strong">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-navy shadow-soft">
            <span className="text-sm font-bold text-primary-foreground font-body">TR</span>
          </div>
          <span className="hidden text-lg font-semibold tracking-tight text-foreground font-body sm:block">
            Private Rooms <span className="text-muted-foreground font-normal">by TRG</span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 font-body ${
                location.pathname === link.to
                  ? "bg-primary/10 text-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Link to="/search">
            <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-foreground">
              <Search className="h-4 w-4" />
            </Button>
          </Link>

          {/* Notifications */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="relative rounded-full text-muted-foreground hover:text-foreground"
              onClick={() => setNotifOpen(!notifOpen)}
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground">
                  {unreadCount}
                </span>
              )}
            </Button>
            <AnimatePresence>
              {notifOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.96 }}
                    transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
                    className="absolute right-0 top-12 z-50 w-80 rounded-2xl glass-strong shadow-3d-float p-2 max-h-[400px] overflow-y-auto"
                  >
                    <div className="mb-2 px-3 py-2">
                      <h3 className="text-sm font-semibold text-foreground font-body">Notifications</h3>
                    </div>
                    {notifications.length === 0 ? (
                      <p className="px-3 py-4 text-sm text-muted-foreground text-center font-body">No notifications</p>
                    ) : notifications.slice(0, 10).map((n) => (
                      <div
                        key={n.id}
                        onClick={() => markNotificationRead(n.id)}
                        className={`flex gap-3 rounded-xl px-3 py-3 transition-all duration-200 hover:bg-secondary/80 cursor-pointer ${!n.read ? "bg-accent/5" : ""}`}
                      >
                        <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                          n.type === "booking" ? "bg-primary/10 text-primary" :
                          n.type === "message" ? "bg-accent/20 text-accent" :
                          n.type === "payment" ? "bg-green-100 text-green-600" :
                          "bg-secondary text-muted-foreground"
                        }`}>
                          {n.type === "booking" ? "📅" : n.type === "message" ? "💬" : n.type === "payment" ? "💳" : "⚙️"}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground font-body">{n.title}</p>
                          <p className="text-xs text-muted-foreground line-clamp-2">{n.description}</p>
                          <p className="mt-1 text-xs text-muted-foreground">{n.time}</p>
                        </div>
                        {!n.read && <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-accent" />}
                      </div>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          <Link to="/messages">
            <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-foreground">
              <MessageSquare className="h-4 w-4" />
            </Button>
          </Link>

          {user ? (
            <div className="flex items-center gap-2">
              <Link to={user.role === "host" ? "/host" : "/dashboard"}>
                <Button variant="ghost" size="icon" className="rounded-full border border-border text-muted-foreground hover:text-foreground">
                  <span className="text-xs font-bold font-body">{user.avatar}</span>
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full text-muted-foreground hover:text-foreground"
                onClick={async () => { await logout(); navigate("/login", { replace: true }); }}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Link to="/login">
              <Button variant="ghost" size="icon" className="rounded-full border border-border text-muted-foreground hover:text-foreground">
                <User className="h-4 w-4" />
              </Button>
            </Link>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="rounded-full text-muted-foreground md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-border glass px-4 py-4 md:hidden"
          >
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className="block rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground font-body"
              >
                {link.label}
              </Link>
            ))}
            {!user && (
              <>
                <Link to="/login" onClick={() => setMobileOpen(false)} className="block rounded-xl px-4 py-3 text-sm font-medium text-primary transition-colors hover:bg-secondary font-body">Sign In</Link>
                <Link to="/signup" onClick={() => setMobileOpen(false)} className="block rounded-xl px-4 py-3 text-sm font-medium text-primary transition-colors hover:bg-secondary font-body">Sign Up</Link>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
