<script setup lang="ts">
import { GoogleMap, CustomMarker, MarkerCluster } from 'vue3-google-map'
import { onMounted, reactive, ref, watch } from 'vue'
import { Coord, MapManager2 } from '@/model/maps.model'
import { makeid } from '@/services/utils.service'
// import { leagueRecords } from '@/data/leagues.data'
import { useDataStore } from '@/stores/data'
import { storeToRefs } from 'pinia'
import type { LeagueRecord } from '@/model/league.model'

const mapRef = ref()
const key = ref<string>(import.meta.env.VITE_APP_GOOGLE_API_KEY)
const center = ref<Coord>(new Coord({ lat: 40.689247, lng: -74.044502 }))
const mapState = reactive({
  mapId: `map-${makeid(6)}`,
  manager: undefined as undefined | MapManager2,
  map: undefined as undefined | google.maps.Map,
})
const { leagues } = storeToRefs(useDataStore())

const emit = defineEmits(['bounds'])
// const map = computed<google.maps.Map | undefined>(() =>
// mapRef.value?.ready ? mapRef.value.map : undefined,
// )

watch(
  () => mapRef.value?.ready,
  (newVal: boolean) => {
    console.log(`New map? ${newVal} ${mapRef.value.map as google.maps.Map}`)
    mapState.map = mapRef.value.map
    console.log(`Bounds: ${mapState.map?.getBounds()}`)
    mapState.map?.addListener('idle', () => {
      const b: google.maps.LatLngBounds | undefined = mapState.map?.getBounds()
      console.log(`New bounds: ${b}`)
      if (b) emit('bounds', b)
    })
  },
)

watch(
  () => leagues.value,
  (newVal: LeagueRecord[]) => {
    mapState.manager = new MapManager2(newVal)
  },
)

onMounted(async () => {
  mapState.manager = new MapManager2([])
  useDataStore().refreshLeagues() // Set new league data
  // const leagues = await useDataStore().refreshLeagues()
  // mapState.manager = new MapManager2(leagues)

  // ;(mapRef.value.setup.map as google.maps.Map). = 20
})

//
</script>

<template>
  <v-card color="grey-lighten-1">
    <GoogleMap
      ref="mapRef"
      :api-key="key"
      style="width: 100%; height: 500px"
      :center="center"
      :zoom="6"
      :map-id="mapState.mapId"
    >
      <MarkerCluster>
        <div v-for="league of Object.values(mapState.manager?.leagueDict ?? {})" :key="league.name">
          <CustomMarker
            v-if="league.lat"
            :options="{
              position: { lat: league.lat, lng: league.lng },
              anchorPoint: 'BOTTOM_CENTER',
            }"
          >
            <v-card style="text-align: center; height: 78px; width: 78px" class="pa-1">
              <div style="color: black">{{ league.name }}</div>
              <img
                v-if="league.logo === '/img/leagues/WFTDA/trans.png'"
                src="/logo.svg"
                style="width: 40px; height: 40px"
              />
              <img v-else :src="league.logo" style="width: 40px; height: 40px" />
            </v-card>
          </CustomMarker>
        </div>
      </MarkerCluster>
    </GoogleMap>
  </v-card>
</template>
