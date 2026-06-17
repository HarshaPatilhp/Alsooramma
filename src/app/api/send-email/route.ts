import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import QRCode from 'qrcode';

export async function POST(request: NextRequest) {
  try {
    const { booking, qrCode } = await request.json();

    console.log('Email request received:', { booking, qrCode });

    // Generate QR Code only if lunch/thirtha prasada is required
    let qrCodeDataURL = '';
    if (booking.lunchRequired) {
      qrCodeDataURL = await QRCode.toDataURL(qrCode, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      console.log('QR Code generated successfully');
    }

    // Create email transporter with explicit settings
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: false, // Use TLS
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    console.log('Transporter created with config:', {
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      user: process.env.EMAIL_USER
    });

    // Verify transporter configuration
    await transporter.verify();
    console.log('Transporter verified successfully');

    // Email content
    const emailContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Seva Booking Confirmation</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f97316; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; }
        .qr-code { text-align: center; margin: 20px 0; }
        .details { background: white; padding: 15px; border-radius: 5px; margin: 15px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🙏 Seva Booking Confirmation</h1>
            <p>Sri Mathaji Ulsooramma Raghavendra Swamy Mutt, Vidyaranyapura </p>
        </div>

        <div class="content">
            <h2>Dear ${booking.devoteeName},</h2>

            <p>Thank you for booking a seva with us. Your booking has been confirmed successfully.</p>

            <div class="details">
                <h3>📋 Booking Details:</h3>
                <ul>
                    <li><strong>Seva:</strong> ${booking.sevaName}</li>
                    <li><strong>Date:</strong> ${new Date(booking.date).toLocaleDateString()}</li>
                    <li><strong>Number of People:</strong> ${booking.numberOfPeople}</li>
                    <li><strong>Gotra:</strong> ${booking.gotra}</li>
                    <li><strong>Nakshatra:</strong> ${booking.nakshatra}</li>
                    <li><strong>Hall Location:</strong> ${booking.hall}</li>
                    <li><strong>Cost:</strong> ${booking.sevaCost}</li>
                    <li><strong>Booking ID:</strong> ${booking.id}</li>
                </ul>
            </div>

            ${booking.lunchRequired ? `
            <div class="qr-code">
                <h3>📱 Your QR Code</h3>
                <p>Please show this QR code at the temple entrance for verification.</p>
                <img src="cid:qrcode-image" alt="Booking QR Code" style="max-width: 200px; border: 2px solid #333; border-radius: 5px;" />
                <p><strong>QR Code:</strong> ${qrCode}</p>
            </div>
            ` : ''}

            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 15px 0;">
                <h4>⏰ Important Instructions:</h4>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Seva Cost:</td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">${booking.sevaCost}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Tirtha Prasada Required:</td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">${booking.lunchRequired ? `Yes (${booking.lunchCount} people)` : 'No'}</td>
                  </tr>
                  ${booking.lunchRequired ? `
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Tirtha Prasada Cost:</td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">${booking.lunchCost} (${booking.lunchCount} × ₹250)</td>
                  </tr>
                  ` : ''}
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #ea580c; font-size: 16px;">Total Cost:</td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #ea580c; font-size: 16px;">${booking.totalCost}</td>
                  </tr>
                </table>
                <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 10px; margin-top: 10px; border-radius: 3px;">
                    <strong style="color: #92400e;">💰 Important Information:</strong> Please be at the temple at the mentioned time.
                </div>
                <ul>
                  <li>Arrive at the temple 15 minutes before your scheduled time</li>
                  <li>Please maintain silence and sanctity in the temple premises</li>
                  ${booking.lunchRequired ? `
                  <li>Bring this email or show the QR code for verification at the time of lunch</li>
                  <li>Please find the QR code attached at the end of this email</li>
                  ` : ''}
                </ul>
            </div>

            <p>We look forward to your divine service and spiritual journey.</p>

            <p>With blessings,<br>
            <strong>Sri Vidyaranyapura Mutt Management</strong></p>

            <div class="footer">
                <p>📞 Contact: +91-XXXXXXXXXX | 📧 info@vidyaranyapuramutt.org</p>
                <p>🏛️ Sri Vidyaranyapura Mutt, Bangalore</p>
            </div>
        </div>
    </div>
</body>
</html>
    `;

    // Send email
    console.log('Attempting to send email to:', booking.email);
    const mailOptions: any = {
      from: process.env.EMAIL_FROM,
      to: booking.email,
      subject: `Seva Booking Confirmation - ${booking.sevaName}`,
      html: emailContent,
    };

    if (booking.lunchRequired && qrCodeDataURL) {
      mailOptions.attachments = [
        {
          filename: `qr-code-${booking.id}.png`,
          content: qrCodeDataURL.split('base64,')[1],
          encoding: 'base64',
          cid: 'qrcode-image'
        }
      ];
    }

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
      messageId: result.messageId
    });

  } catch (error) {
    console.error('Detailed email sending error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      config: {
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        user: process.env.EMAIL_USER
      }
    });

    return NextResponse.json({
      success: false,
      message: 'Failed to send email',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
