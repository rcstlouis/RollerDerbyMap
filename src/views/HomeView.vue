<script setup lang="ts">
// import MapWidget from '@/components/MapWidget.vue'
import LeagueData from '@/components/LeagueData.vue';
import MapWidget2 from '@/components/MapWidget2.vue'
import { wftdaScrape } from '@/data/leagues.data';
//
</script>

<template>
  <v-sheet color="black">
    <div class="px-4 pt-6" style="max-width: 800px; margin: auto">
      <h1>Find a Derby League Near You!</h1>
      <!-- <MapWidget></MapWidget> -->
      <MapWidget2></MapWidget2>
    </div>

    <div class="ma-4">
      <LeagueData :league-record="wftdaScrape[0]"></LeagueData>
    </div>
    <div class="ma-4">
      <LeagueData :league-record="wftdaScrape[1]"></LeagueData>
    </div>
    <div class="ma-4">
      <LeagueData :league-record="wftdaScrape[2]"></LeagueData>
    </div>
  </v-sheet>
</template>
