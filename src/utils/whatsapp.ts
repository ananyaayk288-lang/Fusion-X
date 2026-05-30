/**
 * Twilio WhatsApp messaging utility.
 * Uses the free Twilio sandbox for demo purposes.
 *
 * Required env vars:
 *   TWILIO_ACCOUNT_SID
 *   TWILIO_AUTH_TOKEN
 *   TWILIO_WHATSAPP_FROM  (e.g. "whatsapp:+14155238886")
 */

interface WhatsAppPayload {
  to: string;      // Parent's phone number with country code, e.g. "+919876543210"
  body: string;    // Message body
}

export async function sendWhatsAppMessage({ to, body }: WhatsAppPayload) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886';

  if (!accountSid || !authToken) {
    console.error('[WhatsApp] Missing TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN');
    throw new Error('Twilio credentials not configured');
  }

  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
  const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');

  const formData = new URLSearchParams();
  formData.append('From', from);
  formData.append('To', `whatsapp:${to}`);
  formData.append('Body', body);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData.toString(),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error('[WhatsApp] Twilio API error:', response.status, errorBody);
    throw new Error(`Twilio error: ${response.status}`);
  }

  return await response.json();
}

/**
 * Build a parent-friendly notification message.
 */
export function buildParentAlert(type: string, data: Record<string, any>): string {
  switch (type) {
    case 'spend':
      return `🔔 Smart Campus Alert\n\nYour child just spent ₹${data.amount} at ${data.location}.\nWallet balance: ₹${data.balance ?? 'N/A'}\nTime: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`;
    case 'low_balance':
      return `⚠️ Low Balance Alert\n\nYour child's campus wallet is running low.\nCurrent balance: ₹${data.balance}\nPlease recharge to avoid interruptions.`;
    case 'borrow':
      return `📚 Library Alert\n\nYour child borrowed: ${data.item_name || 'an item'}\nType: ${data.item_type}\nDue date: ${data.due_date}\nPlease ensure timely return to avoid fines.`;
    case 'overdue':
      return `🚨 Overdue Item Alert\n\nYour child has an overdue ${data.item_type}: ${data.item_name || 'item'}\nDue date was: ${data.due_date}\nPlease return it immediately to avoid penalties.`;
    case 'entry':
      return `✅ Campus Entry\n\nYour child entered campus at ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}.\nLocation: ${data.location || 'Main Gate'}`;
    case 'exit':
      return `👋 Campus Exit\n\nYour child left campus at ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}.\nLocation: ${data.location || 'Main Gate'}`;
    default:
      return `🔔 Smart Campus Notification\n\n${data.message || 'Activity detected on your child\'s campus account.'}`;
  }
}
