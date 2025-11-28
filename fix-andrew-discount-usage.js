const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://hmlmazrdoglqfictjcnm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtbG1henJkb2dscWZpY3RqY25tIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkyMDk0OSwiZXhwIjoyMDczNDk2OTQ5fQ.r-CdXvHM8e5HRAgnNOHuikXaIBpr-sBacVNAHR-FDRs'
)

async function fixAndrewDiscountUsage() {
  console.log('=== FIXING ANDREW\'S DISCOUNT USAGE ===\n')

  const andrewId = 'c5e76355-e017-4492-80b5-40ad9a93e379'
  const first50CodeId = '22562fcf-716a-433a-9930-d54ad1031aa6'

  // Andrew's subscription is £144/month for 4 days
  // Original price without 10% discount: £160/month (£40/day × 4 days)
  // Discount amount: £16/month (10% of £160)
  // Final amount: £144/month

  const originalAmount = 160
  const discountAmount = 16
  const finalAmount = 144

  console.log('Step 1: Insert usage record into discount_code_usage table\n')

  const { data: usageRecord, error: usageError } = await supabase
    .from('discount_code_usage')
    .insert({
      discount_code_id: first50CodeId,
      user_id: andrewId,
      used_for: 'subscription',
      original_amount: originalAmount,
      discount_amount: discountAmount,
      final_amount: finalAmount,
      used_at: '2025-11-27T11:29:09.242455+00:00' // Match Andrew's subscription creation time
    })
    .select()

  if (usageError) {
    console.log('❌ Error inserting usage record:', usageError.message)
  } else {
    console.log('✅ Usage record created:', usageRecord)
  }

  console.log('\nStep 2: Update FIRST50 discount code usage count\n')

  const { data: updated, error: updateError } = await supabase
    .from('discount_codes')
    .update({ current_uses: 1 })
    .eq('id', first50CodeId)
    .select()

  if (updateError) {
    console.log('❌ Error updating usage count:', updateError.message)
  } else {
    console.log('✅ Discount code updated:', updated)
  }

  console.log('\n=== VERIFICATION ===\n')

  // Verify the changes
  const { data: usage } = await supabase
    .from('discount_code_usage')
    .select('*')
    .eq('user_id', andrewId)

  const { data: code } = await supabase
    .from('discount_codes')
    .select('code, current_uses, max_uses')
    .eq('id', first50CodeId)
    .single()

  console.log('Usage records for Andrew:', usage?.length || 0)
  if (usage && usage.length > 0) {
    console.log(JSON.stringify(usage[0], null, 2))
  }

  console.log('\nFIRST50 code status:')
  console.log(`  Current uses: ${code?.current_uses}`)
  console.log(`  Max uses: ${code?.max_uses}`)
  console.log(`  Remaining uses: ${(code?.max_uses || 0) - (code?.current_uses || 0)}`)
}

fixAndrewDiscountUsage().catch(console.error)
