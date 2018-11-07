import chai from 'chai'
import AirCon from './aircon'
import sinon from 'sinon'
import Cache from 'cache-base'

const assert = chai.assert

describe('Air Con', () => {
    let sandbox = null;
    let device = { get : () => null }
    let deviceNoDevice = { get : () => null }
    let deviceReject = { get : () => ({Error : 'some error'}) }
    let deviceAuthError = { get : () => ({error : { authError: true}}) }
    
    let events = { subscribe : () => null, on : () => null, dispatch : () => null}
    let store = null 
    //const logger = ({ info : () => null, debug : message => console.log(message), error: () => null })
    const logger = ({ info : () => null, debug : message => null, error: () => null })
    

    beforeEach(() => {
        store = new Cache()
        
        sandbox = sinon.createSandbox();

        sandbox.stub(device,'get').resolves({ deviceId: '123' })
        sandbox.stub(deviceNoDevice,'get').resolves(null)
        sandbox.stub(events,'subscribe').resolves(true)
        sandbox.stub(events,'on') //.resolves(true)
        sandbox.stub(events,'dispatch').resolves(true)
        
    })
    afterEach(() => {
        sandbox.restore()
    })
    it('Should bootstrap', () => {
        
        //assert.isNotNull(aircon())
    })
    it('Should call get device when not cached', async () => {
        
        const request = {
            jwt : '1234',
            deviceId: 'xxx',
        }
        const deps = {
            device,
            store,
            events,
            logger
        }
        const aircon = new AirCon(deps)
        
        assert.isFalse(deps.store.has('xxx'))
        
        aircon.status(request)
        
        assert(deps.device.get.calledOnce,'Should call get device when not cached')
        
    })
    it('Should handle no device', async () => {
        const request = {
            jwt : '1234',
            deviceId: 'xxx'
        }
        const deps = {
            device : deviceNoDevice,
            store,
            events,
            logger
        }
        
        assert.isFalse(deps.store.has('xxx'))

        const aircon = new AirCon(deps)
        
        const response = await aircon.status(request)
        
        assert.deepEqual(response, { response : 'device not found'})
        assert(deps.device.get.calledOnce,'Should call get device')
        
    })
    it('Should handle device rejection', async () => {
        const request = {
            jwt : '1234',
            device: '1234'
        }
        const deps = {
            device : deviceReject,
            store,
            events,
            logger,
        }
        
        const aircon = new AirCon(deps)
        
        try {
            aircon.status(request)
        
            throw new Error('Should not get here')
        } catch (err) {
            assert(err)
        }
        
        
    })
    it('Should call get device with correct args', async () => {
        const request = {
            jwt : '1234',
            deviceId: '123'
        }
        const deps = {
            device,
            store,
            events,
            logger,
        }
        
        const aircon = new AirCon(deps)
        
        await aircon.status(request)
        
        assert(deps.device.get.calledWith({ jwt : '1234', deviceId : '123'}),'Should call get device with correct args')
        
    })
    it('Should return null status', async () => {
        const request = {
            jwt : '1234',
            deviceId: '123'
        }
        const deps = {
            device,
            store,
            events,
            logger,
        }
        
        const aircon = new AirCon(deps)
        
        const response = await aircon.status(request)
        
        assert.include(response, { status : null })
    })
    it('Should handle event', async () => {
        const request = {
            jwt : '1234',
            deviceId: '123'
        }
        const deps = {
            device,
            store,
            events,
            logger,
        }
        
        const aircon = new AirCon(deps)
        
        await aircon.handleEvent({ deviceId : '123', register : 26, data : [0,1]})
        
    })
    it('Should return on status', async () => {
        const request = {
            jwt : '1234',
            deviceId: '123'
        }
        const deps = {
            device,
            store,
            events,
            logger
        }
        
        const aircon = new AirCon(deps)
        
        store.set('123', { status : null, subscribed : true})
        aircon.handleEvent({ deviceId : '123', register : 26, data : [0,1]})

        const response = await aircon.status(request)
        
        assert.include(response, { status : 'on' })
    })
    it('Should return off status', async () => {
        const request = {
            jwt : '1234',
            deviceId: '123'
        }
        const deps = {
            device,
            store,
            events,
            logger
        }
        const aircon = new AirCon(deps)
        
        store.set('123', { status : null, subscribed : true})

        aircon.handleEvent({ deviceId : '123', register : 26, data : [0,0]})

        const response = await aircon.status(request)
        
        assert.include(response, { status : 'off'})
    })
    it('Should only handle aircon registers', async () => {
        const request = {
            jwt : '1234',
            deviceId: '123'
        }
        const deps = {
            device,
            store,
            events,
            logger
        }
        const aircon = new AirCon(deps)
        
        aircon.handleEvent({ deviceId : '123', register : 27, data : [0,0]})

        const response = await aircon.status(request)
        
        assert.include(response, { status : null })
    })
    it('Should not subscribe twice', async () => {
        const request = {
            jwt : '1234',
            deviceId: '123'
        }
        const deps = {
            device,
            store,
            events,
            logger
        }
        store.set('123', {status : 'off', subscribed: true})

        const aircon = new AirCon(deps)
     
        assert(deps.events.subscribe.notCalled)

        await aircon.status(request)
        
        assert(deps.events.subscribe.notCalled,'Should not call subscribe twice')
    })
    it('Should emit status on event', done => {
        const request = {
            jwt : '1234',
            deviceId: '123'
        }
        const deps = {
            device,
            store,
            events,
            logger
        }
        const aircon = new AirCon(deps)
        
        aircon.on('123', x => {
            assert.deepEqual(x, {aircon : {status : 'on'}})
            done()
        })

        aircon.handleEvent({ deviceId : '123', register : 26, data : [0,1]})

        aircon.status(request)
        
    })
    it('Should emit status off event', done => {
        const request = {
            jwt : '1234',
            deviceId: '123'
        }
        const deps = {
            device,
            store,
            events,
            logger
        }
        const aircon = new AirCon(deps)
        
        aircon.on('123', x => {
            assert.deepEqual(x, {aircon : {status : 'off'}})
            done()
        })

        aircon.handleEvent({ deviceId : '123', register : 26, data : [0,0]})

        aircon.status(request)
        
    })
    it('Should turn aircon on', async () => {
        const request = {
            jwt : '1234',
            deviceId: '123'
        }
        const deps = {
            device,
            store,
            events,
            logger
        }
        const aircon = new AirCon(deps)
        
        await aircon.turnOn(request)

        assert(events.dispatch.calledOnce) 
        assert(events.dispatch.calledWith({ deviceId : '123', state: { airConOn : true}}),'Should have called events dispacth with correct args')
    })
    it('Should turn aircon off', async () => {
        const request = {
            jwt : '1234',
            deviceId: '123'
        }
        const deps = {
            device,
            store,
            events,
            logger
        }
        const aircon = new AirCon(deps)
        
        await aircon.turnOff(request)

        assert(events.dispatch.calledOnce) 
        assert(events.dispatch.calledWith({ deviceId : '123', state: { airConOn : false}}),'Should have called events dispacth with correct args')
    })
    it('Should handle auth error', async () => {
        const request = {
            jwt : '1234',
            deviceId: '123'
        }
        const deps = {
            device : deviceAuthError,
            store,
            events,
            logger
        }
        
        const aircon = new AirCon(deps)
        
        const response = await aircon.status(request)
        
        assert.isTrue(response.error.authError)

    })
})

