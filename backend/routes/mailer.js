import emailjs from '@emailjs/nodejs';

export const sendOTPEmail = async (userEmail, otp) => {
  try {
    // These values must match the keys you set in Render
    const templateParams = {
      otp: otp,           // Matches {{otp}} in your HTML
      to_email: userEmail, // Matches {{to_email}} in your EmailJS Settings
    };

    const result = await emailjs.send(
      process.env.EMAILJS_SERVICE_ID,
      process.env.EMAILJS_TEMPLATE_ID,
      templateParams,
      {
        publicKey: process.env.EMAILJS_PUBLIC_KEY,
        privateKey: process.env.EMAILJS_PRIVATE_KEY,
      }
    );

    console.log("✅ EmailJS Success:", result.text);
    return result;
  } catch (error) {
    // This logs the error and the OTP so you don't get stuck during testing
    console.error("❌ EmailJS Failed. Error:", error);

    throw error;
  }
};