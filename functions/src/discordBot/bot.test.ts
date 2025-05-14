import dotenv from 'dotenv'
dotenv.config({ path: '.\\functions\\src\\.env' })

import { sendToLeagueServer } from './bot.js'

console.log(`Token: ${process.env.DISCORD_TOKEN}`)
// const result = await sendMessage('hi')
const result = await sendToLeagueServer('`Beep boop, testing message forwarding`')
console.log(`Message sent: ${result}`)
