import dotenv from 'dotenv'
import { test } from './dataSync-sb.js'
dotenv.config({ path: './functions/src/.env' })

await test()
