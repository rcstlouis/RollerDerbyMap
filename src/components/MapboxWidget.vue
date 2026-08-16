<script setup lang="ts">
import mapboxgl, { TargetFeature, type GeoJSONFeature } from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { onMounted, ref } from 'vue'
import rawLeagueData from '@/data/2026-08-15-leagues.data.json' with { type: 'json' }
import { makeid } from '@/services/utils.service'

mapboxgl.accessToken = import.meta.env.VITE_APP_MAPBOX_TOKEN

const mapId = makeid(6)
const geoJsonData = ref<unknown>(undefined)
const highlightedLeague = ref<string | undefined>(undefined)

function generateGeoJSON() {
  const features = []
  for (const league of rawLeagueData) {
    features.push({
      id: league.id,
      geometry: {
        type: 'Point',
        coordinates: [league.lng, league.lat],
      },
      type: 'Feature',
      properties: {
        description: `${league.name} (${league.lat}, ${league.lng})`,
        'marker-symbol': 'marker',
        'marker-color': '#f800fc',
        'marker-size': 'medium',
        title: league.name,
        url: league.website,
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
    container: 'map-' + mapId,
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
    // map.addLayer({
    //   id: 'wftda-names',
    //   type: 'symbol',
    //   source: 'wftda-leagues',
    //   layout: {
    //     'text-field': ['get', 'description'],
    //     'text-variable-anchor': ['top', 'bottom', 'left', 'right'],
    //     'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
    //     'text-radial-offset': 0.5,
    //     'text-justify': 'auto',
    //   },
    // })
    map.addLayer({
      id: 'wftda-circles',
      type: 'circle',
      source: 'wftda-leagues',
      paint: {
        'circle-color': [
          'case',
          ['boolean', ['feature-state', 'selected'], false],
          '#f00',
          '#4264fb',
        ],
        'circle-radius': [
          'case',
          ['boolean', ['feature-state', 'selected'], false],
          6,
          ['boolean', ['feature-state', 'highlight'], false],
          6,
          4,
        ],
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ffffff',
      },
    })

    let selectedFeature: TargetFeature | undefined = undefined

    // Clicking on a feature will highlight it and display its properties in the card
    map.addInteraction('click', {
      type: 'click',
      target: { layerId: 'wftda-circles' },
      handler: ({ feature }) => {
        if (selectedFeature) {
          map.setFeatureState(selectedFeature, { selected: false })
        } else if (feature) {
          selectedFeature = feature
          map.setFeatureState(feature!, { selected: true })
        }

        highlightedLeague.value = feature?.properties?.title as string | undefined
        console.log('league: ', feature)
      },
    })

    // Clicking on the map will deselect the selected feature
    map.addInteraction('map-click', {
      type: 'click',
      handler: () => {
        if (selectedFeature) {
          map.setFeatureState(selectedFeature, { selected: false })
          selectedFeature = undefined
          highlightedLeague.value = undefined
        }
      },
    })

    // Hovering over a feature will highlight it
    map.addInteraction('mouseenter', {
      type: 'mouseenter',
      target: { layerId: 'airport' },
      handler: ({ feature }) => {
        map.setFeatureState(feature!, { highlight: true })
        map.getCanvas().style.cursor = 'pointer'
      },
    })

    // Moving the mouse away from a feature will remove the highlight
    map.addInteraction('mouseleave', {
      type: 'mouseleave',
      target: { layerId: 'airport' },
      handler: ({ feature }) => {
        map.setFeatureState(feature!, { highlight: false })
        map.getCanvas().style.cursor = ''
        return false
      },
    })
  })
})
</script>

<template>
  <div>
    <div :id="'map-' + mapId" style="width: 800px; height: 600px"></div>
    <v-card :id="`map-${mapId}-info`">
      Selected League: {{ highlightedLeague }}
      <v-card-title>{{ highlightedLeague }}</v-card-title>
    </v-card>
  </div>
</template>
