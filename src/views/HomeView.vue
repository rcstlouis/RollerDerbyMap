<script setup lang="ts">
// import MapWidget from '@/components/MapWidget.vue'
import LeagueData from '@/components/LeagueData.vue'
import MapWidget2 from '@/components/MapWidget2.vue'
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useDataStore } from '@/stores/data'

//

const { leagues } = storeToRefs(useDataStore())
const filteredLeagues = computed(() => {
  console.log('Filtering on new bounds')
  if (!bounds.value || !leagues.value || !bounds.value.toJSON) return leagues ?? []
  const l = leagues.value.filter((league) => {
    const jb = bounds.value?.toJSON()
    // return bounds.value?.contains(new google.maps.LatLng({ lat: league.lat, lng: league.lng }))
    if (!jb) return !!league
    if (league.lat > jb.north || jb.south > league.lat) return false
    if (league.lng > jb.east || jb.west > league.lng) return false
    return !!league
  })
  // console.log(`Filtered Leagues: ${JSON.stringify(l)}`)
  return l
})
const bounds = ref<google.maps.LatLngBounds>()

function setBounds(b: google.maps.LatLngBounds) {
  bounds.value = b
  console.log(`Accepting new bounds`)
}
</script>

<template>
  <v-sheet color="black">
    <div class="px-4 pt-6" style="max-width: 800px; margin: auto">
      <h1>Find a Derby League Near You!</h1>
      <!-- <MapWidget></MapWidget> -->
      <MapWidget2 @bounds="setBounds"></MapWidget2>
    </div>
    <v-card color="primary" class="ma-4 pa-4 font-weight-bold">
      {{ filteredLeagues?.length ?? 0 }} League{{ filteredLeagues.length === 1 ? '' : 's' }} in This
      Area
    </v-card>

    <div v-for="league of filteredLeagues" :key="JSON.stringify(league)">
      <div v-if="league" class="ma-4">
        <LeagueData :league-record="league"></LeagueData>
      </div>
    </div>
    <!-- <div class="ma-4">
      <LeagueData :league-record="wftdaScrape[0]"></LeagueData>
    </div>
    <div class="ma-4">
      <LeagueData :league-record="wftdaScrape[1]"></LeagueData>
    </div>
    <div class="ma-4">
      <LeagueData :league-record="wftdaScrape[2]"></LeagueData>
    </div> -->
  </v-sheet>
</template>
