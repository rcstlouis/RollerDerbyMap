import { DocumentData, WithFieldValue } from 'firebase-admin/firestore'
import { db } from '../services/firebase.service.js'
import {
  DataSyncRequestBody,
  LogRecord,
  RDMResponse,
  RDMUserRecord,
  UserContribution,
} from './dataSync.model.js'
import { makeFirestoreId } from '../utils.js'

export async function entry(body: DataSyncRequestBody): Promise<RDMResponse> {
  console.error('Not implemented')
  const newContributionId = makeFirestoreId()
  switch (body.operationType) {
    case 'contribute:newLeague':
      return db
        .collection('contributions')
        .doc(newContributionId)
        .set(new UserContribution(body))
        .then(() => {
          return {
            status: 200,
            message: `Successfully submitted new league ${body.leagueData!.name}`,
          } as RDMResponse
        })
        .catch((e) => {
          return {
            status: 400,
            message: `Error registering league: ${e?.message ?? e}`,
          } as RDMResponse
        })
    case 'editLeague': {
      return db
        .collection('contributions')
        .doc(newContributionId)
        .set(new UserContribution(body))
        .then(() => {
          return {
            status: 200,
            message: `Successfully edited league ${body.leagueData!.name}`,
          } as RDMResponse
        })
        .catch((e) => {
          return {
            status: 400,
            message: `Error submitting league edits: ${e?.message ?? e}`,
          } as RDMResponse
        })
    }
    default:
      return { status: 400, message: `Data sync operation ${body.operationType} not recognized` }
  }
}

export async function testUpload(collectionName: string, docs: { doc: unknown; id: string }[]) {
  for (const docData of docs) {
    const docRef = db.collection(collectionName).doc(docData.id)
    await docRef.set(docData.doc as WithFieldValue<DocumentData>)
  }
}

export async function addToLogs(
  type: string,
  data: {
    message?: string
    oldData?: unknown
    newData?: unknown
  },
  userObj?: RDMUserRecord | string,
) {
  let user: RDMUserRecord | undefined
  if (typeof userObj === 'string') {
    user = (await db.collection('users').doc(userObj)?.get()) as unknown as RDMUserRecord
  } else {
    user = userObj
  }
  const logEntry = new LogRecord(type, data, user)
  return db.collection('logs').doc(logEntry.id).set(logEntry)
}
