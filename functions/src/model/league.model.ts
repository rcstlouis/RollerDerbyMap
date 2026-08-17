export type RulesetName =
  | 'wftda'
  | 'mrda'
  | 'jrda'
  | 'shortTrack'
  | 'chicagoClassic'
  | 'bankedTrack'
  | 'renegade'
  | 'independent'
  | 'usars'
  | 'rdcl'
  | 'osha'
  | 'coalition'
  | 'made'

export interface LeagueRecord {
  id?: number
  name: string

  country: string
  state?: string
  city: string
  // loc: Coord
  lat: number
  lng: number

  logo?: string
  rulesets: RulesetName[]
  website?: string
  wftdaWebsite?: string
  lastActive?: Date
  tags?: string[]
}
