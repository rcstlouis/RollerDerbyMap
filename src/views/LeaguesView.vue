<script setup lang="ts">
import LeagueData from '@/components/LeagueData.vue';
import { wftdaScrape } from '@/data/leagues.data';
import { type LeagueRecord } from '@/model/league.model';
import { ref, computed } from 'vue'

const filter = ref<string>('')
const filteredLeagues = computed<LeagueRecord[]>(() => {
  const fl = wftdaScrape.sort((a, b) => {
    if (a.name === b.name) return 0
    return a.name < b.name ? -1 : 1
  })
  if (!filter.value.length) return fl
  return fl.filter(league => league.city.toLocaleLowerCase().includes(filter.value.toLocaleLowerCase()) || league.name.toLocaleLowerCase().includes(filter.value.toLocaleLowerCase()))
})
</script>

<template>
  <v-sheet color="black">
    <div class="px-4 pt-6" style="max-width: 800px; margin: auto">
      <h1>Known Leagues</h1>
      <v-text-field v-model="filter" label="Filter" prepend-icon="mdi-magnify" variant="outlined"></v-text-field>

      <div v-for="league of filteredLeagues" :key="league.name" class="mb-4">
        <LeagueData :league-record="league"></LeagueData>
      </div>
      <div v-if="!filteredLeagues.length">
        <p> No leagues found matching "{{ filter }}" </p>
      </div>
    </div>
  </v-sheet>
</template>
