import { defineStore } from 'pinia'
import { supabase } from '@/services/supabaseClient.service'
import type { LeagueRecord } from '@/model/league.model'
import type { LeagueFilters, RulesetName } from '@/model/maps.model'
import offlineLeagueData from '@/data/2026-08-15-leagues.data.json' with { type: 'json' }

export const useMapStore = defineStore('map', {
  persist: false,
  state: () => {
    return {
      leagues: offlineLeagueData as unknown as LeagueRecord[],
      tags: [] as string[],
      activeFilters: {
        tags: [],
        searchString: '',
        useMap: true,
        activeRulesets: [] as RulesetName[],
      } as LeagueFilters,
      selectedLeague: undefined as undefined | LeagueRecord,
      mapBounds: undefined as undefined | google.maps.LatLngBounds,
      mapFocus: undefined as undefined | { lat: number; lng: number } | google.maps.LatLng,
    }
  },
})
