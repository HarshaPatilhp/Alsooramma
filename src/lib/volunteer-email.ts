import emailjs from '@emailjs/browser';
import QRCode from 'qrcode';

export interface VolunteerPassPayload {
  volunteerId: string;
  volunteerName: string;
  volunteerEmail: string;
  volunteerPhone?: string;
  role?: string;
  dutyTitle: string;
  dutyDate: string;
  dutyTime: string;
  dutyLocation: string;
  badgeLevel: string;
  instructions?: string;
}

const DEFAULT_EMAILJS_SERVICE_ID = 'service_7cfhrr5';
const DEFAULT_EMAILJS_TEMPLATE_ID = 'template_1r36hlv';
const DEFAULT_EMAILJS_PUBLIC_KEY = 'JIIK8s48HT1F6ccfl';

/**
 * Encodes volunteer pass information into a structured QR code string.
 */
export function generateVolunteerPassCode(pass: VolunteerPassPayload): string {
  const payload = {
    type: 'VOLUNTEER_PASS',
    id: pass.volunteerId,
    name: pass.volunteerName,
    email: pass.volunteerEmail,
    role: pass.role || 'volunteer',
    duty: pass.dutyTitle,
    date: pass.dutyDate,
    time: pass.dutyTime,
    location: pass.dutyLocation,
    badge: pass.badgeLevel,
    issuedAt: new Date().toISOString()
  };
  return `VOLUNTEER_PASS:${JSON.stringify(payload)}`;
}

/**
 * Generates a Base64 PNG data URL of the QR code.
 */
export async function generateVolunteerQRCodeDataURL(pass: VolunteerPassPayload): Promise<string> {
  const qrString = generateVolunteerPassCode(pass);
  return await QRCode.toDataURL(qrString, {
    width: 320,
    margin: 2,
    color: {
      dark: '#1e293b',
      light: '#ffffff',
    },
  });
}

/**
 * Generates an online public QR image URL that renders directly inside EmailJS <img> tags.
 */
export function generateOnlineQRImageUrl(pass: VolunteerPassPayload): string {
  const qrString = generateVolunteerPassCode(pass);
  return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&margin=10&data=${encodeURIComponent(qrString)}`;
}

/**
 * Sends a Volunteer Duty & Badge QR Pass email via EmailJS (template_1r36hlv).
 */
export async function sendVolunteerPassEmail(pass: VolunteerPassPayload): Promise<{ success: boolean; message: string; mode: 'emailjs' | 'smtp' | 'fallback' }> {
  const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || DEFAULT_EMAILJS_SERVICE_ID;
  const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || DEFAULT_EMAILJS_TEMPLATE_ID;
  const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || DEFAULT_EMAILJS_PUBLIC_KEY;

  const qrDataURL = await generateVolunteerQRCodeDataURL(pass);
  const qrString = generateVolunteerPassCode(pass);
  const qrOnlineUrl = generateOnlineQRImageUrl(pass);

  // Exact parameter mapping matching the user's template:
  // {{volunteer_name}}, {{seva_title}}, {{duty_date}}, {{shift_timing}}, {{assigned_location}}, {{qr_code}}
  const templateParams: Record<string, any> = {
    // Exact template variables
    volunteer_name: pass.volunteerName,
    seva_title: pass.dutyTitle,
    duty_date: pass.dutyDate,
    shift_timing: pass.dutyTime,
    assigned_location: pass.dutyLocation,
    qr_code: qrOnlineUrl, // <img src="{{qr_code}}">

    // Additional aliases for safety
    to_name: pass.volunteerName,
    name: pass.volunteerName,
    to_email: pass.volunteerEmail,
    recipient_email: pass.volunteerEmail,
    user_email: pass.volunteerEmail,
    email: pass.volunteerEmail,
    reply_to: 'harshapatilhp1@gmail.com',
    from_name: 'Volunteer Seva Team - Mathaji Ulsooramma Mutt',

    duty_title: pass.dutyTitle,
    duty_time: pass.dutyTime,
    duty_location: pass.dutyLocation,
    badge_level: pass.badgeLevel,
    instructions: pass.instructions || '',
    message: pass.instructions || '',
    qr_image_url: qrOnlineUrl,
  };

  // 1. Send via EmailJS Browser SDK
  try {
    emailjs.init({ publicKey });

    console.log('Sending EmailJS with template_1r36hlv to:', pass.volunteerEmail, templateParams);
    const response = await emailjs.send(serviceId, templateId, templateParams, { publicKey });

    if (response.status === 200) {
      console.log('EmailJS response success:', response);
      return { success: true, message: 'Email sent via EmailJS successfully!', mode: 'emailjs' };
    }
  } catch (emailjsErr: any) {
    console.warn('Client EmailJS SDK attempt encountered issue, attempting server dispatch route:', emailjsErr?.text || emailjsErr?.message || emailjsErr);
  }

  // 2. Server-side Route Fallback
  try {
    const res = await fetch('/api/send-volunteer-pass', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pass, qrDataURL, qrString, qrOnlineUrl }),
    });

    const data = await res.json();
    if (data.success) {
      return { 
        success: true, 
        message: data.message || 'Email dispatched successfully!', 
        mode: data.mode || 'smtp' 
      };
    } else {
      throw new Error(data.message || 'Server email failed');
    }
  } catch (err: any) {
    console.error('All email dispatch methods failed:', err);
    return {
      success: false,
      message: err.message || 'Failed to dispatch volunteer email pass.',
      mode: 'fallback'
    };
  }
}
