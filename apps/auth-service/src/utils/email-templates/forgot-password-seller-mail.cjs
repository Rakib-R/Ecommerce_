
module.exports = {
  'forgot-password-seller': `
<!DOCTYPE html>
    <html>
    <head>
      <style>
        body { margin:0; padding:0; background-color:#f4f6f8; font-family:Arial,sans-serif; }
        .email-wrapper { width:100%; background-color:#f4f6f8; padding:40px 0; }
        .email-container { max-width:600px; margin:0 auto; background:#fff; border-radius:12px; overflow:hidden; box-shadow:0 10px 25px rgba(0,0,0,0.05); }
        .email-header { background:linear-gradient(135deg,#000,#222); padding:30px; text-align:center; color:#fff; }
        .email-header h1 { margin:0; font-size:22px; }
        .email-body { padding:30px; color:#333; font-size:15px; line-height:1.6; }
        .otp-code { display:inline-block; padding:15px 30px; font-size:28px; letter-spacing:6px; font-weight:bold; background:#f1f3f5; border-radius:10px; border:2px dashed #d1d5db; }
        .email-footer { text-align:center; font-size:13px; color:#888; padding:20px 30px; }
        .highlight { font-weight:bold; color:#000; }
      </style>
      
    </head>
    <body>
      <div class="email-wrapper">
    <div class="email-container">
      
      <div class="email-header">
        <h1>Password Reset Request – Ecommerce</h1>
      </div>

      <div class="email-body">
        <p>Hello <span class="highlight"><%= name %></span>,</p>

        <p>
          We received a request to reset your password for your Ecommerce account.
        </p>

        <p>
          If you made this request, please use the OTP below to reset your password:
        </p>

        <div class="otp-box">
          <div class="otp-code"><%= otp %></div>
        </div>

        <p>
          This OTP is valid for the next <span class="highlight">5 minutes</span>.
        </p>

        <p>
          If you did not request a password reset, you can safely ignore this email.
        </p>
      </div>

      <div class="email-footer">
        © <%= new Date().getFullYear() %> Ecommerce. All rights reserved.
      </div>

    </div>
  </div>
    </body>
 </html>

  `}