import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { PaymentService } from '@/lib/payment/payment-service';

export async function POST(request: Request) {
  try {
    console.log('🔄 Payment creation API called');
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const paymentService = new PaymentService(supabase);

    // Get request body
    const body = await request.json();
    const { registrationId, amount, provider, phoneNumber } = body;
    console.log('📦 Payment request body:', { registrationId, amount, provider, phoneNumber });

    // Validate request
    if (!registrationId || !amount || !provider || !phoneNumber) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create payment
    console.log('🚀 Calling payment service with registration ID:', registrationId);
    const result = await paymentService.createPayment({
      registrationId,  // Use registrationId instead of bookingId
      amount,
      provider,
      phoneNumber
    });

    console.log('✅ Payment initiated successfully:', result);
    return NextResponse.json(result);
  } catch (error) {
    console.error('❌ Payment creation error:', error);
    
    // Check if error is a database error
    const dbError = error as any;
    if (dbError?.code) {
      console.error('Database error code:', dbError.code);
      console.error('Database error details:', dbError.details);
      console.error('Database error hint:', dbError.hint);
    }
    
    // Log full error object for debugging
    console.error('Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Payment creation failed',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
