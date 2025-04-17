"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { MapPin, Users, Clock, Calendar, ArrowRight, Loader2, Check } from "lucide-react"
import { PaymentMethodSelector } from "@/components/payment/payment-method-selector"
import { PhoneNumberInput } from "@/components/payment/phone-number-input"
import { PaymentService } from "@/lib/payment/payment-service"
import { useSupabase } from "@/providers/SupabaseProvider"
import { toast } from "sonner"
import { format } from "date-fns"
import { useRouter } from 'next/navigation'
import { RegistrationService } from "@/lib/services/registration-service"
import { Event } from "@/lib/types"

// Define the types needed for the component
type PaymentProviderType = 'mtn' | 'orange';
type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed';

interface RegistrationModalProps {
  isOpen: boolean
  onClose: () => void
  event: Event | null
  onRegistrationComplete?: () => void
}

export function RegistrationModal({ isOpen, onClose, event, onRegistrationComplete }: RegistrationModalProps) {
  const { supabase, user } = useSupabase()
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [attendees, setAttendees] = useState(1)
  const [loading, setLoading] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState<PaymentProviderType | undefined>()
  const [phoneNumber, setPhoneNumber] = useState("")
  const [isPhoneValid, setIsPhoneValid] = useState(false)
  const [paymentService] = useState(() => new PaymentService(supabase))
  const [registrationService] = useState(() => new RegistrationService(supabase))
  const [registrationId, setRegistrationId] = useState<string>()
  const [paymentTransactionId, setPaymentTransactionId] = useState<string | null>(null)
  const [paymentStatus, setPaymentStatus] = useState<'PENDING' | 'SUCCESSFUL' | 'FAILED' | null>(null)
  const [statusMessage, setStatusMessage] = useState<string>('')
  const [isPolling, setIsPolling] = useState(false)

  if (!event) return null

  const totalPrice = attendees * event.price
  const providers = paymentService.getAvailableProviders()

  const handleCreateRegistration = async () => {
    if (!user) return

    try {
      setLoading(true)
      
      const { data, error } = await registrationService.createRegistration({
        event_id: event.id,
        user_id: user.id,
        attendees: attendees
      })

      if (error) {
        console.error('Registration creation failed:', error)
        toast.error(error.message || "Failed to create registration")
        return
      }
      
      setRegistrationId(data?.id)
      setStep(2)
    } catch (error) {
      console.error('Registration creation failed:', error)
      toast.error(error instanceof Error ? error.message : "Failed to create registration")
    } finally {
      setLoading(false)
    }
  }

  const checkPaymentStatus = async (transactionId: string) => {
    if (!selectedProvider) return

    try {
      const response = await fetch(`/api/payments/status?transactionId=${transactionId}&provider=${selectedProvider}`)
      if (!response.ok) throw new Error('Failed to check payment status')
      
      const data = await response.json()
      
      if (data.status === 'SUCCESSFUL') {
        setPaymentStatus('SUCCESSFUL')
        setStatusMessage('Payment completed successfully!')
        setIsPolling(false)
        
        // Show success message briefly before redirecting
        setTimeout(() => {
          setStep(3)
          if (onRegistrationComplete) {
            onRegistrationComplete()
          }
          // Close modal and redirect after showing success message
          setTimeout(() => {
            onClose()
            router.replace('/registrations')
          }, 1500)
        }, 2000)
      } else if (data.status === 'FAILED') {
        setPaymentStatus('FAILED')
        setStatusMessage(data.message || 'Payment failed. Please try again.')
        setIsPolling(false)
      } else {
        setPaymentStatus('PENDING')
        setStatusMessage('Waiting for payment approval...')
        setTimeout(() => checkPaymentStatus(transactionId), 5000)
      }
    } catch (error) {
      console.error('Error checking payment status:', error)
      setStatusMessage('Error checking payment status')
      setIsPolling(false)
    }
  }

  const handlePayment = async () => {
    if (!selectedProvider || !isPhoneValid || !registrationId) {
      toast.error("Please select a payment method and enter a valid phone number")
      return
    }

    try {
      setLoading(true)

      const paymentRequest = {
        registrationId: registrationId,
        amount: totalPrice,
        provider: selectedProvider.toLowerCase() as 'mtn' | 'orange',
        phoneNumber: phoneNumber
      }

      const response = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentRequest)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Payment failed')
      }

      if (data.success && data.transactionId) {
        setPaymentTransactionId(data.transactionId)
        toast.success('Payment request sent. Check your phone to approve.')
        
        // Start polling for payment status
        setIsPolling(true)
        checkPaymentStatus(data.transactionId)
      } else {
        throw new Error('Payment failed')
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Payment failed')
    } finally {
      setLoading(false)
    }
  }

  const formatEventTime = (date: string, time: string) => {
    try {
      const dateObj = new Date(`${date}T${time}`)
      return format(dateObj, 'PPP p')
    } catch (e) {
      return `${date} ${time}`
    }
  }

  const renderStep = () => {
    switch (step) {
      case 1: // Attendee selection
        return (
          <>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{formatEventTime(event.event_date, event.event_time)}</span>
                  </div>
                </div>
                <div>
                  <Badge variant="outline" className="mb-2">
                    {event.category || 'Event'}
                  </Badge>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{event.capacity - (event.registered_attendees || 0)} spots left</span>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div>
                  <Label htmlFor="attendees">Number of Attendees</Label>
                  <div className="flex items-center space-x-4 mt-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setAttendees(Math.max(1, attendees - 1))}
                      disabled={attendees <= 1}
                    >
                      -
                    </Button>
                    <span className="text-xl font-semibold w-8 text-center">{attendees}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setAttendees(Math.min(event.capacity - (event.registered_attendees || 0), attendees + 1))}
                      disabled={attendees >= event.capacity - (event.registered_attendees || 0)}
                    >
                      +
                    </Button>
                  </div>
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span>Price per attendee</span>
                    <span>{event.price} FCFA</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>{totalPrice} FCFA</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <Button onClick={handleCreateRegistration} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Continue to Payment
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </>
        )

      case 2: // Payment
        return (
          <>
            <div className="space-y-6">
              <div className="bg-muted p-4 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span>Event</span>
                  <span>{event.title}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Attendees</span>
                  <span>{attendees}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>{totalPrice} FCFA</span>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <Label>Select Payment Method</Label>
                <PaymentMethodSelector
                  providers={providers}
                  selectedProvider={selectedProvider}
                  onSelect={(provider) => setSelectedProvider(provider as PaymentProviderType)}
                />

                {selectedProvider && (
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number for {selectedProvider}</Label>
                    <PhoneNumberInput
                      value={phoneNumber}
                      onChange={(value) => setPhoneNumber(value)}
                      onValidityChange={(isValid) => setIsPhoneValid(isValid)}
                    />
                  </div>
                )}

                {paymentTransactionId && (
                  <div className={`p-4 rounded-lg ${
                    paymentStatus === 'SUCCESSFUL' ? 'bg-green-50 text-green-700' :
                    paymentStatus === 'FAILED' ? 'bg-red-50 text-red-700' :
                    'bg-blue-50 text-blue-700'
                  }`}>
                    <div className="flex items-center">
                      {paymentStatus === 'SUCCESSFUL' ? (
                        <Check className="h-5 w-5 mr-2" />
                      ) : (
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      )}
                      <p>{statusMessage}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end mt-6">
              {!paymentTransactionId ? (
                <Button 
                  onClick={handlePayment} 
                  disabled={loading || !selectedProvider || !isPhoneValid}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Pay Now'
                  )}
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => router.push('/registrations')}
                  disabled={isPolling}
                >
                  View My Registrations
                </Button>
              )}
            </div>
          </>
        )

      case 3: // Confirmation
        return (
          <div className="text-center py-8">
            <div className="bg-green-50 text-green-700 p-4 rounded-lg mb-6">
              <Check className="h-8 w-8 mx-auto mb-2" />
              <h3 className="text-lg font-semibold">Registration Successful!</h3>
              <p>Your registration for this event has been confirmed.</p>
            </div>
            
            <Button onClick={() => router.push('/registrations')}>
              View My Registrations
            </Button>
          </div>
        )
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {step === 1 ? 'Register for Event' : 
             step === 2 ? 'Payment' : 
             'Registration Complete'}
          </DialogTitle>
        </DialogHeader>
        {renderStep()}
      </DialogContent>
    </Dialog>
  )
}
