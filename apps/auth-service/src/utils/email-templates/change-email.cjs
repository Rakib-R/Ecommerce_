module.exports = {
  'change-email': `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Confirm Your New Email Address</title>
  <style type="text/css">
    /* Reset & Base Styles */
    body {
      margin: 0;
      padding: 0;
      min-width: 100%;
      width: 100% !important;
      background-color: #f6f9fc;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      -webkit-font-smoothing: antialiased;
      color: #333333;
    }
    table {
      border-collapse: collapse;
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }
    td {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    }
    img {
      border: 0;
      height: auto;
      line-height: 100%;
      outline: none;
      text-decoration: none;
    }
    p {
      margin: 0 0 16px 0;
      font-size: 16px;
      line-height: 24px;
      color: #4f566b;
    }
    
    /* Responsive overrides */
    @media only screen and (max-width: 600px) {
      .email-container {
        width: 100% !important;
        padding: 10px !important;
      }
      .content-body {
        padding: 24px !important;
      }
    }
  </style>
</head>
<body>

  <!-- Background Wrapper -->
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#f6f9fc">
    <tr>
      <td align="center" style="padding: 40px 10px;">
        
        <!-- Email Container Box -->
        <table class="email-container" role="presentation" width="550" cellspacing="0" cellpadding="0" border="0" style="max-width: 550px; width: 100%;">
          
          <!-- Logo / Header area -->
          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <span style="font-size: 24px; font-weight: 700; color: #635bff; letter-spacing: -0.5px;">Ecommerce</span>
            </td>
          </tr>

          <!-- Main Content Card -->
          <tr>
            <td class="content-body" bgcolor="#ffffff" style="padding: 40px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); border: 1px solid #e3e8ee;">
              
              <h1 style="margin: 0 0 20px 0; font-size: 22px; font-weight: 700; color: #1a1f36; line-height: 32px;">
                Confirm your new email
              </h1>
              
              <p>Hi <%= name %>,</p>
              <p>We received a request to change the email address associated with your Ecommerce account. Please enter the verification code below to confirm this change and secure your account.</p>
              
              <!-- OTP Display Box -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 28px 0;">
                <tr>
                  <td align="center" bgcolor="#f8f9fa" style="padding: 16px; border-radius: 6px; border: 1px dashed #cfd7df;">
                    <div style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 700; color: #1a1f36; letter-spacing: 6px; line-height: 44px;">
                      <%= otp %>
                    </div>
                  </td>
                </tr>
              </table>
              
              <p style="font-size: 14px; line-height: 22px; color: #697386;">
                <strong>Note:</strong> This security code will expire in <strong>5 minutes</strong>. If you did not initiate an email change request, you can safely disregard this message; your account will remain tied to your current address.
              </p>
              
              <hr style="border: 0; border-top: 1px solid #e3e8ee; margin: 32px 0 24px 0;" />
              
              <!-- Support Footer Block -->
              <p style="font-size: 13px; line-height: 20px; color: #8792a2; margin-bottom: 0;">
                Questions? Visit our help section or reach out to our team at 
                <a href="mailto:support@email.com" style="color: #635bff; text-decoration: none;">support@email.com</a>.
              </p>
            </td>
          </tr>

          <!-- Footer Area -->
          <tr>
            <td align="center" style="padding-top: 24px;">
              <p style="font-size: 12px; line-height: 18px; color: #8792a2; text-align: center; margin: 0;">
                Secure Login System &copy; 2026 Ecommerce Inc.
              </p>
            </td>
          </tr>

        </table>
        <!-- /Email Container Box -->

      </td>
    </tr>
  </table>

</body>
</html>
`
}
