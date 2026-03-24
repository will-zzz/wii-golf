import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

type AuthDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const AuthDialog: React.FC<AuthDialogProps> = ({ open, onOpenChange }) => {
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();
  const [tab, setTab] = useState("login");
  const [loading, setLoading] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    const { error } = await signIn(loginEmail.trim(), loginPassword);
    setLoading(false);

    if (error) {
      toast({
        title: "Login failed",
        description: error,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Logged in",
      description: "Welcome back to PWGA.",
    });
    onOpenChange(false);
  };

  const handleSignup = async (event: React.FormEvent) => {
    event.preventDefault();
    if (signupPassword.length < 10) {
      toast({
        title: "Use a stronger password",
        description: "Password must be at least 10 characters long.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const { error } = await signUp(
      signupEmail.trim(),
      signupPassword,
      signupName.trim()
    );
    setLoading(false);

    if (error) {
      toast({
        title: "Sign up failed",
        description: error,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Check your email",
      description:
        "We sent a confirmation link. Confirm first, then log in.",
    });
    setTab("login");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>PWGA Account</DialogTitle>
          <DialogDescription>
            Use email login to manage your account and submissions.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="login">Log in</TabsTrigger>
            <TabsTrigger value="signup">Sign up</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form className="space-y-3 mt-2" onSubmit={handleLogin}>
              <Input
                type="email"
                placeholder="Email"
                value={loginEmail}
                onChange={(event) => setLoginEmail(event.target.value)}
                required
              />
              <Input
                type="password"
                placeholder="Password"
                value={loginPassword}
                onChange={(event) => setLoginPassword(event.target.value)}
                required
              />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Logging in..." : "Log in"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form className="space-y-3 mt-2" onSubmit={handleSignup}>
              <Input
                type="text"
                placeholder="Display name"
                value={signupName}
                onChange={(event) => setSignupName(event.target.value)}
                required
              />
              <Input
                type="email"
                placeholder="Email"
                value={signupEmail}
                onChange={(event) => setSignupEmail(event.target.value)}
                required
              />
              <Input
                type="password"
                placeholder="Password (10+ characters)"
                value={signupPassword}
                onChange={(event) => setSignupPassword(event.target.value)}
                required
                minLength={10}
              />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating account..." : "Create account"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AuthDialog;
