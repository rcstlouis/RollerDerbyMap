import { default as nodemailer } from 'nodemailer'
import { ContactUsConfig } from './contact.model.js'
import { default as escape } from 'escape-html'
import { dmHex } from '../discordBot/bot.js'
import { db } from '../services/firebase.service.js'
import { MessageRecord } from '../dataSync/dataSync.model.js'

export async function sendMessage(
  subject: string,
  body: string,
  recipient: string,
  replyTo: string | undefined = undefined,
) {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    // port: 587,
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  })

  const info = await transporter
    .sendMail({
      from: `"BSB Webmaster" <${process.env.EMAIL_USER}>`,
      to: recipient,
      replyTo: replyTo,
      bcc: process.env.TEST_EMAIL,
      subject: subject,
      text: body,
      html: `
    <html>
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1">
      </head>
      <body>${body?.replaceAll('\n', '<br/>')}</body>
    </html>`,
    })
    .catch((e) => console.error(`Email failed to send: ${JSON.stringify(e)}`))

  if (info) console.log('Message sent: %s', info.messageId)
}

export async function sendContactMessage(config: ContactUsConfig) {
  const body = `<p><i>The following message was received from <b>${config.firstName} ${config.lastName}</b> at <b>${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })}</b>:</i></p>
  <div style="background-color: #e3e3e3; padding: 12px">${escape(config.body)}</div>
  <p><i>This is an automated message sent from the BSB website. Reply should be sent to <b>${config.email}</b></i></p>
  <p><i>-Roller Derby Map Webmaster (Hex #255)</i></p>`
  await sendMessage(
    `[RDM Web] ${config.subject}`,
    body,
    process.env.CONTACT_EMAIL ?? '',
    config.email,
  )
  const discordMessage = `**${config.firstName} ${config.lastName}** just filled out the **Roller Derby Map** contact form with the following message: \n\n${config.body}\n\nRespond at ${config.email}`
  await dmHex(discordMessage).catch((e: Error) =>
    console.error(`DM Failed :( ${JSON.stringify(e)}`),
  )
  const messageRecord = new MessageRecord(config)
  await db.collection('messages').doc(messageRecord.id).set(messageRecord)
}
