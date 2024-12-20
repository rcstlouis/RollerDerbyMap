<script setup lang="ts">
import { GoogleMap, Marker } from 'vue3-google-map';
import { onMounted, reactive, ref } from 'vue'
import { Coord, MapManager2 } from '@/model/maps.model';
import { makeid } from '@/services/utils.service';
import { leagueRecords } from '@/data/leagues.data';

const key = ref<string>(import.meta.env.VITE_APP_GOOGLE_API_KEY)
const center = ref<Coord>(new Coord({ lat: 40.689247, lng: -74.044502 }))
const mapState = reactive({
  mapId: `map-${makeid(6)}`,
  manager: undefined as undefined | MapManager2,
})

onMounted(() => {
  mapState.manager = new MapManager2(leagueRecords)
})

//
</script>

<template>
  <GoogleMap :api-key="key" style="width: 100%; height: 500px" :center="center" :zoom="6">
    <Marker v-for="league of Object.values(mapState.manager?.leagueDict ?? {})" :key="league.name"
      :options="{ position: league.loc }">

    </Marker>
  </GoogleMap>
</template>
