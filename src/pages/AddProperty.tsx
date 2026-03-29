import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Upload, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Navbar from "@/components/Navbar";
import { useApp } from "@/contexts/AppContext";
import { supabase } from "@/integrations/supabase/client";

const steps = ["Basic Info", "Images", "Pricing", "Amenities"];
const allAmenities = ["WiFi", "Pool", "Gym", "Kitchen", "Parking", "Air Conditioning", "Washer", "Concierge", "Hot Tub", "Fireplace", "Sauna", "Garden", "BBQ", "EV Charger", "Workspace", "Wine Cellar"];
const propertyTypes = ["Villa", "Apartment", "Condo", "Penthouse", "Townhouse"] as const;

const AddProperty = () => {
  const navigate = useNavigate();
  const { uploadPropertyImages, addProperty } = useApp();
  const [step, setStep] = useState(0);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [propertyType, setPropertyType] = useState<typeof propertyTypes[number]>("Villa");
  const [price, setPrice] = useState("");
  const [minStay, setMinStay] = useState("2");
  const [maxGuests, setMaxGuests] = useState("4");
  const [bedrooms, setBedrooms] = useState("2");
  const [bathrooms, setBathrooms] = useState("2");
  const [instantBook, setInstantBook] = useState(true);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  // FIX 6: Validation error state
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleAmenity = (a: string) => {
    setSelectedAmenities((prev) => prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...files].slice(0, 10)); // Limit to 10
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    // FIX 6: Validate price before submission
    if (!price || Number(price) <= 0) {
      setFormError("Please enter a valid price per night (must be greater than $0).");
      return;
    }

    if (selectedFiles.length === 0) {
      setStep(1);
      setFormError("Please upload at least one image.");
      return;
    }

    setIsSubmitting(true);
    setFormError("");

    try {
      // Use the centralized async addProperty method
      const { data: prop, error: propError } = await addProperty({
        title,
        location,
        description,
        type: propertyType,
        price: Number(price),
        minStay: Number(minStay),
        maxGuests: Number(maxGuests),
        bedrooms: Number(bedrooms),
        bathrooms: Number(bathrooms),
        instantBook: instantBook,
        amenities: selectedAmenities,
      });
 
      if (propError) throw propError;
 
      // 2. Upload images
      if (prop) {
        const { error: uploadError } = await uploadPropertyImages(prop.id, selectedFiles);
        if (uploadError) throw uploadError;
      }

      navigate("/host");
    } catch (err: any) {
      console.error("Error creating property:", err);
      setFormError(err.message || "Failed to create property. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <h1 className="text-3xl font-bold text-foreground text-center">List Your Property</h1>
        <p className="mt-2 text-center text-sm text-muted-foreground font-body">Share your space with discerning travelers worldwide.</p>

        <div className="mt-8 mb-10 flex items-center justify-center gap-2">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-colors font-body ${
                i < step ? "bg-primary text-primary-foreground" : i === step ? "gradient-gold text-accent-foreground" : "bg-secondary text-muted-foreground"
              }`}>
                {i < step ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <span className={`hidden text-xs font-medium sm:block font-body ${i === step ? "text-foreground" : "text-muted-foreground"}`}>{s}</span>
              {i < steps.length - 1 && <div className="mx-1 h-px w-8 bg-border" />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
            {step === 0 && (
              <div className="rounded-2xl border border-border bg-card p-8 space-y-5">
                <div>
                  <label className="text-xs font-medium text-muted-foreground font-body">Property Title</label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Stunning Ocean View Villa" className="mt-1 rounded-xl font-body" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground font-body">Location</label>
                  <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City, Country" className="mt-1 rounded-xl font-body" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground font-body">Property Type</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {propertyTypes.map(t => (
                      <button key={t} onClick={() => setPropertyType(t)}
                        className={`rounded-full px-4 py-2 text-sm font-medium transition-colors font-body ${propertyType === t ? "gradient-gold text-accent-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground font-body">Description</label>
                  <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe your property..." className="mt-1 rounded-xl font-body" rows={4} />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground font-body">Max Guests</label>
                    <Input type="number" value={maxGuests} onChange={e => setMaxGuests(e.target.value)} className="mt-1 rounded-xl font-body" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground font-body">Bedrooms</label>
                    <Input type="number" value={bedrooms} onChange={e => setBedrooms(e.target.value)} className="mt-1 rounded-xl font-body" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground font-body">Bathrooms</label>
                    <Input type="number" value={bathrooms} onChange={e => setBathrooms(e.target.value)} className="mt-1 rounded-xl font-body" />
                  </div>
                </div>
                {/* FIX 6: Show validation errors on step 0 */}
                {formError && step === 0 && (
                  <div className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive font-body">
                    {formError}
                  </div>
                )}
                <Button
                  onClick={() => {
                    if (!title.trim()) {
                      setFormError("Property title is required.");
                      return;
                    }
                    if (!location.trim()) {
                      setFormError("Location is required.");
                      return;
                    }
                    setFormError("");
                    setStep(1);
                  }}
                  className="w-full rounded-xl gradient-navy text-primary-foreground shadow-none hover:opacity-90 font-body"
                >
                  Continue
                </Button>
              </div>
            )}

            {step === 1 && (
              <div className="rounded-2xl border border-border bg-card p-8">
                <h3 className="text-lg font-semibold text-foreground font-body">Upload Photos</h3>
                <p className="mt-1 text-xs text-muted-foreground font-body">High-quality images attract more guests (Limit: 10).</p>
                
                <div className="mt-6 grid grid-cols-3 gap-4">
                  {selectedFiles.map((file, i) => (
                    <div key={i} className="group relative aspect-square overflow-hidden rounded-2xl border border-border bg-secondary">
                      <img src={URL.createObjectURL(file)} alt="Preview" className="h-full w-full object-cover" />
                      <button 
                        onClick={() => removeFile(i)}
                        className="absolute right-1 top-1 rounded-full bg-destructive/80 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  
                  {selectedFiles.length < 10 && (
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="flex aspect-square items-center justify-center rounded-2xl border-2 border-dashed border-border bg-secondary transition-colors hover:border-primary/30"
                    >
                      <div className="text-center">
                        <Plus className="mx-auto h-6 w-6 text-muted-foreground" />
                        <span className="mt-1 block text-xs text-muted-foreground font-body">Add more</span>
                      </div>
                    </button>
                  )}
                </div>

                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  multiple 
                  accept="image/*" 
                  className="hidden" 
                />

                {formError && (
                  <div className="mt-4 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive font-body">
                    {formError}
                  </div>
                )}
                
                <div className="mt-6 flex gap-3">
                  <Button variant="outline" onClick={() => setStep(0)} className="flex-1 rounded-xl font-body">Back</Button>
                  <Button 
                    onClick={() => {
                      if (selectedFiles.length === 0) {
                        setFormError("Please upload at least one image.");
                      } else {
                        setFormError("");
                        setStep(2);
                      }
                    }} 
                    className="flex-1 rounded-xl gradient-navy text-primary-foreground shadow-none hover:opacity-90 font-body"
                  >
                    Continue
                  </Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="rounded-2xl border border-border bg-card p-8 space-y-5">
                <div>
                  <label className="text-xs font-medium text-muted-foreground font-body">Price per Night ($)</label>
                  <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="350" className="mt-1 rounded-xl font-body" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground font-body">Minimum Stay (nights)</label>
                  <div className="mt-2 flex gap-2">
                    {["1", "2", "3", "5", "7"].map((n) => (
                      <button key={n} onClick={() => setMinStay(n)}
                        className={`rounded-full px-4 py-2 text-sm font-medium transition-colors font-body ${minStay === n ? "gradient-gold text-accent-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}>
                        {n}
                      </button>
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground font-body">Guests must book at least {minStay} night{minStay !== "1" ? "s" : ""}.</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground font-body">Booking Type</label>
                  <div className="mt-2 grid grid-cols-2 gap-3">
                    <button onClick={() => setInstantBook(true)}
                      className={`rounded-xl border-2 p-4 text-left transition-all font-body ${instantBook ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"}`}>
                      <p className="text-sm font-semibold text-foreground">⚡ Instant Book</p>
                      <p className="text-xs text-muted-foreground mt-1">Guests book immediately</p>
                    </button>
                    <button onClick={() => setInstantBook(false)}
                      className={`rounded-xl border-2 p-4 text-left transition-all font-body ${!instantBook ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"}`}>
                      <p className="text-sm font-semibold text-foreground">📋 Request to Book</p>
                      <p className="text-xs text-muted-foreground mt-1">You approve each request</p>
                    </button>
                  </div>
                </div>
                {/* FIX 6: Show validation errors on step 2 */}
                {formError && step === 2 && (
                  <div className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive font-body">
                    {formError}
                  </div>
                )}
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(1)} className="flex-1 rounded-xl font-body">Back</Button>
                  <Button onClick={() => setStep(3)} className="flex-1 rounded-xl gradient-navy text-primary-foreground shadow-none hover:opacity-90 font-body">Continue</Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="rounded-2xl border border-border bg-card p-8">
                <h3 className="text-lg font-semibold text-foreground font-body">Select Amenities</h3>
                <div className="mt-4 flex flex-wrap gap-2">
                  {allAmenities.map((a) => (
                    <button key={a} onClick={() => toggleAmenity(a)}
                      className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition-colors font-body ${
                        selectedAmenities.includes(a) ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                      }`}>
                      {selectedAmenities.includes(a) ? <Check className="h-3 w-3" /> : <Plus className="h-3 w-3" />} {a}
                    </button>
                  ))}
                </div>
                <div className="mt-6 flex gap-3">
                  <Button variant="outline" onClick={() => setStep(2)} className="flex-1 rounded-xl font-body">Back</Button>
                  <Button onClick={handleSubmit} disabled={isSubmitting} className="flex-1 rounded-xl gradient-gold text-accent-foreground shadow-none hover:opacity-90 font-body font-semibold">
                    {isSubmitting ? "Uploading..." : "Submit for Approval"}
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AddProperty;
