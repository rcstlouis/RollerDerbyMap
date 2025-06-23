<script setup lang="ts">
// import MapWidget from '@/components/MapWidget.vue'
import MapWidget from '@/components/MapWidget.vue'
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useDataStore } from '@/stores/data'
import LeagueFiltersWidget from '@/components/LeagueFiltersWidget.vue'
import LeagueListWidget from '@/components/LeagueListWidget.vue'
import type { LeagueRecord } from '@/model/league.model'

//

const { leagues } = storeToRefs(useDataStore())
const filteredLeagues = computed<LeagueRecord[]>(() => {
  console.log('Filtering on new bounds')
  if (!bounds.value || !leagues.value || !bounds.value.toJSON) return leagues ?? []
  return leagues.value.filter((league) => {
    return bounds.value?.contains(new google.maps.LatLng({ lat: league.lat, lng: league.lng }))
  })
})
const bounds = ref<google.maps.LatLngBounds>()

function setBounds(b: google.maps.LatLngBounds) {
  bounds.value = b
  console.log(`Accepting new bounds`)
}
</script>

<template>
  <v-sheet color="black">
    <div class="px-4 pt-6" style="max-width: 1600px; margin: auto">
      <MapWidget @bounds="setBounds"></MapWidget>
      <v-card color="primary" class="ma-4 pa-4 font-weight-bold">
        {{ filteredLeagues?.length ?? 0 }} League{{ filteredLeagues.length === 1 ? '' : 's' }} in
        This Area
      </v-card>
      <LeagueFiltersWidget></LeagueFiltersWidget>
      <LeagueListWidget :leagues="leagues"></LeagueListWidget>
    </div>
  </v-sheet>

  <div></div>
</template>
