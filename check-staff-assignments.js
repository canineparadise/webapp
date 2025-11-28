const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://hmlmazrdoglqfictjcnm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtbG1henJkb2dscWZpY3RqY25tIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkyMDk0OSwiZXhwIjoyMDczNDk2OTQ5fQ.r-CdXvHM8e5HRAgnNOHuikXaIBpr-sBacVNAHR-FDRs'
)

async function checkStaffData() {
  console.log('=== CHECKING staff_assignments TABLE ===\n')

  const { data: assignments, error: assignError } = await supabase
    .from('staff_assignments')
    .select('*')
    .limit(10)

  if (assignError) {
    console.log('❌ Error:', assignError.message)
  } else {
    console.log('Found:', assignments?.length || 0, 'staff assignments')
    if (assignments && assignments.length > 0) {
      console.log('\nSample assignment:')
      console.log(JSON.stringify(assignments[0], null, 2))
    }
  }

  console.log('\n=== CHECKING staff_tasks TABLE ===\n')

  const { data: tasks, error: taskError } = await supabase
    .from('staff_tasks')
    .select('*')
    .limit(10)

  if (taskError) {
    console.log('❌ Error:', taskError.message)
  } else {
    console.log('Found:', tasks?.length || 0, 'staff tasks')
    if (tasks && tasks.length > 0) {
      console.log('\nSample task:')
      console.log(JSON.stringify(tasks[0], null, 2))
    }
  }
}

checkStaffData().catch(console.error)
