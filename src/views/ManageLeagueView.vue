<script setup lang="ts">
import ManageWidget from '@/components/ManageWidget.vue';
import { wftdaScrape } from '@/data/leagues.data';
import { type LeagueRecord } from '@/model/league.model';
import { computed, ref } from 'vue'

const selectedLeagueId = ref<string>('')
const availableLeagues = ref<string[]>(wftdaScrape.map(league => league.name))
const selectedLeague = computed<LeagueRecord | undefined>((): LeagueRecord | undefined => {
  return wftdaScrape.find(league => league.name === selectedLeagueId.value)
})

</script>

<template>
  <v-sheet color="black">
    <div class="px-4 pt-6" style="max-width: 800px; margin: auto">
      <h1>Admin Center</h1>
      <p>Select a league to manage</p>
      <v-autocomplete v-model="selectedLeagueId" variant="outlined" :items="availableLeagues"
        hide-details="auto"></v-autocomplete>
      <ManageWidget v-if="selectedLeague" :league-data="selectedLeague" :key="selectedLeagueId"></ManageWidget>
    </div>
  </v-sheet>
</template>
