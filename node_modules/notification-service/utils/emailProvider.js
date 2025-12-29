const SibApiV3Sdk = require('sib-api-v3-sdk');

const sendEmail = async (toEmail, subject, htmlContent) => {
  const defaultClient = SibApiV3Sdk.ApiClient.instance;
  const apiKey = defaultClient.authentications['api-key'];
  apiKey.apiKey = process.env.BREVO_API_KEY;

  const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
  sendSmtpEmail.subject = subject;
  sendSmtpEmail.htmlContent = htmlContent;
  sendSmtpEmail.sender = { "name": "Company CRM", "email": process.env.SENDER_EMAIL || "no-reply@companycrm.com" };
  sendSmtpEmail.to = [{ "email": toEmail }];

  try {
    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log(`✅ Email sent to ${toEmail}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to send email to ${toEmail}:`, error.message);
    return false;
  }
};

module.exports = { sendEmail };
