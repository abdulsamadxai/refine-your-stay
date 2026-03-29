import { createContext, useContext, useState, useCallback, useRef, useEffect, ReactNode } from "react";
import { formatDistanceToNow, parseISO } from "date-fns";
import type { Property, Booking, Conversation, Notification, Message, UserRole, AppUser, ManagedProperty, PropertyStatus, PropertyReviewEntry } from "@/types";

// Re-export types that other files currently import from AppContext
export type { UserRole, AppUser, PropertyStatus, ManagedProperty };

interface AppState {
  user: AppUser | null;
  loading: boolean;
  properties: ManagedProperty[];
  bookings: Booking[];
  conversations: Conversation[];
  notifications: Notification[];
}

interface AppContextValue extends AppState {
  login: (email: string, password: string) => Promise<{ error: any }>;
  signup: (name: string, email: string, password: string, role: UserRole) => Promise<{ error: any }>;
  logout: () => Promise<void>;
  addProperty: (p: Partial<ManagedProperty>) => Promise<{ data: any; error: any }>;
  updatePropertyStatus: (id: string, status: PropertyStatus) => Promise<void>;
  toggleBlockedDate: (propertyId: string, date: string) => Promise<void>;
  createBooking: (propertyId: string, hostId: string, checkIn: Date, checkOut: Date, guests: number, pricePerNight: number, isInstant?: boolean) => Promise<{ data: any; error: any }>;
  cancelBooking: (bookingId: string) => Promise<{ error: any }>;
  fetchBookings: () => Promise<void>;
  updateBookingStatus: (id: string, status: string) => Promise<{ error: any }>;
  addNotification: (userId: string, n: Omit<Notification, "id" | "user_id" | "created_at">) => Promise<{ error: any }>;
  markNotificationRead: (id: string) => Promise<{ error: any }>;
  fetchNotifications: () => Promise<void>;
  sendMessage: (conversationId: string, text: string) => Promise<{ error: any }>;
  fetchConversations: () => Promise<void>;
  fetchMessages: (id: string) => Promise<Message[]>;
  startConversation: (propertyId: string, hostId: string) => Promise<string | null>;
  updateProfile: (updates: any) => Promise<{ error: any }>;
  uploadAvatar: (file: File) => Promise<{ publicUrl: string | null; error: any }>;
  fetchProperties: () => Promise<void>;
  fetchPropertyById: (id: string) => Promise<ManagedProperty | null>;
  uploadPropertyImages: (propertyId: string, files: File[]) => Promise<{ error: any }>;
}

const AppContext = createContext<AppContextValue | null>(null);

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
};

