import express from 'express'
import AirCon  from './aircon'
import bodyParser from 'body-parser'
import cors from 'cors'

const PORT = process.env.PORT || 8080
const HOST = process.env.HOST || '0.0.0.0'

const App = deps => {
    const http = express()
    http.use(bodyParser.json());
    http.use(cors())
    const aircon = new AirCon(deps)
    
    http.get('/status', (req, res) => {
        res.status(200).send({ status : 'ok'})
    })

    http.get('/:deviceId', async (req, res) => {

        const deviceId = req.params.deviceId
        
        if(!deviceId) {
            res.status(400).send('No device specified')
        }

        if(req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') { 
            const token = req.headers.authorization.split(' ')[1]            

            const response = await aircon.status({ deviceId , jwt: token })   
            
            if(response.status)
            {
                res.status(200).send(response)
            }
            if(response.error)
            {
                res.status(error.authError ? 401 : 400).send(error.description)
            }
            
        } else {
            res.status(400).send('Invalid request no auth token')
        }
    })
    
    http.post('/:deviceId', async (req, res) => {

        const deviceId = req.params.deviceId

        if(!deviceId) {
            res.status(400).send('No device specified')
        }

        if(req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') { 
            const token = req.headers.authorization.split(' ')[1]
            try {
                if(req.body.state.aircon) {
                    await aircon.turnOn({ deviceId, jwt: token })  
                
                    res.status(200).send({ response : 'ok'})
                } else {
                    await aircon.turnOff({ deviceId, jwt: token })
                
                    res.status(200).send({ response : 'ok'})
                } 
            } catch (err) {
                res.status(500).send({ error : err})
            }
        } else {
            res.status(401).send('Unauthorised')
        }
    })
    
    http.listen(PORT, HOST)

    console.log(`Running on http://${HOST}:${PORT}`)

}

export default App