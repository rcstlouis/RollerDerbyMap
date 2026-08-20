<script setup lang="ts">
import custardData from '@/data/merge 2026-08-19/custard-parse.json' with { type: 'json' }
import wftdaScrape from '@/data/merge 2026-08-19/wftda-scrape.json' with { type: 'json' }
import type { LeagueRecord } from '@/model/league.model'
import { MultipleLeagueMergeManager } from '@/model/merge.model'
import { onMounted, ref } from 'vue'
import MergeableLeagueCard from '@/components/MergeableLeagueCard.vue'

const mergeManager = ref<MultipleLeagueMergeManager | undefined>(undefined)
const isMounted = ref<string>('false')

onMounted(() => {
  ;(mergeManager.value = new MultipleLeagueMergeManager(
    {
      baseDatasetName: 'WFTDA',
      incomingDatasetName: 'CUSTARD',
      mergeStrategy: 'stringSimilarityUSA_WFTDA',
    },
    wftdaScrape as LeagueRecord[],
    custardData as LeagueRecord[],
  )),
    (isMounted.value = 'true')
})
</script>

<template>
  <h1>Merging CUSTARD data into WFTDA data</h1>
  <div
    style="margin-bottom: 16px"
    v-for="leagueMergeManager of Object.values(mergeManager?.singleLeagueMergeManagerDict ?? {})"
    :key="leagueMergeManager.base.name + '-' + isMounted"
  >
    <MergeableLeagueCard :league-merge-manager="leagueMergeManager"></MergeableLeagueCard>
  </div>
</template>
