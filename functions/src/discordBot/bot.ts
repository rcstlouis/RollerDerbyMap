// Require the necessary discord.js classes
import { Client, Events, GatewayIntentBits, TextChannel } from 'discord.js'

let client: Client | undefined = undefined
let isInitialized = false

async function init() {
  if (isInitialized) return

  // Create a new client instance
  client = new Client({ intents: [GatewayIntentBits.Guilds] })

  // When the client is ready, run this code (only once).
  // The distinction between `client: Client<boolean>` and `readyClient: Client<true>` is important for TypeScript developers.
  // It makes some properties non-nullable.
  client.once(Events.ClientReady, (readyClient) => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`)
  })

  // Log in to Discord with your client's token
  await client.login(process.env.DISCORD_TOKEN)

  isInitialized = true
}

// export async function sendMessage(message: string) {
//     await init()
//     const channel = client!.channels.cache.get('1022333941715320942/1254642041065836575')
//     if (channel) (channel as any).send(message)
//     return await client!.users.send('394714978957131786', message)
// }

export async function dmHex(message: string) {
  await init()
  return await client!.users.send('394714978957131786', message)
}

export async function sendToLeagueServer(message: string) {
  await init()
  const channel: TextChannel = (await client!.channels.fetch('1306121296828174457')) as TextChannel
  return await channel.send({ content: message })
}
