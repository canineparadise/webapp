/**
 * Import existing clients from CSV files into Supabase
 * Run with: node scripts/import-existing-clients.js
 */

const fs = require('fs')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local')
  process.exit(1)
}

// Create Supabase client with service role key (bypasses RLS)
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Parse CSV file
function parseCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8')
  const lines = content.split('\n').filter(line => line.trim())

  // Skip header row
  const dataLines = lines.slice(1)

  const clients = []

  for (const line of dataLines) {
    // Handle CSV parsing with quoted fields
    const match = line.match(/^"?([^"]*)"?,(.+)$/)
    if (match) {
      const name = match[1].trim()
      const email = match[2].trim().toLowerCase()

      if (email && email.includes('@')) {
        clients.push({ name, email })
      }
    }
  }

  return clients
}

async function importClients() {
  console.log('🔍 Reading CSV files from exisitingclients folder...\n')

  const csvDir = path.join(__dirname, '../exisitingclients')
  const csvFiles = fs.readdirSync(csvDir).filter(file => file.endsWith('.csv'))

  console.log(`Found ${csvFiles.length} CSV files\n`)

  let allClients = []

  // Read all CSV files
  for (const file of csvFiles) {
    const filePath = path.join(csvDir, file)
    const clients = parseCSV(filePath)
    console.log(`📄 ${file}: ${clients.length} clients`)
    allClients = allClients.concat(clients)
  }

  // Remove duplicates based on email
  const uniqueClients = Array.from(
    new Map(allClients.map(c => [c.email, c])).values()
  )

  console.log(`\n📊 Total unique clients: ${uniqueClients.length}`)
  console.log(`📊 Duplicates removed: ${allClients.length - uniqueClients.length}\n`)

  // Import to Supabase in batches
  console.log('⬆️  Importing to Supabase...\n')

  const batchSize = 100
  let imported = 0
  let errors = 0

  for (let i = 0; i < uniqueClients.length; i += batchSize) {
    const batch = uniqueClients.slice(i, i + batchSize)

    const { data, error } = await supabase
      .from('existing_clients')
      .upsert(batch, { onConflict: 'email' })

    if (error) {
      console.error(`❌ Error importing batch ${i / batchSize + 1}:`, error.message)
      errors += batch.length
    } else {
      imported += batch.length
      console.log(`✅ Imported batch ${i / batchSize + 1} (${imported}/${uniqueClients.length})`)
    }
  }

  console.log('\n' + '='.repeat(50))
  console.log(`✅ Import complete!`)
  console.log(`   Imported: ${imported}`)
  console.log(`   Errors: ${errors}`)
  console.log('='.repeat(50))
}

// Run the import
importClients().catch(error => {
  console.error('❌ Fatal error:', error)
  process.exit(1)
})
