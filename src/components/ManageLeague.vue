<script setup lang="ts">
import type { LeagueRecord } from '@/model/league.model';
import LeagueData from './LeagueData.vue';
import { type PropType, defineProps, onMounted, reactive, defineEmits, computed } from 'vue';
import { useVuelidate } from '@vuelidate/core'
import { required, url, helpers } from '@vuelidate/validators'
import { VFileUpload } from 'vuetify/labs/VFileUpload'
import type { FirebaseError } from 'firebase/app';
import { useDataStore } from '@/stores/data';
import { DataSyncRequestBody } from '@/model/dataSync.model';
import type { HttpsCallableResult } from 'firebase/functions';
import { fileToBase64 } from '@/services/utils.service';

const props = defineProps({
  leagueData: Object as PropType<LeagueRecord | undefined>
})
const emits = defineEmits(['setEditState'])

const editState = reactive({
  isEditing: false,
  status: 'ready' as 'ready' | 'sending' | 'error' | 'success',
  errorMessage: '' as string | FirebaseError
})

const state = reactive({
  name: '',
  city: '',
  state: '',
  country: '',
  website: '',
  wftdaWebsite: '',
  leagues: [] as ('WFTDA' | 'MRDA' | 'JRDA' | 'Short Track')[],
  newLogoFile: undefined as undefined | File,

  contributorType: 'Fan' as 'Member' | 'Admin' | 'Fan',
  contributorNotes: '',
  contributorProof: '',

})
const rules = {
  name: { required },
  city: { required },
  state: {},
  country: { required },
  website: { url },
  wftdaWebsite: { url },
  leagues: {},
  newLogoFile: {},

  contributorType: { requiredIfNew: helpers.withMessage('Please specify your relation to the league', (value: string) => !!value || !isNewLeague.value) },
  contributorProof: { requiredIfNew: helpers.withMessage('Please include signs of ongoing activity to help us verify this league', (value: string) => !!value || !isNewLeague.value) },
  contributorNotes: {},
}

const v$ = useVuelidate(rules, state)

const isNewLeague = computed<boolean>(() => {
  return !props.leagueData
})

function setEdit() {
  editState.isEditing = true
  emits('setEditState', true)
}

function resetForm() {
  editState.isEditing = false
  emits('setEditState', false)
  if (props.leagueData) {
    state.name = props.leagueData.name
    state.city = props.leagueData.city
    state.state = props.leagueData.state ?? ''
    state.country = props.leagueData.country
    state.website = props.leagueData.website ?? ''
    state.wftdaWebsite = props.leagueData?.wftdaWebsite ?? ''
    state.newLogoFile = undefined
    state.leagues = props.leagueData.leagues

    state.contributorType = 'Fan'
    state.contributorProof = ''
    state.contributorNotes = ''
  }
}

async function attemptSubmit() {
  v$.value.$touch()
  if (v$.value.$invalid) {
    editState.status = 'error'
    const errorMessage = `Please fix the form data before continuing`
    console.log(errorMessage)
    return
  }
  editState.status = 'sending'
  const file = state.newLogoFile ? await fileToBase64(state.newLogoFile) : undefined

  if (isNewLeague.value) {
    await useDataStore().dataSync(new DataSyncRequestBody('contribute:newLeague', {
      file,
      leagueData: {
        name: state.name,

        country: state.country,
        state: state.state,
        city: state.state,
        loc: { lat: 0, lng: 0 },

        leagues: state.leagues,
        website: state.website,
        wftdaWebsite: state.wftdaWebsite,
      },
      contribute: {
        leagueRelation: state.contributorType,
        signsOfActivity: state.contributorProof,
        notes: state.contributorNotes
      }
    })).then(() => {
      editState.status = 'success'
    }).catch((response: HttpsCallableResult<unknown>) => {
      editState.status = 'error'
      editState.errorMessage = response.data as string | FirebaseError
    })
  } else {
    await useDataStore().dataSync(new DataSyncRequestBody('editLeague', {
      file,
      docId: props.leagueData?.id,
      leagueData: {
        name: state.name,

        country: state.country,
        state: state.state,
        city: state.state,
        loc: { lat: 0, lng: 0 },

        leagues: state.leagues,
        website: state.website,
        wftdaWebsite: state.wftdaWebsite,
      },
    })).then(() => {
      editState.status = 'success'
    }).catch((response: HttpsCallableResult<unknown>) => {
      editState.status = 'error'
      editState.errorMessage = response.data as string | FirebaseError
    })
  }
}


onMounted(() => {
  resetForm()
})
</script>

