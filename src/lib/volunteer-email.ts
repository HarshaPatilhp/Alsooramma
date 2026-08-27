import emailjs from '@emailjs/browser';
import QRCode from 'qrcode';

export interface VolunteerPassPayload {
  volunteerId: string;
  volunteerName: string;
  volunteerEmail: string;
  volunteerPhone?: string;
  role: string;
  dutyTitle: string;
  dutyDate: string;
  dutyTime: string;
  dutyLocation: string;
  badgeLevel: string;
  instructions?: string;
}

/**
 * Encodes volunteer pass information into a structured QR code string.
 */
export function generateVolunteerPassCode(pass: VolunteerPassPayload): string {
  const payload = {
    type: 'VOLUNTEER_PASS',
    id: pass.volunteerId,
    name: pass.volunteerName,
    email: pass.volunteerEmail,
    role: pass.role,
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
 * Sends a Volunteer Duty & Badge QR Pass email.
 * First attempts to send using client-side EmailJS. If EmailJS is not configured
 * or fails, automatically falls back to our server-side API.
 */
export async function sendVolunteerPassEmail(pass: VolunteerPassPayload): Promise<{ success: boolean; message: string; mode: 'emailjs' | 'smtp' | 'fallback' }> {
  const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || '';
  const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || '';
  const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || '';

  const qrDataURL = await generateVolunteerQRCodeDataURL(pass);
  const qrString = generateVolunteerPassCode(pass);

  // 1. Try sending via EmailJS if credentials are present
  if (serviceId && templateId && publicKey) {
    try {
      const templateParams = {
        to_name: pass.volunteerName,
        to_email: pass.volunteerEmail,
        recipient_email: pass.volunteerEmail,
        duty_title: pass.dutyTitle,
        duty_date: pass.dutyDate,
        duty_time: pass.dutyTime,
        duty_location: pass.dutyLocation,
        badge_level: pass.badgeLevel,
        instructions: pass.instructions || 'Please arrive 15 minutes before your shift and present this QR pass at the entrance.',
        qr_code: qrString,
        qr_image_url: qrDataURL,
        message: pass.instructions || 'Thank you for your dedicated service at Sri Raghavendra Swamy Mutt.'
      };

      const response = await emailjs.send(serviceId, templateId, templateParams, publicKey);
      if (response.status === 200) {
        return { success: true, message: 'Email sent via EmailJS successfully!', mode: 'emailjs' };
      }
    } catch (emailjsErr) {
      console.warn('EmailJS sending failed or template variables mismatched, attempting server fallback:', emailjsErr);
    }
  }

  // 2. Server-side SMTP Fallback
  try {
    const res = await fetch('/api/send-volunteer-pass', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pass, qrDataURL, qrString }),
    });

    const data = await res.json();
    if (data.success) {
      return { success: true, message: 'Email sent via Server SMTP successfully!', mode: 'smtp' };
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
