<script setup lang="ts">
import custardData from '@/data/merge 2026-08-19/custard-parse.json' with { type: 'json' }
import wftdaScrape from '@/data/merge 2026-08-19/wftda-scrape.json' with { type: 'json' }
import type { LeagueRecord } from '@/model/league.model'
import { MultipleLeagueMergeManager, SingleLeagueMergeManager } from '@/model/merge.model'
import { onMounted, ref } from 'vue'
import MergeableLeagueCard from '@/components/MergeableLeagueCard.vue'
import dayjs from 'dayjs'

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

function downloadTextFile() {
  // Step 1: Define text content
  const textContent = JSON.stringify(mergeManager.value?.getFinalizedMergeData(), null, 4)

  // Step 2: Create Blob
  const blob = new Blob([textContent], { type: 'text/json;charset=utf-8' })

  // Step 3: Generate object URL
  const blobUrl = URL.createObjectURL(blob)

  // Step 4: Trigger download
  const downloadLink = document.createElement('a')
  downloadLink.href = blobUrl
  downloadLink.download = `${dayjs().format('YYYY-MM-DD-HH:MM:ss')}-merge-${mergeManager.value?.baseDatasetName}-${mergeManager.value?.incomingDatasetName}.json`
  downloadLink.style.display = 'none'
  document.body.appendChild(downloadLink)
  downloadLink.click()

  // Step 5: Cleanup
  document.body.removeChild(downloadLink)
  URL.revokeObjectURL(blobUrl)
}
</script>

<template>
  <h1>Merging CUSTARD data into WFTDA data</h1>
  <v-btn
    variant="flat"
    color="primary"
    prepend-icon="mdi-download"
    @click.stop="downloadTextFile()"
  >
    Download result
  </v-btn>
  <div
    style="margin-bottom: 16px"
    v-for="(leagueMergeManager, i) of Object.values(
      mergeManager?.singleLeagueMergeManagerDict ?? {},
    )"
    :key="leagueMergeManager.base.name + '-' + isMounted"
  >
    <div v-if="leagueMergeManager.baseIsMergeCandidate()">
      {{ i }}
      <MergeableLeagueCard :league-merge-manager="leagueMergeManager"></MergeableLeagueCard>
    </div>
  </div>
  <v-btn
    variant="flat"
    color="primary"
    prepend-icon="mdi-download"
    @click.stop="downloadTextFile()"
  >
    Download result
  </v-btn>
</template>
