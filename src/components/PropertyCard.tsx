import { Link } from "react-router-dom";
import { Star, ShieldCheck, Clock } from "lucide-react";
import type { Property } from "@/types";
import { motion } from "framer-motion";
import { useRef, useState } from "react";

interface PropertyCardProps {
  property: Property;
  index?: number;
}

const PropertyCard = ({ property, index = 0 }: PropertyCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current || window.innerWidth < 768) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: y * -6, y: x * 6 });
  };

  const handleMouseLeave = () => setTilt({ x: 0, y: 0 });

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
    >
      <Link to={`/property/${property.id}`} className="group block">
        <div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="overflow-hidden rounded-2xl bg-card shadow-3d transition-all duration-500 ease-out"
          style={{
            transform: `perspective(800px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateZ(0)`,
            willChange: "transform, box-shadow",
          }}
        >
          {/* Image */}
          <div className="relative aspect-[4/3] overflow-hidden">
            <img
              src={property.image}
              alt={property.title}
              loading="lazy"
              width={800}
              height={600}
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            {/* Badges */}
            <div className="absolute left-3 top-3 flex gap-2">
              {property.verified && (
                <span className="flex items-center gap-1 rounded-full glass px-2.5 py-1 text-xs font-medium text-foreground font-body">
                  <ShieldCheck className="h-3 w-3 text-primary" /> Verified
                </span>
              )}
              {property.instantBook && (
                <span className="flex items-center gap-1 rounded-full gradient-gold px-2.5 py-1 text-xs font-semibold text-accent-foreground font-body">
                  ⚡ Instant
                </span>
              )}
            </div>
            <div className="absolute bottom-3 right-3">
              <span className="flex items-center gap-1 rounded-full glass px-2.5 py-1 text-xs font-medium text-foreground font-body">
                <Clock className="h-3 w-3" /> Min {property.minStay} nights
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground font-body">
                  {property.type} · {property.location}
                </p>
                <h3 className="mt-1 truncate text-base font-semibold text-foreground font-body">
                  {property.title}
                </h3>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-accent text-accent" />
                <span className="text-sm font-semibold text-foreground font-body">{property.rating}</span>
                <span className="text-xs text-muted-foreground font-body">({property.reviews})</span>
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-lg font-bold text-foreground font-body">${property.price}</span>
              <span className="text-sm text-muted-foreground font-body">/ night</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default PropertyCard;
