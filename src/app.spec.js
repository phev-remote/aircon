import chai from 'chai'
import App from './app'
import CacheBase from 'cache-base'
import sinon from 'sinon'
import request from 'supertest'

import DeviceEvents from './device-event'
import DeviceRegistry from './device-registry'
import serviceRequest from './service-request'
import AirCon from './aircon'

//const assert = chai.assert

describe('App', () => {
    let sandbox = null
    let store = null 
    let jwt = { verify : () => null }
    let jwtInvalid = { verify : () => null }
    let jwtDifferentUser = { verify : () => null }
    let publisher = { publish : () => null }
    let results = [{ on : () => null, name : 'local-123-subscription'}]
    let subscription = { get : () => null }
    let topic = { subscription : () => null, publisher : () => null}
    let pubsub = { topic : () => null }
    let app = null

    const deviceEventStore = new CacheBase()
    const deviceRegistryStore = new CacheBase()
    const airConStore = new CacheBase()

    const deviceEvents = new DeviceEvents({ store : deviceEventStore, pubsub })
    const deviceRegistry = new DeviceRegistry({ jwt , store : deviceRegistryStore, serviceRequest })

    const logger = ({ info : () => null, debug : message => null, error: () => null })
    
        
    beforeEach(() => {
        
        store = new CacheBase()
        
        
        deviceRegistryStore.set('my-device2', { deviceId: 'my-device2', uid : '123'})
        
        sandbox = sinon.createSandbox()

        sandbox.stub(jwt,'verify').returns({sub : '123'})
        sandbox.stub(jwtDifferentUser,'verify').returns({sub : '124'})
        sandbox.stub(jwtInvalid,'verify').returns({error : {code : 'auth/argument-error', message : 'blah blah'}})
        sandbox.stub(publisher, 'publish').resolves(true)
        sandbox.stub(topic,'publisher').returns(publisher)

        sandbox.stub(subscription, 'get').resolves(results)
        sandbox.stub(topic,'subscription').returns(subscription)
        
        sandbox.stub(pubsub,'topic').returns(topic)

        const aircon = new AirCon({ device: deviceRegistry, events : deviceEvents, store : airConStore, jwt, logger })
        app = App({aircon})
    
    })
    afterEach(() => {
        sandbox.restore()
        app.close()
    }) 
    it('get status', done => {
        request(app)
          .get('/status')
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end((err) => {
            if (err) return done(err)
            done()
        })
    }) 
    it('get aircon status for device', done => {
        request(app)
          .get('/my-device2')
          .set('Accept', 'application/json')
          .set('Authorization', 'Bearer 1234')
          .expect(200)
          .expect({ status : null })
          .end((err) => {
            if (err) return done(err)
            done()
        })
    }) 
    it('post aircon on', done => {
        
        request(app)
          .post('/my-device2')
          .set('Accept', 'application/json')
          .set('Authorization', 'Bearer 1234')
          .send({ state : { aircon : true }})
          .expect('Content-Type', /json/)
          .expect({ response : 'ok'})
          .expect(200)
          .end((err) => {
            if (err) return done(err)
            done()
        })
    }) 
    it('post aircon off', done => {  
        request(app)
          .post('/my-device2')
          .set('Accept', 'application/json')
          .set('Authorization', 'Bearer 1234')
          .send({ state : { aircon : false }})
          .expect('Content-Type', /json/)
          .expect({ response : 'ok'})
          .expect(200)
          .end((err) => {
            if (err) return done(err)
            done()
        })
    })
    /*
    it('get aircon status for device with bad JWT token different user', done => {
        
        const invalidJWTapp = App({ store, jwt: jwtDifferentUser })
        
        request(invalidJWTapp)
          .get('/my-device2')
          .set('Accept', 'application/json')
          .set('Authorization', 'Bearer 1234')
          .expect('Content-Type', /json/)
          .expect(401)
          .end((err) => {
            if (err) return done(err)
            done()
        })
    })
    it('get aircon status for device with no device', done => {
        
        request(app)
          .get('/my-device')
          .set('Accept', 'application/json')
          .set('Authorization', 'Bearer 1234')
          .expect('Content-Type', /json/)
          .expect(400)
          .expect({ error : 'Device does not exist'})
          .end((err) => {
            if (err) return done(err)
            done()
        })
    }) */
}) 