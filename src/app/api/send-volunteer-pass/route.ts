import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import QRCode from 'qrcode';

const EMAILJS_SERVICE_ID = 'service_7cfhrr5';
const EMAILJS_TEMPLATE_ID = 'template_1r36hlv';
const EMAILJS_PUBLIC_KEY = 'JIIK8s48HT1F6ccfl';
const EMAILJS_PRIVATE_KEY = process.env.EMAILJS_PRIVATE_KEY || 'cqXbdIMW85jCxqRIiQkWA';

export async function POST(request: NextRequest) {
  try {
    const { pass, qrDataURL, qrString, qrOnlineUrl } = await request.json();

    if (!pass || !pass.volunteerEmail) {
      return NextResponse.json({ success: false, message: 'Volunteer email is required' }, { status: 400 });
    }

    const finalQrOnlineUrl = qrOnlineUrl || `https://api.qrserver.com/v1/create-qr-code/?size=250x250&margin=10&data=${encodeURIComponent(qrString || `VOLUNTEER_PASS:${JSON.stringify(pass)}`)}`;

    let finalQrDataUrl = qrDataURL;
    if (!finalQrDataUrl) {
      const qrData = qrString || `VOLUNTEER_PASS:${JSON.stringify(pass)}`;
      finalQrDataUrl = await QRCode.toDataURL(qrData, {
        width: 320,
        margin: 2,
        color: {
          dark: '#1e293b',
          light: '#ffffff',
        },
      });
    }

    // 1. Try sending via EmailJS REST API using the Private Key (Access Token)
    try {
      const emailJsPayload = {
        service_id: EMAILJS_SERVICE_ID,
        template_id: EMAILJS_TEMPLATE_ID,
        user_id: EMAILJS_PUBLIC_KEY,
        accessToken: EMAILJS_PRIVATE_KEY,
        template_params: {
          email: pass.volunteerEmail,
          to_email: pass.volunteerEmail,
          recipient_email: pass.volunteerEmail,
          user_email: pass.volunteerEmail,
          reply_to: 'vidyaranyapuramutt@gmail.com',
          from_name: 'Volunteer Seva Team - Mathaji Ulsooramma Mutt',

          volunteer_name: pass.volunteerName,
          volunteerName: pass.volunteerName,
          to_name: pass.volunteerName,
          name: pass.volunteerName,

          seva_title: pass.dutyTitle,
          sevaTitle: pass.dutyTitle,
          duty_title: pass.dutyTitle,
          duty: pass.dutyTitle,
          seva: pass.dutyTitle,

          duty_date: pass.dutyDate,
          dutyDate: pass.dutyDate,
          date: pass.dutyDate,

          shift_timing: pass.dutyTime,
          shiftTiming: pass.dutyTime,
          duty_time: pass.dutyTime,
          timing: pass.dutyTime,
          time: pass.dutyTime,

          assigned_location: pass.dutyLocation,
          assignedLocation: pass.dutyLocation,
          duty_location: pass.dutyLocation,
          location: pass.dutyLocation,
          gate: pass.dutyLocation,

          qr_code: finalQrOnlineUrl,
          qrCode: finalQrOnlineUrl,
          qr_image_url: finalQrOnlineUrl,
          badge_level: pass.badgeLevel,
          instructions: pass.instructions || '',
          message: pass.instructions || '',
        }
      };

      const emailJsRes = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailJsPayload)
      });

      if (emailJsRes.ok) {
        const text = await emailJsRes.text();
        console.log('Volunteer pass sent via EmailJS REST API:', text);
        return NextResponse.json({
          success: true,
          message: 'Volunteer pass sent via EmailJS API',
          mode: 'emailjs'
        });
      } else {
        const errorText = await emailJsRes.text();
        console.warn('EmailJS REST API response:', errorText);
      }
    } catch (eJsErr) {
      console.warn('EmailJS REST API call failed:', eJsErr);
    }

    // 2. Nodemailer SMTP Fallback
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const emailHtml = `
<table style="background: #f5f5f5; padding: 30px 10px;" width="100%" cellspacing="0" cellpadding="0">
<tbody>
<tr>
<td align="center">
<table style="max-width: 600px; width: 100%; background: #ffffff; border-radius: 14px; overflow: hidden;" width="600" cellspacing="0" cellpadding="0">
<tbody>
<tr>
<td style="padding: 28px 20px 20px;" align="center">
<h2 style="margin: 0; font-size: 22px; color: #1e293b;">🙏 Welcome to the Volunteer Seva Team! 🙏</h2>
<p style="margin: 10px 0 0; color: #666; font-size: 14px;">Mathaji Ulsooramma Raghavendra Swamy Mutt</p>
<p style="margin: 4px 0 0; color: #777; font-size: 13px;">Vidyaranyapura, Bangalore</p>
</td>
</tr>
<tr>
<td style="padding: 10px 30px;">
<p style="font-size: 16px; color: #333;">Dear <strong>${pass.volunteerName}</strong>,</p>
<p style="font-size: 14px; line-height: 1.6; color: #555;">We are pleased to welcome you to the <strong>Volunteer Seva Team</strong>. Your QR Duty Pass has been generated for your seva.</p>
</td>
</tr>
<tr>
<td style="padding: 10px 30px;">
<table style="background: #fafafa; border-radius: 10px; height: 200px;" width="100%" cellspacing="0" cellpadding="10">
<tbody>
<tr style="height: 40px;">
<td style="font-size: 14px; color: #666;">📌 <strong>Seva</strong></td>
<td style="font-size: 14px; color: #333; font-weight: bold;">${pass.dutyTitle}</td>
</tr>
<tr style="height: 40px;">
<td style="font-size: 14px; color: #666;">📅 <strong>Date</strong></td>
<td style="font-size: 14px; color: #333; font-weight: bold;">${pass.dutyDate}</td>
</tr>
<tr style="height: 40px;">
<td style="font-size: 14px; color: #666;">⏰ <strong>Timing</strong></td>
<td style="font-size: 14px; color: #333; font-weight: bold;">${pass.dutyTime}</td>
</tr>
<tr style="height: 40px;">
<td style="font-size: 14px; color: #666;">📍 <strong>Location/Gate</strong></td>
<td style="font-size: 14px; color: #333; font-weight: bold;">${pass.dutyLocation}</td>
</tr>
</tbody>
</table>
</td>
</tr>
<tr>
<td style="padding: 25px 30px;" align="center">
<h3 style="margin: 0 0 8px; font-size: 18px; color: #333;">🎫 Your QR Duty Pass</h3>
<p style="margin: 0 0 18px; font-size: 13px; color: #777;">Please present this QR code at the designated entry point.</p>
<div style="background: #ffffff; padding: 15px; display: inline-block; border: 1px solid #eeeeee; border-radius: 10px;">
  <img style="display: block; width: 250px; height: 250px;" src="${finalQrOnlineUrl}" alt="Volunteer QR Code" width="250" height="250" />
</div>
<p style="margin: 15px 0 0; font-size: 13px; color: #777;">Scan for Entry &amp; Attendance Verification</p>
</td>
</tr>
<tr>
<td style="padding: 10px 30px 25px;">
<p style="font-size: 14px; line-height: 1.6; color: #555;">Please keep this QR pass safely on your phone. It will be used for <strong>entry and attendance verification</strong>.</p>
<p style="font-size: 14px; color: #555;">🙏 Thank you for your valuable seva. We look forward to your participation!</p>
<p style="font-size: 14px; color: #333; margin-bottom: 0;"><strong>Regards,</strong><br>Volunteer Seva Team<br>Mathaji Ulsooramma Raghavendra Swamy Mutt<br>Vidyaranyapura, Bangalore</p>
</td>
</tr>
</tbody>
</table>
</td>
</tr>
</tbody>
</table>
    `;

    const mailOptions: any = {
      from: process.env.EMAIL_FROM || 'info@vidyaranyapuramutt.org',
      to: pass.volunteerEmail,
      subject: `🎫 Volunteer QR Duty Pass - ${pass.dutyTitle || 'Mathaji Ulsooramma Raghavendra Swamy Mutt'}`,
      html: emailHtml,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Volunteer pass email sent via SMTP fallback:', info.messageId);

    return NextResponse.json({
      success: true,
      message: 'Volunteer pass sent successfully via SMTP fallback',
      messageId: info.messageId,
      mode: 'smtp'
    });
  } catch (error: any) {
    console.error('Failed to send volunteer pass email:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to send volunteer pass email' },
      { status: 500 }
    );
  }
}
