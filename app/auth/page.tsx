"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";
import { ArrowRight, Loader2, Phone } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BsCalendarEvent } from "react-icons/bs";
import { useAuth } from "@/hooks/useAuth";

export default function AuthPage() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [savedPhone, setSavedPhone] = useState<string | null>(null);
  
  // Use the auth hook instead of direct Supabase client
  const { signInWithOtp, verifyOtp } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check for phone in localStorage
    const lastPhone = localStorage.getItem('lastPhone');
    if (lastPhone) {
      setSavedPhone(lastPhone);
      setPhoneNumber(lastPhone);
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
        case 'invalid_otp':
          friendlyMessage = 'Invalid verification code. Please try again.';
          break;
        case 'phone_not_found':
          friendlyMessage = 'Phone number not found. Please check and try again.';
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



  const sendOTP = async () => {
    setError("");
    setIsLoading(true);

    try {
      // Validate inputs
      if (!phoneNumber) {
        setError("Please enter your phone number");
        setIsLoading(false);
        return;
      }

      // Format the phone number if needed
      let formattedPhone = phoneNumber;
      if (!phoneNumber.startsWith('+')) {
        formattedPhone = `+${phoneNumber}`;
      }

      // Save phone for convenience
      localStorage.setItem('lastPhone', formattedPhone);
      
      // Send OTP using useAuth hook
      const { error } = await signInWithOtp(formattedPhone);

      if (error) {
        console.error('OTP request error:', error);
        setError(error);
        setIsLoading(false);
        return;
      }
      
      // Show verification code input
      setOtpSent(true);
      toast({
        title: "Code sent",
        description: "Check your phone for the verification code",
      });
    } catch (e: any) {
      console.error('Auth error:', e);
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOTPCode = async () => {
    setError("");
    setIsLoading(true);

    try {
      // Validate inputs
      if (!otpCode) {
        setError("Please enter the verification code");
        setIsLoading(false);
        return;
      }

      // Format the phone number if needed
      let formattedPhone = phoneNumber;
      if (!phoneNumber.startsWith('+')) {
        formattedPhone = `+${phoneNumber}`;
      }
      
      // Verify OTP
      const { data, error } = await verifyOtp(formattedPhone, otpCode);

      if (error) {
        console.error('OTP verification error:', error);
        setError(error);
        setIsLoading(false);
        return;
      }

      // Special handling for admin
      if (formattedPhone === "+jospenwolongwo") { // Replace with your actual admin phone number
        localStorage.setItem('adminBypass', 'enabled');
      }

      if (data?.session) {
        toast({
          title: 'Welcome!',
          description: 'You have been signed in successfully.',
        });
        
        // Get the intended redirect destination
        const redirectTo = searchParams?.get('redirectTo') || '/';
        router.push(redirectTo);
      }
    } catch (e: any) {
      console.error('Auth error:', e);
      setError(e.message);
    } finally {
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
              Enter your phone number to get started
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
            {otpSent ? (
              <div className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-md space-y-2">
                  <h3 className="font-medium">Verify your phone</h3>
                  <p className="text-sm text-muted-foreground">
                    We sent a verification code to <strong>{phoneNumber}</strong>
                  </p>
                  <ol className="text-sm text-muted-foreground list-decimal pl-4 space-y-1">
                    <li>Check your text messages</li>
                    <li>Enter the code below</li>
                  </ol>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="otpCode">Verification Code</Label>
                  <Input
                    id="otpCode"
                    type="text"
                    placeholder="123456"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                <Button
                  onClick={verifyOTPCode}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      Verify Code
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>

                <div className="grid grid-cols-1 gap-3">
                  <Button
                    onClick={() => setOtpSent(false)}
                    variant="outline"
                    className="w-full"
                  >
                    Back to Phone Entry
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="phoneNumber"
                      type="tel"
                      placeholder="+1234567890"
                      className="pl-10"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Enter your phone number including country code (e.g., +1 for US)
                  </p>
                </div>

                <Button
                  onClick={sendOTP}
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
                      Send Verification Code
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
                
                {phoneNumber === "+jospenwolongwo" && (
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
