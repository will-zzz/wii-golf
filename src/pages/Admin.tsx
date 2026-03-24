import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
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

type ClaimRow = {
  id: number;
  user_id: string;
  player_id: string;
  status: "pending" | "approved" | "rejected" | "revoked";
  created_at: string;
  players: { full_name: string } | null;
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

const Admin: React.FC = () => {
  const { user, isAdmin, loading } = useAuth();
  const { toast } = useToast();
  const [claims, setClaims] = useState<ClaimRow[]>([]);
  const [disputes, setDisputes] = useState<DisputeRow[]>([]);
  const [profiles, setProfiles] = useState<Record<string, ProfileRow>>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const [loadingData, setLoadingData] = useState(true);

  const loadAdminData = async () => {
    setLoadingData(true);
    const [claimsResult, disputesResult] = await Promise.all([
      supabase
        .from("player_claims")
        .select("id, user_id, player_id, status, created_at, players(full_name)")
        .order("created_at", { ascending: false }),
      supabase
        .from("score_disputes")
        .select(
          "id, round_id, player_id, reporter_user_id, status, reason, created_at, players(full_name), score_rounds(source_timestamp)"
        )
        .order("created_at", { ascending: false }),
    ]);

    if (claimsResult.error) {
      toast({
        title: "Failed to load claims",
        description: claimsResult.error.message,
        variant: "destructive",
      });
    } else {
      setClaims((claimsResult.data ?? []) as unknown as ClaimRow[]);
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

    const userIds = new Set<string>();
    (claimsResult.data ?? []).forEach((claim: any) => userIds.add(claim.user_id));
    (disputesResult.data ?? []).forEach((dispute: any) =>
      userIds.add(dispute.reporter_user_id)
    );

    if (userIds.size > 0) {
      const { data: profileRows, error: profilesError } = await supabase
        .from("user_profiles")
        .select("user_id, email, display_name")
        .in("user_id", Array.from(userIds));

      if (profilesError) {
        toast({
          title: "Failed to load user profiles",
          description: profilesError.message,
          variant: "destructive",
        });
      } else {
        const nextProfiles: Record<string, ProfileRow> = {};
        (profileRows ?? []).forEach((row) => {
          nextProfiles[row.user_id] = row;
        });
        setProfiles(nextProfiles);
      }
    }

    setLoadingData(false);
  };

  useEffect(() => {
    if (!user || !isAdmin) return;
    loadAdminData();
  }, [user, isAdmin]);

  const pendingClaims = useMemo(
    () => claims.filter((claim) => claim.status === "pending"),
    [claims]
  );
  const openDisputes = useMemo(
    () => disputes.filter((dispute) => dispute.status === "open"),
    [disputes]
  );

  const updateClaimStatus = async (claimId: number, status: ClaimRow["status"]) => {
    setBusyId(`claim-${claimId}`);
    const { error } = await supabase
      .from("player_claims")
      .update({ status })
      .eq("id", claimId);
    setBusyId(null);

    if (error) {
      toast({
        title: "Failed to update claim",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Claim updated",
      description: `Claim marked as ${status}.`,
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
        Review player claim requests and score disputes.
      </p>

      {loadingData ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500">
          Loading admin data...
        </div>
      ) : (
        <Tabs defaultValue="claims" className="w-full">
          <TabsList>
            <TabsTrigger value="claims">Claims ({pendingClaims.length} pending)</TabsTrigger>
            <TabsTrigger value="disputes">Disputes ({openDisputes.length} open)</TabsTrigger>
          </TabsList>

          <TabsContent value="claims">
            <div className="bg-white border rounded-lg mt-4 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Player</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {claims.map((claim) => {
                    const profile = profiles[claim.user_id];
                    return (
                      <TableRow key={claim.id}>
                        <TableCell>{claim.players?.full_name ?? "Unknown player"}</TableCell>
                        <TableCell>
                          {profile?.display_name || profile?.email || claim.user_id}
                        </TableCell>
                        <TableCell className="capitalize">{claim.status}</TableCell>
                        <TableCell>
                          {new Date(claim.created_at).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            size="sm"
                            disabled={
                              busyId === `claim-${claim.id}` || claim.status === "approved"
                            }
                            onClick={() => void updateClaimStatus(claim.id, "approved")}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={
                              busyId === `claim-${claim.id}` || claim.status === "rejected"
                            }
                            onClick={() => void updateClaimStatus(claim.id, "rejected")}
                          >
                            Reject
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
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
        </Tabs>
      )}
    </motion.div>
  );
};

export default Admin;
