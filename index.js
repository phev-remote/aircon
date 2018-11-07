const gcpConfig = process.env.GCP_CONFIG || './gcpconfig.json' 
const firebaseConfig = process.env.FIREBASE_CONFIG || './firebase.json'

const DeviceEvents = require('./lib/device-event').default
const DeviceRegistry = require('./lib/device-registry').default
const jwt = require('./lib/jwt')
const CacheBase = require('cache-base')
const config = require(gcpConfig)
const PubSub = require('@google-cloud/pubsub')
const firebaseAdmin = require('firebase-admin')
const serviceAccount = require(firebaseConfig)
const serviceRequest = require('./lib/service-request')

const pubsub = new PubSub(config)
const deviceEventStore = new CacheBase()
const deviceRegistryStore = new CacheBase()
const airConStore = new CacheBase()

const deviceEvents = new DeviceEvents({ store : deviceEventStore, pubsub })
const deviceRegistry = new DeviceRegistry({ jwt , store : deviceRegistryStore, serviceRequest })

const aircon = new AirCon({events : deviceEvents, device : deviceRegistry, store : airConStore})

firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(serviceAccount),
})

deviceRegistryStore.set('my-device2', { deviceId: 'my-device2', uid : '3tZrIIUySpftIwnTOt8iDn76g9j1'})

require('./lib/app').default({ aircon } )