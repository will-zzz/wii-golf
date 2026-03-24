import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";
import { uploadPlayerHeadshot } from "@/utils/imageUtils";
import PlayerHeadshotUploader from "@/components/PlayerHeadshotUploader";

const slugifyName = (name: string): string =>
  name
    .toLowerCase()
    .trim()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const CompleteProfile: React.FC = () => {
  const { user, profile, linkedPlayer, refreshProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [storedPhotoUrl, setStoredPhotoUrl] = useState("");
  const [croppedPhotoBlob, setCroppedPhotoBlob] = useState<Blob | null>(null);
  const [bio, setBio] = useState("");
  const [favoriteShot, setFavoriteShot] = useState("");
  const [hero, setHero] = useState("");
  const [foe, setFoe] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadExisting = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from("players")
        .select(
          "photo_url, bio, favorite_golf_shot, biggest_hero, greatest_foe"
        )
        .eq("user_id", user.id)
        .maybeSingle();

      if (error || !data) return;
      setStoredPhotoUrl(data.photo_url ?? "");
      setBio(data.bio ?? "");
      setFavoriteShot(data.favorite_golf_shot ?? "");
      setHero(data.biggest_hero ?? "");
      setFoe(data.greatest_foe ?? "");
    };
    loadExisting();
  }, [user]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user) return;

    const fullName = profile?.display_name?.trim();
    if (!fullName) {
      toast({
        title: "Missing display name",
        description: "Set your display name in account settings first.",
        variant: "destructive",
      });
      return;
    }

    const baseSlug = slugifyName(fullName);
    const candidateSlug = baseSlug || `player-${user.id.slice(0, 8)}`;

    setSaving(true);
    let uploadedPhotoUrl = storedPhotoUrl.trim();
    try {
      if (croppedPhotoBlob) {
        const publicUrl = await uploadPlayerHeadshot(supabase, user.id, croppedPhotoBlob);
        if (publicUrl) {
          uploadedPhotoUrl = publicUrl;
          setStoredPhotoUrl(publicUrl);
        }
      }
    } catch (error) {
      setSaving(false);
      toast({
        title: "Failed to upload headshot",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
      return;
    }

    if (!uploadedPhotoUrl) {
      setSaving(false);
      toast({
        title: "Headshot required",
        description: "Please upload and crop a square headshot.",
        variant: "destructive",
      });
      return;
    }

    const payload = {
      full_name: fullName,
      slug: candidateSlug,
      photo_url: uploadedPhotoUrl,
      bio: bio.trim(),
      favorite_golf_shot: favoriteShot.trim(),
      biggest_hero: hero.trim(),
      greatest_foe: foe.trim(),
      approved: false,
      user_id: user.id,
    };

    const savePlayerPayload = async (data: typeof payload) => {
      const { data: existingRows, error: lookupError } = await supabase
        .from("players")
        .select("id")
        .eq("user_id", user.id)
        .limit(1);

      if (lookupError) {
        throw new Error(lookupError.message);
      }

      if ((existingRows ?? []).length > 0) {
        const { error: updateError } = await supabase
          .from("players")
          .update(data)
          .eq("user_id", user.id);
        if (updateError) {
          throw new Error(updateError.message);
        }
        return;
      }

      const { error: insertError } = await supabase.from("players").insert(data);
      if (insertError) {
        throw new Error(insertError.message);
      }
    };

    try {
      await savePlayerPayload(payload);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      if (!errorMessage.toLowerCase().includes("slug")) {
        setSaving(false);
        toast({
          title: "Failed to submit player profile",
          description: errorMessage,
          variant: "destructive",
        });
        return;
      }

      try {
        await savePlayerPayload({
          ...payload,
          slug: `${candidateSlug}-${user.id.slice(0, 6)}`,
        });
      } catch (fallbackError) {
        setSaving(false);
        toast({
          title: "Failed to submit player profile",
          description:
            fallbackError instanceof Error
              ? fallbackError.message
              : "Unknown error",
          variant: "destructive",
        });
        return;
      }
    }
    setSaving(false);

    await refreshProfile();
    toast({
      title: "Profile submitted",
      description: "Your player profile is pending admin approval.",
    });
    navigate("/account");
  };

  if (!user) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">Log in required.</p>
          <Link to="/" className="text-pwga-blue hover:underline">
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="container mx-auto px-4 py-24 max-w-3xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h1 className="text-3xl font-bold mb-2">Create Player Profile</h1>
      <p className="text-gray-600 mb-6">
        Finish your signup by submitting your player profile. Admin approval is required
        before your player appears publicly.
      </p>

      <form className="space-y-4 bg-white border rounded-lg p-5" onSubmit={handleSubmit}>
        <div>
          <label className="text-sm font-medium">Name</label>
          <Input value={profile?.display_name ?? ""} disabled />
        </div>

        <PlayerHeadshotUploader
          imageUrl={storedPhotoUrl}
          onCroppedBlobChange={setCroppedPhotoBlob}
          onError={(message) =>
            toast({
              title: "Image upload error",
              description: message,
              variant: "destructive",
            })
          }
        />

        <div>
          <label className="text-sm font-medium">Bio (third person)</label>
          <Textarea
            value={bio}
            onChange={(event) => setBio(event.target.value)}
            className="min-h-28"
            required
          />
        </div>

        <div>
          <label className="text-sm font-medium">Favorite Golf Shot</label>
          <Input
            value={favoriteShot}
            onChange={(event) => setFavoriteShot(event.target.value)}
            required
          />
        </div>

        <div>
          <label className="text-sm font-medium">Biggest Hero</label>
          <Input value={hero} onChange={(event) => setHero(event.target.value)} required />
        </div>

        <div>
          <label className="text-sm font-medium">Greatest Foe</label>
          <Input value={foe} onChange={(event) => setFoe(event.target.value)} required />
        </div>

        <div className="pt-2 flex justify-between items-center">
          <span className="text-xs text-gray-500">
            {linkedPlayer?.approved
              ? "Your current player profile is approved."
              : "Submission status: pending admin approval until approved."}
          </span>
          <Button type="submit" disabled={saving}>
            {saving ? "Submitting..." : "Submit Player Profile"}
          </Button>
        </div>
      </form>
    </motion.div>
  );
};

export default CompleteProfile;
