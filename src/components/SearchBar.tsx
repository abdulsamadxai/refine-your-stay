import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, Calendar, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SearchBarProps {
  variant?: "hero" | "compact";
}

const SearchBar = ({ variant = "hero" }: SearchBarProps) => {
  const navigate = useNavigate();
  const [location, setLocation] = useState("");
  const [guests, setGuests] = useState(1);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (location) params.set("location", location);
    if (guests > 1) params.set("guests", guests.toString());
    if (checkIn) params.set("checkIn", checkIn);
    if (checkOut) params.set("checkOut", checkOut);
    navigate(`/search?${params.toString()}`);
  };

  if (variant === "compact") {
    return (
      <div className="flex w-full max-w-xl items-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 shadow-soft transition-shadow hover:shadow-elevated">
        <Search className="h-4 w-4 text-muted-foreground shrink-0 ml-1" />
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="Search destinations..."
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none font-body px-2"
        />
        <Button 
          onClick={handleSearch}
          size="sm"
          className="rounded-full gradient-navy text-primary-foreground text-xs px-4 h-8 shadow-none hover:opacity-90 font-body"
        >
          Search
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl rounded-2xl border border-border bg-card p-2 shadow-elevated">
      <div className="flex flex-col gap-2 md:flex-row md:items-center">
        <div className="flex flex-1 items-center gap-2 rounded-xl px-4 py-3 transition-colors hover:bg-secondary">
          <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            type="text"
            placeholder="Where to?"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none font-body"
          />
        </div>
        
        <div className="hidden h-8 w-px bg-border md:block" />
        
        <div className="flex flex-1 items-center gap-2 rounded-xl px-4 py-3 transition-colors hover:bg-secondary">
          <Calendar className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
            className="w-full bg-transparent text-sm text-foreground focus:outline-none font-body appearance-none"
            placeholder="Check in"
          />
        </div>

        <div className="hidden h-8 w-px bg-border md:block" />

        <div className="flex flex-1 items-center gap-2 rounded-xl px-4 py-3 transition-colors hover:bg-secondary">
          <Calendar className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            min={checkIn || new Date().toISOString().split("T")[0]}
            className="w-full bg-transparent text-sm text-foreground focus:outline-none font-body appearance-none"
            placeholder="Check out"
          />
        </div>
        
        <div className="hidden h-8 w-px bg-border md:block" />
        
        <div className="flex items-center gap-3 px-4 py-3 md:flex-none">
          <Users className="h-4 w-4 shrink-0 text-muted-foreground" />
          <div className="flex items-center gap-2">
            <button
              onClick={() => setGuests(Math.max(1, guests - 1))}
              className="flex h-6 w-6 items-center justify-center rounded-full border border-border text-xs text-muted-foreground hover:bg-secondary"
            >
              -
            </button>
            <span className="text-sm font-medium text-foreground font-body w-4 text-center">{guests}</span>
            <button
              onClick={() => setGuests(guests + 1)}
              className="flex h-6 w-6 items-center justify-center rounded-full border border-border text-xs text-muted-foreground hover:bg-secondary"
            >
              +
            </button>
          </div>
          <span className="text-xs text-muted-foreground font-body">guests</span>
        </div>

        <Button
          onClick={handleSearch}
          className="rounded-xl gradient-navy px-8 py-6 text-sm font-semibold text-primary-foreground shadow-none hover:opacity-90 font-body"
        >
          <Search className="mr-2 h-4 w-4" /> Search
        </Button>
      </div>
    </div>
  );
};

export default SearchBar;
