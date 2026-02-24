
module.exports = {
  'forgot-password-buyer': `
<!DOCTYPE html>
<html>
<head>
  <title>Ecommerce Password Reset</title>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />

  <style type="text/css">
    /* Reset */
    body {
      margin: 0;
      padding: 0;
      background-color: #f4f6f8;
      font-family: Arial, Helvetica, sans-serif;
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }

    table {
      border-spacing: 0;
    }

    img {
      border: 0;
    }

    /* Container */
    .email-wrapper {
      width: 100%;
      background-color: #f4f6f8;
      padding: 40px 0;
    }

    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
    }

    /* Header */
    .email-header {
      background: linear-gradient(135deg, #000000, #222222);
      padding: 30px;
      text-align: center;
      color: #ffffff;
    }

    .email-header h1 {
      margin: 0;
      font-size: 22px;
      letter-spacing: 0.5px;
    }

    /* Body */
    .email-body {
      padding: 30px;
      color: #333333;
      font-size: 15px;
      line-height: 1.6;
    }

    .email-body p {
      margin: 0 0 16px 0;
    }

    /* OTP Box */
    .otp-box {
      margin: 25px 0;
      text-align: center;
    }

    .otp-code {
      display: inline-block;
      padding: 15px 30px;
      font-size: 28px;
      letter-spacing: 6px;
      font-weight: bold;
      color: #000000;
      background-color: #f1f3f5;
      border-radius: 10px;
      border: 2px dashed #d1d5db;
    }

    /* Footer */
    .email-footer {
      text-align: center;
      font-size: 13px;
      color: #888888;
      padding: 20px 30px 30px 30px;
    }

    .highlight {
      font-weight: bold;
      color: #000000;
    }

    @media only screen and (max-width: 600px) {
      .email-body {
        padding: 20px;
      }

      .email-header {
        padding: 20px;
      }
    }
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
`
}