import { db, auth } from '../services/firebase.service.js'
import { RegisterUserRequestBody } from '../dataSync/dataSync.model.js'
import { type UserRecord } from 'firebase-admin/auth'

export function entry(body: RegisterUserRequestBody) {
  return auth
    .createUser({
      email: body.email,
      displayName: body.name,
      password: body.pass,
    })
    .then((user: UserRecord) => {
      const id = user.uid
      return db.collection('users').doc(id).set({ id, displayName: body.name, email: body.email })
    })
}
