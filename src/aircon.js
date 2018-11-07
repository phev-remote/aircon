import { EventEmitter } from 'events'

class AirCon extends EventEmitter {
    constructor(deps) {
        super()
        this.device = deps.device
        this.events = deps.events
        this.store = deps.store
        this.handleEvent = this.handleEvent.bind(this)
        this.logger = deps.logger
        console.log(`Logger is ${this.logger}`)
        
    }
    async status(args) {
        this.logger.debug(`Status call args ${JSON.stringify(args)}`)
        const { jwt, deviceId } = args
        let device  = null
        
        if(this.store.has(deviceId)) {
            device = this.store.get(deviceId)
            this.logger.debug(`device is cached : ${JSON.stringify(device)}`)
        } else {
            device = await this.device.get({jwt , deviceId})
            if(!device) {
                this.logger.error(`device not found ${deviceId}`)
                return { response : 'device not found'}
            }
            if(device.error) {
                this.logger.error(`get device call failed ${device.error}`)
                return { error : device.error }
            }
        } 
        
        if(device.subscribed) {
            
            this.logger.debug(`device is cached and subscribed ${JSON.stringify(device)}`) 
            
            return { status : device.status }
        } else {
            this.logger.debug(`device is either not cached or not subscribed`)
           
            this.store.set(deviceId, { status : null, subscribed : false})
            
            this.logger.debug(`device now stored in cache : ${JSON.stringify(this.store.get(deviceId))}`)
           
            const response = await this.subscribe({ deviceId })
           
            if(response) {
                const device = this.store.get(deviceId)
                device.subscribed = true

                this.store.set(deviceId, device)

                this.logger.debug(`subscribed to device : ${deviceId} response : ${JSON.stringify(response)}`)

                return { status : device.status }
            
            } else {
                this.logger.error(`could not subscribe to device : ${deviceId} null response received`)
                return { error : { description : `could not subscribe to device : ${deviceId} null response received`}}
            } 
        }
    }
    async subscribe(args) {
        const { deviceId } = args
        
        //const device = 
        this.logger.debug(`subscribing to device : ${deviceId}`)
           
        return this.events.subscribe({ deviceId, callback : this.handleEvent })
        
    }
    handleEvent(event) {
        
        const { deviceId, register, data } = event
        
        this.logger.debug(`received event for device : ${deviceId} data : ${JSON.stringify(data)}`)
        
        if(register === 26) {
            let device = this.store.get(deviceId)

            if(!device) {
                this.logger.debug(`device ${deviceId} not found in cache so recreating`)
                device = { status: null, subscribed : false} 
            }
            if(data[1] === 1) {
                device.status = 'on'
                this.emit(deviceId,{aircon : { status : 'on' }})
            } else {
                device.status = 'off'
                this.emit(deviceId,{ aircon : { status : 'off' }})
            }
            this.store.set(deviceId, device)
                
        }
    }
    async turnOn(args) {
        const { jwt, deviceId } = args

        const device = await this.device.get({jwt , deviceId})

        if(!device) {
            return { response : 'device not found'}
        }

        this.events.dispatch({ deviceId, state : { airConOn : true} })
        return { response : 'ok'}
    }
    async turnOff(args) {
        const { jwt, deviceId } = args

        const device = await this.device.get({jwt , deviceId})

        if(!device) {
            return { response : 'device not found'}
        }

        this.events.dispatch({ deviceId, state : { airConOn : false} })

        return { response : 'ok'}
    } 
}

export default AirCon 