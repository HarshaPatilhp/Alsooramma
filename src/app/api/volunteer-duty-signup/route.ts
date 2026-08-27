import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const { 
      applicantName, 
      applicantPhone, 
      applicantEmail, 
      applicantRole, 
      applicantAvailability, 
      shiftTitle, 
      shiftLocation, 
      shiftTime, 
      shiftDay 
    } = await request.json();

    if (!applicantName || !applicantPhone) {
      return NextResponse.json(
        { success: false, message: 'Applicant name and phone are required.' },
        { status: 400 }
      );
    }

    const targetRecipient = 'vidyaranyapuramutt@gmail.com';
    const currentTimeIST = new Date().toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'full',
      timeStyle: 'medium'
    });

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>New Swayamsevak Duty Shift Registration</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f4f6f9; margin: 0; padding: 20px;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
    <!-- Header Banner -->
    <tr>
      <td style="background: linear-gradient(135deg, #ea580c, #f59e0b); padding: 25px 20px; text-align: center; color: #ffffff;">
        <h1 style="margin: 0; font-size: 22px; font-weight: bold; letter-spacing: 0.5px;">🙏 New Swayamsevak Duty Shift Signup 🙏</h1>
        <p style="margin: 6px 0 0; font-size: 13px; opacity: 0.95;">Mathaji Ulsooramma Sri Raghavendra Swamy Mutt, Vidyaranyapura</p>
      </td>
    </tr>

    <!-- Body Content -->
    <tr>
      <td style="padding: 25px 30px;">
        <p style="font-size: 15px; color: #333333; margin-top: 0;">
          A new devotee has registered for the <strong>Sarvotham Swayamsevakar Sangha</strong> duty shift. Please find the details below:
        </p>

        <!-- Shift Details Box -->
        <table width="100%" cellspacing="0" cellpadding="8" style="background-color: #fff7ed; border: 1px solid #fed7aa; border-radius: 8px; margin: 15px 0 20px;">
          <tr>
            <td colspan="2" style="font-weight: bold; color: #c2410c; font-size: 14px; border-bottom: 1px solid #ffedd5; padding-bottom: 6px;">
              📌 Shift Details
            </td>
          </tr>
          <tr>
            <td width="35%" style="color: #666; font-size: 13px; font-weight: bold;">Duty Shift:</td>
            <td style="color: #1e293b; font-size: 13px; font-weight: bold;">${shiftTitle || 'General Temple Seva Shift'}</td>
          </tr>
          ${shiftDay ? `
          <tr>
            <td style="color: #666; font-size: 13px; font-weight: bold;">Day:</td>
            <td style="color: #1e293b; font-size: 13px;">${shiftDay}</td>
          </tr>
          ` : ''}
          ${shiftTime ? `
          <tr>
            <td style="color: #666; font-size: 13px; font-weight: bold;">Timing:</td>
            <td style="color: #1e293b; font-size: 13px;">${shiftTime}</td>
          </tr>
          ` : ''}
          ${shiftLocation ? `
          <tr>
            <td style="color: #666; font-size: 13px; font-weight: bold;">Location:</td>
            <td style="color: #1e293b; font-size: 13px;">${shiftLocation}</td>
          </tr>
          ` : ''}
        </table>

        <!-- Volunteer Information Box -->
        <table width="100%" cellspacing="0" cellpadding="8" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 20px;">
          <tr>
            <td colspan="2" style="font-weight: bold; color: #1e293b; font-size: 14px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px;">
              👤 Swayamsevak Information
            </td>
          </tr>
          <tr>
            <td width="35%" style="color: #666; font-size: 13px; font-weight: bold;">Full Name:</td>
            <td style="color: #0f172a; font-size: 13px; font-weight: bold;">${applicantName}</td>
          </tr>
          <tr>
            <td style="color: #666; font-size: 13px; font-weight: bold;">Phone / WhatsApp:</td>
            <td style="color: #0f172a; font-size: 13px;"><a href="tel:${applicantPhone}" style="color: #ea580c; text-decoration: none; font-weight: bold;">${applicantPhone}</a></td>
          </tr>
          ${applicantEmail ? `
          <tr>
            <td style="color: #666; font-size: 13px; font-weight: bold;">Email:</td>
            <td style="color: #0f172a; font-size: 13px;"><a href="mailto:${applicantEmail}" style="color: #ea580c; text-decoration: none;">${applicantEmail}</a></td>
          </tr>
          ` : ''}
          <tr>
            <td style="color: #666; font-size: 13px; font-weight: bold;">Preferred Domain:</td>
            <td style="color: #0f172a; font-size: 13px;">${applicantRole || 'Temple Operations'}</td>
          </tr>
          <tr>
            <td style="color: #666; font-size: 13px; font-weight: bold;">Availability:</td>
            <td style="color: #0f172a; font-size: 13px;">${applicantAvailability || 'As Assigned'}</td>
          </tr>
          <tr>
            <td style="color: #666; font-size: 13px; font-weight: bold;">Submitted At:</td>
            <td style="color: #64748b; font-size: 12px;">${currentTimeIST}</td>
          </tr>
        </table>

        <div style="text-align: center; margin: 25px 0 10px;">
          <a href="https://wa.me/${applicantPhone.replace(/\D/g, '')}" style="display: inline-block; background-color: #25D366; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: bold; padding: 10px 20px; border-radius: 8px; margin-right: 8px;">
            💬 WhatsApp Volunteer
          </a>
          <a href="tel:${applicantPhone}" style="display: inline-block; background-color: #ea580c; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: bold; padding: 10px 20px; border-radius: 8px;">
            📞 Call Volunteer
          </a>
        </div>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="background-color: #f1f5f9; padding: 15px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b;">
        This is an automated notification from the <strong>Mathaji Ulsooramma Sri Raghavendra Swamy Mutt</strong> Portal.<br>
        Vidyaranyapura, Bangalore-560097
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    // Transporter
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

    const mailOptions: any = {
      from: process.env.EMAIL_FROM || 'info@vidyaranyapuramutt.org',
      to: targetRecipient,
      subject: `🔔 New Swayamsevak Duty Shift Signup: ${shiftTitle || 'General Seva'} - ${applicantName}`,
      html: emailHtml,
    };

    if (applicantEmail && applicantEmail.includes('@')) {
      mailOptions.replyTo = applicantEmail;
    }

    const info = await transporter.sendMail(mailOptions);
    console.log('Duty shift signup notification sent to', targetRecipient, info.messageId);

    return NextResponse.json({
      success: true,
      message: `Notification email dispatched to ${targetRecipient}`,
      messageId: info.messageId
    });

  } catch (error: any) {
    console.error('Error sending duty shift signup email:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to dispatch email' },
      { status: 500 }
    );
  }
}
