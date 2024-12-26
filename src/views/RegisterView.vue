<script setup lang="ts">
// import events from '../data/events.json'
import { watch, reactive, onMounted } from 'vue'
import { useVuelidate } from '@vuelidate/core'
import { required, email, helpers } from '@vuelidate/validators'
import { useUserStore } from '@/stores/user';
import { FirebaseError } from 'firebase/app';
import { useRouter } from 'vue-router';

const userStore = useUserStore()
const router = useRouter()
const state = reactive({
  user: '',
  pass: '',
  confirmPass: '',
  name: ''
})
const rules = {
  user: { required, email },
  pass: { required },
  confirmPass: { matches: helpers.withMessage('Passwords must match', (value: string) => value === state.pass) }
  , name: { required }
}

const v$ = useVuelidate(rules, state)
const formState = reactive({
  status: 'ready' as 'ready' | 'sending' | 'error' | 'success',
  firebaseError: 'An unknown error has occurred' as undefined | FirebaseError | string
})

watch(() => userStore.user, newVal => {
  if (newVal) formState.status = 'success'
  else formState.status = 'ready'
})

async function navigateAway() {
  router.push('/manage')
}

async function attemptRegister() {
  formState.status = 'sending'
  await userStore.register({
    name: state.name,
    pass: state.pass,
    email: state.user
  })
    .then(() => {
      formState.status = 'success'
    })
    .catch(e => {
      formState.status = 'error'
      formState.firebaseError = e
    })
}

onMounted(() => {
  if (userStore.user) {
    formState.status = 'success'
    navigateAway()
  }
})
</script>

<template>
  <v-sheet color="black">
    <div class="px-4 pt-6" style="max-width: 400px; margin: auto">
      <v-card color="grey-darken-4">
        <v-card-text>
          <h1 class="mb-6">Register</h1>
          <v-text-field class="mb-4" label="Display Name" v-model="v$.name.$model" variant="outlined"
            :disabled="formState.status === 'sending' || formState.status === 'success'"
            :error-messages="v$.name.$errors.map((e: any) => e.$message as string)" hide-details="auto"></v-text-field>
          <v-text-field class="mb-4" label="Email" v-model="v$.user.$model" variant="outlined"
            :disabled="formState.status === 'sending' || formState.status === 'success'"
            :error-messages="v$.user.$errors.map((e: any) => e.$message as string)" hide-details="auto"></v-text-field>
          <v-text-field class="mb-4" label="Password" v-model="v$.pass.$model" variant="outlined"
            :disabled="formState.status === 'sending' || formState.status === 'success'" type="password"
            :error-messages="v$.pass.$errors.map((e: any) => e.$message as string)" hide-details="auto"></v-text-field>
          <v-text-field class="mb-4" label="Confirm Password" v-model="v$.confirmPass.$model" variant="outlined"
            :disabled="formState.status === 'sending' || formState.status === 'success'" type="password"
            :error-messages="v$.confirmPass.$errors.map((e: any) => e.$message as string)"
            hide-details="auto"></v-text-field>
          <div class="d-flex">
            <v-btn color="primary" variant="flat" :disabled="v$.$invalid || formState.status === 'sending'"
              @click="attemptRegister"> Register </v-btn>
            <v-progress-circular v-if="formState.status === 'sending'" class="ml-4" indeterminate />
          </div>

          <v-alert v-if="formState.status === 'error'" color="orange-lighten-2" class="mt-4" icon="mdi-alert">
            There was a problem registering:<br />
            {{ (formState.firebaseError as FirebaseError)?.message ?? formState.firebaseError }}
            <p class="mt-2">If this persists, ask an admin for help or try the <a href="/contact">contact
                form</a>.</p>
          </v-alert>

          <v-alert v-if="formState.status === 'success'" color="success" class="mt-4" icon="mdi-check">
            You have successfully registered an new account!<br />
            <p class="mt-2">If you are not redirected automatically, <a href="/manage" style="color:black">
                click
                here</a>.</p>
          </v-alert>
        </v-card-text>
      </v-card>
      <p class="mt-2">If you already have an account, <a href="/signin">click here</a> to sign in.</p>
    </div>
  </v-sheet>
</template>

<style>
@media (min-width: 1024px) {
  .about {
    min-height: 100vh;
    align-items: center;
  }
}
</style>
