const nodeMailer = require('nodemailer')
const config = require('../config/')
const path = require('path')
const ejs = require('ejs')

const transporter = nodeMailer.createTransport({
  service: config.get('EMAIL_SERVICE'),
  auth: {
    user: config.get('EMAIL_USER'),
    pass: config.get('EMAIL_PASSWORD')
  }
})

const sendOtpToEmail = async (email, otp, name, flag = 'verify') => {
  let templatePath, subject

  switch (flag) {
  case 'forgot_password':
    templatePath = path.join(__dirname, '../views/passwordResetOtp.ejs')
    subject = 'Reset Your Password'
    break
  case 'resend_otp':
    templatePath = path.join(__dirname, '../views/reSendOtp.ejs')
    subject = 'Resend OTP for Verification'
    break
  default:
    templatePath = path.join(__dirname, '../views/emailOtp.ejs')
    subject = 'Your Email Verification OTP'
  }

  const html = await ejs.renderFile(templatePath, { otp, name })

  return transporter.sendMail({
    from: config.EMAIL_USER,
    to: email,
    subject,
    text: `Your OTP is ${otp}. It will expire in 10 minutes.`,
    html
  })
}

module.exports = sendOtpToEmail
