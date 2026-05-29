import { NextRequest, NextResponse } from 'next/server';
import { createClient, getSecureUser } from '../../../../utils/supabase/server';
import { withCors } from '../../../../utils/cors';

export const dynamic = 'force-dynamic';

/**
 * Build a notification message for parents based on alert type.
 */
function buildAlertContent(type: string, data: Record<string, any>): { title: string; message: string } {
  switch (type) {
    case 'spend':
      return {
        title: '💳 Spending Alert',
        message: `Your child spent ₹${data.amount} at ${data.location}. Wallet balance: ₹${data.balance ?? 'N/A'}.`,
      };
    case 'low_balance':
      return {
        title: '⚠️ Low Balance Warning',
        message: `Your child's campus wallet is running low. Current balance: ₹${data.balance}. Please recharge soon.`,
      };
    case 'borrow':
      return {
        title: '📚 Item Borrowed',
        message: `Your child borrowed: ${data.item_name || 'an item'} (${data.item_type}). Due date: ${data.due_date}.`,
      };
    case 'overdue':
      return {
        title: '🚨 Overdue Item',
        message: `Your child has an overdue ${data.item_type}: ${data.item_name || 'item'}. Due date was: ${data.due_date}. Please return immediately.`,
      };
    case 'entry':
      return {
        title: '✅ Campus Entry',
        message: `Your child entered campus at ${data.location || 'Main Gate'}.`,
      };
    case 'exit':
      return {
        title: '👋 Campus Exit',
        message: `Your child left campus from ${data.location || 'Main Gate'}.`,
      };
    case 'attendance':
      return {
        title: '📋 Attendance Recorded',
        message: `Your child's attendance was recorded for ${data.course_code || 'a class'} at ${data.location || 'campus'}.`,
      };
    default:
      return {
        title: '🔔 Campus Alert',
        message: data.message || 'Activity detected on your child\'s campus account.',
      };
  }
}

// POST — Send an in-app notification to a parent (or any user)
export const POST = withCors(async (request: NextRequest) => {
  try {
    const { student_id, parent_id, type, ...extraData } = await request.json();

    if (!type) {
      return NextResponse.json({ message: 'Notification type is required' }, { status: 400 });
    }

    const user = await getSecureUser();
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();

    // Determine who to notify
    // If parent_id is provided, notify that parent directly
    // Otherwise, look up the parent linked to the student
    let targetUserId = parent_id;

    if (!targetUserId && student_id) {
      // Look up the parent for this student from profiles
      const { data: parentProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('linked_student_id', student_id)
        .eq('role', 'parent')
        .single();

      targetUserId = parentProfile?.id;
    }

    if (!targetUserId) {
      return NextResponse.json({ message: 'No parent found for this student' }, { status: 404 });
    }

    // Build the notification content
    const { title, message } = buildAlertContent(type, extraData);

    // Insert into the notifications table (triggers real-time push via Supabase)
    const { error } = await supabase.from('notifications').insert({
      user_id: targetUserId,
      title,
      message,
      read: false,
    });

    if (error) {
      console.error('Notification insert error:', error.message);
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Notification sent' }, { status: 201 });
  } catch (e: any) {
    console.error('Parent notify exception:', e);
    return NextResponse.json({ message: e.message || 'Server error' }, { status: 500 });
  }
});
