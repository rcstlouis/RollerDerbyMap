// import { openAsBlob } from 'node:fs'
import readXlsxFile, { readSheetNames } from 'read-excel-file/node'
import NodeGeocoder from 'node-geocoder'
import fs from 'fs'
import { LeagueRecord, RulesetName } from '../../model/league.model.js'
// import { default as Papa } from 'papaparse'
import StrCompare from 'string-comparison'

export async function entry() {
  let csvOutString = `id,createdAt,name,country,state,city,logo,rulesets,website,wftdaWebsite,tags,isDeleted,lat,lng`

  // Init Geocoder
  const geocoder = NodeGeocoder({
    provider: 'google',
    apiKey: process.env.GOOGLE_API_KEY,
    formatter: null,
  })

  // Parse CSV File
  const INPUT_FILE_NAME = './functions/src/parse/custard-parse/custard.xlsx'
  const sheetNames = await readSheetNames(INPUT_FILE_NAME)
  console.log(sheetNames)

  for (const sheetName of sheetNames) {
    let fileOutString = `id,createdAt,name,country,state,city,logo,rulesets,website,wftdaWebsite,tags,isDeleted,lat,lng`
    if (['unmapped'].includes(sheetName)) continue

    const rows = await readXlsxFile(INPUT_FILE_NAME, { sheet: sheetName })
    console.log(`\n\n  #### Row count for ${sheetName}: ${rows.length} ####  \n\n`)

    // Index columns
    const colIndexDict: { [colName: string]: number } = {}
    for (let i = 0; i < rows[0].length; i++) {
      colIndexDict[rows[0][i] as string] = i
    }

    let isHeader = true
    for (const row of rows) {
      if (isHeader) {
        console.log('Headers: ', row.join(','))
        isHeader = false
        continue
      }

      const leagueName =
        row[
          colIndexDict['league name'] ?? colIndexDict['league name '] ?? colIndexDict['Team name']
        ]
      const locName = row[colIndexDict['Location']]
      const coordsObj = await geocoder
        .geocode(locName as string)
        .catch((e) => console.error(`Could not geocode ${locName}: `, e))
      const coords = coordsObj?.[0]
      console.log(
        `${leagueName} is located at ${locName} with coords (${coords?.latitude}, ${coords?.longitude})`,
      )

      csvOutString += `\n,,"${leagueName}","${coords?.countryCode ?? 'us'}",,"${coords?.city ?? locName}",,"${row[colIndexDict['Ruleset']]}","${row[colIndexDict['website link']]}",,,false,${coords?.latitude},${coords?.longitude}`
      fileOutString += `\n,,"${leagueName}","${coords?.countryCode ?? 'us'}",,"${coords?.city ?? locName}",,"${row[colIndexDict['Ruleset']]}","${row[colIndexDict['website link']]}",,,false,${coords?.latitude},${coords?.longitude}`
    }
    await fs.writeFileSync(
      `./functions/src/parse/custard-parse/out-${sheetName}.csv`,
      fileOutString,
    )
  }
  // Papa.parse('')

  // Combine with existing WFTDA backup data
  await fs.writeFileSync(`./functions/src/parse/custard-parse/out.csv`, csvOutString)
}

