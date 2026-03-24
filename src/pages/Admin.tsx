import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";

type PlayerRow = {
  id: string;
  full_name: string;
  approved: boolean;
  user_id: string | null;
  created_at: string;
};

type DisputeRow = {
  id: number;
  round_id: number;
  player_id: string;
  reporter_user_id: string;
  status: "open" | "resolved" | "dismissed";
  reason: string;
  created_at: string;
  score_rounds: { source_timestamp: string | null } | null;
  players: { full_name: string } | null;
};

type ProfileRow = {
  user_id: string;
  email: string;
  display_name: string | null;
};

type PlayerOption = {
  id: string;
  full_name: string;
};

const Admin: React.FC = () => {
  const { user, isAdmin, loading } = useAuth();
  const { toast } = useToast();
  const [pendingSignups, setPendingSignups] = useState<PlayerRow[]>([]);
  const [linkedPlayers, setLinkedPlayers] = useState<PlayerRow[]>([]);
  const [allPlayers, setAllPlayers] = useState<PlayerOption[]>([]);
  const [disputes, setDisputes] = useState<DisputeRow[]>([]);
  const [profiles, setProfiles] = useState<Record<string, ProfileRow>>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedPlayerId, setSelectedPlayerId] = useState("");

  const loadAdminData = async () => {
    setLoadingData(true);
    const [pendingResult, linkedResult, playersResult, disputesResult, profilesResult] =
      await Promise.all([
        supabase
          .from("players")
          .select("id, full_name, approved, user_id, created_at")
          .not("user_id", "is", null)
          .eq("approved", false)
          .order("created_at", { ascending: false }),
        supabase
          .from("players")
          .select("id, full_name, approved, user_id, created_at")
          .not("user_id", "is", null)
          .order("full_name", { ascending: true }),
        supabase
          .from("players")
          .select("id, full_name")
          .eq("approved", true)
          .order("full_name", { ascending: true }),
        supabase
          .from("score_disputes")
          .select(
            "id, round_id, player_id, reporter_user_id, status, reason, created_at, players(full_name), score_rounds(source_timestamp)"
          )
          .order("created_at", { ascending: false }),
        supabase
          .from("user_profiles")
          .select("user_id, email, display_name")
          .order("created_at", { ascending: true }),
      ]);

    if (pendingResult.error) {
      toast({
        title: "Failed to load pending signups",
        description: pendingResult.error.message,
        variant: "destructive",
      });
    } else {
      setPendingSignups((pendingResult.data ?? []) as PlayerRow[]);
    }

    if (linkedResult.error) {
      toast({
        title: "Failed to load account links",
        description: linkedResult.error.message,
        variant: "destructive",
      });
    } else {
      setLinkedPlayers((linkedResult.data ?? []) as PlayerRow[]);
    }

    if (playersResult.error) {
      toast({
        title: "Failed to load players",
        description: playersResult.error.message,
        variant: "destructive",
      });
    } else {
      setAllPlayers((playersResult.data ?? []) as PlayerOption[]);
    }

    if (disputesResult.error) {
      toast({
        title: "Failed to load disputes",
        description: disputesResult.error.message,
        variant: "destructive",
      });
    } else {
      setDisputes((disputesResult.data ?? []) as unknown as DisputeRow[]);
    }

    if (profilesResult.error) {
      toast({
        title: "Failed to load user profiles",
        description: profilesResult.error.message,
        variant: "destructive",
      });
    } else {
      const nextProfiles: Record<string, ProfileRow> = {};
      ((profilesResult.data ?? []) as ProfileRow[]).forEach((row) => {
        nextProfiles[row.user_id] = row;
      });
      setProfiles(nextProfiles);
    }

    setLoadingData(false);
  };

  useEffect(() => {
    if (!user || !isAdmin) return;
    loadAdminData();
  }, [user, isAdmin]);

  const openDisputes = useMemo(
    () => disputes.filter((dispute) => dispute.status === "open"),
    [disputes]
  );
  const allProfiles = useMemo(() => Object.values(profiles), [profiles]);

  const approveSignup = async (playerId: string) => {
    setBusyId(`signup-${playerId}`);
    const { error } = await supabase
      .from("players")
      .update({ approved: true })
      .eq("id", playerId);
    setBusyId(null);

    if (error) {
      toast({
        title: "Failed to approve signup",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Signup approved",
      description: "Player profile is now public.",
    });
    await loadAdminData();
  };

  const rejectSignup = async (playerId: string) => {
    setBusyId(`signup-${playerId}`);
    const { error } = await supabase
      .from("players")
      .update({ user_id: null })
      .eq("id", playerId);
    setBusyId(null);

    if (error) {
      toast({
        title: "Failed to reject signup",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Signup rejected",
      description: "Account was unlinked from this pending profile.",
    });
    await loadAdminData();
  };

  const updateDisputeStatus = async (
    disputeId: number,
    status: DisputeRow["status"]
  ) => {
    setBusyId(`dispute-${disputeId}`);
    const payload =
      status === "open"
        ? { status, resolved_at: null }
        : { status, resolved_at: new Date().toISOString() };
    const { error } = await supabase
      .from("score_disputes")
      .update(payload)
      .eq("id", disputeId);
    setBusyId(null);

    if (error) {
      toast({
        title: "Failed to update dispute",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Dispute updated",
      description: `Dispute marked as ${status}.`,
    });
    await loadAdminData();
  };

  const linkAccountToPlayer = async () => {
    if (!selectedUserId || !selectedPlayerId) return;
    setBusyId("advanced-link");

    const { error: unlinkError } = await supabase
      .from("players")
      .update({ user_id: null })
      .eq("user_id", selectedUserId)
      .neq("id", selectedPlayerId);

    if (unlinkError) {
      setBusyId(null);
      toast({
        title: "Failed preparing link",
        description: unlinkError.message,
        variant: "destructive",
      });
      return;
    }

    const { error: linkError } = await supabase
      .from("players")
      .update({ user_id: selectedUserId })
      .eq("id", selectedPlayerId);

    setBusyId(null);

    if (linkError) {
      toast({
        title: "Failed linking account",
        description: linkError.message,
        variant: "destructive",
      });
      return;
    }

    const selectedProfile = profiles[selectedUserId];
    const selectedPlayer = allPlayers.find((player) => player.id === selectedPlayerId);
    toast({
      title: "Account linked",
      description: `${
        selectedProfile?.display_name || selectedProfile?.email || selectedUserId
      } -> ${selectedPlayer?.full_name || selectedPlayerId}`,
    });
    setSelectedUserId("");
    setSelectedPlayerId("");
    await loadAdminData();
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <p className="text-xl text-gray-600">Loading admin...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-3">Log in required.</p>
          <Link to="/" className="text-pwga-blue hover:underline">
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-3">You are not an admin.</p>
          <Link to="/" className="text-pwga-blue hover:underline">
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="container mx-auto px-4 py-24 max-w-6xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h1 className="text-3xl font-bold mb-2">Admin</h1>
      <p className="text-gray-600 mb-6">
        Approve new player signups, review disputes, and manage account links.
      </p>

      {loadingData ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500">
          Loading admin data...
        </div>
      ) : (
        <Tabs defaultValue="approvals" className="w-full">
          <TabsList>
            <TabsTrigger value="approvals">
              Signups ({pendingSignups.length} pending)
            </TabsTrigger>
            <TabsTrigger value="disputes">Disputes ({openDisputes.length} open)</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value="approvals">
            <div className="bg-white border rounded-lg mt-4 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pending Player</TableHead>
                    <TableHead>Account</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingSignups.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-gray-500">
                        No pending signups.
                      </TableCell>
                    </TableRow>
                  ) : (
                    pendingSignups.map((signup) => {
                      const profile = signup.user_id ? profiles[signup.user_id] : null;
                      return (
                        <TableRow key={signup.id}>
                          <TableCell>{signup.full_name}</TableCell>
                          <TableCell>
                            {profile?.display_name || profile?.email || signup.user_id}
                          </TableCell>
                          <TableCell>
                            {new Date(signup.created_at).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button
                              size="sm"
                              disabled={busyId === `signup-${signup.id}`}
                              onClick={() => void approveSignup(signup.id)}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={busyId === `signup-${signup.id}`}
                              onClick={() => void rejectSignup(signup.id)}
                            >
                              Reject
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="disputes">
            <div className="bg-white border rounded-lg mt-4 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Round</TableHead>
                    <TableHead>Player</TableHead>
                    <TableHead>Reporter</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {disputes.map((dispute) => {
                    const profile = profiles[dispute.reporter_user_id];
                    return (
                      <TableRow key={dispute.id}>
                        <TableCell>
                          #{dispute.round_id}
                          <div className="text-xs text-gray-500">
                            {dispute.score_rounds?.source_timestamp
                              ? new Date(dispute.score_rounds.source_timestamp).toLocaleDateString()
                              : "Unknown date"}
                          </div>
                        </TableCell>
                        <TableCell>{dispute.players?.full_name ?? "Unknown player"}</TableCell>
                        <TableCell>
                          {profile?.display_name || profile?.email || dispute.reporter_user_id}
                        </TableCell>
                        <TableCell className="max-w-[380px] whitespace-normal">
                          {dispute.reason}
                        </TableCell>
                        <TableCell className="capitalize">{dispute.status}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            size="sm"
                            disabled={
                              busyId === `dispute-${dispute.id}` ||
                              dispute.status === "resolved"
                            }
                            onClick={() => void updateDisputeStatus(dispute.id, "resolved")}
                          >
                            Resolve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={
                              busyId === `dispute-${dispute.id}` ||
                              dispute.status === "dismissed"
                            }
                            onClick={() => void updateDisputeStatus(dispute.id, "dismissed")}
                          >
                            Dismiss
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="advanced">
            <div className="bg-white border rounded-lg mt-4 p-4">
              <h2 className="text-lg font-semibold mb-1">Account to Player Linking</h2>
              <p className="text-sm text-gray-600 mb-4">
                Rare admin operation. Use this when linking an existing legacy player to a
                specific account.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select user account" />
                  </SelectTrigger>
                  <SelectContent>
                    {allProfiles.map((profile) => (
                      <SelectItem key={profile.user_id} value={profile.user_id}>
                        {profile.display_name || profile.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedPlayerId} onValueChange={setSelectedPlayerId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select approved player" />
                  </SelectTrigger>
                  <SelectContent>
                    {allPlayers.map((player) => (
                      <SelectItem key={player.id} value={player.id}>
                        {player.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  disabled={
                    busyId === "advanced-link" || !selectedUserId || !selectedPlayerId
                  }
                  onClick={() => void linkAccountToPlayer()}
                >
                  {busyId === "advanced-link" ? "Linking..." : "Link account"}
                </Button>
              </div>
            </div>

            <div className="bg-white border rounded-lg mt-4 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Player</TableHead>
                    <TableHead>Linked account</TableHead>
                    <TableHead>Approved</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {linkedPlayers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-gray-500">
                        No account links yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    linkedPlayers.map((player) => {
                      const profile = player.user_id ? profiles[player.user_id] : null;
                      return (
                        <TableRow key={player.id}>
                          <TableCell>{player.full_name}</TableCell>
                          <TableCell>
                            {profile?.display_name || profile?.email || player.user_id}
                          </TableCell>
                          <TableCell>{player.approved ? "Yes" : "No"}</TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </motion.div>
  );
};

export default Admin;
