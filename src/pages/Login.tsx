import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useApp } from "@/contexts/AppContext";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, loading: appLoading } = useApp();

  // Once user state is populated (auth event fired + profile fetched), redirect by role
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
    if (!email || !password) { setError("Please fill in all fields."); return; }

    setIsSubmitting(true);
    setError("");

    try {
      const { error: authError } = await login(email, password);
      if (authError) {
        setError(authError.message);
        setIsSubmitting(false);
      }
      // On success: onAuthStateChange fires SIGNED_IN → fetchProfile → sets user
      // The useEffect above will then redirect based on role
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
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
          <h1 className="mt-4 text-3xl font-bold text-foreground">Welcome Back</h1>
          <p className="mt-2 text-sm text-muted-foreground font-body">Sign in to your Private Rooms account</p>
        </div>

        <div className="rounded-2xl glass-strong p-8 shadow-3d-float">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive font-body">{error}</div>
            )}
            <div>
              <label className="text-xs font-medium text-muted-foreground font-body">Email</label>
              <div className="relative mt-1">
                <Input
                  type="email"
                  value={email}
                  disabled={isSubmitting}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="rounded-xl pl-10 font-body"
                />
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground font-body">Password</label>
              <div className="relative mt-1">
                <Input
                  type={showPw ? "text" : "password"}
                  value={password}
                  disabled={isSubmitting}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="rounded-xl pl-10 pr-10 font-body"
                />
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <button 
                  type="button" 
                  onClick={() => setShowPw(!showPw)} 
                  disabled={isSubmitting}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
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
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground font-body">
            Don't have an account?{" "}
            <Link to="/signup" className="font-semibold text-primary hover:underline">Sign Up</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
