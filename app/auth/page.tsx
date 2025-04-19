"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";
import { ArrowRight, Loader2, Mail } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BsCalendarEvent } from "react-icons/bs";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [needsVerification, setNeedsVerification] = useState(false);
  const [savedEmail, setSavedEmail] = useState<string | null>(null);
  
  // Create Supabase client directly
  const supabase = createClientComponentClient();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check for email in localStorage
    const lastEmail = localStorage.getItem('lastEmail');
    if (lastEmail) {
      setSavedEmail(lastEmail);
      setEmail(lastEmail);
    }

    // Get error info from URL if available
    const error = searchParams?.get('error');
    const errorMessage = searchParams?.get('message');

    // Log any auth errors to help debug issues
    if (error) {
      console.log('Auth page loaded with error:', error, errorMessage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      // Set user-friendly error message based on error code
      let friendlyMessage = '';
      
      // Simple error handling with clear messages
      switch(error) {
        case 'no_code':
          friendlyMessage = 'Missing authentication code. Please try again.';
          break;
        case 'pkce':
          friendlyMessage = 'The authentication link has expired. Please try again.';
          break;
        case 'unknown':
          friendlyMessage = errorMessage || 'Authentication failed. Please try again.';
          break;
        default:
          friendlyMessage = 'Authentication error. Please try again.';
          break;
      }
      
      setError(friendlyMessage);
    }
    
    // Check if we've been redirected after a successful login
    const loginSuccess = searchParams?.get('login') === 'success';
    if (loginSuccess) {
      // Remove the parameter from URL
      const url = new URL(window.location.href);
      url.searchParams.delete('login');
      window.history.replaceState({}, '', url.toString());
      
      // Redirect to homepage
      router.push('/');
    }
  }, [searchParams, router]);



  const handleSubmit = async () => {
    setError("");
    setIsLoading(true);

    try {
      // Validate inputs
      if (!email) {
        setError("Please enter your email address");
        setIsLoading(false);
        return;
      }

      if (isSignUp && !password) {
        setError("Please enter a password");
        setIsLoading(false);
        return;
      }

      if (isSignUp && password.length < 6) {
        setError("Password must be at least 6 characters");
        setIsLoading(false);
        return;
      }

      // Save email for convenience
      localStorage.setItem('lastEmail', email);
      
      if (isSignUp) {
        // Handle sign up
        console.log('Attempting to sign up with:', email);
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });

        if (error) {
          console.error('Sign up error:', error);
          setError(error.message);
          setIsLoading(false);
          return;
        }
        
        if (data?.user) {
          toast({
            title: "Account created",
            description: "You have successfully signed up! Redirecting to dashboard...",
          });
          
          // Redirect to home page after successful signup
          router.push('/');
        } else {
          // In case email verification is needed
          setNeedsVerification(true);
          setSavedEmail(email);
        }
      } else {
        // Handle sign in
        console.log('Attempting to sign in with:', email);
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          console.error('Sign in error:', error);
          setError(error.message);
          setIsLoading(false);
          return;
        }

        if (data?.user) {
          toast({
            title: "Welcome back",
            description: "You have successfully signed in!",
          });
          
          // Redirect to home page or requested page after successful login
          const redirectTo = searchParams?.get('redirectTo') || '/';
          router.push(redirectTo);
        }
      }
    } catch (error: any) {
      console.error("Authentication error:", error);
      setError(error.message || "An error occurred during authentication");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md mx-auto"
      >
        <div className="space-y-6 bg-card shadow-lg rounded-xl p-6 border">
          <div className="space-y-2 text-center">
            <BsCalendarEvent className="mx-auto h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">Welcome to Event Portal</h1>
            <p className="text-muted-foreground">
              {isSignUp ? 'Create an account to get started' : 'Sign in to your account'}
            </p>
          </div>

          {error && (
            <div>
              <Alert variant="destructive" className="border-red-500/50 text-red-600 dark:text-red-400">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </div>
          )}

          <div className="space-y-6">
            {needsVerification ? (
              <div className="bg-amber-50 dark:bg-amber-900/20 p-6 rounded-lg space-y-4">
                <div className="flex items-center justify-center">
                  <div className="bg-amber-100 dark:bg-amber-900/40 p-3 rounded-full">
                    <Mail className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                  </div>
                </div>
                
                <h3 className="text-center text-lg font-medium">Verification Required</h3>
                
                <p className="text-center text-sm text-muted-foreground">
                  We&apos;ve sent a verification email to <strong>{email}</strong>
                </p>
                
                <div className="bg-card p-4 rounded border">
                  <ol className="list-decimal list-inside space-y-2 text-sm">
                    <li>Check your email inbox for the verification link</li>
                    <li>Click the link in your email to verify your account</li>
                    <li>Return here to sign in after verification</li>
                  </ol>
                </div>
                
                <div className="grid grid-cols-1 gap-3">
                  <Button
                    onClick={() => setNeedsVerification(false)}
                    variant="outline"
                    className="w-full"
                  >
                    Back to Sign In
                  </Button>
                  

                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      className="pl-10"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type="password"
                      placeholder="u2022u2022u2022u2022u2022u2022"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {isSignUp ? 'Password must be at least 6 characters' : ''}
                  </p>
                </div>

                <Button
                  onClick={handleSubmit}
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
                      {isSignUp ? 'Sign Up' : 'Sign In'}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>

                <div className="text-center text-sm pt-2">
                  <p className="text-muted-foreground">
                    {isSignUp ? (
                      <>
                        Already have an account?{' '}
                        <button 
                          onClick={() => setIsSignUp(false)} 
                          className="text-primary hover:underline"
                          type="button"
                        >
                          Sign in
                        </button>
                      </>
                    ) : (
                      <>
                        Don&apos;t have an account?{' '}
                        <button 
                          onClick={() => setIsSignUp(true)} 
                          className="text-primary hover:underline"
                          type="button"
                        >
                          Create one
                        </button>
                      </>
                    )}
                  </p>
                </div>
                
                {email === "jospenwolongwo@gmail.com" && (
                  <p className="text-xs text-muted-foreground mt-1 text-center">
                    Admin account detected - you&apos;ll have access to admin features after login
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
