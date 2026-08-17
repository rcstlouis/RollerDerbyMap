import { Timestamp } from 'firebase-admin/firestore'
import { makeFirestoreId } from '../utils.js'
import { UserRecord } from 'firebase-admin/auth'
import { ContactUsConfig } from '../contact/contact.model.js'
import { LeagueRecord } from '../model/league.model.js'

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
  // leagueData: LeagueRecord | null
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
    // this.leagueData = body.leagueData?.name
    //   ? {
    //       name: body.leagueData?.name,
    //       id: body.leagueData.id ?? 1,
    //       country: body.leagueData.country ?? '',
    //       state: body.leagueData.state ?? '',
    //       city: body.leagueData.city ?? '',
    //       logo: body.leagueData.logo ?? '',
    //       // leagues: body.leagueData.leagues ?? '',
    //       lat: 0,
    //       lng: 0,
    //       rulesets: [],
    //       website: body.leagueData.website ?? '',
    //       wftdaWebsite: body.leagueData.wftdaWebsite ?? '',
    //       lastActive: body.leagueData.lastActive ?? '',
    //       tags: body.leagueData.tags ?? '',
    //     }
    //   : null
    this.contributionData = {
      type: 'newLeague',
      leagueRelation: body.contribute?.leagueRelation ?? null,
      signsOfActivity: body.contribute?.signsOfActivity ?? null,
      notes: body.contribute?.notes ?? null,
    }
  }
}
