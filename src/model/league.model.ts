import type { Coord } from './maps.model'

export interface LeagueRecord {
  id?: string
  name: string

  country: string
  state?: string
  city: string
  loc: Coord

  logo?: string
  leagues: ('WFTDA' | 'MRDA' | 'JRDA' | 'Short Track')[]
  website?: string
  wftdaWebsite?: string
  lastActive?: Date
  tags?: string[]
}
