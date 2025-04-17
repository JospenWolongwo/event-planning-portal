import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { SMSService } from '@/lib/notifications/sms-service';

// API endpoint for generating verification codes for event registrations
export async function POST(request: Request) {
  try {
    console.log('🔄 API: Registration verification code generation request received');
    
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (!user) {
      console.error('❌ API: User not authenticated');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get request body
    const body = await request.json();
    const { registrationId } = body;

    if (!registrationId) {
      console.error('❌ API: Missing registrationId in request body');
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    console.log('🔍 API: Looking for registration with ID:', registrationId);
    console.log('👤 API: User ID:', user.id);

    // Check if the registration exists
    const { data: registration, error: registrationError } = await supabase
      .from('event_registrations')
      .select('id, user_id, event_id')
      .eq('id', registrationId)
      .single();

    if (registrationError || !registration) {
      console.error('❌ API: Registration not found', registrationError);
      return NextResponse.json(
        { error: 'Registration not found', details: registrationError?.message },
        { status: 404 }
      );
    }

    // Verify that the user owns this registration
    if (registration.user_id !== user.id) {
      console.error('❌ API: User does not own this registration');
      return NextResponse.json(
        { error: 'Unauthorized - you do not own this registration' },
        { status: 403 }
      );
    }

    // Generate a 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('🔑 API: Generated verification code for registration');

    // Store the verification code in the database
    const { data: codeData, error: codeError } = await supabase
      .from('registration_verification_codes')
      .insert([
        {
          registration_id: registrationId,
          code: verificationCode,
          expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes from now
        },
      ])
      .select()
      .single();

    if (codeError) {
      console.error('❌ API: Error storing verification code', codeError);
      return NextResponse.json(
        { error: 'Failed to generate verification code', details: codeError.message },
        { status: 500 }
      );
    }

    // Get the user's phone number
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('phone')
      .eq('id', user.id)
      .single();

    if (profileError || !profile || !profile.phone) {
      console.error('❌ API: Error fetching user phone number', profileError);
      return NextResponse.json(
        { error: 'Failed to fetch user phone number', details: profileError?.message },
        { status: 500 }
      );
    }

    // Get event details
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('title, event_date, event_time')
      .eq('id', registration.event_id)
      .single();

    if (eventError || !event) {
      console.error('❌ API: Error fetching event details', eventError);
      return NextResponse.json(
        { error: 'Failed to fetch event details', details: eventError?.message },
        { status: 500 }
      );
    }

    // Format date and time for SMS
    const eventDate = new Date(event.event_date);
    const formattedDate = `${eventDate.getDate()}/${eventDate.getMonth() + 1}/${eventDate.getFullYear()}`;
    
    // Send SMS with verification code
    const smsService = new SMSService({
      accountSid: process.env.TWILIO_ACCOUNT_SID!,
      authToken: process.env.TWILIO_AUTH_TOKEN!,
      fromNumber: process.env.TWILIO_FROM_NUMBER!,
      environment: (process.env.NODE_ENV === 'production' ? 'production' : 'sandbox')
    });
    const message = `Your Event Portal verification code for ${event.title} on ${formattedDate} is: ${verificationCode}. This code will expire in 15 minutes.`;
    
    try {
      await smsService.sendMessage({
        to: profile.phone,
        message: message
      });
      console.log('✅ API: SMS sent successfully');
    } catch (smsError) {
      console.error('❌ API: Error sending SMS', smsError);
      return NextResponse.json(
        { error: 'Failed to send verification code via SMS', details: smsError },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Verification code sent',
      code_id: codeData.id,
    });
  } catch (error) {
    console.error('❌ API: Unexpected error in code generation', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred', details: error },
      { status: 500 }
    );
  }
}
