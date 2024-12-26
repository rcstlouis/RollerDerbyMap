import { defineStore } from 'pinia'
import { auth, firebaseCloudFunction } from '@/services/firebase.service'
import { signInWithEmailAndPassword, signOut, type User, type UserCredential } from 'firebase/auth'
import { useLocalStorage } from '@vueuse/core'
import type { RegisterUserRequestBody } from '@/model/dataSync.model'

export const useUserStore = defineStore({
  id: 'user',
  state: () => {
    return {
      user: useLocalStorage<User | undefined>('user:auth', undefined),
    }
  },
  actions: {
    async signin(email: string, password: string): Promise<UserCredential> {
      return signInWithEmailAndPassword(auth, email, password).then((result) => {
        this.user = result.user
        return result as UserCredential
      })
    },
    async register(body: RegisterUserRequestBody) {
      return firebaseCloudFunction('registerUser2', body)
    },
    async signout() {
      await signOut(auth)
      this.user = undefined
    },
  },
})
