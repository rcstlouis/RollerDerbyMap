import { Timestamp } from 'firebase-admin/firestore'
import { makeFirestoreId } from '../utils'
import { UserRecord } from 'firebase-admin/auth'
import { ContactUsConfig } from '../contact/contact.model'

export interface DataSyncRequestBody {
  docId?: string
  userId?: string
  operationType: 'contribute:newLeague' | 'editLeague'
  file?: string
  eventData?: unknown
  leagueData?: LeagueRecord
  contribute?: {
    leagueRelation: string
    signsOfActivity: string
    notes: string
  }
}

export interface LeagueRecord {
  name: string
  id: string

  country: string
  state: string | null
  city: string
  loc: Coord

  logo: string | null
  leagues: ('WFTDA' | 'MRDA' | 'JRDA' | 'Short Track')[]
  website: string | null
  wftdaWebsite: string | null
  lastActive: Date | null
  tags: string[]
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

export class LogRecord {
  timestamp: Timestamp
  userDisplayName: string | null
  id: string
  userId: string | null
  type: string
  data: {
    message?: string
    oldData?: unknown
    newData?: unknown
  }

  constructor(
    type: string,
    data: { message?: string; oldData?: unknown; newData?: unknown },
    userObj?: RDMUserRecord,
  ) {
    this.id = makeFirestoreId()
    this.type = type
    this.userId = userObj?.id ?? null
    this.userDisplayName = userObj?.displayName ?? null
    this.timestamp = Timestamp.fromDate(new Date())
    this.data = data
  }
}

export class RDMUserRecord {
  id: string
  displayName?: string
  email: string
  privateKey: string

  constructor(user: UserRecord) {
    this.id = user.uid
    this.displayName = user.displayName
    this.email = user.email!
    this.privateKey = makeFirestoreId()
  }
}

export class MessageRecord {
  id: string

  firstName: string
  lastName: string
  subject: string
  body: string
  email: string

  constructor(source: ContactUsConfig) {
    this.firstName = source.firstName
    this.lastName = source.lastName
    this.subject = source.subject
    this.body = source.body
    this.email = source.email
    this.id = makeFirestoreId()
  }
}

export interface RDMResponse {
  status: 200 | 400
  message: string
  body?: unknown
}

export class UserContribution {
  id: string
  userId: string | null
  status: 'pending' | 'approved' | 'rejected'
  leagueData: LeagueRecord | null
  contributionData: {
    type: 'newLeague'
    leagueRelation: string | null
    signsOfActivity: string | null
    notes: string | null
  }

  constructor(body: DataSyncRequestBody) {
    this.id = makeFirestoreId()
    this.userId = body.userId ?? null
    this.status = 'pending'
    this.leagueData = body.leagueData?.name
      ? {
          name: body.leagueData?.name,
          id: body.leagueData.id ?? makeFirestoreId(),
          country: body.leagueData.country ?? null,
          state: body.leagueData.state ?? null,
          city: body.leagueData.city ?? null,
          loc: body.leagueData.loc ?? null,
          logo: body.leagueData.logo ?? null,
          leagues: body.leagueData.leagues ?? null,
          website: body.leagueData.website ?? null,
          wftdaWebsite: body.leagueData.wftdaWebsite ?? null,
          lastActive: body.leagueData.lastActive ?? null,
          tags: body.leagueData.tags ?? null,
        }
      : null
    this.contributionData = {
      type: 'newLeague',
      leagueRelation: body.contribute?.leagueRelation ?? null,
      signsOfActivity: body.contribute?.signsOfActivity ?? null,
      notes: body.contribute?.notes ?? null,
    }
  }
}
