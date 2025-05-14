import { sendContactMessage } from './contact.js'
import dotenv from 'dotenv'
import { ContactUsConfig } from './contact.model.js'
import { default as escape } from 'escape-html'

dotenv.config({ path: '.\\functions\\src\\.env' })

// const body = "Hey there,<br/>If you're seeing this, the email is getting smarter in <b>html</b>.<br/>-Hex | They/Them"
// const subject = "Testing BSB Cloud Function"
// const recipient = process.env.TEST_EMAIL ?? ''
// sendMessage(subject, body, recipient)

sendContactMessage(
  new ContactUsConfig({
    email: process.env.TEST_EMAIL ?? '',
    firstName: 'Renee',
    lastName: 'St Louis',
    body: 'Hi, I found you all online, and I got really excited about your new program!',
    subject: 'Test Inquiry',
  }),
)

console.log(escape('<b>html escape text</b>'))
