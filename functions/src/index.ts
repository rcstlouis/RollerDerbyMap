/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { onRequest } from 'firebase-functions/v1/https'
import useCors from 'cors'
import dotenv from 'dotenv'
import { DataSyncRequestBody, RegisterUserRequestBody } from './dataSync/dataSync.model.js'
import { entry as dataSyncEntry } from './dataSync/dataSync.js'
import { entry as registerUserEntry } from './register/register.js'
import { ContactUsConfig } from './contact/contact.model.js'
import { sendContactMessage } from './contact/contact.js'

dotenv.config({ path: './src/.env' })

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

// const cors = useCors({ origin: true });
const whitelist: string[] = process.env.WHITELIST?.split(',') ?? []
const cors = useCors({
  origin: function (origin, callback) {
    if (!whitelist.length) {
      console.error(`No whitelist present; please check env variables`)
      callback(new Error('No Domains Accepted'))
    } else if (whitelist.indexOf(origin ?? '') !== -1) {
      console.log(`Domain ${origin} accepted`)
      callback(null, true)
    } else {
      console.error(`Domain ${origin} denied`)
      callback(new Error('Not allowed by CORS'))
    }
  },
})

export const generatecontactemail = onRequest(async (req, res) => {
  await cors(req, res, async (): Promise<void> => {
    const body: ContactUsConfig = req.body?.data ?? req.body
    console.log(`Attempting to send message: ${JSON.stringify(body)}`)
    await sendContactMessage(body)
      .then(() => {
        res.statusCode = 200
        res.json({ data: 'Message successfully sent!' })
      })
      .catch((e) => {
        res.statusCode = 400
        res.statusMessage = e.message ?? e
        res.json({ data: e })
      })
    return
  })
})

export const registerUser2 = onRequest(async (req, res) => {
  await cors(req, res, async (): Promise<void> => {
    const body: RegisterUserRequestBody = req.body?.data ?? req.body
    console.log(`Attempting to send message: ${JSON.stringify(body)}`)
    await registerUserEntry(body)
      .then(() => {
        res.statusCode = 200
        res.json({ data: `Successfully registered account ${body.email}` })
      })
      .catch((e) => {
        res.statusCode = 400
        res.statusMessage = e.message ?? e
        res.json({ data: e })
      })
    return
  })
})

export const dataSync = onRequest(async (req, res) => {
  await cors(req, res, async (): Promise<void> => {
    const body: DataSyncRequestBody = req.body?.data ?? req.body
    console.log(`Attempting to send message: ${JSON.stringify(body)}`)
    await dataSyncEntry(body)
      .then(() => {
        res.statusCode = 200
        res.json({ data: 'Message successfully sent!' })
      })
      .catch((e) => {
        res.statusCode = 400
        res.statusMessage = e.message ?? e
        res.json({ data: e })
      })
    return
  })
})
