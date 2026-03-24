import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";
import PlayerHeadshotUploader from "@/components/PlayerHeadshotUploader";
import { uploadPlayerHeadshot } from "@/utils/imageUtils";

type EditablePlayerProfile = {
  id: string;
  full_name: string;
  photo_url: string | null;
  bio: string | null;
  favorite_golf_shot: string | null;
  biggest_hero: string | null;
  greatest_foe: string | null;
  approved: boolean;
};

const Account: React.FC = () => {
  const { user, refreshProfile, isAdmin } = useAuth();
  const { toast } = useToast();
  const [playerProfile, setPlayerProfile] = useState<EditablePlayerProfile | null>(null);
  const [loadingPlayerProfile, setLoadingPlayerProfile] = useState(false);
  const [savingPlayerProfile, setSavingPlayerProfile] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [storedPhotoUrl, setStoredPhotoUrl] = useState("");
  const [croppedPhotoBlob, setCroppedPhotoBlob] = useState<Blob | null>(null);
  const [photoUrl, setPhotoUrl] = useState("");
  const [bio, setBio] = useState("");
  const [favoriteShot, setFavoriteShot] = useState("");
  const [hero, setHero] = useState("");
  const [foe, setFoe] = useState("");

  useEffect(() => {
    const loadPlayerProfile = async () => {
      if (!user) return;
      setLoadingPlayerProfile(true);
      const { data, error } = await supabase
        .from("players")
        .select(
          "id, full_name, photo_url, bio, favorite_golf_shot, biggest_hero, greatest_foe, approved"
        )
        .eq("user_id", user.id)
        .maybeSingle();

      setLoadingPlayerProfile(false);

      if (error) {
        toast({
          title: "Failed to load player profile",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      if (!data) {
        setPlayerProfile(null);
        return;
      }

      const profileData = data as EditablePlayerProfile;
      setPlayerProfile(profileData);
      setPlayerName(profileData.full_name ?? "");
      setStoredPhotoUrl(profileData.photo_url ?? "");
      setPhotoUrl(profileData.photo_url ?? "");
      setBio(profileData.bio ?? "");
      setFavoriteShot(profileData.favorite_golf_shot ?? "");
      setHero(profileData.biggest_hero ?? "");
      setFoe(profileData.greatest_foe ?? "");
    };

    void loadPlayerProfile();
  }, [user]);

  const handleSavePlayerProfile = async () => {
    if (!user || !playerProfile) return;
    setSavingPlayerProfile(true);

    let uploadedPhotoUrl = photoUrl.trim();
    try {
      if (croppedPhotoBlob) {
        uploadedPhotoUrl = await uploadPlayerHeadshot(supabase, user.id, croppedPhotoBlob);
        setStoredPhotoUrl(uploadedPhotoUrl);
        setPhotoUrl(uploadedPhotoUrl);
      }
    } catch (error) {
      setSavingPlayerProfile(false);
      toast({
        title: "Failed to upload headshot",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from("players")
      .update({
        full_name: playerName.trim(),
        photo_url: uploadedPhotoUrl,
        bio: bio.trim(),
        favorite_golf_shot: favoriteShot.trim(),
        biggest_hero: hero.trim(),
        greatest_foe: foe.trim(),
      })
      .eq("id", playerProfile.id);

    if (!error) {
      const { error: profileSyncError } = await supabase
        .from("user_profiles")
        .update({ display_name: playerName.trim() || null })
        .eq("user_id", user.id);

      if (profileSyncError) {
        console.error("Unable to sync display_name:", profileSyncError.message);
      }
    }

    setSavingPlayerProfile(false);

    if (error) {
      toast({
        title: "Failed to save player profile",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    await refreshProfile();
    setPlayerProfile({
      ...playerProfile,
      full_name: playerName.trim(),
      photo_url: uploadedPhotoUrl,
      bio: bio.trim(),
      favorite_golf_shot: favoriteShot.trim(),
      biggest_hero: hero.trim(),
      greatest_foe: foe.trim(),
    });
    toast({
      title: "Player profile updated",
      description: "Your profile changes have been saved.",
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-2">Log in required</h1>
          <p className="text-gray-600 mb-4">Create an account to manage your profile.</p>
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
      <h1 className="text-3xl font-bold mb-6">My Account</h1>

      <div className="bg-white rounded-lg border p-5 mb-6">
        <h2 className="text-lg font-semibold mb-2">Player Profile</h2>
        {loadingPlayerProfile ? (
          <p className="text-sm text-gray-500">Loading player profile...</p>
        ) : !playerProfile ? (
          <div className="text-sm text-gray-600">
            <p className="mb-2">You have not submitted a player profile yet.</p>
            <Link to="/complete-profile" className="text-pwga-blue hover:underline">
              Complete your player profile
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-xs text-gray-500">
              Slug: <span className="font-mono">{playerProfile.slug}</span> (stable; does not
              change when you edit your name)
            </div>
            <div className="text-xs text-gray-500">
              Approval status:{" "}
              <span className="font-medium">
                {playerProfile.approved ? "Approved" : "Pending admin approval"}
              </span>
            </div>

            <div>
              <label className="text-sm font-medium">Player Name</label>
              <Input
                value={playerName}
                onChange={(event) => setPlayerName(event.target.value)}
                placeholder="Your public player name"
              />
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
              <label className="text-sm font-medium">Bio</label>
              <Textarea
                value={bio}
                onChange={(event) => setBio(event.target.value)}
                className="min-h-28"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Favorite Golf Shot</label>
              <Input
                value={favoriteShot}
                onChange={(event) => setFavoriteShot(event.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Biggest Hero</label>
              <Input value={hero} onChange={(event) => setHero(event.target.value)} />
            </div>

            <div>
              <label className="text-sm font-medium">Greatest Foe</label>
              <Input value={foe} onChange={(event) => setFoe(event.target.value)} />
            </div>

            <Button
              onClick={handleSavePlayerProfile}
              disabled={savingPlayerProfile || !playerName.trim()}
            >
              {savingPlayerProfile ? "Saving..." : "Save player profile"}
            </Button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg border p-5">
        <h2 className="text-lg font-semibold mb-2">Player Identity Linking</h2>
        <p className="text-sm text-gray-600">
          Player identity links are managed by league admins to avoid confusion and abuse.
          This account display name does not change the public player profile card on the
          players page.
        </p>
        {isAdmin ? (
          <div className="mt-3">
            <Link to="/admin" className="text-pwga-blue hover:underline text-sm">
              Open Admin - Advanced account linking
            </Link>
          </div>
        ) : null}
      </div>

      <div className="bg-white rounded-lg border p-5 mt-6">
        <h2 className="text-lg font-semibold mb-2">Why name changes look different</h2>
        <p className="text-sm text-gray-600">
          Scores are attributed by stable `player_id`, not by name text. You can change your
          player name without losing score attribution. The slug stays stable for links.
        </p>
      </div>
    </motion.div>
  );
};

export default Account;
