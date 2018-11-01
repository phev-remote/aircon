import firebaseAdmin from 'firebase-admin'


const verify = async token => {
    try {
        return await firebaseAdmin.auth().verifyIdToken(token)
    } catch(err) {
        return {error : { code : err.errorInfo.code, message : err.errorInfo.message } }
    }  
}

export { verify }