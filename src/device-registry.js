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
        
        try{
            const decodedJWT = await this.jwt.verify(jwt)
            
            const device = await this.store.get(deviceId)

            if(device.uid === decodedJWT.sub) {
                return device
            } else {
                return Promise.reject({ error : 'User not Authorised'})
            }
        } catch (err) {
            return Promise.reject({ error : 'JWT Not Authorised'})
        }     
    }
}

export default DeviceRegistry