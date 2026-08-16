import { defineStore } from 'pinia'
import { supabase } from '@/services/supabaseClient.service'
import type { LeagueRecord } from '@/model/league.model'
import type { LeagueFilters, RulesetName } from '@/model/maps.model'
import offlineLeagueData from '@/data/leagues.data.json' with { type: 'json' }

export const useDataStore = defineStore('map', {
  persist: true,
  state: () => {
    return {
      leagues: offlineLeagueData as unknown as LeagueRecord[],
      example: undefined as unknown,
      tags: [] as string[],
      activeFilters: {
        tags: [],
        searchString: '',
        useMap: true,
      } as LeagueFilters,
      mapBounds: undefined as undefined,
      mapFocus: undefined as undefined | { lat: number; lng: number },
    }
  },
  actions: {
    async refreshLeagues(): Promise<LeagueRecord[]> {
      const { data } = await supabase.from('League2').select()
      const l = data?.map((lr) => {
        const parsedRecord: LeagueRecord = JSON.parse(JSON.stringify(lr ?? {}))
        let rulesets: RulesetName[] = []
        if (Array.isArray(lr.rulesets)) {
          rulesets = lr.rulesets
        }
        if (typeof lr.leagues === 'string') {
          rulesets = JSON.parse(lr.rulesets) as RulesetName[]
        }
        parsedRecord.rulesets = rulesets
        return parsedRecord
      }) as LeagueRecord[]
      this.leagues = l
      console.log(`Found ${l.length} known leagues`)

      // Initialize Tags
      const tagDict: { [tagName: string]: true } = {}
      for (const league of l) {
        for (const ruleset of league.rulesets) tagDict[ruleset] = true
      }
      this.tags = Object.keys(tagDict).sort()

      return this.leagues
    },
  },
})
