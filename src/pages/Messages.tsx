import { useState, useEffect, useRef } from "react";
import { Send, ArrowLeft, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import { useApp } from "@/contexts/AppContext";
import { supabase } from "@/integrations/supabase/client";
import type { Conversation, Message } from "@/types";

const Messages = () => {
  const { conversations, sendMessage, fetchConversations, fetchMessages, user } = useApp();
  const [activeConvo, setActiveConvo] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMsg, setNewMsg] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) fetchConversations();
  }, [user, fetchConversations]);

  useEffect(() => {
    const loadMessages = async () => {
      if (activeConvo) {
        setLoadingMessages(true);
        const msgs = await fetchMessages(activeConvo.id);
        setMessages(msgs);
        setLoadingMessages(false);
      }
    };
    loadMessages();
  }, [activeConvo, fetchMessages]);

  useEffect(() => {
    if (!activeConvo || !user) return;

    // Real-time listener for current conversation
    const channel = supabase
      .channel(`message_updates_${activeConvo.id}`)
      .on(
        "postgres_changes",
        { 
          event: "INSERT", 
          schema: "public", 
          table: "messages",
          filter: `conversation_id=eq.${activeConvo.id}`
        },
        async (payload: any) => {
          const newM = payload.new as any;
          setMessages(prev => {
            // Check if already added (to avoid double entry with optimistic send)
            if (prev.some(m => m.id === newM.id)) return prev;
            const isOwn = newM.sender_id === user.id;
            return [...prev, {
              id: newM.id,
              text: newM.text,
              senderId: newM.sender_id,
              senderName: isOwn ? user.name : activeConvo.hostName,
              senderAvatar: isOwn ? user.avatar : activeConvo.hostAvatar,
              isOwn: isOwn,
              timestamp: new Date(newM.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeConvo, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!newMsg.trim() || !activeConvo) return;
    const text = newMsg.trim();
    setNewMsg("");
    await sendMessage(activeConvo.id, text);
    // Real-time listener handles the UI update
  };

  const selectConvo = (c: Conversation) => {
    setActiveConvo(c);
    setShowChat(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      {/* FIX 10: Use CSS variable for navbar height instead of hardcoded 65px */}
      <div
        className="mx-auto flex max-w-6xl"
        style={{ height: "calc(100vh - var(--navbar-height, 65px))" }}
      >
        {/* Sidebar */}
        <div
          className={`w-full sm:w-80 shrink-0 border-r border-border bg-card overflow-y-auto ${
            showChat ? "hidden sm:block" : "block"
          }`}
        >
          <div className="p-4 border-b border-border">
            <h2 className="text-lg font-bold text-foreground font-body">Messages</h2>
          </div>

          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <MessageSquare className="h-10 w-10 text-muted-foreground" />
              <p className="mt-4 text-sm font-semibold text-foreground font-body">No conversations yet</p>
              <p className="mt-1 text-xs text-muted-foreground font-body">
                Book a property or contact a host to start a conversation.
              </p>
            </div>
          ) : (
            conversations.map((c) => (
              <button
                key={c.id}
                onClick={() => selectConvo(c)}
                className={`flex w-full gap-3 p-4 text-left transition-colors hover:bg-secondary ${
                  activeConvo?.id === c.id ? "bg-secondary" : ""
                }`}
              >
                <img
                  src={c.propertyImage}
                  alt=""
                  className="h-12 w-12 rounded-xl object-cover shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-foreground truncate font-body">
                      {c.hostName}
                    </span>
                    <span className="text-xs text-muted-foreground font-body shrink-0">
                      {c.lastMessageTime}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate font-body">{c.propertyTitle}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground truncate font-body">
                    {c.lastMessage}
                  </p>
                </div>
                {c.unread > 0 && (
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full gradient-gold text-[10px] font-bold text-accent-foreground">
                    {c.unread}
                  </span>
                )}
              </button>
            ))
          )}
        </div>

        {/* Chat area */}
        <div className={`flex flex-1 flex-col ${!showChat ? "hidden sm:flex" : "flex"}`}>
          {activeConvo ? (
            <>
              {/* Chat header */}
              <div className="flex items-center gap-3 border-b border-border px-6 py-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="sm:hidden rounded-full"
                  onClick={() => setShowChat(false)}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="flex h-9 w-9 items-center justify-center rounded-full gradient-navy text-xs font-bold text-primary-foreground font-body">
                  {activeConvo.hostAvatar}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground font-body">
                    {activeConvo.hostName}
                  </p>
                  <p className="text-xs text-muted-foreground font-body">
                    {activeConvo.propertyTitle}
                  </p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {loadingMessages ? (
                  <div className="flex h-full items-center justify-center">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  </div>
                ) : (
                  <>
                    {messages.map((m) => (
                      <div
                        key={m.id}
                        className={`flex ${m.isOwn ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-2xl px-4 py-3 shadow-soft transition-all duration-200 hover:shadow-elevated ${
                            m.isOwn
                              ? "gradient-navy text-primary-foreground"
                              : "glass text-secondary-foreground"
                          }`}
                        >
                          <p className="text-sm font-body">{m.text}</p>
                          <p
                            className={`mt-1 text-[10px] ${
                              m.isOwn ? "text-primary-foreground/60" : "text-muted-foreground"
                            } font-body`}
                          >
                            {m.timestamp}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Input */}
              <div className="border-t border-border p-4">
                <div className="flex gap-2">
                  <Input
                    value={newMsg}
                    onChange={(e) => setNewMsg(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    placeholder="Type a message..."
                    className="rounded-xl font-body"
                  />
                  <Button
                    onClick={handleSend}
                    className="rounded-xl gradient-navy text-primary-foreground shadow-none hover:opacity-90"
                    size="icon"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            /* Empty state when no conversation is selected */
            <div className="flex flex-1 flex-col items-center justify-center text-center p-8">
              <MessageSquare className="h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-base font-semibold text-foreground font-body">
                Select a conversation
              </p>
              <p className="mt-1 text-sm text-muted-foreground font-body">
                Choose a conversation from the sidebar to start messaging.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
