import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldCheck, Star, Clock, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SearchBar from "@/components/SearchBar";
import PropertyCard from "@/components/PropertyCard";
import { useApp } from "@/contexts/AppContext";
import heroImage from "@/assets/hero-villa.jpg";
import { useEffect } from "react";

const Index = () => {
  const { properties, fetchProperties } = useApp();
  const featured = properties.slice(0, 4);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImage} alt="Luxury villa" width={1920} height={1080} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-foreground/60 via-foreground/40 to-foreground/70" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-28 sm:px-6 sm:py-36 lg:px-8 lg:py-44">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center"
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-card/10 px-4 py-1.5 text-xs font-medium tracking-wider text-primary-foreground uppercase backdrop-blur-sm font-body">
              <Sparkles className="h-3 w-3" /> Exclusive & Verified Properties
            </span>
            <h1 className="mt-6 text-4xl font-bold tracking-tight text-primary-foreground sm:text-5xl lg:text-7xl">
              Stay in Places That<br />
              <span className="text-gradient-gold" style={{ WebkitTextFillColor: "transparent", background: "linear-gradient(135deg, hsl(40, 80%, 65%), hsl(35, 85%, 50%))", WebkitBackgroundClip: "text" }}>
                Inspire
              </span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base text-primary-foreground/80 font-body sm:text-lg">
              Curated luxury rentals across America's most iconic cities — verified hosts, flexible stays, and concierge-level service.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 flex justify-center"
          >
            <SearchBar />
          </motion.div>
        </div>
      </section>

      {/* Why TRG */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">Why Private Rooms by TRG</h2>
          <p className="mt-3 text-muted-foreground font-body">The premium standard in short-term rentals.</p>
        </div>
        <div className="mt-12 grid gap-8 sm:grid-cols-3">
          {[
            { icon: ShieldCheck, title: "Verified & Trusted", desc: "Every host and guest is identity-verified. Every property is inspected for quality and accuracy." },
            { icon: Star, title: "Premium Properties", desc: "Handpicked luxury villas, penthouses, and unique spaces curated for discerning travelers." },
            { icon: Clock, title: "Flexible Stays", desc: "Hosts set minimum stay rules. Find the perfect short or extended stay that fits your schedule." },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="card-3d rounded-2xl border border-border bg-card p-8 text-center shadow-3d"
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <item.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-foreground font-body">{item.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed font-body">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">Featured Properties</h2>
            <p className="mt-2 text-muted-foreground font-body">Handpicked stays trending this season.</p>
          </div>
          <Link to="/search">
            <Button variant="ghost" className="gap-1 text-sm text-primary font-body hover:bg-primary/5">
              View All <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((p, i) => (
            <PropertyCard key={p.id} property={p} index={i} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="gradient-navy py-20">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-primary-foreground sm:text-4xl">
            Ready to Experience Luxury?
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-base text-primary-foreground/70 font-body">
            Join thousands of discerning travelers who choose Private Rooms by TRG for exceptional stays worldwide.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link to="/search">
              <Button className="rounded-full gradient-gold px-8 py-3 text-sm font-semibold text-accent-foreground shadow-none hover:opacity-90 font-body">
                Explore Properties
              </Button>
            </Link>
            <Link to="/host/add-property">
              <Button variant="outline" className="rounded-full border-primary-foreground/30 bg-transparent px-8 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary-foreground/10 font-body">
                Become a Host
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
