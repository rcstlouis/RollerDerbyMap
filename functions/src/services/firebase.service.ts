import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getAuth } from 'firebase-admin/auth'

const app = initializeApp({
  credential: cert('./src/admin.json'),
})
export const auth = getAuth(app)
export const db = getFirestore(app)
