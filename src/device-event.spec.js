import chai from 'chai'
import DeviceEvents from './device-event'
import sinon from 'sinon'
import Cache from 'cache-base'


const assert = chai.assert

describe('Device Events', () => {
    let sandbox = null
    let store = null 
    let publisher = { publish : () => null }
    let results = [{ on : () => null}]
    let topic = { createSubscription : () => null, publisher : () => null}
    let pubsub = { topic : () => null }
    
    beforeEach(() => {
        store = new Cache()
        
        sandbox = sinon.createSandbox()
        sandbox.stub(publisher, 'publish').resolves(true)
        sandbox.stub(topic,'publisher').returns(publisher)

        sandbox.stub(topic,'createSubscription').resolves(results)
        
        sandbox.stub(pubsub,'topic').returns(topic)

    })
    afterEach(() => {
        sandbox.restore()
    })
    it('Should bootstrap', () => {
        
        assert.isNotNull(new DeviceEvents({ store, pubsub }))
    })
    it('Should subscribe to device', async () => {
        
        const deviceEvents = new DeviceEvents({ store, pubsub })
        const func = () => null

        await deviceEvents.subscribe({callerId : 'aircon', deviceId : '123', callback : func})

        assert.isTrue(store.has('local-aircon-123-subscription'))
        assert.equal(func, store.get('local-aircon-123-subscription').callback)

    })
    it('Should dispatch to correct topic', async () => {
        
        const deviceEvents = new DeviceEvents({ store, pubsub })
        
        await deviceEvents.dispatch({deviceId : '123', state : { airConOn : true}})

        assert(pubsub.topic.calledWith('config-change'),'Shoud be called with correct topic')
    })
    it('Should dispatch to correct message', async () => {
        
        const deviceEvents = new DeviceEvents({ store, pubsub })
        
        await deviceEvents.dispatch({deviceId : '123', state : { airConOn : true}})

        assert(publisher.publish.calledWith(Buffer.from(JSON.stringify({ state: { airConOn : true}}))),'Shoud be called with correct message')
    })
})
