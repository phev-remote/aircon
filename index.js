const DeviceEvents = require('./lib/device-event').default
const DeviceRegistry = require('./lib/device-registry').default
const jwt = require('./lib/jwt')
const CacheBase = require('cache-base')
const PubSub = require('@google-cloud/pubsub')

const pubsub = new PubSub()
const deviceEventStore = new CacheBase()
const deviceRegistryStore = new CacheBase()
const airConStore = new CacheBase()

const deviceEvents = new DeviceEvents({ store : deviceEventStore, pubsub })
const deviceRegistry = new DeviceRegistry({ jwt , store : deviceRegistryStore })
const firebaseAdmin = require('firebase-admin')

const serviceAccount = require(process.env.FIREBASEJSON || './firebase.json')

firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(serviceAccount),
  //databaseURL: 'https://phev-db3fa.firebaseio.com'
})

deviceRegistryStore.set('my-device2', { deviceId: 'my-device2', uid : '3tZrIIUySpftIwnTOt8iDn76g9j1'})
require('./lib/app').default({ events : deviceEvents, device : deviceRegistry, store : airConStore})