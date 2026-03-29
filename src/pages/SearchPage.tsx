import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { SlidersHorizontal, X, Wifi, Car, Waves, Dumbbell, UtensilsCrossed, Snowflake, Laptop, Zap, Star, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PropertyCard from "@/components/PropertyCard";
import SearchBar from "@/components/SearchBar";
import { useApp } from "@/contexts/AppContext";

const propertyTypes = ["All", "Villa", "Apartment", "Condo", "Penthouse", "Townhouse"];
const amenityList = [
  { id: "WiFi", icon: <Wifi className="h-3.5 w-3.5" /> },
  { id: "Parking", icon: <Car className="h-3.5 w-3.5" /> },
  { id: "Pool", icon: <Waves className="h-3.5 w-3.5" /> },
  { id: "Gym", icon: <Dumbbell className="h-3.5 w-3.5" /> },
  { id: "Kitchen", icon: <UtensilsCrossed className="h-3.5 w-3.5" /> },
  { id: "Air Conditioning", icon: <Snowflake className="h-3.5 w-3.5" /> },
];

const SearchPage = () => {
  const { properties } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [priceRange, setPriceRange] = useState([0, 2000]);
  const [minStay, setMinStay] = useState(1);
  const [selectedType, setSelectedType] = useState("All");
  const [showFilters, setShowFilters] = useState(true);
  
  // Advanced filters
  const [guests, setGuests] = useState(1);
  const [bedrooms, setBedrooms] = useState(0);
  const [bathrooms, setBathrooms] = useState(0);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [sortBy, setSortBy] = useState("newest");

  // Sync with URL params
  useEffect(() => {
    const loc = searchParams.get("location");
    const g = searchParams.get("guests");
    if (g) setGuests(parseInt(g));
  }, [searchParams]);

  const toggleAmenity = (id: string) => {
    setSelectedAmenities(prev => 
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const filtered = useMemo(() => {
    let result = properties.filter((p) => {
      // Only show live properties to guests
      if (p.status !== "live") return false;
      
      // Price
      if (p.price < priceRange[0] || p.price > priceRange[1]) return false;
      
      // Location (simple search)
      const locSearch = searchParams.get("location")?.toLowerCase();
      if (locSearch && !p.location.toLowerCase().includes(locSearch)) return false;
      
      // Stay
      if (p.minStay > minStay) return false;
      
      // Type
      if (selectedType !== "All" && p.type !== selectedType) return false;
      
      // Guests/Specs
      if (p.maxGuests < guests) return false;
      if (p.bedrooms < bedrooms) return false;
      if (p.bathrooms < bathrooms) return false;
      
      // Amenities
      if (selectedAmenities.length > 0) {
        if (!selectedAmenities.every(a => p.amenities.includes(a as any))) return false;
      }
      
      // Verified
      if (onlyVerified && !p.verified) return false;
      
      return true;
    });

    // Sorting
    return [...result].sort((a, b) => {
      if (sortBy === "price_asc") return a.price - b.price;
      if (sortBy === "price_desc") return b.price - a.price;
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "reviews") return b.reviews - a.reviews;
      // "newest" sort: most recently created first
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });
  }, [properties, priceRange, minStay, selectedType, searchParams, guests, bedrooms, bathrooms, selectedAmenities, onlyVerified, sortBy]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1 max-w-xl">
            <SearchBar variant="compact" />
          </div>
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="gap-2 rounded-full font-body">
            <SlidersHorizontal className="h-4 w-4" /> Filters
            {showFilters && <X className="h-3 w-3" />}
          </Button>
        </div>

        <div className="mt-6 flex flex-col gap-8 lg:flex-row">
          {/* Filters Sidebar */}
          {showFilters && (
            <motion.aside initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} className="w-full shrink-0 lg:w-72">
              <div className="sticky top-24 space-y-8 rounded-3xl glass-strong p-6 shadow-3d-float border border-border/50">
                <div>
                  <h4 className="text-sm font-bold text-foreground font-body flex items-center gap-2">
                    Price Range
                  </h4>
                  <p className="mt-1 text-xs text-muted-foreground font-body">${priceRange[0]} – ${priceRange[1]}+ / night</p>
                  <Slider value={priceRange} onValueChange={setPriceRange} min={0} max={2000} step={50} className="mt-4" />
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-foreground font-body">Specifications</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground font-body">Guests</span>
                      <div className="flex items-center gap-3">
                        <button onClick={() => setGuests(Math.max(1, guests - 1))} className="h-6 w-6 rounded-full border border-border flex items-center justify-center hover:bg-secondary">-</button>
                        <span className="text-xs font-semibold w-4 text-center">{guests}+</span>
                        <button onClick={() => setGuests(guests + 1)} className="h-6 w-6 rounded-full border border-border flex items-center justify-center hover:bg-secondary">+</button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground font-body">Bedrooms</span>
                      <div className="flex items-center gap-3">
                        <button onClick={() => setBedrooms(Math.max(0, bedrooms - 1))} className="h-6 w-6 rounded-full border border-border flex items-center justify-center hover:bg-secondary">-</button>
                        <span className="text-xs font-semibold w-4 text-center">{bedrooms}+</span>
                        <button onClick={() => setBedrooms(bedrooms + 1)} className="h-6 w-6 rounded-full border border-border flex items-center justify-center hover:bg-secondary">+</button>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-foreground font-body mb-3">Amenities</h4>
                  <div className="grid grid-cols-1 gap-2">
                    {amenityList.map((a) => (
                      <button
                        key={a.id}
                        onClick={() => toggleAmenity(a.id)}
                        className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs transition-all border ${
                          selectedAmenities.includes(a.id) 
                            ? "bg-primary/10 border-primary text-primary" 
                            : "border-transparent text-muted-foreground hover:bg-secondary"
                        }`}
                      >
                        {a.icon}
                        <span className="font-body">{a.id}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-foreground font-body mb-3">Property Type</h4>
                  <div className="flex flex-wrap gap-2">
                    {propertyTypes.map((t) => (
                      <button key={t} onClick={() => setSelectedType(t)}
                        className={`rounded-full px-3 py-1.5 text-[10px] font-bold transition-all border font-body ${
                          selectedType === t 
                            ? "gradient-navy text-primary-foreground border-transparent" 
                            : "bg-secondary text-muted-foreground border-border hover:border-muted-foreground"
                        }`}>
                        {t.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={onlyVerified} 
                      onChange={(e) => setOnlyVerified(e.target.checked)}
                      className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                    />
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-foreground font-body flex items-center gap-1.5">
                        <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Verified Only
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            </motion.aside>
          )}

          <div className="flex-1">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground font-body">
                  {filtered.length} {filtered.length === 1 ? "property" : "properties"} found
                </h1>
                {searchParams.get("location") && (
                  <p className="text-sm text-muted-foreground font-body mt-1">Stays in "{searchParams.get("location")}"</p>
                )}
              </div>
              
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-muted-foreground font-body hidden sm:block">SORT BY:</span>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px] rounded-xl border-border bg-card font-body text-xs font-semibold">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-border glass-strong shadow-3d">
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="price_asc">Price: Low to High</SelectItem>
                    <SelectItem value="price_desc">Price: High to Low</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="reviews">Most Reviews</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-[2rem] border-2 border-dashed border-border py-32 text-center card-3d">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary mb-6 shadow-soft">
                  <SlidersHorizontal className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <p className="text-xl font-bold text-foreground font-body">No matching stays found</p>
                <p className="mt-2 text-sm text-muted-foreground font-body max-w-xs mx-auto">Try adjusting your filters or expanding your search area to find the perfect room.</p>
                <Button variant="outline" className="mt-8 rounded-2xl border-border px-8 font-body font-bold hover:bg-secondary"
                  onClick={() => { setPriceRange([0, 2000]); setMinStay(1); setSelectedType("All"); setGuests(1); setBedrooms(0); setBathrooms(0); setSelectedAmenities([]); setOnlyVerified(false); setSearchParams({}); }}>
                  Clear All Filters
                </Button>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((p, i) => (
                  <PropertyCard key={p.id} property={p} index={i} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SearchPage;
