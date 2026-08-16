import { entry } from './parse.js'
import dotenv from 'dotenv'
dotenv.config({ path: './functions/src/.env' })

await entry()
