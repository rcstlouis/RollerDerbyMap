import { db } from '../services/firebase.service.js'
import { DataSyncRequestBody } from './dataSync.model.js'

export async function entry(body: DataSyncRequestBody) {
  console.error('Not implemented')
}

export async function testUpload(collectionName: string, docs: { doc: any; id: string }[]) {
  for (const docData of docs) {
    const docRef = db.collection(collectionName).doc(docData.id)
    await docRef.set(docData.doc)
  }
}
