const amqp = require('amqplib')
const config = require('../config/')
const sendOtpToEmail = require('../service/emailProvider')
const cliColor = require('../helper/color.helper')

async function startEmailConsumer() {
  const connection = await amqp.connect(config.get('AMQP_URL'))
  const channel = await connection.createChannel()
  await channel.assertQueue('emailQueue')

  cliColor.warn('Email Service: Waiting for messages...')

  channel.consume('emailQueue', async (msg) => {
    if (msg !== null) {
      try {
        // Provide default value for otp in case it's missing (e.g., for welcome emails)
        const { email, otp = '', name, flag } = JSON.parse(msg.content.toString())
        console.log(flag, 'flag')
        await sendOtpToEmail(email, otp, name, flag)
        channel.ack(msg)
        cliColor.info(`Email sent to: ${email} with flag: ${flag}`)
      } catch (error) {
        console.error('Error processing email job:', error)
        cliColor.error('Error processing email job:', error.message)
        channel.nack(msg, false, false)
      }
    }
  })
}

module.exports = startEmailConsumer
