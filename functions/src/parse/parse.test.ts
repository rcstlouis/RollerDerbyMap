import dotenv from 'dotenv'
dotenv.config({ path: './functions/src/.env' })
import path from 'path'
import fs from 'fs'

// import { entry as custardParse } from './custard-parse/parse.js'
// await custardParse()

// import { wftdaParse } from './wftda-scrape/wftda-scrape.js'
// await wftdaParse()

// import { newCustardParse } from './custard-parse/parse.js'
// await newCustardParse()

import { incorporateCustardData } from './custard-parse/parse.js'
const otherLeagues = JSON.parse(
  fs.readFileSync(
    path.join(process.cwd(), 'functions/src/parse/wftda-scrape/wftda-scrape.json'),
    'utf8',
  ),
)
const custardLeagues = JSON.parse(
  fs.readFileSync(
    path.join(process.cwd(), 'functions/src/parse/custard-parse/custard-parse.json'),
    'utf8',
  ),
)
await incorporateCustardData(otherLeagues, custardLeagues)
