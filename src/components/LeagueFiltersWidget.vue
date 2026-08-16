<script setup lang="ts">
import type { LeagueFilters } from '@/model/maps.model'
import { useDataStore } from '@/stores/data'
import { storeToRefs } from 'pinia'
import { onMounted, reactive } from 'vue'
import '@googlemaps/extended-component-library/place_picker.js'

const dataStore = useDataStore()
const { tags } = storeToRefs(dataStore)

const filterState = reactive({
  tags: [] as string[],
  searchString: '',
  useMap: true,
})

function getFilters(): LeagueFilters {
  return {
    tags: filterState.tags,
    searchString: filterState.searchString,
    useMap: filterState.useMap,
  }
}

function syncFilterState() {
  dataStore.activeFilters = getFilters()
}

onMounted(() => {
  filterState.searchString = dataStore.activeFilters.searchString ?? ''
  filterState.tags = dataStore.activeFilters.tags ?? []
  filterState.useMap = dataStore.activeFilters.useMap ?? true

  // const placePicker = document.getElementById('place-picker')
  // placePicker?.addEventListener('gmpx-placechange', () => {
  // const loc = ((placePicker as unknown)!.value as google.maps.Place).location
  // console.log(`Centering map to ${loc}`)
  // if (loc) dataStore.mapFocus = loc
  // })
})
</script>

<template>
  <div color="black">
    <!-- <h1>Map Controls</h1>
    <gmpx-place-picker
      placeholder="Center Map On"
      id="place-picker"
      style="width: 100%"
    ></gmpx-place-picker>

    <h1>Filters</h1>
    <v-select
      v-model="filterState.tags"
      multiple
      :items="tags"
      variant="outlined"
      label="Affiliations/Rulesets"
      prepend-icon="mdi-tag"
      hide-details="auto"
      @update:model-value="syncFilterState"
    ></v-select>
    <v-text-field
      v-model="filterState.searchString"
      label="Filter"
      prepend-icon="mdi-magnify"
      variant="outlined"
      hide-details="auto"
      class="mt-4"
      @update:model-value="syncFilterState"
    ></v-text-field>
    <v-switch
      v-model="filterState.useMap"
      label="Filter using Map"
      color="primary"
      prepend-icon="mdi-map"
      class="mt-1"
      @update:model-value="syncFilterState"
    ></v-switch> -->
  </div>
</template>
