
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { adminLogin, isAdminAuthenticated } from "@/services/authService";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { LogIn, Lock, User } from "lucide-react";
import ChatLayout from "@/components/layout/ChatLayout";

const AdminLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  // If already authenticated, redirect to admin dashboard
  useEffect(() => {
    if (isAdminAuthenticated()) {
      navigate("/admin");
    }
  }, [navigate]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const success = adminLogin(username, password);
      if (success) {
        toast.success("Admin authentication successful");
        navigate("/admin");
      } else {
        toast.error("Invalid admin credentials");
      }
    } catch (error) {
      toast.error("Authentication failed");
      console.error("Admin login error:", error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <ChatLayout>
      <div className="flex items-center justify-center min-h-[80vh]">
        <Card className="w-[350px]">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <Lock className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-center">Admin Login</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access the admin dashboard
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="username"
                    placeholder="Enter username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full flex gap-2" 
                type="submit"
                disabled={loading}
              >
                <LogIn size={18} />
                {loading ? "Authenticating..." : "Login"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </ChatLayout>
  );
};

export default AdminLogin;
