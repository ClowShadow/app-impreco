import { connectToDatabase } from '../lib/db.js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

async function seed() {
  console.log('🌱 Starting database seed...\n')

  try {
    const { db } = await connectToDatabase()

    // Seed products
    console.log('📦 Seeding products...')
    const productsData = JSON.parse(
      readFileSync(join(__dirname, '../seed/products.json'), 'utf-8')
    )
    
    // Convert date strings to Date objects
    const products = productsData.map((p: any) => ({
      ...p,
      createdAt: new Date(p.createdAt.$date),
      updatedAt: new Date(p.updatedAt.$date),
    }))

    // Clear existing data
    await db.collection('products').deleteMany({})
    
    // Insert new data
    const result = await db.collection('products').insertMany(products)
    console.log(`✅ Inserted ${result.insertedCount} products\n`)

    // Create index on id field
    await db.collection('products').createIndex({ id: 1 }, { unique: true })
    console.log('✅ Created index on products.id\n')

    console.log('🎉 Database seed completed successfully!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Seed failed:', error)
    process.exit(1)
  }
}

seed()
