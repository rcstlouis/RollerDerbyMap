import { db, auth } from '../services/firebase.service.js'
import { RDMUserRecord, RegisterUserRequestBody } from '../dataSync/dataSync.model.js'
import { type UserRecord } from 'firebase-admin/auth'
import { addToLogs } from '../dataSync/dataSync.js'

export async function entry(body: RegisterUserRequestBody) {
  return auth
    .createUser({
      email: body.email,
      displayName: body.name,
      password: body.pass,
    })
    .then(async (user: UserRecord) => {
      const rdmUser = new RDMUserRecord(user)
      await addToLogs('user:register', rdmUser, { newData: rdmUser })
      return db.collection('users').doc(rdmUser.id).set(rdmUser)
    })
}
