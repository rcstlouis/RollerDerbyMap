<script setup lang="ts">
import type { ContactUsConfig } from '@/model/contact.model'
import { firebaseCloudFunction } from '@/services/firebase.service'
import { ref, defineProps, reactive } from 'vue'
import { useVuelidate } from '@vuelidate/core'
import { required, email } from '@vuelidate/validators'

const props = defineProps({
  hasFormOnly: Boolean
})
const state = reactive({
  name: '',
  email: '',
  message: ''
})
const rules = {
  name: { required },
  email: { required, email },
  message: { required }
}
const v$ = useVuelidate(rules, state)

const formStatus = ref<'ready' | 'sending' | 'error' | 'success'>('ready')
const formId = ref<number>(1)
const formRef = ref<unknown>(null)

const emailDict = {
  join: { email: 'join@baystatebrawlers.com', tag: 'Intake & Training:' },
  liaison: { email: 'liaison@baystatebrawlers.com', tag: 'To Play Us:' },
  officials: { email: 'officials@baystatebrawlers.com', tag: 'Officiate With Us:' },
  volunteer: { email: 'volunteer@baystatebrawlers.com', tag: 'Volunteer With Us:' },
  sponsors: { email: 'sponsors@baystatebrawlers.com', tag: 'Advertise With Us:' },
  press: { email: 'press@baystatebrawlers.com', tag: 'Press Inquiries:' },
  events: { email: 'events@baystatebrawlers.com', tag: 'Events & Fundraisers:' },
  //   webmaster: { email: 'webmaster@baystatebrawlers.com', tag: 'Webmaster:' },
  board: { email: 'board@baystatebrawlers.com', tag: 'Contact our Board of Directors:' }
} as { [emailName: string]: { email: string; tag: string } }

function sendMessage() {
  v$.value.$validate()
  formStatus.value = 'sending'
  v$.value.$touch() // Check form validation
  if (v$.value.$invalid) {
    console.error(`Form has errors`)
    formStatus.value = 'error'
    return
  }
  firebaseCloudFunction('generatecontactemail', {
    email: state.email,
    body: state.message,
    firstName: state.name,
    lastName: '',
    subject: `Message from ${state.name}`
  } as ContactUsConfig)
    .then((result) => {
      console.log(`Message sent! ${JSON.stringify(result)}`)
      formStatus.value = 'success'
    })
    .catch((e) => {
      console.error(`Error: ${e}`)
      formStatus.value = 'error'
    })
}

function resetForm() {
  formId.value += 1
  state.name = ''
  state.email = ''
  state.message = ''
  formStatus.value = 'ready'
  v$.value.name.$reset()
  v$.value.email.$reset()
  v$.value.message.$reset()
}
</script>

<template>
  <h1 v-if="!hasFormOnly">Contact</h1>
  <div class="d-flex flex-column">
    <h2 v-if="!hasFormOnly" class="mb-1">Drop Us A Line!</h2>
    <v-form ref="formRef" @submit.prevent="sendMessage" :key="formId">
      <div class="d-flex flex-column">
        <v-text-field class="mb-4" label="Name*" v-model="v$.name.$model" variant="outlined"
          :disabled="formStatus === 'sending' || formStatus === 'success'" validate-on="blur"
          :error="!!v$.name.$errors?.length" :error-messages="v$.name.$errors.map((e) => e.$message as string)"
          hide-details="auto"></v-text-field>
        <v-text-field class="mb-4" label="Email*" v-model="v$.email.$model" variant="outlined"
          :disabled="formStatus === 'sending' || formStatus === 'success'" validate-on="blur"
          :error="!!v$.email.$errors?.length" :error-messages="v$.email.$errors.map((e) => e.$message as string)"
          hide-details="auto"></v-text-field>
        <v-textarea class="mb-4" label="Message*" v-model="v$.message.$model" variant="outlined"
          :disabled="formStatus === 'sending' || formStatus === 'success'" validate-on="blur"
          :error="!!v$.message.$errors?.length" :error-messages="v$.message.$errors.map((e) => e.$message as string)"
          hide-details="auto"></v-textarea>
        <v-btn block append-icon="mdi-send" color="primary" type="submit"
          :disabled="v$.$invalid || formStatus === 'sending' || formStatus === 'success'">
          Send
        </v-btn>
      </div>
    </v-form>
    <v-alert class="ma-4" v-if="formStatus === 'error'" color="orange-lighten-2">
      <div class="d-flex align-center">
        <v-spacer />
        <v-icon class="mr-2">mdi-alert</v-icon>
        <p>There was a problem; Please try again.</p>
        <v-spacer />
      </div>
      <p class="w-100" style="text-align: center">If this persists, try emailing us:</p>
      <v-btn href="mailto:info@baystatebrawlers.com" append-icon="mdi-send" block class="mt-2" color="black">
        info@baystatebrawlers.com
      </v-btn>
    </v-alert>
    <v-alert class="ma-4" v-if="formStatus === 'sending'" color="info">
      <div class="d-flex align-center">
        <v-spacer />
        <p>Sending your message</p>
        <v-progress-circular class="ml-2" color="white" indeterminate />
        <v-spacer />
      </div>
    </v-alert>
    <v-alert class="ma-4" v-if="formStatus === 'success'" color="success">
      We've receieved your message, and we'll get back to you when we can!
      <v-btn block @click="resetForm" color="black" append-icon="mdi-refresh" class="mt-2">
        Send another
      </v-btn>
    </v-alert>
    <h2 v-if="!hasFormOnly" class="mt-6">Or Contact One of Our Committees</h2>
    <v-card v-if="!hasFormOnly" color="grey-lighten-3" class="pa-4 pt-2 mb-4 mt-0">
      <v-container>
        <div v-for="emailName of Object.keys(emailDict)" :key="emailName">
          <v-row v-if="!$vuetify.display.mdAndUp">
            <v-col cols="12">
              <b>{{ emailDict[emailName].tag }}</b>
            </v-col>
          </v-row>
          <v-row no-gutters>
            <v-col v-if="$vuetify.display.mdAndUp" :cols="4" style="text-align: right">
              <b>{{ emailDict[emailName].tag }}</b>
            </v-col>
            <v-col :cols="4" style="text-align: right">
              <a :href="`mailto:${emailDict[emailName].email}`">
                <b>
                  {{ emailName }}
                </b>
              </a>
            </v-col>
            <v-col :cols="$vuetify.display.mdAndUp ? 4 : 8">
              <a :href="`mailto:${emailDict[emailName].email}`">@baystatebrawlers.com</a>
            </v-col>
          </v-row>
        </div>
      </v-container>
    </v-card>
  </div>
</template>