<template>
  <div v-if="!editState.isEditing">
    <div v-if="isNewLeague">
      <v-card color="white">
        <v-card-title>
          Register New League
        </v-card-title>
        <v-card-text>
          <p class="mb-2">
            Let us know about a league that's not in our database, even if it's not yours! We want to make sure
            everyone has a place on the map.
          </p>
          <v-btn color="secondary" prepend-icon="mdi-plus" @click="setEdit">Register new league</v-btn>
        </v-card-text>
      </v-card>
    </div>
    <div v-else>
      <LeagueData :league-record="leagueData"></LeagueData>
      <div class="mt-n14 mr-2" style="text-align: right; position:relative">
        <v-btn icon="mdi-pencil" variant="flat" color="secondary" @click="setEdit">
        </v-btn>
      </div>
    </div>
  </div>
  <div v-else>
    <v-card color="grey-lighten-1"
      :title="isNewLeague ? 'Registering New League' : `Editing ${leagueData?.name ?? 'Unrecognized League'}`">
      <v-card-text>
        <v-card color="white" :title="isNewLeague ? 'Add Logo' : 'Replace Logo'">
          <v-card-text>
            <div v-if="!isNewLeague">
              <h3>Replace Logo</h3>
              <v-img :src="leagueData?.logo" lazy-src="/logo.svg" :height="100" />
            </div>
            <VFileUpload density="compact" clearable scrim="primary"></VFileUpload>
          </v-card-text>
        </v-card>

        <v-card class="mt-4">
          <v-card-title>League Info</v-card-title>
          <v-card-text>
            <v-text-field v-model="v$.name.$model" label="League Name*" variant="outlined" density="compact"
              hide-details="auto"
              :error-messages="v$.name.$errors.map((e: any) => e.$message as string)"></v-text-field>
            <v-text-field v-model="v$.city.$model" class="mt-3" label="City*" variant="outlined" density="compact"
              hide-details="auto"
              :error-messages="v$.city.$errors.map((e: any) => e.$message as string)"></v-text-field>
            <v-text-field v-model="v$.state.$model" class="mt-3" label="State/Province/Territory" variant="outlined"
              density="compact" hide-details="auto"
              :error-messages="v$.state.$errors.map((e: any) => e.$message as string)"></v-text-field>
            <v-text-field v-model="v$.country.$model" class="mt-3" label="Country*" variant="outlined" density="compact"
              hide-details="auto"
              :error-messages="v$.country.$errors.map((e: any) => e.$message as string)"></v-text-field>
            <v-text-field v-model="v$.website.$model" class="mt-3" label="Website" variant="outlined" density="compact"
              hide-details="auto"
              :error-messages="v$.website.$errors.map((e: any) => e.$message as string)"></v-text-field>
            <v-select multiple v-model="v$.leagues.$model" class="mt-3" label="Associations / Rulesets"
              variant="outlined" density="compact" chips hide-details="auto"
              :items="['WFTDA', 'MRDA', 'JRDA', 'Short Track']"
              :error-messages="v$.leagues.$errors.map((e: any) => e.$message as string)"></v-select>
            <v-text-field v-if="v$.leagues.$model.includes('WFTDA')" v-model="v$.wftdaWebsite.$model" class="mt-3"
              label="WFTDA Page" variant="outlined" density="compact" hide-details="auto"
              :error-messages="v$.wftdaWebsite.$errors.map((e: any) => e.$message as string)"></v-text-field>
          </v-card-text>
        </v-card>

        <v-card v-if="isNewLeague" class="mt-4" title="About You">
          <v-card-text>
            <v-select v-model="v$.contributorType.$model" class="mb-3" label="What's your relationship to this league?*"
              variant="outlined" density="compact" hide-details="auto" :items="['Fan', 'Member', 'Admin']"
              :error-messages="v$.contributorType.$errors.map((e: any) => e.$message as string)"></v-select>
            <p>Do you have any other info about the league to show that it's currently active? Socials, events, games,
              scrimmages? Please include links here if you're able.</p>
            <v-textarea v-model="v$.contributorProof.$model" class="mb-3 mt-1" label="Signs of Activity*"
              variant="outlined" density="compact" hide-details="auto"
              :error-messages="v$.contributorProof.$errors.map((e: any) => e.$message as string)"></v-textarea>
            <p>Anything else you want to include or tell us about?</p>
            <v-textarea v-model="v$.contributorNotes.$model" class="mt-1" label="Notes" variant="outlined"
              density="compact" hide-details="auto"
              :error-messages="v$.contributorNotes.$errors.map((e: any) => e.$message as string)"></v-textarea>
          </v-card-text>
        </v-card>

        <v-card-actions>
          <div class="d-flex mt-4" style="width:100%">
            <v-btn variant="flat" prepend-icon="mdi-close" @click="resetForm" color="red-lighten-1"> Cancel </v-btn>
            <v-spacer />
            <v-btn class="ml-2" :disabled="v$.$invalid" color="secondary" variant="flat" prepend-icon="mdi-content-save"
              @click="attemptSubmit">Submit</v-btn>
          </div>
        </v-card-actions>

        <v-alert v-if="editState.status === 'error'" color="orange-lighten-2" class="mt-4" icon="mdi-alert">
          There was a problem submitting the form:<br />
          {{ (editState.errorMessage as FirebaseError)?.message ?? editState.errorMessage }}
          <p class="mt-2">If this persists, ask an admin for help or try the <a href="/contact">contact
              form</a>. If you leave this page, your data will not be saved.</p>
        </v-alert>

        <v-alert v-if="editState.status === 'success'" color="success" class="mt-4" icon="mdi-check">
          You have successfully submitted a registration for a new league! Our admin team will review this and get back
          to you when we can.<br />
        </v-alert>
      </v-card-text>
    </v-card>
  </div>
</template>
