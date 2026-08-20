<script setup lang="ts">
import { SingleLeagueMergeManager } from '@/model/merge.model'
import type { PropType } from 'vue'

const props = defineProps({
  leagueMergeManager: Object as PropType<SingleLeagueMergeManager>,
})
</script>

<template>
  <v-card color="grey-darken-4" style="padding: 8px">
    <h3 v-html="leagueMergeManager?.base.name"></h3>
    <v-card v-if="leagueMergeManager?.incoming" color="grey-darken-1" style="padding: 8px">
      <h3>
        {{ leagueMergeManager?.manager.incomingDatasetName }} Data:
        {{ leagueMergeManager?.incoming }}
      </h3>
    </v-card>
  </v-card>
</template>
