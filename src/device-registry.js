const DEVICE_SERVICE_URI = process.env.DEVICE_SERVICE_URI || 'http://device:8080/'
class DeviceRegistry {
    constructor(deps) {
        //super()
        this.store = deps.store
        this.jwt = deps.jwt
        this.serviceRequest = deps.serviceRequest
    }
    async get(args) {

        const { deviceId, jwt } = args

        const deviceExists = await this.store.has(deviceId)

        if(!deviceExists) {
            
            const device = await this.serviceRequest.getJsonServiceRequest(DEVICE_SERVICE_URI,jwt)
            
            if(device.error) {
                return { error : device.error }
            }
            if(device) {
                this.store.set(deviceId, device) 
                return device
            }
            return { error : 'unknown error'}
            
        }
        
        const decodedJWT = await this.jwt.verify(jwt)
        
        if(decodedJWT.error) {
            return { error : { description : 'User not authorised invalid token', authError : true} }
        }
        
        const device = await this.store.get(deviceId)
                
        if(device.uid === decodedJWT.sub) {
            return device
        } else {
            return { error : { description : 'User not authorised to get device', authError : true} }
        } 
    }
}

export default DeviceRegistry