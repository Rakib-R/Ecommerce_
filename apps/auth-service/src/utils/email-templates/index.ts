
// Import all your template files
const userTemplates = require('./forgot-password-user-mail.cjs');
const sellerTemplates = require('./forgot-password-seller-mail.cjs');
const verifyTemplates = require('./verify-email.cjs');
const signInTemplates = require('./sign-in.cjs');

// Combine them into one master object
const EMAIL_TEMPLATES: Record<string, string> = {
  ...userTemplates,
  ...sellerTemplates,
  ...verifyTemplates,
  ...signInTemplates
};

export default EMAIL_TEMPLATES;