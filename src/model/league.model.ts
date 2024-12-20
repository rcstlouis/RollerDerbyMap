import type { Coord } from './maps.model'

export interface LeagueRecord {
  name: string

  country: string
  state: string
  city: string
  loc: Coord

  leagues: ('WFTDA' | 'MRDA' | 'JRDA' | 'Short Track')[]
  website?: string
  lastActive?: Date
  tags?: string[]
}
