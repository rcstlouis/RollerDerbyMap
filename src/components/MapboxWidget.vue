<script setup lang="ts">
import mapboxgl, { TargetFeature, type GeoJSONFeature } from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { onMounted, ref, watch } from 'vue'
import { MapManager, RULESET_COLOR_DICT, RULESET_NAME_DICT } from '@/model/maps.model'
import { useMapStore } from '@/stores/map'
import { storeToRefs } from 'pinia'
import { makeid } from '@/services/utils.service'
import type { LeagueRecord } from '@/model/league.model'
import { useDisplay } from 'vuetify'

mapboxgl.accessToken = import.meta.env.VITE_APP_MAPBOX_TOKEN

const mapId = ref<string>(makeid(6))
const mapManager = ref<undefined | MapManager>(undefined)
const { selectedLeague } = storeToRefs(useMapStore())
const highlightedLeagueModel = ref<LeagueRecord | undefined>(undefined)
const overlayModel = ref<boolean>(false)
const height = ref<number>(600)
const width = ref<number>(800)

watch(
  () => selectedLeague.value,
  (newVal: LeagueRecord | undefined) => {
    highlightedLeagueModel.value = selectedLeague.value
    overlayModel.value = !!selectedLeague.value
  },
)

onMounted(async () => {
  height.value = useDisplay().height.value * 0.8
  width.value = useDisplay().width.value
  mapManager.value = new MapManager(mapId.value, useMapStore().leagues)
  console.log('captured id: ', mapId.value)

  // Let viewport size before map load
  await new Promise((resolve, reject) => setTimeout(resolve, 500))
  //@ts-ignore
  mapManager.value.initMap()
})
</script>

<template>
  <v-sheet style="position: relative" rounded="0" color="black">
    <div
      :key="mapId"
      :id="'map-' + mapId"
      :style="{ height: height + 'px', width: width + 'px' }"
    ></div>
    <v-card
      v-if="selectedLeague"
      color="grey-darken-4"
      class="pa-2"
      style="position: absolute; top: 0; right: 0; opacity: 0.8; max-width: 60%"
    >
      <v-sheet class="d-flex justify-center" color="white">
        <v-img
          class="flex-grow-0"
          :src="selectedLeague?.logo"
          style="opacity: 1"
          lazy-src="/logo.svg"
          :width="100"
          :max-height="100"
        />
      </v-sheet>
      <h2>{{ selectedLeague.name }}</h2>
      <p>{{ selectedLeague.city }}</p>
      <p>{{ selectedLeague?.state }}</p>
      <p>{{ selectedLeague.country }}</p>
      <div class="d-flex">
        <v-chip
          v-for="ruleset of selectedLeague?.rulesets ?? []"
          :key="ruleset"
          :color="RULESET_COLOR_DICT[ruleset] ?? 'grey'"
        >
          {{ RULESET_NAME_DICT[ruleset] ?? ruleset }}
        </v-chip>
      </div>
      <v-btn
        v-if="selectedLeague.website"
        style="padding-left: 8px; padding-right: 8px"
        color="white"
        variant="flat"
        :href="selectedLeague.website"
        append-icon="mdi-open-in-new"
        target="_blank"
      >
        Website
      </v-btn>
      <v-btn
        v-if="selectedLeague.wftdaWebsite"
        style="padding-left: 8px; padding-right: 8px"
        color="white"
        variant="flat"
        :href="selectedLeague.wftdaWebsite"
        append-icon="mdi-open-in-new"
        target="_blank"
      >
        WFTDA Page
      </v-btn>
    </v-card>
  </v-sheet>
</template>
