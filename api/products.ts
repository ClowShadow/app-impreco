import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getDb } from '../database/lib/db.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  try {
    const db = await getDb()
    const collection = db.collection('products')

    if (req.method === 'GET') {
      const { id } = req.query

      if (id) {
        const product = await collection.findOne({ id: parseInt(id as string) })
        if (!product) {
          return res.status(404).json({ error: 'Product not found' })
        }
        return res.status(200).json(product)
      }

      const products = await collection.find({}).toArray()
      return res.status(200).json(products)
    }

    if (req.method === 'POST') {
      const product = req.body
      const result = await collection.insertOne({
        ...product,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      return res.status(201).json({ _id: result.insertedId, ...product })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('API Error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
