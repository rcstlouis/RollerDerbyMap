// import { openAsBlob } from 'node:fs'
import readXlsxFile, { readSheetNames } from 'read-excel-file/node'
import NodeGeocoder from 'node-geocoder'
import fs from 'fs'
// import { default as Papa } from 'papaparse'

export async function entry() {
  let csvOutString = `id,createdAt,name,country,state,city,logo,rulesets,website,wftdaWebsite,tags,isDeleted,lat,lng`

  // Init Geocoder
  const geocoder = NodeGeocoder({
    provider: 'google',
    apiKey: process.env.GOOGLE_API_KEY,
    formatter: null,
  })

  // Parse CSV File
  const INPUT_FILE_NAME = './functions/src/parse/custard.xlsx'
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
    await fs.writeFileSync(`./functions/src/parse/out-${sheetName}.csv`, fileOutString)
  }
  // Papa.parse('')

  // Combine with existing WFTDA backup data
  await fs.writeFileSync(`./functions/src/parse/out.csv`, csvOutString)
}
