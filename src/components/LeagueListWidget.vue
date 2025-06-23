<script setup lang="ts">
import LeagueData from '@/components/LeagueData.vue'
import { type LeagueRecord } from '@/model/league.model'
import { useDataStore } from '@/stores/data'
import { storeToRefs } from 'pinia'
import { type PropType, watch, onMounted, ref } from 'vue'

const dataStore = useDataStore()
const { activeFilters, mapBounds } = storeToRefs(dataStore)

watch(
  () => dataStore.leagues,
  () => {
    leagueLists.allLeagues = dataStore.leagues ?? []
    updateActiveLeagueList()
    refreshTimestamp.value = new Date().getTime()
  },
)
watch(
  () => activeFilters.value,
  (newVal) => {
    console.debug(`New filter values: ${JSON.stringify(newVal)}`)
    updateActiveLeagueList()
  },
  { deep: true },
)
watch(
  () => mapBounds.value,
  () => {
    updateActiveLeagueList(true)
  },
  { deep: true },
)

const props = defineProps({
  leagues: Object as PropType<LeagueRecord[]>,
})

const refreshTimestamp = ref<number>(new Date().getTime())

const leagueLists = {
  allLeagues: [] as LeagueRecord[],
  filteredLeagues: [] as LeagueRecord[],
  boundAndFilteredLeagues: [] as LeagueRecord[],
  isUsingMap: true,
}

function updateActiveLeagueList(onlyUpdateBounds?: boolean) {
  // Update Using Filters
  if (!onlyUpdateBounds || leagueLists.isUsingMap === !activeFilters.value.useMap) {
    // Update using Tags
    leagueLists.filteredLeagues = leagueLists.allLeagues ?? []
    if (activeFilters.value.tags?.length) {
      leagueLists.filteredLeagues = leagueLists.filteredLeagues.filter((league) => {
        for (const activeTag of activeFilters.value.tags ?? []) {
          if (league.leagues.includes(activeTag as 'WFTDA')) return true // Excessively Narrow cast to suppress error, doesn't actually restrict to WFTDA
          return false
        }
      })
    }
    // Update using search string
    if (activeFilters.value.searchString && activeFilters.value.searchString?.length) {
      leagueLists.filteredLeagues = leagueLists.filteredLeagues.filter(
        (league) =>
          league.city
            .toLocaleLowerCase()
            .includes(activeFilters.value.searchString!.toLocaleLowerCase()) ||
          league.name
            .toLocaleLowerCase()
            .includes(activeFilters.value.searchString!.toLocaleLowerCase()),
      )
    }
  }

  // Update Using Bounds
  if (mapBounds.value && activeFilters.value.useMap) {
    leagueLists.boundAndFilteredLeagues = leagueLists.filteredLeagues.filter(
      (league) =>
        league.lat && league.lng && mapBounds.value?.contains({ lat: league.lat, lng: league.lng }),
    )
  } else {
    leagueLists.boundAndFilteredLeagues = leagueLists.filteredLeagues
  }
  console.debug(`-- All Leagues: ${leagueLists.allLeagues?.length ?? 0}`)
  console.debug(`Filtered Leagues: ${leagueLists.filteredLeagues?.length ?? 0}`)
  console.debug(`Bound Leagues: ${leagueLists.boundAndFilteredLeagues?.length ?? 0}`)
  refreshTimestamp.value = new Date().getTime()
}

onMounted(() => {
  leagueLists.allLeagues = dataStore.leagues ?? []
  updateActiveLeagueList()
})
</script>

<template>
  <v-sheet color="black">
    <div class="px-4 pt-6" style="max-width: 800px; margin: auto" :key="refreshTimestamp">
      <!-- <p>{{ refreshTimestamp }}</p> -->
      <!-- <p>Total Leagues: {{ leagueLists.allLeagues?.length ?? 0 }}</p> -->
      <!-- <p>Unbound Leagues: {{ leagueLists.filteredLeagues?.length ?? 0 }}</p> -->
      <p>Leagues matching criteria: {{ leagueLists.boundAndFilteredLeagues?.length ?? 0 }}</p>

      <!-- <v-text-field
        v-model="filter"
        label="Filter"
        prepend-icon="mdi-magnify"
        variant="outlined"
        density="compact"
      ></v-text-field> -->
      <div v-for="league of leagueLists.boundAndFilteredLeagues" :key="league.name" class="mb-4">
        <LeagueData :league-record="league"></LeagueData>
      </div>
      <div v-if="!leagueLists.allLeagues?.length">
        <p>League data has not yet loaded</p>
      </div>
      <div v-else-if="!leagueLists.boundAndFilteredLeagues.length">
        <p>No leagues found matching "{{ activeFilters.searchString }}"</p>
      </div>
    </div>
  </v-sheet>
</template>
