
module.exports = {
  'verify-email': `
<html>
<head>
  <title>Ecommerce Activation Email</title>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style type="text/css">
    /* Base */
    body {
      margin: 0;
      padding: 0;
      min-width: 100%;
      font-family: Arial, sans-serif;
      font-size: 16px;
      line-height: 1.5;
      background-color: #fafafa;
      color: #222222;
    }
      p{
        margin-bottom: 12px;
      }
  </style>

   <div class="email-wrapper">
    <div class="email-body">
        <p>Thank you <%= name %> for registering with Ecommerce.</p>
        <p>Use the following activation code to activate your account:</p>
        <h2><%= otp %></h2>
        <p>Please enter this code on the activation page within the next 5 minutes.</p>
        <p>If you did not register for an Ecommerce account, please ignore this email.</p>

        Did not register for an Ecommerce account? 
      <p>If you did not request this email, please ignore it.</p>
    </div>
    <div class="email-footer">
      If you have any questions, please don't hesitate to contact us at
      <a href="mailto:support@email.com">www@email.com</a>
    </div>
      <hr />
      <p class="footer">Secure Login System &copy; 2026</p>
  </div>

</head>
</html>
`
}