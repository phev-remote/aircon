import admin from 'firebase-admin'

const verify = token => admin.auth().verifyIdToken(token)

export { verify }