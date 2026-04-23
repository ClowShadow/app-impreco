import type { VercelRequest, VercelResponse } from '@vercel/node'
import { connectToDatabase } from '../database/lib/db.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    await connectToDatabase()
    res.status(200).json({ status: 'ok', database: 'connected' })
  } catch (error) {
    res.status(500).json({ status: 'error', database: 'disconnected', error: String(error) })
  }
}
