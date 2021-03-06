import EventEmitter from 'events'

const env = process.env.ENV || 'local'
const projectId = process.env.PROJECTID || 'phev-db3fa'
const configTopic = 'config-change'

class DeviceEvents extends EventEmitter {
    constructor(deps) {
        super()
        this.store = deps.store
        this.pubsub = deps.pubsub
        this.event = this.event.bind(this)
        this.logger = deps.logger
    }
    async subscribe(args) {
        const { callerId, deviceId, callback } = args
        const topicName = `projects/${projectId}/topics/my-device-events`
        const subscriptionName = `${env}-${deviceId}-subscription`
        
        return this.pubsub
            .topic(topicName)
                .subscription(subscriptionName)
                    .get({
                        autoCreate: true,
                    }).then(results => {
        //                this.logger.debug(`Subscribed to ${subscriptionName}`)
                        const subscription = results[0]
                        subscription.on('message', this.event)
                    
                        this.on(deviceId, callback)
                    
                        this.store.set(subscription.name, { deviceId, callback,  subscription, callerId})
                        return { response : 'ok' }
                    }).catch(err => {
                        console.error('ERROR:', err)
                    })
    }
    event(message) {
        console.log(`Device ${message.attributes.deviceId} data ${JSON.stringify(message.data)}`)
        this.emit(message.attributes.deviceId,{ deviceId : message.attributes.deviceId,...JSON.parse(message.data) })
        message.ack()
    }
    dispatch(message) {
        return this.pubsub
            .topic(configTopic)
            .publisher()
            .publish(Buffer.from(JSON.stringify({ state: message.state})))
                .then(results => {
                    return results[0]
                })
                .catch(err => {
                    console.error('ERROR:', err)
                })
    }
}

export default DeviceEvents