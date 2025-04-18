"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { ArrowRight, Lock, Loader2, Mail, User, Key, Bug } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BsCalendarEvent } from "react-icons/bs";
// Simplified authentication approach - no separate admin bypass needed

export default function AuthPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthContent />
    </Suspense>
  );
}

function AuthContent() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [error, setError] = useState("");
  const [savedEmail, setSavedEmail] = useState<string | null>(null);
  // Simplified auth - no need for multiple test options
  const { signInWithEmail, testSignIn } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check for saved email
    const lastEmail = localStorage.getItem("lastEmail");
    if (lastEmail) {
      setSavedEmail(lastEmail);
    }

    // Check for redirect parameter
    const redirectTo = searchParams.get("redirectTo");
    if (redirectTo) {
      console.log("Redirect after login:", redirectTo);
    }
    
    // Check for error parameters from callback
    const error = searchParams.get("error");
    const errorDescription = searchParams.get("errorDescription");
    
    if (error) {
      console.error("Auth error:", error, errorDescription);
      setError(errorDescription || "Authentication failed. Please try again.");
    }
  }, [searchParams]);

  const handleContinue = async () => {
    setError("");
    setMagicLinkSent(false);

    // Email authentication
    if (!email && !savedEmail) {
      setError("Please enter your email address");
      return;
    }

    setIsLoading(true);
    try {
      const emailToUse = email || savedEmail || "";
      
      const { error: signInError } = await signInWithEmail(emailToUse);
      if (signInError) throw new Error(signInError);

      // Save email for future use
      localStorage.setItem("lastEmail", emailToUse);

      // Set magic link sent state
      setMagicLinkSent(true);

      toast({
        title: "Magic link sent!",
        description: "Please check your email for the login link",
      });
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestSignIn = async () => {
    setIsLoading(true);
    try {
      // For the test application, we're just using the 'admin' role for simplicity
      await testSignIn('admin');
      
      toast({
        title: "Test login successful!",
        description: "You now have access to all features",
      });
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // No need for toggling test options in simplified approach

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 sm:px-6 lg:px-8 bg-background">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary"
        >
          <BsCalendarEvent className="h-6 w-6 text-primary-foreground" />
        </motion.div>
        <h2 className="mt-6 text-center text-3xl font-extrabold tracking-tight">
          Sign in to Event Portal
        </h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Access your account to manage events and bookings
        </p>
      </div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md"
      >
        <div className="bg-card px-4 py-8 shadow sm:rounded-lg sm:px-10">
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-6">
            {!magicLinkSent ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder=""
                      className="pl-10"
                      value={email || savedEmail || ""}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  {email === "jospenwolongwo@gmail.com" && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Admin account detected - you&apos;ll be redirected to the admin dashboard after login
                    </p>
                  )}
                </div>
                
                <div>
                  <Button
                    onClick={handleContinue}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Please wait...
                      </>
                    ) : (
                      <>
                        Continue
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>

                <div className="text-center text-sm">
                  <p className="text-muted-foreground">
                    We&apos;ll send you a magic link to log in
                  </p>
                </div>
              </>
            ) : (
              <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg space-y-4">
                <div className="flex items-center justify-center">
                  <div className="bg-green-100 dark:bg-green-900/40 p-3 rounded-full">
                    <Mail className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
                
                <h3 className="text-center text-lg font-medium">Magic link sent!</h3>
                
                <p className="text-center text-sm text-muted-foreground">
                  We&apos;ve sent a login link to <strong>{email || savedEmail}</strong>
                </p>
                
                <div className="bg-card p-4 rounded border">
                  <ol className="list-decimal list-inside space-y-2 text-sm">
                    <li>Check your email inbox for the login link</li>
                    <li>Click the link in your email (valid for 24 hours)</li>
                    <li>You&apos;ll be automatically signed in to your account</li>
                  </ol>
                </div>
                
                <div>
                  <Button
                    onClick={handleContinue}
                    variant="outline"
                    className="w-full"
                  >
                    Send another link
                  </Button>
                </div>
              </div>
            )}
            
            {!magicLinkSent && (
              <div className="text-center text-sm mt-4">
                <p className="text-muted-foreground">
                  Enter your email above and click Continue to sign in
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
