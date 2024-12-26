<script setup lang="ts">
import type { LeagueRecord } from '@/model/league.model';
import LeagueData from './LeagueData.vue';
import { type PropType, defineProps, onMounted, reactive } from 'vue';
import { useVuelidate } from '@vuelidate/core'
import { required, url } from '@vuelidate/validators'
import { VFileUpload } from 'vuetify/labs/VFileUpload'

const props = defineProps({
  leagueData: Object as PropType<LeagueRecord>
})
const editState = reactive({
  isEditing: false,
})

const state = reactive({
  name: '',
  city: '',
  state: '',
  country: '',
  website: '',
  wftdaWebsite: '',
  leagues: [] as string[],
  newLogoFile: undefined as undefined | File
})
const rules = {
  name: { required },
  city: { required },
  state: {},
  country: { required },
  website: { url },
  wftdaWebsite: { url },
  leagues: {},
  newLogoFile: {}
}

const v$ = useVuelidate(rules, state)

function resetForm() {
  editState.isEditing = false
  if (props.leagueData) {
    state.name = props.leagueData.name
    state.city = props.leagueData.city
    state.state = props.leagueData.state ?? ''
    state.country = props.leagueData.country
    state.website = props.leagueData.website ?? ''
    state.wftdaWebsite = props.leagueData?.wftdaWebsite ?? ''
    state.newLogoFile = undefined
    state.leagues = props.leagueData.leagues
  }
}

onMounted(() => {
  resetForm()
})
</script>

<template>
  <h2>Manage League</h2>
  <div v-if="!editState.isEditing">
    <LeagueData :league-record="leagueData"></LeagueData>
    <div class="mt-n14 mr-2" style="text-align: right; position:relative">
      <v-btn icon="mdi-pencil" variant="flat" color="secondary" @click="editState.isEditing = true">
      </v-btn>
    </div>
  </div>
  <div v-else>
    <v-card color="grey-lighten-4">
      <v-card-text>
        <h2>Editing {{ leagueData?.name ?? 'Invalid League' }}</h2>

        <v-card color="white">
          <v-card-text>
            <h3>Replace Image</h3>
            <v-img :src="leagueData?.logo" lazy-src="/logo.svg" :height="100" />
            <VFileUpload density="compact" clearable scrim="primary"></VFileUpload>
          </v-card-text>
        </v-card>

        <v-text-field v-model="v$.name.$model" class="mt-3" label="League Name*" variant="outlined" density="compact"
          hide-details="auto" :error-messages="v$.name.$errors.map((e: any) => e.$message as string)"></v-text-field>
        <v-text-field v-model="v$.city.$model" class="mt-3" label="City*" variant="outlined" density="compact"
          hide-details="auto" :error-messages="v$.city.$errors.map((e: any) => e.$message as string)"></v-text-field>
        <v-text-field v-model="v$.state.$model" class="mt-3" label="State/Province/Territory" variant="outlined"
          density="compact" hide-details="auto"
          :error-messages="v$.state.$errors.map((e: any) => e.$message as string)"></v-text-field>
        <v-text-field v-model="v$.country.$model" class="mt-3" label="Country*" variant="outlined" density="compact"
          hide-details="auto" :error-messages="v$.country.$errors.map((e: any) => e.$message as string)"></v-text-field>
        <v-text-field v-model="v$.website.$model" class="mt-3" label="Website" variant="outlined" density="compact"
          hide-details="auto" :error-messages="v$.website.$errors.map((e: any) => e.$message as string)"></v-text-field>
        <v-select multiple v-model="v$.leagues.$model" class="mt-3" label="Leagues" variant="outlined" density="compact"
          chips hide-details="auto" :items="['WFTDA', 'MRDA', 'JRDA', 'Short Track']"
          :error-messages="v$.leagues.$errors.map((e: any) => e.$message as string)"></v-select>
        <v-text-field v-if="v$.leagues.$model.includes('WFTDA')" v-model="v$.wftdaWebsite.$model" class="mt-3"
          label="WFTDA Page" variant="outlined" density="compact" hide-details="auto"
          :error-messages="v$.wftdaWebsite.$errors.map((e: any) => e.$message as string)"></v-text-field>
        <v-card-actions>
          <div class="d-flex mt-4" style="width:100%">
            <v-btn variant="flat" prepend-icon="mdi-close" @click="resetForm" color="red-lighten-1"> Cancel </v-btn>
            <v-spacer />
            <v-btn class="ml-2" :disabled="v$.$invalid" color="secondary" variant="flat"
              prepend-icon="mdi-content-save">Submit</v-btn>
          </div>
        </v-card-actions>
      </v-card-text>
    </v-card>
  </div>

  <h2>Manage Events</h2>
</template>
