import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: './src/.env' })

export const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ROLE_KEY!)

export async function test() {
  // Make a request
  const { data } = await supabase.from('League2').select('*')
  console.log(`${data?.length} Leagues`)
}

export async function wake() {
  const { data } = await supabase.from('League2').select('*')
  console.log(`Heartbeat at ${new Date()} ${data?.length} Leagues`)
}
