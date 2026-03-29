import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="border-t border-border bg-card">
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg gradient-navy">
              <span className="text-xs font-bold text-primary-foreground font-body">TR</span>
            </div>
            <span className="text-sm font-semibold text-foreground font-body">Private Rooms by TRG</span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Curated luxury stays across America's most iconic cities. Every property verified, every experience exceptional.
          </p>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold text-foreground font-body">Explore</h4>
          <div className="flex flex-col gap-2">
            <Link to="/search" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Browse Properties</Link>
            <Link to="/search" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Destinations</Link>
            <Link to="/search" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Experiences</Link>
          </div>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold text-foreground font-body">Hosting</h4>
          <div className="flex flex-col gap-2">
            <Link to="/host" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Become a Host</Link>
            <Link to="/host" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Host Resources</Link>
            <Link to="/host" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Community</Link>
          </div>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold text-foreground font-body">Support</h4>
          <div className="flex flex-col gap-2">
            <span className="text-sm text-muted-foreground">Help Center</span>
            <span className="text-sm text-muted-foreground">Safety</span>
            <span className="text-sm text-muted-foreground">Terms & Privacy</span>
          </div>
        </div>
      </div>
      <div className="mt-10 border-t border-border pt-6 text-center">
        <p className="text-xs text-muted-foreground">© 2026 Private Rooms by TRG. All rights reserved.</p>
      </div>
    </div>
  </footer>
);

export default Footer;
