import { defineStore } from 'pinia'
import { db, firebaseCloudFunction } from '@/services/firebase.service'
import type { BSBEvent } from '@/model/events.model'
import { collection, onSnapshot, query } from 'firebase/firestore'
import type { DataSyncRequestBody } from '@/model/dataSync.model'
import type { HttpsCallableResult } from 'firebase/functions'
import { supabase } from '@/services/supabaseClient.service'
import type { LeagueRecord } from '@/model/league.model'

let unsub = () => {
  // initializes the variable
}

export const useDataStore = defineStore({
  id: 'data',
  state: () => {
    return {
      events: [] as BSBEvent[],
      leagues: [] as LeagueRecord[],
      example: undefined as unknown,
    }
  },
  actions: {
    setup() {
      const events: BSBEvent[] = []
      const q = query(collection(db, 'events'))
      unsub = onSnapshot(q, (querySnapshot) => {
        querySnapshot.docChanges().forEach((change) => {
          events.push(change.doc.data() as BSBEvent)
          this.example = events
        })
      })
    },
    dataSync(body: DataSyncRequestBody): Promise<HttpsCallableResult<unknown>> {
      return firebaseCloudFunction('dataSync', body)
    },
    unsubscribe() {
      unsub()
    },
    async refreshLeagues(): Promise<LeagueRecord[]> {
      const { data } = await supabase.from('League').select()
      const l = data?.map((lr) => {
        const parsedRecord: LeagueRecord = JSON.parse(JSON.stringify(lr ?? {}))
        // parsedRecord.loc = { lat: lr.lat, lng: lr.lng }
        // console.log(parsedRecord.loc)
        parsedRecord.leagues = lr.rulesets
        return parsedRecord
      }) as LeagueRecord[]
      this.leagues = l
      console.log(`Found ${l.length} known leagues`)
      return this.leagues
    },
  },
})