import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [authSession, setAuthSession] = useState<Session | null>(null);
  const [properties, setProperties] = useState<ManagedProperty[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // fetchProfile: pure data fetcher - does NOT manage loading state
  // Loading is managed exclusively by the onAuthStateChange effect below
  const fetchProfile = useCallback(async (userId: string): Promise<AppUser | null> => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (error) throw error;
      
      let profileData = data;

      // Fallback: If profile doesn't exist, create it from auth metadata
      if (!profileData) {
        console.warn("Profile not found for user, attempting to create one...");
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          const { data: newProfile, error: createError } = await supabase
            .from("profiles")
            .insert({
              id: authUser.id,
              full_name: authUser.user_metadata?.full_name || "",
              email: authUser.email || "",
              role: authUser.user_metadata?.role || "guest",
              avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${authUser.id}`
            })
            .select()
            .single();
          
          if (createError) {
            console.error("Failed to create missing profile:", createError);
            throw createError;
          }
          profileData = newProfile;
        }
      }

      if (profileData) {
        console.log("fetchProfile: Profile found for", userId, "role:", profileData.role);
        const appUser: AppUser = {
          id: profileData.id,
          name: profileData.full_name,
          email: profileData.email,
          role: profileData.role as UserRole,
          avatar: profileData.avatar_url || profileData.full_name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase(),
          verified: profileData.verified,
          bio: profileData.bio || "",
          phone: profileData.phone || "",
          joinedYear: profileData.joined_year || new Date().getFullYear(),
        };
        setUser(appUser);
        return appUser;
      }
      return null;
    } catch (err) {
      console.error("Error fetching profile:", err);
      return null;
    }
  }, []);

  const mapDbToAppProperty = useCallback((dbProp: any): ManagedProperty => {
    const images = dbProp.property_images || [];
    const primaryImage = images.find((img: any) => img.is_primary)?.image_url || images[0]?.image_url || "";
    
    const reviewList = (dbProp.reviews || []) as any[];
    const reviewEntries: PropertyReviewEntry[] | undefined = reviewList.length
      ? [...reviewList]
          .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
          .map((r: any) => {
            const rev = r.profiles;
            const name = rev?.full_name || "Guest";
            const initials =
              rev?.avatar_initials ||
              name
                .split(" ")
                .map((w: string) => w[0])
                .join("")
                .slice(0, 2)
                .toUpperCase();
            return {
              id: r.id,
              reviewerName: name,
              reviewerInitials: initials,
              rating: r.rating,
              comment: r.comment ?? null,
              createdAt: r.created_at,
            };
          })
      : undefined;

    return {
      id: dbProp.id,
      title: dbProp.title,
      location: dbProp.location,
      price: dbProp.price_per_night,
      rating: dbProp.rating || 0,
      reviews: dbProp.review_count || 0,
      image: primaryImage,
      images: images.sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0)).map((img: any) => img.image_url),
      type: dbProp.property_type as any,
      minStay: dbProp.min_stay,
      maxGuests: dbProp.max_guests,
      bedrooms: dbProp.bedrooms,
      bathrooms: dbProp.bathrooms,
      verified: dbProp.verified,
      instantBook: dbProp.instant_book,
      description: dbProp.description,
      status: dbProp.status as any,
      createdAt: dbProp.created_at,
      amenities: dbProp.amenities || [],
      blockedDates: (dbProp.blocked_dates || []).map((d: any) => d.blocked_date),
      hostId: dbProp.host_id,
      host: {
        name: dbProp.profiles?.full_name || "Host",
        avatar: dbProp.profiles?.avatar_url || (dbProp.profiles?.full_name?.[0] || "H"),
        verified: dbProp.profiles?.verified || false,
        superhost: dbProp.profiles?.superhost || false,
        joinedYear: dbProp.profiles?.joined_year || 2026,
        responseRate: dbProp.profiles?.response_rate || 100,
      },
      ...(reviewEntries?.length ? { reviewEntries } : {}),
    };
  }, []);

  const fetchProperties = useCallback(async () => {
    console.log("AppContext: Starting fetchProperties...");
    try {
      // Simplified query to check if complex joins are causing issues on live
      let query = supabase.from("properties").select(`*`);
      
      console.log("AppContext: fetchProperties - about to await query...");
      const { data, error } = await query;
      
      console.log("fetchProperties: fetched", data?.length || 0, "properties. Error:", error);
      if (data && data.length > 0) {
        console.log("fetchProperties: First property title:", data[0].title);
        
        // Re-fetch with full data if simple one works, or just proceed with mapped objects if simple is enough
        const { data: fullData, error: fullError } = await supabase.from("properties").select(`
          *,
          profiles (*),
          property_images (*),
          blocked_dates (*)
        `);
        console.log("fetchProperties: Full data fetched. Items:", fullData?.length, "Error:", fullError);

        if (fullError) throw fullError;
        if (fullData) {
          setProperties(fullData.map(mapDbToAppProperty));
        }
      } else {
        console.warn("fetchProperties: Data is empty or null");
        setProperties([]);
      }
      
      if (error) throw error;
    } catch (err) {
      console.error("AppContext detail: Error in fetchProperties:", err);
    }
  }, [mapDbToAppProperty]);

  const fetchPropertyById = useCallback(async (id: string): Promise<ManagedProperty | null> => {
    try {
      const { data, error } = await supabase
        .from("properties")
        .select(`
          *,
          profiles (*),
          property_images (*),
          blocked_dates (*),
          reviews (
            id,
            rating,
            comment,
            created_at,
            reviewer_id,
            profiles!reviews_reviewer_id_fkey (
              full_name,
              avatar_url,
              avatar_initials
            )
          )
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return data ? mapDbToAppProperty(data) : null;
    } catch (err) {
      console.error("Error fetching property by ID:", err);
      return null;
    }
  }, [mapDbToAppProperty]);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (data) {
        setNotifications(data.map((n: any) => ({
          id: n.id,
          type: n.type as Notification["type"],
          title: n.title,
          description: n.description,
          time: formatDistanceToNow(parseISO(n.created_at), { addSuffix: true }),
          read: n.read
        })));
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  }, [user]);

  const addNotification = useCallback(async (userId: string, n: Omit<Notification, "id" | "user_id" | "created_at">) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .insert({
          user_id: userId,
          title: n.title,
          description: n.description,
          type: n.type
        });
      if (error) throw error;
      await fetchNotifications();
      return { error: null };
    } catch (err) {
      console.error("Error adding notification:", err);
      return { error: err };
    }
  }, [fetchNotifications]);

  const markNotificationRead = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", id);
      if (error) throw error;
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      return { error: null };
    } catch (err) {
      return { error: err };
    }
  }, []);

  const fetchBookings = useCallback(async () => {
    if (!user) return;
    try {
      const isHost = user.role === "host";
      const { data, error } = await supabase
        .from("bookings")
        .select(`
          *,
          properties (
            *,
            profiles (*),
            property_images (*),
            blocked_dates (*)
          ),
          guest:profiles!guest_id (*)
        `)
        .eq(isHost ? "host_id" : "guest_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (data) {
        setBookings(data.map((b: any) => ({
          id: b.id,
          propertyId: b.property_id,
          guestId: b.guest_id,
          hostId: b.host_id,
          checkIn: b.check_in,
          checkOut: b.check_out,
          guests: b.guests,
          nights: b.nights,
          pricePerNight: b.price_per_night,
          subtotal: b.subtotal,
          serviceFee: b.service_fee,
          total: b.total,
          status: b.status as any,
          property: mapDbToAppProperty(b.properties)
        })));
      }
    } catch (err) {
      console.error("Error fetching bookings:", err);
    }
  }, [user, mapDbToAppProperty]);

  const fetchConversations = useCallback(async () => {
    if (!user) return;
    try {
      const isHost = user.role === "host";
      const { data, error } = await supabase
        .from("conversations")
        .select(`
          *,
          properties (
            title, 
            id,
            property_images (image_url)
          ),
          other_participant:profiles!${isHost ? "guest_id" : "host_id"} (*),
          messages (id, read, sender_id)
        `)
        .eq(isHost ? "host_id" : "guest_id", user.id)
        .order("updated_at", { ascending: false });

      if (error) throw error;
      if (data) {
        setConversations(data.map((c: any) => ({
          id: c.id,
          propertyTitle: c.properties?.title || "Property Conversation",
          propertyImage: c.properties?.property_images?.[0]?.image_url || `https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=200`,
          hostName: c.other_participant?.full_name || "Unknown User",
          hostAvatar: c.other_participant?.avatar_url || (c.other_participant?.full_name?.[0] || "?"),
          lastMessage: c.last_message_text || "Started a conversation",
          lastMessageTime: c.last_message_at ? new Date(c.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now",
          unread: (c.messages || []).filter((m: any) => !m.read && m.sender_id !== user.id).length,
          messages: []
        })));
      }
    } catch (err) {
      console.error("Error fetching conversations:", err);
    }
  }, [user]);

  const fetchMessages = useCallback(async (conversationId: string): Promise<Message[]> => {
    if (!user) return [];
    try {
      const { data, error } = await supabase
        .from("messages")
        .select(`
          *,
          profiles (*)
        `)
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      if (data) {
        return data.map((m: any) => ({
          id: m.id,
          senderId: m.sender_id,
          senderName: m.profiles?.full_name || "Unknown",
          senderAvatar: m.profiles?.avatar_url || (m.profiles?.full_name?.[0] || "U"),
          text: m.text,
          timestamp: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isOwn: m.sender_id === user.id
        }));
      }
      return [];
    } catch (err) {
      console.error("Error fetching messages:", err);
      return [];
    }
  }, [user]);

  const sendMessage = useCallback(async (conversationId: string, text: string) => {
    if (!user) return { error: new Error("Not logged in") };
    try {
      // Get conversation to find recipient
      const { data: convo } = await supabase
        .from("conversations")
        .select("*")
        .eq("id", conversationId)
        .single();

      const recipientId = user.id === convo.guest_id ? convo.host_id : convo.guest_id;

      const { error: msgError } = await supabase
        .from("messages")
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          text
        });
      if (msgError) throw msgError;

      const { error: convoError } = await supabase
        .from("conversations")
        .update({
          last_message_text: text,
          last_message_at: new Date().toISOString()
        })
        .eq("id", conversationId);
      if (convoError) throw convoError;

      await addNotification(recipientId, {
        type: "message",
        title: "New Message",
        description: text.substring(0, 50) + (text.length > 50 ? "..." : ""),
        read: false,
        time: "Just now"
      });

      await fetchConversations();
      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  }, [user, fetchConversations, addNotification]);

  const startConversation = useCallback(async (propertyId: string, hostId: string): Promise<string | null> => {
    if (!user) return null;
    if (user.id === hostId) {
      console.warn("Cannot start a conversation with yourself.");
      return null;
    }
    try {
      const { data: existing, error: checkError } = await supabase
        .from("conversations")
        .select("id")
        .eq("property_id", propertyId)
        .eq("guest_id", user.id)
        .eq("host_id", hostId)
        .maybeSingle();

      if (checkError) throw checkError;
      if (existing) return existing.id;

      const { data: created, error: createError } = await supabase
        .from("conversations")
        .insert({
          property_id: propertyId,
          guest_id: user.id,
          host_id: hostId
        })
        .select("id")
        .single();

      if (createError) throw createError;
      await fetchConversations();
      return created.id;
    } catch (err) {
      console.error("Error starting conversation:", err);
      return null;
    }
  }, [user, fetchConversations]);

  useEffect(() => {
    console.log("AppContext: loadData effect running. User logged in:", !!user);
    const loadData = async () => {
      if (user) {
        await fetchBookings();
        await fetchConversations();
        await fetchNotifications();
      }
    };
    loadData();
  }, [user, fetchBookings, fetchConversations, fetchNotifications]);

  // Dedicated effect for properties that runs on mount and whenever fetchProperties changes
  useEffect(() => {
    console.log("AppContext: Global property fetch initiated");
    fetchProperties();
  }, [fetchProperties]);

  // Remove initAuth to avoid race conditions with onAuthStateChange
  // const initAuth = useCallback(async () => ...);

  // Auth synchronization effect (Stage 1: Listen for session changes)
  useEffect(() => {
    console.log("AppContext: Initializing auth listener (sync-safe)");
    
    // Initial check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        console.log("AppContext: Initial session found for", session.user.id);
      }
    });

    // Synchronous-safe listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("AppContext: Auth event (sync):", event, "UID:", session?.user?.id);
      
      // Update our reactive session state to trigger the sync effect below
      setAuthSession(session);

      if (event === "SIGNED_OUT") {
        setUser(null);
        setBookings([]);
        setConversations([]);
        setNotifications([]);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Auth synchronization effect (Stage 2: Fetch profile when session exists)
  useEffect(() => {
    let active = true;

    const syncProfile = async () => {
      // Use the session from our reactive state
      const currentSession = authSession;
      
      if (!currentSession?.user) {
        if (active) setLoading(false);
        return;
      }

      console.log("AppContext: Syncing profile for", currentSession.user.id);
      setLoading(true);
      
      try {
        const profile = await fetchProfile(currentSession.user.id);
        
        if (active && !profile) {
          // If profile trigger is still running, wait and try once more
          await new Promise(r => setTimeout(r, 1000));
          await fetchProfile(currentSession.user.id);
        }
      } catch (err) {
        console.error("AppContext: Sync error:", err);
      } finally {
        if (active) setLoading(false);
      }
    };

    syncProfile();

    return () => {
      active = false;
    };
  }, [authSession, fetchProfile]);

  const login = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    // onAuthStateChange (SIGNED_IN event) will call fetchProfile and set user state.
    // Login page watches user state changes to redirect.
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
    return { error };
  }, [toast]);

  const signup = useCallback(async (name: string, email: string, password: string, role: UserRole) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          role: role,
        },
      },
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return { error };
    }

    if (data.user) {
      // Profile is now handled automatically by the Database Trigger 'on_auth_user_created'.
      // If the user has a session, they are logged in. If not, they may need to confirm email.
      if (!data.session) {
        toast({ 
          title: "Check your email", 
          description: "We've sent you a confirmation link to complete your registration.",
          variant: "default" 
        });
      }
    }
    return { error };
  }, [toast]);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const updateProfile = useCallback(async (updates: any) => {
    if (!user) return { error: new Error("No user logged in") };
    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id);
    if (!error) {
      await fetchProfile(user.id);
      toast({ title: "Success", description: "Profile updated successfully." });
    } else {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
    return { error };
  }, [user, fetchProfile, toast]);

  const uploadAvatar = useCallback(async (file: File) => {
    if (!user) return { publicUrl: null, error: new Error("No user logged in") };
    const fileExt = file.name.split(".").pop();
    const filePath = `${user.id}/${Math.random()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file);
    if (uploadError) return { publicUrl: null, error: uploadError };
    const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(filePath);
    await updateProfile({ avatar_url: publicUrl });
    
    await addNotification(user.id, {
      type: "system",
      title: "Profile Updated",
      description: "Your avatar has been updated successfully.",
      read: false,
      time: "Just now"
    });

    return { publicUrl, error: null };
  }, [user, updateProfile, addNotification]);



  const addProperty = useCallback(async (partial: Partial<ManagedProperty>) => {
    if (!user) return { data: null, error: new Error("No user logged in") };
    try {
      const { data, error } = await supabase.from("properties").insert({
        host_id: user.id,
        title: partial.title || "Untitled Property",
        location: partial.location || "Unknown",
        description: partial.description || "",
        price_per_night: partial.price || 100,
        property_type: partial.type || "Villa",
        min_stay: partial.minStay || 1,
        max_guests: partial.maxGuests || 4,
        bedrooms: partial.bedrooms || 1,
        bathrooms: partial.bathrooms || 1,
        status: "pending",
        amenities: partial.amenities || [],
        instant_book: partial.instantBook ?? true,
      }).select().single();
      
      if (error) throw error;
      await fetchProperties();
      return { data, error: null };
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
      return { data: null, error: err };
    }
  }, [user, fetchProperties, toast]);

  const uploadPropertyImages = useCallback(async (propertyId: string, files: File[]) => {
    if (!user) return { error: new Error("No user logged in") };
    try {
      const uploadPromises = files.map(async (file, index) => {
        const fileExt = file.name.split(".").pop();
        const filePath = `properties/${user.id}/${propertyId}/${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from("property-images").upload(filePath, file);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from("property-images").getPublicUrl(filePath);
        return { property_id: propertyId, image_url: publicUrl, is_primary: index === 0, display_order: index };
      });
      const imageData = await Promise.all(uploadPromises);
      const { error } = await supabase.from("property_images").insert(imageData);
      return { error };
    } catch (err: any) {
      return { error: err };
    }
  }, [user]);

  const updatePropertyStatus = useCallback(async (id: string, status: PropertyStatus) => {
    try {
      const { error } = await supabase
        .from("properties")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
      setProperties(prev => prev.map(p => p.id === id ? { ...p, status } : p));
      toast({ title: "Status Updated", description: `Property status changed to ${status}.` });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  }, [toast]);

  const toggleBlockedDate = useCallback(async (propertyId: string, date: string) => {
    try {
      const property = properties.find(p => p.id === propertyId);
      if (!property) return;
      
      const isCurrentlyBlocked = property.blockedDates.includes(date);
      
      if (isCurrentlyBlocked) {
        const { error } = await supabase
          .from("blocked_dates")
          .delete()
          .eq("property_id", propertyId)
          .eq("blocked_date", date);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("blocked_dates")
          .insert({ 
            property_id: propertyId, 
            blocked_date: date, 
            reason: "host_blocked" 
          });
        if (error) throw error;
      }
      // Re-sync from DB to get authoritative state
      await fetchProperties();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  }, [properties, fetchProperties, toast]);

  const createBooking = useCallback(async (propertyId: string, hostId: string, checkIn: Date, checkOut: Date, guests: number, pricePerNight: number, isInstant: boolean = false) => {
    if (!user) return { data: null, error: new Error("Not logged in") };
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / 86400000);
    const subtotal = pricePerNight * nights;
    const serviceFee = Math.round(subtotal * 0.12);
    const total = subtotal + serviceFee;
    try {
      const { data, error } = await supabase.from("bookings").insert({
        property_id: propertyId, guest_id: user.id, host_id: hostId,
        check_in: checkIn.toISOString().split("T")[0], check_out: checkOut.toISOString().split("T")[0],
        guests, nights, price_per_night: pricePerNight, subtotal, service_fee: serviceFee, total,
        status: isInstant ? "confirmed" : "pending"
      }).select().single();
      if (error) throw error;
      await fetchBookings();

      // If instant book, immediately block the dates
      if (data.status === "confirmed") {
        const dates = [];
        let current = new Date(checkIn);
        while (current <= checkOut) {
          dates.push({ property_id: propertyId, blocked_date: current.toISOString().split("T")[0], reason: `Booking ${data.id}` });
          current.setDate(current.getDate() + 1);
        }
        await supabase.from("blocked_dates").insert(dates);
        await fetchProperties();
      }

      // Notify host
      await addNotification(hostId, {
        type: "booking",
        title: "New Booking Request",
        description: `You have a new request for ${guests} guests.`,
        read: false,
        time: "Just now"
      });

      toast({ title: "Success", description: "Booking request submitted successfully." });
      return { data, error: null };
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
      return { data: null, error: err };
    }
  }, [user, fetchBookings, addNotification, toast, fetchProperties]);

  const cancelBooking = useCallback(async (bookingId: string) => {
    try {
      const { data: booking } = await supabase.from("bookings").select("*, properties(title)").eq("id", bookingId).single();
      const { error } = await supabase.from("bookings").update({ status: "cancelled" }).eq("id", bookingId);
      if (error) throw error;
      await fetchBookings();

      if (booking) {
        await addNotification(booking.host_id, {
          type: "booking",
          title: "Booking Cancelled",
          description: `The reservation for ${booking.properties?.title || "your property"} has been cancelled.`,
          read: false,
          time: "Just now"
        });
      }

      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  }, [fetchBookings, addNotification]);

  const updateBookingStatus = useCallback(async (id: string, status: string) => {
    try {
      const { data: booking, error: fetchError } = await supabase.from("bookings").select("*").eq("id", id).single();
      if (fetchError) throw fetchError;
      const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
      if (error) throw error;
      if (status === "confirmed" && booking) {
        const start = new Date(booking.check_in);
        const end = new Date(booking.check_out);
        const dates = [];
        let current = new Date(start);
        while (current <= end) {
          dates.push({ property_id: booking.property_id, blocked_date: current.toISOString().split("T")[0], reason: `Booking ${id}` });
          current.setDate(current.getDate() + 1);
        }
        await supabase.from("blocked_dates").insert(dates);
      }
      await fetchBookings();
      await fetchProperties();

      // Notify guest
      if (booking) {
        await addNotification(booking.guest_id, {
          type: "booking",
          title: `Booking ${status.charAt(0).toUpperCase() + status.slice(1)}`,
          description: `Your reservation has been ${status}.`,
          read: false,
          time: "Just now"
        });
      }

      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  }, [fetchBookings, fetchProperties, addNotification]);

  // Real-time Subscription Setup
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("public_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "messages" },
        (payload: any) => {
          if (payload.eventType === "INSERT") {
            const newMessage = payload.new;
            // Only fetch if we received a message from someone else
            if (newMessage && newMessage.sender_id !== user.id) {
              fetchConversations();
            }
          } else if (payload.eventType === "UPDATE") {
             fetchConversations();
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        () => {
          fetchNotifications();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bookings" },
        (payload: any) => {
          // Handle INSERT, UPDATE (new), and DELETE (old)
          const b = payload.new || payload.old;
          if (b && (b.guest_id === user.id || b.host_id === user.id)) {
            fetchBookings();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchConversations, fetchNotifications, fetchBookings]);

  return (
    <AppContext.Provider value={{
      user, loading, properties, bookings, conversations, notifications,
      login, signup, logout,
      addProperty, updatePropertyStatus, toggleBlockedDate,
      createBooking, cancelBooking,
      sendMessage,
      updateProfile, uploadAvatar,
      fetchProperties, fetchPropertyById, uploadPropertyImages,
      fetchBookings, updateBookingStatus,
      fetchConversations, fetchMessages, startConversation,
      fetchNotifications, addNotification, markNotificationRead,
    }}>
      {children}
    </AppContext.Provider>
  );
};
