import { ConnectionOptions, default as mysql } from 'mysql2'
import { Client, ConnectConfig } from 'ssh2'
import dotenv from 'dotenv'

// Import config on load to initialize the constants
dotenv.config({ path: './functions/src/.env' })
let sqlConnection: Promise<mysql.Connection> | undefined = undefined
let sshClient: Client | undefined = undefined

function getConnection(): Promise<mysql.Connection | undefined> {
  if (sqlConnection) return sqlConnection
  sshClient = new Client()
  const dbServer = {
    host: process.env.DATABASE_SSH_IP,
    port: 3306,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASS,
    database: process.env.DATABASE_NAME,
  }
  const tunnelConfig = {
    host: process.env.DATABASE_SSH_IP,
    port: 22,
    username: process.env.DATABASE_SSH_USER,
    password: process.env.DATABASE_SSH_PASS,
    timeout: 10 * 1000,
  } as ConnectConfig
  const forwardConfig = {
    dstHost: '127.0.0.1',
    dstPort: 3306,
    srcHost: dbServer.host,
    srcPort: dbServer.port,
  }
  sqlConnection = new Promise((resolve, reject) => {
    sshClient!
      .on('ready', () => {
        sshClient!.forwardOut(
          forwardConfig.srcHost!,
          forwardConfig.srcPort,
          forwardConfig.dstHost!,
          forwardConfig.dstPort,
          (err, stream) => {
            if (err) reject(err)
            const updatedDbServer = {
              ...dbServer,
              stream,
            } as ConnectionOptions
            const connection = mysql.createConnection(updatedDbServer)
            connection.connect((error) => {
              if (error) reject(error)
              resolve(connection)
            })
          },
        )
      })
      .connect(tunnelConfig)
  })
  return sqlConnection
}

export function getQueryResult(queryText: string) {
  return new Promise(async (resolve, reject) => {
    const mysqlConnection = await getConnection()
    console.log(`Query: ${queryText}`)
    const queryResult = mysqlConnection?.execute({ sql: queryText })
    const results: any[] = []
    queryResult?.on('result', (result) => {
      results.push(result.affectedRows ?? result)
    })
    queryResult?.on('error', (err) => reject(err))
    queryResult?.on('end', () => {
      switch (results.length) {
        case 0:
          resolve(undefined)
          break
        case 1:
          resolve(results[0])
          break
        default:
          resolve(results)
      }
    })
  })
}

export function closeConnection() {
  getConnection().then((connection) => connection?.end())
  sshClient?.end()
}
