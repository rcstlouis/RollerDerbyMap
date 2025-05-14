import { defineStore } from 'pinia'
import { db, firebaseCloudFunction } from '@/services/firebase.service'
import type { BSBEvent } from '@/model/events.model'
import { collection, onSnapshot, query } from 'firebase/firestore'
import type { DataSyncRequestBody } from '@/model/dataSync.model'
import type { HttpsCallableResult } from 'firebase/functions'

let unsub = () => {
  // initializes the variable
}

export const useDataStore = defineStore({
  id: 'data',
  state: () => {
    return {
      events: [] as BSBEvent[],
      example: undefined as unknown,
    }
  },
  actions: {
    setup() {
      const events: BSBEvent[] = []
      const q = query(collection(db, 'events'))
      unsub = onSnapshot(q, (querySnapshot) => {
        querySnapshot.docChanges().forEach((change) => {
          events.push(change.doc.data() as BSBEvent)
          this.example = events
        })
      })
    },
    dataSync(body: DataSyncRequestBody): Promise<HttpsCallableResult<unknown>> {
      return firebaseCloudFunction('dataSync', body)
    },
    unsubscribe() {
      unsub()
    },
  },
})
