import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, User, Eye, EyeOff, Home, Briefcase, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useApp } from "@/contexts/AppContext";
import type { UserRole } from "@/types";

const Signup = () => {
  const navigate = useNavigate();
  const { signup, user, loading: appLoading } = useApp();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("guest");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Robust redirection once user is authenticated and profile is loaded
  useEffect(() => {
    if (user && !appLoading) {
      if (user.role === "host") {
        navigate("/host", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    }
  }, [user, appLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) { setError("Please fill in all fields."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    
    setIsSubmitting(true);
    setError("");

    try {
      const { error: signupError } = await signup(name, email, password, role);
      if (signupError) {
        setError(signupError.message);
        setIsSubmitting(false);
      } else {
        // If successful but no immediate redirect (e.g. session delay or email confirmation)
        // we reset submitting so the user isn't stuck.
        setTimeout(() => setIsSubmitting(false), 2000);
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during signup.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-navy shadow-soft">
              <span className="text-sm font-bold text-primary-foreground font-body">TR</span>
            </div>
          </Link>
          <h1 className="mt-4 text-3xl font-bold text-foreground">Create Account</h1>
          <p className="mt-2 text-sm text-muted-foreground font-body">Join the premium rental experience</p>
        </div>

        <div className="rounded-2xl glass-strong p-8 shadow-3d-float">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive font-body">{error}</div>
            )}

            {/* Role selection */}
            <div>
              <label className="text-xs font-medium text-muted-foreground font-body">I want to</label>
              <div className="mt-2 grid grid-cols-2 gap-3">
                {([
                  { value: "guest" as UserRole, icon: Briefcase, label: "Book Stays", desc: "Find luxury properties" },
                  { value: "host" as UserRole, icon: Home, label: "Host Guests", desc: "List your property" },
                ]).map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setRole(opt.value)}
                    className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all font-body ${
                      role === opt.value
                        ? "border-primary bg-primary/5 text-foreground"
                        : "border-border text-muted-foreground hover:border-primary/30"
                    }`}
                  >
                    <opt.icon className="h-5 w-5" />
                    <span className="text-sm font-semibold">{opt.label}</span>
                    <span className="text-[10px]">{opt.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground font-body">Full Name</label>
              <div className="relative mt-1">
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" className="rounded-xl pl-10 font-body" />
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground font-body">Email</label>
              <div className="relative mt-1">
                <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="rounded-xl pl-10 font-body" />
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground font-body">Password</label>
              <div className="relative mt-1">
                <Input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="rounded-xl pl-10 pr-10 font-body"
                />
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full rounded-xl gradient-navy py-3 text-sm font-semibold text-primary-foreground shadow-none hover:opacity-90 font-body"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground font-body">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-primary hover:underline">Sign In</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;
