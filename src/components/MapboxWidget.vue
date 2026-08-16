<script setup lang="ts">
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { onMounted, ref } from 'vue'
import rawLeagueData from '@/data/2026-08-15-leagues.data.json' with { type: 'json' }

mapboxgl.accessToken = import.meta.env.VITE_APP_MAPBOX_TOKEN

const geoJsonData = ref<unknown>(undefined)

function generateGeoJSON() {
  const features = []
  for (const league of rawLeagueData) {
    features.push({
      geometry: {
        type: 'Point',
        coordinates: [league.lng, league.lat],
      },
      type: 'Feature',
      properties: {
        description: `${league.name} (${league.lat}, ${league.lng})`,
        // 'marker-symbol': 'marker',
        // 'marker-color': '#f800fc',
        // 'marker-size': 'medium',
        // title: league.name,
        // url: league.website,
      },
    })
  }
  return {
    type: 'FeatureCollection',
    features,
  }
}

onMounted(() => {
  console.log('token: ', import.meta.env.VITE_APP_MAPBOX_TOKEN)
  geoJsonData.value = generateGeoJSON()
  const map = new mapboxgl.Map({
    container: 'map',
    center: [-71.06776, 42.35816],
    zoom: 9,
    config: {
      basemap: {
        theme: 'monochrome',
        showPlaceLabels: false,
        showPointOfInterestLabels: false,
        showRoadLabels: false,
        showTransitLabels: false,
      },
    },
  })
  console.log(map)
  map.on('load', () => {
    console.log('Adding geojson ', geoJsonData.value)
    map.addSource('wftda-leagues', { type: 'geojson', data: geoJsonData.value as string })
    map.addLayer({
      id: 'wftda',
      type: 'symbol',
      source: 'wftda-leagues',
      layout: {
        'text-field': ['get', 'description'],
        'text-variable-anchor': ['top', 'bottom', 'left', 'right'],
        'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
        'text-radial-offset': 0.5,
        'text-justify': 'auto',
      },
    })
  })
})
</script>

<template>
  <p>This is the new map</p>
  <div id="map" style="width: 800px; height: 600px"></div>
</template>
