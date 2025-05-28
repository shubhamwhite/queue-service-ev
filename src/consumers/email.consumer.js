const amqp = require('amqplib')
const config = require('../config/')
const sendOtpToEmail = require('../service/emailProvider')

async function startEmailConsumer() {
  const connection = await amqp.connect(config.get('AMQP_URL'))
  const channel = await connection.createChannel()
  await channel.assertQueue('emailQueue')

  console.log('Email Service: Waiting for messages...')

  channel.consume('emailQueue', async (msg) => {
    if (msg !== null) {
      try {
        const { email, otp, name, flag } = JSON.parse(msg.content.toString())
        await sendOtpToEmail(email, otp, name, flag)
        channel.ack(msg)
        console.log(`Email sent to: ${email}`)
      } catch (error) {
        console.error('Error processing email job:', error.message)
        channel.nack(msg, false, false) // discard message
      }
    }
  })
}

module.exports = startEmailConsumer
