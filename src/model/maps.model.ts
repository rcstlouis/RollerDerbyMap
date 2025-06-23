import { type LeagueRecord } from './league.model'

export class MapManager {
  leagueDict: { [leagueName: string]: LeagueRecord }

  constructor(leagueRecords: LeagueRecord[]) {
    this.leagueDict = {}
    for (const record of leagueRecords ?? []) {
      this.leagueDict[record.name] = record
    }
  }
}

export interface LeagueFilters {
  tags?: string[]
  searchString?: string
  useMap?: boolean
}
