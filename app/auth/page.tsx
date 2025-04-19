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
// Simple, direct Supabase-based authentication with no custom hooks

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
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
          friendlyMessage = 'Missing authentication code. Please try the magic link again or request a new one.';
          break;
        case 'pkce':
          friendlyMessage = 'The authentication link was already used or has expired. Please request a new magic link below.';
          break;
        case 'unknown':
          friendlyMessage = errorMessage || 'Authentication failed. Please try again with a new magic link.';
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

    // Validate inputs
    if (!email) {
      setError("Please enter your email address");
      return;
    }

    if (!password) {
      setError("Please enter your password");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setIsLoading(true);
    try {
      let result;
      
      if (isSignUp) {
        // Sign up flow
        result = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          }
        });
        
        if (result.error) throw result.error;
        
        toast({
          title: "Account created!",
          description: "You can now sign in with your credentials",
        });
        
        // Switch to sign in mode after successful signup
        setIsSignUp(false);
      } else {
        // Sign in flow
        result = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (result.error) throw result.error;
        
        // Save email for future use
        localStorage.setItem("lastEmail", email);
        
        if (result.data?.session) {
          toast({
            title: "Signed in successfully!",
            description: "Welcome back",
          });
          
          // Redirect to home page
          router.push('/');
        }
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      setError(error.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Since we have simplified the auth to allow all authenticated users to access admin features,
  // we don't need a separate test sign-in function anymore

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
            <div className="mb-8 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
              <h3 className="text-lg font-semibold mb-2">Authentication Error</h3>
              <p>{error}</p>
              <div className="mt-3 text-sm text-red-500">
                <details>
                  <summary>Technical details</summary>
                  <p className="mt-1">Error code: {searchParams?.get('error')}</p>
                  {searchParams?.get('errorDescription') && <p>Details: {searchParams?.get('errorDescription')}</p>}
                </details>
              </div>
            </div>
          )}
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder=""
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
                    placeholder="••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {isSignUp ? 'Password must be at least 6 characters' : ''}
                </p>
              </div>
              
              <div>
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
              </div>

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
          </div>
        </div>
      </motion.div>
    </div>
  );
}
