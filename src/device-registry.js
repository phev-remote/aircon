class DeviceRegistry {
    constructor(deps) {
        //super()
        this.store = deps.store
        this.jwt = deps.jwt
    }
    async get(args) {
        

        const { deviceId, jwt } = args

        const deviceExists = await this.store.has(deviceId)

        if(!deviceExists) {
            return undefined
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