export async function newCustardParse() {
  // Init Geocoder
  const geocoder = NodeGeocoder({
    provider: 'google',
    apiKey: process.env.GOOGLE_API_KEY,
    formatter: null,
  })

  // Parse CSV File
  const INPUT_FILE_NAME = './functions/src/parse/custard-parse/custard.xlsx'
  const sheetNames = await readSheetNames(INPUT_FILE_NAME)
  console.log(sheetNames)

  const leaguesList = []

  for (const sheetName of sheetNames) {
    if (['unmapped'].includes(sheetName)) continue // skip the unmapped leagues

    const rows = await readXlsxFile(INPUT_FILE_NAME, { sheet: sheetName })
    console.log(`\n\n  #### Row count for ${sheetName}: ${rows.length} ####  \n\n`)

    // Index columns
    const colIndexDict: { [colName: string]: number } = {}
    for (let i = 0; i < rows[0].length; i++) {
      colIndexDict[rows[0][i] as string] = i
    }

    let isHeader = true
    for (const row of rows) {
      if (isHeader) {
        console.log('Headers: ', row.join(','))
        isHeader = false
        continue
      }

      const leagueName =
        row[
          colIndexDict['league name'] ?? colIndexDict['league name '] ?? colIndexDict['Team name']
        ]
      const locName = row[colIndexDict['Location']]
      const location = (
        await geocoder
          .geocode(locName as string)
          .catch((e) => console.error(`Could not geocode ${locName}: `, e))
      )?.[0]

      console.log(
        `${leagueName} is located at ${locName} with coords (${location?.latitude}, ${location?.longitude})`,
      )
      const rulesets: RulesetName[] = []
      const statusText = row[colIndexDict['status']]?.toString()?.toLowerCase()
      const rulesetText = row[colIndexDict['Ruleset']]?.toString()?.toLowerCase()
      // const genderText = row[colIndexDict['Gendered?']]?.toString()?.toLowerCase()
      if (
        (rulesetText?.includes('ft') && !rulesetText?.includes('ftda')) ||
        statusText?.includes('independent') ||
        rulesetText?.includes('independent') ||
        rulesetText?.includes('all')
      )
        rulesets.push('independent')

      if (rulesetText?.includes('wftda')) rulesets.push('wftda')

      if (rulesetText?.includes('mrda')) rulesets.push('mrda')
      if (rulesetText?.includes('short track')) rulesets.push('shortTrack')
      if (rulesetText?.includes('coalition')) rulesets.push('coalition')
      if (rulesetText?.includes('banked')) rulesets.push('bankedTrack')
      if (rulesetText?.includes('usars')) rulesets.push('usars')
      if (rulesetText?.includes('renegade')) rulesets.push('renegade')
      if (rulesetText?.includes('rdcl')) rulesets.push('rdcl')
      if (rulesetText?.includes('osha')) rulesets.push('osha')
      if (rulesetText?.includes('made')) rulesets.push('made')

      leaguesList.push({
        name: leagueName,
        city: location?.city,
        state: location?.administrativeLevels?.level1long,
        country: location?.country,

        lng: location?.longitude,
        lat: location?.latitude,

        rulesets: rulesets,
        website: row[colIndexDict['website link']],
      })
    }
  }
  await fs.writeFileSync(
    `./functions/src/parse/custard-parse/custard-parse.json`,
    JSON.stringify(leaguesList, null, 4),
  )
  return leaguesList
}

export async function incorporateCustardData(
  otherData: LeagueRecord[],
  custardData: LeagueRecord[],
): Promise<LeagueRecord[]> {
  const unifiedList: LeagueRecord[] = []
  const custardLeagueNames = custardData.map((league) => league.name)
  const abridgedCustardData: LeagueRecord[] = custardData.concat([])
  for (const league of otherData) {
    // Non-intersect list

    // If it's a custard entry, absorb the data and delete the custard record
    if (
      league.country === 'United States' &&
      league.rulesets?.includes('wftda') &&
      ![
        'Iron Vixens Roller Derby',
        'Boulder County Roller Derby',
        'Brewcity Bruisers',
        'Cincinnati Roller Derby',
        'DC Rollergirls',
        'Team Montana Roller Derby',
        'SoFlo Roller Derby',
        'Mission City Roller Derby',
        'Chattahoochee Valley Roller Derby',
        'Pacific Roller Derby',
        'Rockin City Roller Derby',
        'Silicon Valley Roller Derby',
        'Sin City Roller Derby',
        'SO Derby',
        'Waimea Wranglers Rough Rollers',
        'Penn Jersey Roller Derby',
        'Garden Island Renegade Rollerz',
        'Central Penn Rollers',
        'Small Town Roller Derby',
        'Black Derby Collective',
        'Riptide Roller Derby',
        'Colorado Legacy Roller Derby',
      ].includes(league.name)
    ) {
      const matchCandidates = StrCompare.diceCoefficient.sortMatch(league.name, custardLeagueNames)
      // if (matchCandidates[matchCandidates.length - 1].rating < 0.9)
      console.log(`${league.name} => ${matchCandidates[matchCandidates.length - 1].member}`)
      const indexToRemove = abridgedCustardData.findIndex(
        (cLeague) => (cLeague.name = matchCandidates[matchCandidates.length - 1].member),
      )
      const custardLeague = abridgedCustardData[indexToRemove]

      league.city = custardLeague.city ?? league.city
      league.state = custardLeague.state ?? league.state
      league.lat = custardLeague.lat ?? league.lat
      league.lng = custardLeague.lng ?? league.lng
      league.rulesets = [
        ...new Set([...(league.rulesets ?? []), ...(custardLeague.rulesets ?? [])]),
      ]
      league.website = custardLeague.website

      if (indexToRemove > -1) abridgedCustardData.splice(indexToRemove, 1)
    }
    unifiedList.push(league)
  }
  const allLeagues = unifiedList.concat(abridgedCustardData)
  for (let i = 0; i < allLeagues.length; i++) allLeagues[i].id = i + 1

  fs.writeFileSync(
    './functions/src/parse/custard-parse/combined.json',
    JSON.stringify(allLeagues, null, 4),
  )
  return allLeagues
}
