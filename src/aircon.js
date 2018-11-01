import { EventEmitter } from 'events'

class AirCon extends EventEmitter {
    constructor(deps) {
        super()
        this.device = deps.device
        this.events = deps.events
        this.store = deps.store
        this.handleEvent = this.handleEvent.bind(this)
    }
    async status(args) {
        const { jwt, deviceId } = args
        const device = await this.device.get({jwt , deviceId})
        
        if(!device) {
            return { response : 'device not found'}
        }
    
        if(device.error) {
            return { error : device.error }
        }
        const isCached = await this.store.has(deviceId)
    
        if(isCached) {
            return this.store.get(deviceId)
        } else {
            const response = await this.subscribe({ deviceId })
            
            if(response.error) {
                return response.error
            }

            return { status : null }
        }
    }
    async subscribe(args) {
        const { deviceId } = args
        
        const deviceAlreadySubscribed = await this.store.has(deviceId)
        
        if(!deviceAlreadySubscribed)
        {
            this.store.set(deviceId, { status : null})
            return this.events.subscribe({ deviceId, callback : this.handleEvent })
            
        } else {
            return undefined
        }
    }
    handleEvent(event) {
        
        const { deviceId, register, data } = event
        if(register === 26) {
            if(data[1] === 1) {
                this.store.set(deviceId, { status : 'on'})
                this.emit(deviceId,{aircon : { status : 'on' }})
            } else {
                this.store.set(deviceId, { status : 'off'})
                this.emit(deviceId,{ aircon : { status : 'off' }})
            }
        }
    }
    async turnOn(args) {
        const { jwt, deviceId } = args

        try {
            const device = await this.device.get({jwt , deviceId})

            if(!device) {
                return { response : 'device not found'}
            }

            this.events.dispatch({ deviceId, state : { airConOn : true} })
        } catch (err) {
            return { error : err}
        }
    
    }
    async turnOff(args) {
        const { jwt, deviceId } = args

        try {
            const device = await this.device.get({jwt , deviceId})

            if(!device) {
                return { response : 'device not found'}
            }

            return this.events.dispatch({ deviceId, state : { airConOn : false} })

            
        } catch (err) {
            return { error : err}
        }
    
    } 
}

export default AirCon 