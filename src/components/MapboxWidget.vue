<script setup lang="ts">
import mapboxgl, { TargetFeature, type GeoJSONFeature } from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { onMounted, ref } from 'vue'
import rawLeagueData from '@/data/2026-08-15-leagues.data.json' with { type: 'json' }
import { makeid } from '@/services/utils.service'
import { MapManager } from '@/model/maps.model'
import { useMapStore } from '@/stores/map'

mapboxgl.accessToken = import.meta.env.VITE_APP_MAPBOX_TOKEN

const mapId = ref<string>('')
const highlightedLeague = ref<string | undefined>(undefined)
const mapManager = ref<undefined | MapManager>(undefined)

onMounted(async () => {
  mapManager.value = new MapManager(useMapStore().leagues)
  // @ts-ignore
  mapId.value = mapManager.value.getId()
  // Delay to give the div a bit to set up
  await new Promise((resolve, reject) => setTimeout(resolve, 500))
  console.log('captured id: ', mapId.value)
  mapManager.value.initMap()
})
</script>

<template>
  <div>
    <div :key="mapId" :id="'map-' + mapId" style="width: 800px; height: 600px"></div>
    <v-card :key="mapId" :id="`map-${mapId}-info`">
      Selected League: {{ highlightedLeague }}
      <v-card-title>{{ highlightedLeague }}</v-card-title>
    </v-card>
  </div>
</template>
