<script setup lang="ts">
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { onMounted } from 'vue'

mapboxgl.accessToken = import.meta.env.VITE_APP_MAPBOX_TOKEN

onMounted(() => {
  console.log('token: ', import.meta.env.VITE_APP_MAPBOX_TOKEN)
  const map = new mapboxgl.Map({
    container: 'map',
    center: [-71.06776, 42.35816],
    zoom: 9,
  })
  console.log(map)
})
</script>

<template>
  <p>This is the new map</p>
  <div id="map" style="width: 800px; height: 600px"></div>
</template>
