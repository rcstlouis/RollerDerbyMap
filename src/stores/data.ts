import { defineStore } from 'pinia'
// import { db, firebaseCloudFunction } from '@/services/firebase.service'
// import type { BSBEvent } from '@/model/events.model'
// import { collection, onSnapshot, query } from 'firebase/firestore'
// import type { DataSyncRequestBody } from '@/model/dataSync.model'
// import type { HttpsCallableResult } from 'firebase/functions'
import { supabase } from '@/services/supabaseClient.service'
import type { LeagueRecord } from '@/model/league.model'
import type { LeagueFilters } from '@/model/maps.model'
import offlineLeagueData from '@/data/leagues.data.json' with { type: 'json' }

// let unsub = () => {
// initializes the variable
// }

export const useDataStore = defineStore({
  id: 'data',
  state: () => {
    return {
      // events: [] as BSBEvent[],
      leagues: offlineLeagueData as unknown as LeagueRecord[],
      example: undefined as unknown,
      tags: [] as string[],
      activeFilters: {
        tags: [],
        searchString: '',
        useMap: true,
      } as LeagueFilters,
      mapBounds: undefined as undefined | google.maps.LatLngBounds,
      mapFocus: undefined as undefined | { lat: number; lng: number } | google.maps.LatLng,
    }
  },
  actions: {
    // setup() {
    //   // const events: BSBEvent[] = []
    //   const q = query(collection(db, 'events'))
    //   unsub = onSnapshot(q, (querySnapshot) => {
    //     querySnapshot.docChanges().forEach((change) => {
    //       events.push(change.doc.data() as BSBEvent)
    //       this.example = events
    //     })
    //   })
    // },
    // dataSync(body: DataSyncRequestBody): Promise<HttpsCallableResult<unknown>> {
    // return firebaseCloudFunction('dataSync', body)
    // },
    // unsubscribe() {
    // unsub()
    // },
    async refreshLeagues(): Promise<LeagueRecord[]> {
      const { data } = await supabase.from('League2').select()
      const l = data?.map((lr) => {
        const parsedRecord: LeagueRecord = JSON.parse(JSON.stringify(lr ?? {}))
        let rulesets: string[] = []
        if (Array.isArray(lr.rulesets)) {
          rulesets = lr.rulesets
        }
        if (typeof lr.leagues === 'string') {
          rulesets = JSON.parse(lr.rulesets) as string[]
        }
        parsedRecord.leagues = rulesets as ['WFTDA'] // Overly restrictive cast is only used to satisfy linting
        return parsedRecord
      }) as LeagueRecord[]
      this.leagues = l
      console.log(`Found ${l.length} known leagues`)

      // Initialize Tags
      const tagDict: { [tagName: string]: true } = {}
      for (const league of l) {
        for (const ruleset of league.leagues) tagDict[ruleset] = true
      }
      this.tags = Object.keys(tagDict).sort()

      return this.leagues
    },
  },
})
