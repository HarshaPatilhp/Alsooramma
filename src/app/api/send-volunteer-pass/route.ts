import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import QRCode from 'qrcode';

const EMAILJS_SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || 'service_7cfhrr5';
const EMAILJS_TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || 'template_1r36hlv';
const EMAILJS_PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || 'JIIK8s48HT1F6ccfl';
const EMAILJS_PRIVATE_KEY = process.env.EMAILJS_PRIVATE_KEY || 'cqXbdIMW85jCxqRIiQkWA';

export async function POST(request: NextRequest) {
  try {
    const { pass, qrDataURL, qrString } = await request.json();

    if (!pass || !pass.volunteerEmail) {
      return NextResponse.json({ success: false, message: 'Volunteer email is required' }, { status: 400 });
    }

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
          to_name: pass.volunteerName,
          to_email: pass.volunteerEmail,
          recipient_email: pass.volunteerEmail,
          user_email: pass.volunteerEmail,
          email: pass.volunteerEmail,
          name: pass.volunteerName,
          duty_title: pass.dutyTitle,
          duty_date: pass.dutyDate,
          duty_time: pass.dutyTime,
          duty_location: pass.dutyLocation,
          badge_level: pass.badgeLevel,
          instructions: pass.instructions || 'Please arrive 15 minutes before your shift and present this QR pass at the entrance.',
          qr_code: qrString || `VOLUNTEER_PASS:${JSON.stringify(pass)}`,
          qr_image_url: finalQrDataUrl,
          message: pass.instructions || 'Thank you for your dedicated service at Sri Raghavendra Swamy Mutt.'
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
        console.warn('EmailJS REST API responded with error, falling back to Nodemailer SMTP:', errorText);
      }
    } catch (eJsErr) {
      console.warn('EmailJS REST API call failed, falling back to Nodemailer SMTP:', eJsErr);
    }

    // 2. Nodemailer SMTP Fallback
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: false, // Use TLS
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Swayamsevak Duty Pass & QR Badge</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1e293b; margin: 0; padding: 0; background: #f8fafc; }
    .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; }
    .header { background: linear-gradient(135deg, #ea580c 0%, #f59e0b 100%); color: white; padding: 28px 24px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
    .header p { margin: 6px 0 0 0; font-size: 13px; opacity: 0.95; font-weight: 500; }
    .badge-tag { display: inline-block; background: rgba(255,255,255,0.25); color: #fff; padding: 4px 14px; border-radius: 999px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-top: 10px; border: 1px solid rgba(255,255,255,0.4); }
    .content { padding: 28px 24px; }
    .greeting { font-size: 18px; font-weight: 700; color: #0f172a; margin-top: 0; }
    .card { background: #fff7ed; border: 1.5px solid #fed7aa; border-radius: 12px; padding: 18px; margin: 20px 0; }
    .card-title { font-size: 14px; font-weight: 800; color: #9a3412; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 0.5px; }
    .qr-section { text-align: center; background: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 16px; padding: 24px; margin: 24px 0; }
    .qr-img { width: 220px; height: 220px; border-radius: 12px; border: 4px solid #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .qr-caption { font-size: 12px; font-weight: 600; color: #64748b; margin-top: 10px; }
    .instructions { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 16px; margin: 20px 0; font-size: 13px; color: #166534; }
    .instructions h4 { margin: 0 0 6px 0; font-size: 13px; font-weight: 800; text-transform: uppercase; color: #15803d; }
    .footer { text-align: center; padding: 20px; background: #f1f5f9; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🙏 Swayamsevak Duty Pass</h1>
      <p>Sri Mathaji Ulsooramma Raghavendra Swamy Mutt, Vidyaranyapura</p>
      <div class="badge-tag">🎖️ ${pass.badgeLevel || 'Active Swayamsevak'}</div>
    </div>

    <div class="content">
      <h2 class="greeting">Hare Srinivasa, ${pass.volunteerName}!</h2>
      <p style="font-size: 14px; color: #475569; line-height: 1.5;">
        Thank you for offering your sacred service for the Mutt. Please find your official volunteer entry pass and QR code verification ticket below.
      </p>

      <div class="card">
        <div class="card-title">📋 Assigned Seva & Duty Schedule</div>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          <tr>
            <td style="padding: 6px 0; font-weight: 600; color: #7c2d12; width: 40%;">Duty Assignment:</td>
            <td style="padding: 6px 0; font-weight: 700; color: #1e293b;">${pass.dutyTitle || 'Temple Operations'}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: 600; color: #7c2d12;">Duty Date:</td>
            <td style="padding: 6px 0; font-weight: 700; color: #1e293b;">${pass.dutyDate || 'Scheduled Day'}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: 600; color: #7c2d12;">Shift Timing:</td>
            <td style="padding: 6px 0; font-weight: 700; color: #1e293b;">${pass.dutyTime || 'As scheduled'}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: 600; color: #7c2d12;">Reporting Gate/Hall:</td>
            <td style="padding: 6px 0; font-weight: 700; color: #1e293b;">${pass.dutyLocation || 'Main Temple Entrance'}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: 600; color: #7c2d12;">Badge Level:</td>
            <td style="padding: 6px 0; font-weight: 700; color: #ea580c;">${pass.badgeLevel || 'Standard Sevak'}</td>
          </tr>
        </table>
      </div>

      <div class="qr-section">
        <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 800; color: #0f172a;">📱 Your Volunteer QR Pass</h3>
        <p style="font-size: 12px; color: #64748b; margin: 0 0 16px 0;">Present this QR code to the Admin/Scanner at the gate to claim your Seva Badge & check-in.</p>
        <img src="cid:volunteer-qrcode" class="qr-img" alt="Volunteer QR Code" />
        <div class="qr-caption">Pass ID: ${pass.volunteerId}</div>
      </div>

      <div class="instructions">
        <h4>⏰ Important Instructions:</h4>
        <ul style="margin: 0; padding-left: 18px; line-height: 1.6;">
          <li>Please arrive at the temple 15 minutes before your shift starts.</li>
          <li>Wear traditional attire suitable for temple seva service.</li>
          <li>The Admin will scan this QR at the gate to award your Duty Badge and confirm attendance.</li>
          ${pass.instructions ? `<li><strong>Notes:</strong> ${pass.instructions}</li>` : ''}
        </ul>
      </div>

      <p style="font-size: 13px; color: #64748b; text-align: center; margin-top: 24px;">
        May Sri Moola Rama, Sri Raghavendra Gurugalu shower their supreme blessings upon you and your family.
      </p>
    </div>

    <div class="footer">
      <p style="margin: 0 0 4px 0; font-weight: 700;">Sri Mathaji Ulsooramma Raghavendra Swamy Mutt</p>
      <p style="margin: 0;">Vidyaranyapura, Bangalore • Swayamsevak Sangha Portal</p>
    </div>
  </div>
</body>
</html>
    `;

    const mailOptions: any = {
      from: process.env.EMAIL_FROM || 'info@vidyaranyapuramutt.org',
      to: pass.volunteerEmail,
      subject: `🎖️ Swayamsevak Duty Pass & QR Badge - ${pass.dutyTitle || 'Sri Raghavendra Swamy Mutt'}`,
      html: emailHtml,
      attachments: [
        {
          filename: `volunteer-pass-${pass.volunteerId}.png`,
          content: finalQrDataUrl.split('base64,')[1],
          encoding: 'base64',
          cid: 'volunteer-qrcode',
        },
      ],
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
