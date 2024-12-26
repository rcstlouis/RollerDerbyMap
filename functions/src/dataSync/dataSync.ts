import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { DataSyncRequestBody } from './dataSync.model.js'

const app = initializeApp({
  credential: cert('./functions/src/admin.json'),
})
const db = getFirestore(app)

export async function entry(body: DataSyncRequestBody) {
  console.error('Not implemented')
}

export async function testUpload(collectionName: string, docs: { doc: any; id: string }[]) {
  for (const docData of docs) {
    const docRef = db.collection(collectionName).doc(docData.id)
    await docRef.set(docData.doc)
  }
}
