import { MailService } from '@sendgrid/mail';

if (!process.env.SENDGRID_API_KEY) {
  console.warn("SENDGRID_API_KEY not found. Email notifications will be disabled.");
}

const mailService = new MailService();
if (process.env.SENDGRID_API_KEY) {
  mailService.setApiKey(process.env.SENDGRID_API_KEY);
}

interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  if (!process.env.SENDGRID_API_KEY) {
    console.log(`Email would be sent to ${params.to}: ${params.subject}`);
    return true; // Return true for development/testing
  }

  try {
    await mailService.send({
      to: params.to,
      from: params.from,
      subject: params.subject,
      text: params.text,
      html: params.html,
    });
    return true;
  } catch (error) {
    console.error('SendGrid email error:', error);
    return false;
  }
}

// Email Templates
export const emailTemplates = {
  orderConfirmation: {
    subject: "Order Confirmation - OptiBuy",
    text: (userName: string, productName: string) => `
Hello ${userName},

Congratulations! Your order has been received successfully.

Product: ${productName}
Status: Processing

You will be contacted through your registered e-mail in the system with updates about your order.

Companies will provide you with up-to-date information about their offers both from the OptiBuy platform and through your e-mail within the period you specify.

Thank you for using OptiBuy for your collective purchasing needs!

Best regards,
The OptiBuy Team
    `,
    html: (userName: string, productName: string) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #3b82f6; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f8fafc; padding: 30px; }
        .success-badge { background: #10b981; color: white; padding: 8px 16px; border-radius: 20px; display: inline-block; font-size: 14px; margin: 10px 0; }
        .product-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6; }
        .footer { background: #1f2937; color: #d1d5db; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 OptiBuy Order Confirmation</h1>
        </div>
        <div class="content">
            <h2>Hello ${userName},</h2>
            
            <div class="success-badge">✓ Order Received Successfully</div>
            
            <p><strong>Congratulations! Your order has been received successfully.</strong></p>
            
            <div class="product-details">
                <h3>Order Details</h3>
                <p><strong>Product:</strong> ${productName}</p>
                <p><strong>Status:</strong> <span style="color: #10b981;">Processing</span></p>
            </div>
            
            <h3>What happens next?</h3>
            <ul>
                <li>You will be contacted through your registered e-mail in the system with updates</li>
                <li>Companies will provide up-to-date information about their offers</li>
                <li>Updates will come both from the OptiBuy platform and directly to your email</li>
                <li>Communication will occur within the timeframe you specified</li>
            </ul>
            
            <p>Thank you for using OptiBuy for your collective purchasing needs!</p>
        </div>
        <div class="footer">
            <p>Best regards,<br>The OptiBuy Team</p>
            <p><em>Collective purchasing made simple</em></p>
        </div>
    </div>
</body>
</html>
    `
  },

  rfqConfirmation: {
    subject: "RFQ Submitted Successfully - OptiBuy Business",
    text: (userName: string, productName: string) => `
Hello ${userName},

Congratulations! Your Request for Quotation (RFQ) has been received successfully.

Product/Service: ${productName}
Status: Active - Awaiting Supplier Responses

You will be contacted through your registered e-mail in the system with supplier quotes and updates about your RFQ.

Qualified suppliers will provide you with detailed quotations and up-to-date information about their offerings both from the OptiBuy business platform and through your e-mail within the period you specify.

Thank you for using OptiBuy for your business procurement needs!

Best regards,
The OptiBuy Business Team
    `,
    html: (userName: string, productName: string) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #1f2937; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f8fafc; padding: 30px; }
        .success-badge { background: #059669; color: white; padding: 8px 16px; border-radius: 20px; display: inline-block; font-size: 14px; margin: 10px 0; }
        .rfq-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #1f2937; }
        .footer { background: #374151; color: #d1d5db; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏢 OptiBuy Business RFQ Confirmation</h1>
        </div>
        <div class="content">
            <h2>Hello ${userName},</h2>
            
            <div class="success-badge">✓ RFQ Submitted Successfully</div>
            
            <p><strong>Congratulations! Your Request for Quotation (RFQ) has been received successfully.</strong></p>
            
            <div class="rfq-details">
                <h3>RFQ Details</h3>
                <p><strong>Product/Service:</strong> ${productName}</p>
                <p><strong>Status:</strong> <span style="color: #059669;">Active - Awaiting Supplier Responses</span></p>
            </div>
            
            <h3>What happens next?</h3>
            <ul>
                <li>Qualified suppliers will review your RFQ requirements</li>
                <li>You'll receive detailed quotations via email and platform notifications</li>
                <li>Suppliers will provide up-to-date pricing and availability information</li>
                <li>All communication will occur within your specified timeframe</li>
            </ul>
            
            <p>Thank you for using OptiBuy for your business procurement needs!</p>
        </div>
        <div class="footer">
            <p>Best regards,<br>The OptiBuy Business Team</p>
            <p><em>Professional procurement solutions</em></p>
        </div>
    </div>
</body>
</html>
    `
  },

  sellerOfferNotification: {
    subject: "New Offer Available - OptiBuy",
    text: (userName: string, productName: string, sellerName: string, offerDetails: string) => `
Hello ${userName},

Great news! A new offer is available for a product you're interested in.

Product: ${productName}
Seller: ${sellerName}
Offer Details: ${offerDetails}

This offer is available for the period you specified in your purchase intention.

Visit OptiBuy to view full details and join this collective purchase opportunity.

You will continue to receive updates about offers through your registered e-mail as they become available.

Best regards,
The OptiBuy Team
    `,
    html: (userName: string, productName: string, sellerName: string, offerDetails: string) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #10b981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f8fafc; padding: 30px; }
        .offer-badge { background: #f59e0b; color: white; padding: 8px 16px; border-radius: 20px; display: inline-block; font-size: 14px; margin: 10px 0; }
        .offer-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981; }
        .cta-button { background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; font-weight: bold; }
        .footer { background: #065f46; color: #d1fae5; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔔 New Offer Available</h1>
        </div>
        <div class="content">
            <h2>Hello ${userName},</h2>
            
            <div class="offer-badge">New Collective Purchase Opportunity</div>
            
            <p><strong>Great news! A new offer is available for a product you're interested in.</strong></p>
            
            <div class="offer-details">
                <h3>Offer Details</h3>
                <p><strong>Product:</strong> ${productName}</p>
                <p><strong>Seller:</strong> ${sellerName}</p>
                <p><strong>Offer:</strong> ${offerDetails}</p>
            </div>
            
            <p>This offer is available for the period you specified in your purchase intention.</p>
            
            <a href="#" class="cta-button">View Full Details on OptiBuy</a>
            
            <p><em>You will continue to receive updates about new offers through your registered e-mail as they become available.</em></p>
        </div>
        <div class="footer">
            <p>Best regards,<br>The OptiBuy Team</p>
            <p><em>Connecting buyers with the best collective deals</em></p>
        </div>
    </div>
</body>
</html>
    `
  }
};

// Email notification functions
export async function sendOrderConfirmation(userEmail: string, userName: string, productName: string): Promise<boolean> {
  return await sendEmail({
    to: userEmail,
    from: 'orders@optibuy.com',
    subject: emailTemplates.orderConfirmation.subject,
    text: emailTemplates.orderConfirmation.text(userName, productName),
    html: emailTemplates.orderConfirmation.html(userName, productName)
  });
}

export async function sendRFQConfirmation(userEmail: string, userName: string, productName: string): Promise<boolean> {
  return await sendEmail({
    to: userEmail,
    from: 'business@optibuy.com',
    subject: emailTemplates.rfqConfirmation.subject,
    text: emailTemplates.rfqConfirmation.text(userName, productName),
    html: emailTemplates.rfqConfirmation.html(userName, productName)
  });
}

export async function sendSellerOfferNotification(
  userEmail: string, 
  userName: string, 
  productName: string, 
  sellerName: string, 
  offerDetails: string
): Promise<boolean> {
  return await sendEmail({
    to: userEmail,
    from: 'offers@optibuy.com',
    subject: emailTemplates.sellerOfferNotification.subject,
    text: emailTemplates.sellerOfferNotification.text(userName, productName, sellerName, offerDetails),
    html: emailTemplates.sellerOfferNotification.html(userName, productName, sellerName, offerDetails)
  });
}
