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

// Strictly Volunteer EmailJS Account 2
const VOLUNTEER_EMAILJS_SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_VOLUNTEER_SERVICE_ID || 'service_a5uozgh';
const VOLUNTEER_EMAILJS_TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_VOLUNTEER_TEMPLATE_ID || 'template_1r36hlv';
const VOLUNTEER_EMAILJS_PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_VOLUNTEER_PUBLIC_KEY || 'JIIK8s48HT1F6ccfl';

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
 * Sends a Volunteer Duty & Badge QR Pass email via Volunteer EmailJS (template_1r36hlv & service_a5uozgh).
 */
export async function sendVolunteerPassEmail(pass: VolunteerPassPayload): Promise<{ success: boolean; message: string; mode: 'emailjs' | 'smtp' | 'fallback' }> {
  const serviceId = VOLUNTEER_EMAILJS_SERVICE_ID;
  const templateId = VOLUNTEER_EMAILJS_TEMPLATE_ID;
  const publicKey = VOLUNTEER_EMAILJS_PUBLIC_KEY;

  const qrDataURL = await generateVolunteerQRCodeDataURL(pass);
  const qrString = generateVolunteerPassCode(pass);
  const qrOnlineUrl = generateOnlineQRImageUrl(pass);

  // Complete parameter matrix supporting every single placeholder permutation in template_1r36hlv
  const templateParams: Record<string, any> = {
    // Volunteer Name
    volunteer_name: pass.volunteerName,
    volunteerName: pass.volunteerName,
    to_name: pass.volunteerName,
    name: pass.volunteerName,
    user_name: pass.volunteerName,

    // Seva / Duty
    seva_title: pass.dutyTitle,
    sevaTitle: pass.dutyTitle,
    duty_title: pass.dutyTitle,
    dutyTitle: pass.dutyTitle,
    duty: pass.dutyTitle,
    seva: pass.dutyTitle,
    title: pass.dutyTitle,

    // Date
    duty_date: pass.dutyDate,
    dutyDate: pass.dutyDate,
    date: pass.dutyDate,

    // Shift Timing
    shift_timing: pass.dutyTime,
    shiftTiming: pass.dutyTime,
    duty_time: pass.dutyTime,
    dutyTime: pass.dutyTime,
    time: pass.dutyTime,

    // Location / Gate
    assigned_location: pass.dutyLocation,
    assignedLocation: pass.dutyLocation,
    duty_location: pass.dutyLocation,
    location: pass.dutyLocation,
    gate: pass.dutyLocation,

    // QR Code Image
    qr_code: qrOnlineUrl,
    qrCode: qrOnlineUrl,
    qr_image_url: qrOnlineUrl,
    qr_url: qrOnlineUrl,
    pass_code: qrString,

    // Additional info
    badge_level: pass.badgeLevel,
    instructions: pass.instructions || '',
    message: pass.instructions || '',

    // Recipient & sender email
    email: pass.volunteerEmail,
    to_email: pass.volunteerEmail,
    recipient_email: pass.volunteerEmail,
    reply_to: 'vidyaranyapuramutt@gmail.com',
    from_name: 'Volunteer Seva Team - Mathaji Ulsooramma Mutt',
  };

  // 1. Send via EmailJS Browser SDK using Volunteer Public Key (JIIK8s48HT1F6ccfl)
  try {
    emailjs.init({ publicKey });

    console.log('Sending Volunteer Pass via EmailJS Account 2:', {
      service: serviceId,
      template: templateId,
      publicKey: publicKey,
      recipient: pass.volunteerEmail
    });

    const response = await emailjs.send(serviceId, templateId, templateParams, { publicKey });

    if (response.status === 200) {
      console.log('Volunteer EmailJS dispatch success:', response);
      return { success: true, message: 'Email sent via Volunteer EmailJS successfully!', mode: 'emailjs' };
    }
  } catch (emailjsErr: any) {
    console.warn('Volunteer EmailJS attempt error:', emailjsErr?.text || emailjsErr?.message || emailjsErr);
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
