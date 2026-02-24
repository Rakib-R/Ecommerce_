
// Import all your template files
const userTemplates = require('./forgot-password-buyer.mail.cjs');
const sellerTemplates = require('./forgot-password-seller-mail.cjs');
const verifyTemplates = require('./verify-email.cjs');

// Combine them into one master object
const EMAIL_TEMPLATES: Record<string, string> = {
  ...userTemplates,
  ...sellerTemplates,
  ...verifyTemplates,
};

export default EMAIL_TEMPLATES;