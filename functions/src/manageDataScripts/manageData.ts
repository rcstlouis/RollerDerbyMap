import { getQueryResult } from '../mysql-db.js'
import leagueData from './2026-08-15-leagues.data.json' with { type: 'json' }
import { escape } from 'mysql2'
import { default as dayjs } from 'dayjs'

export async function addLeagues() {
  const createDate = escape(dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss'))
  for (const league of leagueData) {
    const queryString =
      `INSERT INTO League (name, country, state, city, logo, rulesets, website, wftdaWebsite, tags, lat, lng, createdAt) VALUES (` +
      [
        escape(league.name),
        escape(league.country),
        escape(league.state),
        escape(league.city),
        escape(league.logo),
        escape(JSON.stringify(league.rulesets)),
        escape(league.website),
        escape(league.wftdaWebsite),
        escape(JSON.stringify(league.tags)),
        escape(league.lat),
        escape(league.lng),
        createDate,
      ].join(', ') +
      ');'
    await getQueryResult(queryString)
  }
}
