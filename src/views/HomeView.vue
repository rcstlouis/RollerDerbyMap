<script setup lang="ts">
// import MapWidget from '@/components/MapWidget.vue'
// import MapWidget from '@/components/MapWidget.vue'
// import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useDataStore } from '@/stores/data'
import LeagueFiltersWidget from '@/components/LeagueFiltersWidget.vue'
import LeagueListWidget from '@/components/LeagueListWidget.vue'
// import type { LeagueRecord } from '@/model/league.model'
import { useDisplay } from 'vuetify'
import MapboxWidget from '@/components/MapboxWidget.vue'

const { smAndDown } = useDisplay()

const { leagues } = storeToRefs(useDataStore())
// const filteredLeagues = computed<LeagueRecord[]>(() => {
//   console.log('Filtering on new bounds')
//   if (!bounds.value || !leagues.value || !bounds.value.toJSON) return leagues ?? []
//   return leagues.value.filter((league) => {
//     return bounds.value?.contains(new google.maps.LatLng({ lat: league.lat, lng: league.lng }))
//   })
// })
// const bounds = ref<google.maps.LatLngBounds>()

// function setBounds(b: google.maps.LatLngBounds) {
// bounds.value = b
// console.log(`Accepting new bounds`)
// }
</script>

<template>
  <v-sheet color="black">
    <div :class="`d-flex w-100 ${smAndDown ? 'flex-column' : ''}`">
      <div class="flex-grow-1">
        <v-sheet color="grey-lighten-1">
          <div class="d-flex justify-center">
            <MapboxWidget></MapboxWidget>
          </div>
          <!-- <MapWidget v-if="" @bounds="setBounds"></MapWidget> -->
          <!-- <v-card color="primary" class="pa-2 font-weight-bold text-center"> -->
          <!-- {{ filteredLeagues?.length ?? 0 }} League{{ filteredLeagues.length === 1 ? '' : 's' }} -->
          <!-- in This Area -->
          <!-- </v-card> -->
        </v-sheet>
        <!-- <LeagueFiltersWidget></LeagueFiltersWidget> -->
      </div>
      <v-sheet class="d-flex justify-center pa-4" color="black" style="line-height: 1.1">
        <div>
          <p>
            Roller derby map is a work-in-progress. Check back later for more! Special thanks to the
            Villain and to <a href="https://linktr.ee/CustardVillain" target="_blank">CUSTARD</a>,
            on whose work this site is built.
          </p>
        </div>
      </v-sheet>
      <!-- <div class="flex-grow-0" style="max-height: 70vh; overflow-y: scroll">
          <LeagueListWidget :leagues="leagues"></LeagueListWidget>
        </div> -->
    </div>
  </v-sheet>

  <div></div>
</template>
