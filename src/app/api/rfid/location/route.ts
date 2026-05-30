import { NextRequest, NextResponse } from 'next/server';
import { createClient, getSecureUser } from '../../../../utils/supabase/server';
import { withCors } from '../../../../utils/cors';

export const dynamic = 'force-dynamic';

// POST — Record an RFID location scan event
export const POST = withCors(async (request: NextRequest) => {
  try {
    const { location, metadata } = await request.json();
    if (!location || typeof location !== 'string') {
      return NextResponse.json({ message: 'Location is required' }, { status: 400 });
    }
    const user = await getSecureUser();
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const supabase = await createClient();
    const { error } = await supabase.from('rfid_scans').insert({
      student_id: user.id,
      location,
      event_type: 'location',
      metadata: metadata || null,
    });
    if (error) {
      console.error('Location scan insert error:', error.message);
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'Location recorded' }, { status: 201 });
  } catch (e) {
    console.error('Location route exception:', e);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
});

// GET — Retrieve latest location for users (role-based visibility)
export const GET = withCors(async (request: NextRequest) => {
  try {
    const user = await getSecureUser();
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const supabase = await createClient();

    // Fetch the current user's role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const userRole = profile?.role || 'student';

    // Build the query for latest scans — get most recent per user
    // Visibility rules:
    //   admin   → sees everyone
    //   teacher → sees students & other teachers
    //   parent  → sees students only
    //   student → sees teachers only
    let query = supabase
      .from('rfid_scans')
      .select('student_id, location, scanned_at, metadata')
      .eq('event_type', 'location')
      .order('scanned_at', { ascending: false })
      .limit(200);

    const { data: scans, error } = await query;
    if (error) {
      console.error('Location fetch error:', error.message);
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    // Deduplicate: keep only the latest scan per student_id
    const latestByUser = new Map<string, any>();
    for (const scan of scans || []) {
      if (!latestByUser.has(scan.student_id)) {
        latestByUser.set(scan.student_id, scan);
      }
    }

    // Fetch profiles for all users in the result to filter by role
    const userIds = Array.from(latestByUser.keys());
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, role, full_name')
      .in('id', userIds);

    const profileMap = new Map<string, any>();
    for (const p of profiles || []) {
      profileMap.set(p.id, p);
    }

    // Apply visibility filter
    const result: any[] = [];
    for (const [uid, scan] of latestByUser) {
      const targetProfile = profileMap.get(uid);
      if (!targetProfile) continue;
      const targetRole = targetProfile.role;

      let visible = false;
      if (userRole === 'admin') visible = true;
      else if (userRole === 'teacher' && (targetRole === 'student' || targetRole === 'teacher')) visible = true;
      else if (userRole === 'parent' && targetRole === 'student') visible = true;
      else if (userRole === 'student' && targetRole === 'teacher') visible = true;

      if (visible) {
        result.push({
          user_id: uid,
          name: targetProfile.full_name || 'Unknown',
          role: targetRole,
          location: scan.location,
          last_seen: scan.scanned_at,
          metadata: scan.metadata,
        });
      }
    }

    return NextResponse.json({ locations: result }, { status: 200 });
  } catch (e) {
    console.error('Location GET exception:', e);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
});
