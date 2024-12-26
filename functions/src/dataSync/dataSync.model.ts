export interface DataSyncRequestBody {
  collectionId: string
  docId: string
  userId: string
  operationType: 'create' | 'read' | 'update' | 'delete'
  eventData?: unknown
  leagueData?: LeagueRecord
}

export interface LeagueRecord {
  name: string
  id?: string

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

export interface Coord {
  lat: number
  lng: number
}

export interface RegisterUserRequestBody {
  name: string
  pass: string
  email: string
}
