import chai from 'chai'
import bootstrap from './bootstrap'
import DeviceEvents from './device-event'
import DeviceRegistry from './device-registry'
import Cache from 'cache-base'
import PubSub from '@google-cloud/pubsub'
import jwt from './jwt'
import AirCon from './aircon'

const assert = chai.assert

describe('Bootstrap', () => {
    it('Should bootstrap', done => {
        bootstrap().start()
        done()
    })
    it('Should receive event', () => {
         /*  E2E test
        
        const jwt = { verify : ()=> Promise.resolve({ sub : 1})}
        const deviceEventStore = new Cache()
        const deviceRegistryStore = new Cache()
        const airconStore = new Cache()
        const pubsub = new PubSub()
        const deviceEvents = new DeviceEvents({ pubsub, store : deviceEventStore })        
        const deviceRegistry = new DeviceRegistry({ store: deviceRegistryStore, jwt })
        const aircon = new AirCon({ store : airconStore, device : deviceRegistry, events : deviceEvents})
        
        //deviceEventStore.set('my-device2',{ uid : 1})
        deviceRegistryStore.set('my-device2',{ uid : 1})

        //const response = await aircon.status(request)
        //deviceEvents.subscribe({callerId : 'aircon', deviceId : 'my-device', callback : message => console.log(JSON.stringify(message))})
        setInterval(async () => {
            const response = await aircon.status({ deviceId : 'my-device2', jwt: 'xxx'})
            console.log(response)

        },1000)

        setTimeout(()=> aircon.turnOn({ deviceId : 'my-device2', jwt: 'xxx'})
            .then(res => console.log(`Response ${res}`))
            .catch(err => console.error(err)),5000)

        setTimeout(()=> aircon.turnOff({ deviceId : 'my-device2', jwt: 'xxx'})
            .then(res => console.log(`Response ${res}`))
            .catch(err => console.error(err)),15000)
         */
    })

})