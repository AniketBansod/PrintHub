const nodemailer = require('nodemailer');

// Create transporter with explicit SMTP settings
const createTransporter = () => {
  console.log('Creating email transporter...');
  console.log('EMAIL_USER:', process.env.EMAIL_USER);
  console.log('EMAIL_PASS exists:', !!process.env.EMAIL_PASS);
  
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

// Email templates
const getOrderConfirmationTemplate = (studentName, orderId, totalAmount) => {
  return {
    subject: 'PrintHub - Order Confirmation',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>PrintHub - Order Confirmation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #F59E0B, #D97706); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .order-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #F59E0B; }
          .order-id { font-size: 18px; font-weight: bold; color: #F59E0B; }
          .amount { font-size: 16px; color: #059669; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .logo { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🖨️ PrintHub</div>
            <h1>Order Confirmation</h1>
          </div>
          <div class="content">
            <h2>Hello ${studentName}!</h2>
            <p>Thank you for choosing <strong>PrintHub</strong> for your printing needs. Your order has been successfully placed and payment has been confirmed.</p>
            
            <div class="order-details">
              <h3>Order Details:</h3>
              <p><strong>Order ID:</strong> <span class="order-id">${orderId}</span></p>
              <p><strong>Total Amount:</strong> <span class="amount">₹${totalAmount}</span></p>
              <p><strong>Order Date:</strong> ${new Date().toLocaleDateString('en-IN')}</p>
            </div>
            
            <h3>What's Next?</h3>
            <p>Your print job has been added to our queue. You will receive another email notification as soon as your order is processed and ready for collection.</p>
            
            <p><strong>Important:</strong> Please keep your Order ID (<span class="order-id">${orderId}</span>) safe as you'll need it for verification at the xerox center.</p>
            
            <p>If you have any questions, feel free to contact us.</p>
            
            <div class="footer">
              <p>Best regards,<br>The PrintHub Team</p>
              <p>This is an automated message. Please do not reply to this email.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
  };
};

const getOrderReadyTemplate = (studentName, orderId) => {
  return {
    subject: 'PrintHub - Your Order is Ready for Collection!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>PrintHub - Order Ready</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #059669, #047857); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .order-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669; }
          .order-id { font-size: 18px; font-weight: bold; color: #F59E0B; background: #FEF3C7; padding: 5px 10px; border-radius: 5px; }
          .collection-info { background: #ECFDF5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .logo { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
          .urgent { color: #DC2626; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🖨️ PrintHub</div>
            <h1>🎉 Your Order is Ready!</h1>
          </div>
          <div class="content">
            <h2>Hello ${studentName}!</h2>
            <p>Great news! Your print job has been completed and is ready for collection.</p>
            
            <div class="order-details">
              <h3>Order Information:</h3>
              <p><strong>Order ID:</strong> <span class="order-id">${orderId}</span></p>
              <p><strong>Status:</strong> <span style="color: #059669; font-weight: bold;">✅ Completed</span></p>
              <p><strong>Ready Date:</strong> ${new Date().toLocaleDateString('en-IN')}</p>
            </div>
            
            <div class="collection-info">
              <h3>📋 Collection Instructions:</h3>
              <p><strong>Please bring your Order ID for verification:</strong></p>
              <p class="order-id">${orderId}</p>
              <p class="urgent">⚠️ Important: You must provide this Order ID to collect your documents.</p>
            </div>
            
            <h3> Where to Collect:</h3>
            <p>Visit the xerox center and present your Order ID to the staff. They will verify your order and hand over your printed documents.</p>
            
            <p>Thank you for using <strong>PrintHub</strong>! We hope you're satisfied with our service.</p>
            
            <div class="footer">
              <p>Best regards,<br>The PrintHub Team</p>
              <p>This is an automated message. Please do not reply to this email.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
  };
};

// Send email function
const sendEmail = async (to, subject, html) => {
  try {
    console.log('Attempting to send email to:', to);
    console.log('Subject:', subject);
    
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"PrintHub" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: subject,
      html: html
    };
    
    console.log('Mail options:', mailOptions);
    
    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    console.error('Error details:', {
      code: error.code,
      command: error.command,
      response: error.response
    });
    return { success: false, error: error.message };
  }
};

// Send order confirmation email
const sendOrderConfirmationEmail = async (studentEmail, studentName, orderId, totalAmount) => {
  const template = getOrderConfirmationTemplate(studentName, orderId, totalAmount);
  return await sendEmail(studentEmail, template.subject, template.html);
};

// Send order ready email
const sendOrderReadyEmail = async (studentEmail, studentName, orderId) => {
  const template = getOrderReadyTemplate(studentName, orderId);
  return await sendEmail(studentEmail, template.subject, template.html);
};

module.exports = {
  sendOrderConfirmationEmail,
  sendOrderReadyEmail,
  sendEmail
};
