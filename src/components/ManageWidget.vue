<script setup lang="ts">
import type { LeagueRecord } from '@/model/league.model';
import { type PropType, defineProps, reactive, defineEmits } from 'vue';
import ManageLeague from './ManageLeague.vue';

const props = defineProps({
  leagueData: Object as PropType<LeagueRecord>
})
const emits = defineEmits(['setEditState'])

const editState = reactive({
  isEditing: false,
})

function setEdit(state: boolean) {
  editState.isEditing = state
  emits('setEditState', state)
}
</script>

<template>
  <h2>Manage League</h2>
  <ManageLeague :league-data="leagueData" @set-edit-state="setEdit"></ManageLeague>

  <h2 class="mt-2">Manage Events</h2>
</template>
