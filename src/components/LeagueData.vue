<script setup lang="ts">
import type { LeagueRecord } from '@/model/league.model';
import { defineProps, ref, type PropType } from 'vue'
import { useDisplay } from 'vuetify';

const { xs } = useDisplay()
const props = defineProps({
  leagueRecord: Object as PropType<LeagueRecord>
})

const leagueColorDict: { [leagueName: string]: string } = {
  'WFTDA': 'pink-lighten-2'
}
</script>

<template>
  <v-card color="white">
    <v-card-text>
      <div :class="{ 'd-flex': true, 'flex-column-reverse': xs }">
        <div>
          <h2>{{ leagueRecord?.name }}</h2>
          <p>{{ leagueRecord?.city }}</p>
          <p>{{ leagueRecord?.state }}</p>
          <p>{{ leagueRecord?.country }}</p>
          <div class="my-2">
            <v-btn v-if="leagueRecord?.website" :href="leagueRecord.website" target="_blank" variant="flat"
              color="primary" :prepend-icon="leagueRecord.website.includes('facebook') ? 'mdi-facebook' : 'mdi-link'">
              Website
            </v-btn>
            <v-btn v-if="leagueRecord?.wftdaWebsite" :href="leagueRecord.wftdaWebsite" target="_blank" variant="flat"
              color="primary" prepend-icon="mdi-link">
              Wftda Page
            </v-btn>
          </div>
          <v-chip v-for="league of leagueRecord?.leagues ?? []" :key="league"
            :color="leagueColorDict[league] ?? 'grey'">
            {{ league }}
          </v-chip>
        </div>
        <v-spacer />
        <v-img :src="leagueRecord?.logo" lazy-src="/logo.svg" :height="100" />
      </div>
    </v-card-text>
  </v-card>
</template>
