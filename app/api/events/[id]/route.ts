import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// API endpoint for fetching a single event by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const eventId = params.id;
    
    if (!eventId) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      );
    }
    
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Get the event with organizer details
    const { data: event, error } = await supabase
      .from('events')
      .select(`
        *,
        organizer:profiles(id, full_name, avatar_url),
        category:event_categories(name, description)
      `)
      .eq('id', eventId)
      .single();
    
    if (error) {
      console.error('Error fetching event:', error);
      return NextResponse.json(
        { error: 'Failed to fetch event details' },
        { status: 500 }
      );
    }
    
    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }
    
    // Get registration count for this event
    const { count: registrationCount, error: countError } = await supabase
      .from('event_registrations')
      .select('*', { count: 'exact' })
      .eq('event_id', eventId)
      .eq('status', 'confirmed');
    
    if (countError) {
      console.error('Error fetching registration count:', countError);
    }
    
    // Get current user's registration status if logged in
    const { data: { user } } = await supabase.auth.getUser();
    let userRegistration = null;
    
    if (user) {
      const { data: registration } = await supabase
        .from('event_registrations')
        .select('*')
        .eq('event_id', eventId)
        .eq('user_id', user.id)
        .maybeSingle();
      
      userRegistration = registration;
    }
    
    // Format response
    return NextResponse.json({
      event,
      registrationCount: registrationCount || 0,
      userRegistration,
      isOrganizer: user ? event.organizer.id === user.id : false
    });
  } catch (error) {
    console.error('Unexpected error in event details endpoint:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

// API endpoint for updating an event
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const eventId = params.id;
    const body = await request.json();
    
    if (!eventId) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      );
    }
    
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Check if user is the organizer or admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    
    const { data: event } = await supabase
      .from('events')
      .select('organizer_id')
      .eq('id', eventId)
      .single();
    
    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }
    
    const isOrganizer = event.organizer_id === user.id;
    const isAdmin = profile?.role === 'admin';
    
    if (!isOrganizer && !isAdmin) {
      return NextResponse.json(
        { error: 'Not authorized to update this event' },
        { status: 403 }
      );
    }
    
    // Update the event
    const { data, error } = await supabase
      .from('events')
      .update({
        title: body.title,
        description: body.description,
        location: body.location,
        event_date: body.event_date,
        event_time: body.event_time,
        price: body.price,
        capacity: body.capacity,
        image_url: body.image_url,
        category: body.category,
        status: body.status,
        updated_at: new Date().toISOString()
      })
      .eq('id', eventId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating event:', error);
      return NextResponse.json(
        { error: 'Failed to update event' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      message: 'Event updated successfully',
      event: data
    });
  } catch (error) {
    console.error('Unexpected error in event update endpoint:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

// API endpoint for deleting an event
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const eventId = params.id;
    
    if (!eventId) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      );
    }
    
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Check if user is the organizer or admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    
    const { data: event } = await supabase
      .from('events')
      .select('organizer_id')
      .eq('id', eventId)
      .single();
    
    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }
    
    const isOrganizer = event.organizer_id === user.id;
    const isAdmin = profile?.role === 'admin';
    
    if (!isOrganizer && !isAdmin) {
      return NextResponse.json(
        { error: 'Not authorized to delete this event' },
        { status: 403 }
      );
    }
    
    // Delete the event
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId);
    
    if (error) {
      console.error('Error deleting event:', error);
      return NextResponse.json(
        { error: 'Failed to delete event' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error('Unexpected error in event delete endpoint:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
