import { createContext, useContext, useState, useCallback, useRef, useEffect, ReactNode } from "react";
import type { Property, Booking, Conversation, Notification, Message, UserRole, AppUser, ManagedProperty, PropertyStatus } from "@/types";
import { properties as defaultProperties, bookings as defaultBookings, conversations as defaultConversations, notifications as defaultNotifications } from "@/lib/data";

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
  updatePropertyStatus: (id: string, status: PropertyStatus) => void;
  toggleBlockedDate: (propertyId: string, date: string) => void;
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
  const [properties, setProperties] = useState<ManagedProperty[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;
      if (data) {
        setUser({
          id: data.id,
          name: data.full_name,
          email: data.email,
          role: data.role as UserRole,
          avatar: data.avatar_url || data.full_name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase(),
          verified: data.verified,
          joinedYear: data.joined_year || new Date().getFullYear(),
        });
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
    }
  }, []);

  const mapDbToAppProperty = useCallback((dbProp: any): ManagedProperty => {
    const images = dbProp.property_images || [];
    const primaryImage = images.find((img: any) => img.is_primary)?.image_url || images[0]?.image_url || "";
    
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
      }
    };
  }, []);

  const fetchProperties = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("properties")
        .select(`
          *,
          profiles (*),
          property_images (*),
          blocked_dates (*)
        `)
        .eq("status", "live");

      if (error) throw error;
      if (data) {
        setProperties(data.map(mapDbToAppProperty));
      }
    } catch (err) {
      console.error("Error fetching properties:", err);
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
          blocked_dates (*)
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
          time: new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
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
          other_participant:profiles!${isHost ? "guest_id" : "host_id"} (*)
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
          unread: 0,
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
    const loadData = async () => {
      await fetchProperties();
      if (user) {
        await fetchBookings();
        await fetchConversations();
        await fetchNotifications();
      }
    };
    loadData();
  }, [user, fetchProperties, fetchBookings, fetchConversations, fetchNotifications]);

  const initAuth = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await fetchProfile(session.user.id);
    }
    setLoading(false);
  }, [fetchProfile]);

  useEffect(() => {
    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        await fetchProfile(session.user.id);
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        setBookings([]);
        setConversations([]);
        setNotifications([]);
      }
    });

    return () => subscription.unsubscribe();
  }, [initAuth, fetchProfile]);

  const login = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "You have successfully logged in." });
    }
    return { error };
  }, [toast]);

  const signup = useCallback(async (name: string, email: string, password: string, role: UserRole) => {
    const { error } = await supabase.auth.signUp({
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
    } else {
      toast({ title: "Success", description: "Account created successfully." });
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

  const updatePropertyStatus = useCallback((id: string, status: PropertyStatus) => {
    setProperties(prev => prev.map(p => p.id === id ? { ...p, status } : p));
  }, []);

  const toggleBlockedDate = useCallback((propertyId: string, date: string) => {
    setProperties(prev => prev.map(p => {
      if (p.id !== propertyId) return p;
      const blocked = p.blockedDates.includes(date) ? p.blockedDates.filter(d => d !== date) : [...p.blockedDates, date];
      return { ...p, blockedDates: blocked };
    }));
  }, []);

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
            // New message logic will be handled by re-fetching to maintain full context
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
          const b = payload.new as any;
          if (b.guest_id === user.id || b.host_id === user.id) {
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
    } as any}>
      {children}
    </AppContext.Provider>
  );
};
