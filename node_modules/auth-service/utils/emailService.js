const SibApiV3Sdk = require('sib-api-v3-sdk');

const sendOTPEmail = async (email, otp) => {
  const defaultClient = SibApiV3Sdk.ApiClient.instance;
  const apiKey = defaultClient.authentications['api-key'];
  apiKey.apiKey = process.env.BREVO_API_KEY;

  const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
  sendSmtpEmail.subject = "Password Reset OTP";
  sendSmtpEmail.htmlContent = `<h3>Password Reset Request</h3><p>Your OTP for password reset is: <b>${otp}</b></p><p>It expires in 10 minutes.</p>`;
  // Use the email you verified in Brevo (usually your login email)
  sendSmtpEmail.sender = { "name": "Company CRM", "email": process.env.SENDER_EMAIL || "no-reply@companycrm.com" };
  sendSmtpEmail.to = [{ "email": email }];

  try {
    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('API called successfully. Returned data: ' + JSON.stringify(data));
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

module.exports = { sendOTPEmail };
