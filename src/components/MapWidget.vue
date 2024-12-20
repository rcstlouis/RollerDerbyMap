<script setup lang="ts">
import { getMap } from '@/services/maps.service'
import { ref, onMounted, reactive } from 'vue'
import { makeid } from '@/services/utils.service'
import { MapManager } from '@/model/maps.model'
import { leagueRecords } from '@/data/leagues.data';

const mapElement = ref<HTMLElement>()
const mapState = reactive({
  mapId: `map-${makeid(6)}`,
  manager: undefined as undefined | MapManager,
  markers: [] as google.maps.marker.AdvancedMarkerElement[]
})

async function createMap() {
  setTimeout(async () => {

    if (mapElement.value) {
      const map = await getMap(mapElement.value!, mapState.mapId)
      mapState.manager = new MapManager(map, mapState.mapId)
    } else {
      console.error(`Map failed to load`)
    }

    setTimeout(async () => {

      for (const leagueRecord of leagueRecords) {
        console.log(`Registering ${leagueRecord.name}`)
        const marker = await mapState.manager?.addLeague(leagueRecord)
        if (marker) mapState.markers.push(marker)
      }
    }, 2000)
  }, 2000)
}

onMounted(async () => {
  console.log(`Skipping mount`)
})
</script>

<template>
  <v-card class="pa-2" color="grey-lighten-1">
    This is above the map
    <v-btn @click="createMap">Generate map</v-btn>
    <div ref="mapElement" style="height: 400px; width: 100%;">
    </div>
    This is below the map
  </v-card>
</template>
