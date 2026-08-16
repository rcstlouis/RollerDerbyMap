import { addLeagues } from './manageData.js'
import dotenv from 'dotenv'
dotenv.config({ path: './functions/src/.env' })

addLeagues()
