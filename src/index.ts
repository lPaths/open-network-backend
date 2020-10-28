import 'dotenv/config'
import * as express from 'express'
import * as cors from 'cors'
import { createServer } from 'http'
import * as cookieParser from 'cookie-parser'
// import * as cluster from 'cluster'
// import { cpus } from 'os'
import * as ora from 'ora'

import models from 'models'
import { Logger, NetWorkManager } from 'services'
import { hl } from 'utils'

import { createApolloServer } from '_apollo-server'
import { mongooseConnect } from '_mongoose'

// * Process events
process.on('exit', (code) => {
  // ? Application specific logging, throwing an error, or other logic here
  Logger.error('Process exited with code:', code)
})

async function main() {
  // * Connect to database
  await mongooseConnect().then(async () => {
    const now = new Date()

    await models.User.updateMany({}, { $set: { isOnline: false, lastActiveAt: now } })
  })

  // * Initialize application
  const app = express()

  const spinner = ora({ spinner: 'dots', prefixText: Logger.prefixes })
  const prefix = `[Express]`

  spinner.start(`${prefix} Initializing`)

  // ? Static
  if (process.env.NODE_ENV === 'development') {
    app.use(express.static('uploads'))
  }

  // ? CORS
  if (process.env.CORS_ORIGIN) {
    app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }))
  }

  // ? Cookie
  app.use(cookieParser())

  // ? Hide X-Powered-By in response headers
  app.disable('x-powered-by')

  // ? Apollo Server
  const graphqlPath = '/gql'
  const apolloServer = createApolloServer(graphqlPath)
  apolloServer.applyMiddleware({ app, path: graphqlPath, cors: false })

  // ? Start
  // const numCPUs = cpus().length

  // if (cluster.isMaster) {
  //   console.log(`Master ${process.pid} is running`)

  //   for (let i = 0; i < ; i++) {
  //     cluster.fork()
  //   }

  //   cluster.on('exit', (worker, code, signal) => {
  //     console.log(`Worker ${worker.process.pid} terminated`)
  //   })
  // } else {
  // ? Create http server and add subscriptions to it
  const httpServer = createServer(app)
  apolloServer.installSubscriptionHandlers(httpServer)

  // ? Listen to HTTP and WebSocket server
  const { PORT, NODE_ENV } = process.env
  httpServer.listen({ port: PORT }, () => {
    spinner.succeed(
      `${prefix} Server ready at ${
        NODE_ENV === 'development' ? hl.success(`http://${NetWorkManager.ip}:${PORT!}`) : `port ${PORT}`
      }`
    )
  })
  // }
}

main()
