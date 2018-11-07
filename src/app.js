import express from 'express'
import AirCon  from './aircon'
import bodyParser from 'body-parser'
import cors from 'cors'
import morgan from 'morgan'
import winston from 'winston'

const PORT = process.env.PORT || 8080
const HOST = process.env.HOST || '0.0.0.0'

const logger = winston.createLogger({
    levels: winston.config.syslog.levels,
  })
logger.add(new winston.transports.Console({
    format: winston.format.simple(),
    level : 'debug'
  }))
logger.stream = {
    write: function(message, encoding) {
        logger.info(message);
    },
}

const SHORT_SHA = process.env.SHORT_SHA  || 'unknown'
  const App = deps => {
    logger.info(`Air conditioning service v${process.env.npm_package_version} sha:${SHORT_SHA}`)
    
    logger.info('Server starting')
    const http = express()
    http.use(morgan('combined',{ stream : logger.stream }))
    http.use(bodyParser.json());
    http.use(cors())

    deps.logger = logger
    const aircon = new AirCon(deps)
    
    http.get('/status', (req, res) => {
        res.status(200).send({ status : 'ok'})
    })

    http.get('/:deviceId', async (req, res) => {

        const deviceId = req.params.deviceId
        
        if(!deviceId) {
            res.status(400).send({ error : 'No device specified' })
            return
        }

        if(req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') { 
            const token = req.headers.authorization.split(' ')[1]            

            const response = await aircon.status({ deviceId , jwt: token })   
            
            if(response.error) {
                res.status(response.error.authError ? 401 : 400).send({ error : response.error.description })
                return
            } else {
                res.status(200).send(response)
                return
            }
        } else {
            res.status(400).send({ error : 'No auth token'})
        }
    })
    
    http.post('/:deviceId', async (req, res) => {

        const deviceId = req.params.deviceId

        if(!deviceId) {
            res.status(400).send('No device specified')
            return
        }

        if(req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') { 
            const token = req.headers.authorization.split(' ')[1]
            
            if(req.body.state.aircon) {
                const response = await aircon.turnOn({ deviceId, jwt: token })  
                
                res.status(200).send(response)
                return

             } else {
                const response = await aircon.turnOff({ deviceId, jwt: token })
                
                res.status(200).send(response)

                return
            } 
            
        } else {
            res.status(401).send('Unauthorised')
            return
        }
    })
    
    logger.info(`Running on http://${HOST}:${PORT}`)
    return http.listen(PORT, HOST)
}

export default App