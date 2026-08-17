import path from 'path'
import fs from 'fs'
import { parse } from 'node-html-parser'
import { default as NodeGeocoder } from 'node-geocoder'
// import { LeagueRecord } from '../../dataSync/dataSync.model'

export async function wftdaParse() {
  // const singleFileRawHtml = fs.readFileSync(
  // path.join(process.cwd(), 'functions/src/parse/wftda-scrape/2026-08-16 wftda.txt'),
  // 'utf8',
  // )
  // const singleFileRoot = parse(singleFileRawHtml)
  const downloadRawHtml = fs.readFileSync(
    path.join(process.cwd(), 'functions/src/parse/wftda-scrape/2026-08-16 wftda-download.html'),
    'utf8',
  )
  const downloadRoot = parse(downloadRawHtml)

  const geocoder = NodeGeocoder({
    provider: 'google',
    apiKey: process.env.GOOGLE_API_KEY,
    formatter: null,
  })

  const leagueItems = downloadRoot
    .querySelectorAll('div')
    .filter((x) => x.rawAttrs.split(' ').includes('leagues-item'))

  const leagueRecords = []

  for (const leagueItem of leagueItems) {
    console.log(leagueItem)
    const imagePath = (
      leagueItem.children[0].querySelector('img')?.attributes['data-src'] ?? ''
    ).split('/')
    const locString = leagueItem.children[2].innerText.replaceAll('&nbsp;', '').trim()
    console.log(`Locating `, locString)
    const location = (await geocoder.geocode(locString))[0]

    leagueRecords.push({
      name: leagueItem.children[1].querySelector('span')?.innerText,
      city: location.city,
      state: location.administrativeLevels?.level1long,
      country: location.country,

      lng: location.longitude,
      lat: location.latitude,

      logo: imagePath.length ? '/img/leagues/WFTDA/' + imagePath[imagePath.length - 1] : '',
      rulesets: ['wftda'],
      wftdaWebsite:
        'https://wftda.com' + leagueItem.children[0].querySelector('a')?.attributes['href'],
    })
  }

  fs.writeFileSync(
    path.join(process.cwd(), 'functions/src/parse/wftda-scrape/wftda-scrape.json'),
    JSON.stringify(leagueRecords, null, 4),
  )
  return leagueRecords
}
