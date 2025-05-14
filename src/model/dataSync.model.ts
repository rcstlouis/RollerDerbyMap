import { useUserStore } from '@/stores/user'
import type { LeagueRecord } from './league.model'

export interface RegisterUserRequestBody {
  name: string
  pass: string
  email: string
}

export class DataSyncRequestBody {
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

  constructor(
    operationType: 'contribute:newLeague' | 'editLeague',
    obj: {
      docId?: string
      leagueData?: LeagueRecord
      file?: string
      contribute?: {
        leagueRelation: string
        signsOfActivity: string
        notes: string
      }
    },
  ) {
    this.operationType = operationType
    this.docId = obj.docId
    this.userId = useUserStore().user?.uid
    this.leagueData = obj.leagueData
    this.contribute = obj.contribute
  }
}
