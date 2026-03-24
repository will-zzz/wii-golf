import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";

type Claim = {
  id: number;
  status: "pending" | "approved" | "rejected" | "revoked";
  created_at: string;
  players: { full_name: string } | null;
};

type PlayerOption = {
  id: string;
  full_name: string;
};

const Account: React.FC = () => {
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [displayName, setDisplayName] = useState(profile?.display_name ?? "");
  const [saving, setSaving] = useState(false);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [claimablePlayers, setClaimablePlayers] = useState<PlayerOption[]>([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>("");
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    setDisplayName(profile?.display_name ?? "");
  }, [profile?.display_name]);

  const loadAccountData = async () => {
    const [{ data: claimsData, error: claimsError }, { data: playersData, error: playersError }] =
      await Promise.all([
        supabase
          .from("player_claims")
          .select("id, status, created_at, players(full_name)")
          .order("created_at", { ascending: false }),
        supabase
          .from("players")
          .select("id, full_name")
          .eq("approved", true)
          .order("full_name", { ascending: true }),
      ]);

    if (claimsError) {
      toast({
        title: "Failed loading claims",
        description: claimsError.message,
        variant: "destructive",
      });
    } else {
      setClaims((claimsData ?? []) as unknown as Claim[]);
    }

    if (playersError) {
      toast({
        title: "Failed loading players",
        description: playersError.message,
        variant: "destructive",
      });
    } else {
      setClaimablePlayers((playersData ?? []) as PlayerOption[]);
    }
  };

  useEffect(() => {
    if (!user) return;
    loadAccountData();
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("user_profiles")
      .update({
        display_name: displayName.trim() || null,
      })
      .eq("user_id", user.id);

    setSaving(false);

    if (error) {
      toast({
        title: "Failed to save profile",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    await refreshProfile();
    toast({
      title: "Profile updated",
      description: "Your display name has been saved.",
    });
  };

  const handleSubmitClaim = async () => {
    if (!selectedPlayerId) return;
    setClaiming(true);
    const { error } = await supabase.from("player_claims").insert({
      player_id: selectedPlayerId,
      user_id: user?.id,
      status: "pending",
    });
    setClaiming(false);

    if (error) {
      toast({
        title: "Claim request failed",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setSelectedPlayerId("");
    await loadAccountData();
    toast({
      title: "Claim request submitted",
      description: "A league admin can now review your request.",
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
        <h2 className="text-lg font-semibold mb-3">Profile</h2>
        <p className="text-sm text-gray-500 mb-2">{user.email}</p>
        <Input
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          placeholder="Display name"
        />
        <Button className="mt-3" onClick={handleSaveProfile} disabled={saving}>
          {saving ? "Saving..." : "Save profile"}
        </Button>
      </div>

      <div className="bg-white rounded-lg border p-5 mb-6">
        <h2 className="text-lg font-semibold mb-3">Claim Your Player Profile</h2>
        <p className="text-sm text-gray-600 mb-3">
          Submit a claim request so scores including your player can be tied to your account.
        </p>
        <div className="flex gap-2">
          <Select value={selectedPlayerId} onValueChange={setSelectedPlayerId}>
            <SelectTrigger>
              <SelectValue placeholder="Select your player" />
            </SelectTrigger>
            <SelectContent>
              {claimablePlayers.map((player) => (
                <SelectItem key={player.id} value={player.id}>
                  {player.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleSubmitClaim} disabled={!selectedPlayerId || claiming}>
            {claiming ? "Submitting..." : "Request claim"}
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg border p-5">
        <h2 className="text-lg font-semibold mb-3">My Claim Requests</h2>
        {claims.length === 0 ? (
          <p className="text-gray-500 text-sm">No claim requests yet.</p>
        ) : (
          <div className="space-y-2">
            {claims.map((claim) => (
              <div key={claim.id} className="flex items-center justify-between bg-gray-50 rounded px-3 py-2">
                <span>{claim.players?.full_name ?? "Unknown player"}</span>
                <span className="text-sm font-medium capitalize">{claim.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Account;
