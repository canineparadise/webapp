-- ============================================
-- STAFF ASSIGNMENTS TABLE
-- ============================================
-- Track which staff members are assigned to which areas/playgrounds

CREATE TABLE IF NOT EXISTS staff_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Assignment details
  date DATE NOT NULL,
  staff_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Area/Location assignment
  area_type TEXT NOT NULL CHECK (area_type IN ('playground_1', 'playground_2', 'playground_3', 'indoor_play', 'reception', 'feeding_area', 'grooming', 'other')),
  area_name TEXT, -- Custom name if "other"

  -- Time slot
  shift_start TIME NOT NULL,
  shift_end TIME NOT NULL,

  -- Assignment details
  assignment_notes TEXT,
  assigned_by_admin_id UUID REFERENCES profiles(id) ON DELETE SET NULL,

  -- Status
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  checked_in BOOLEAN DEFAULT false,
  checked_in_at TIMESTAMPTZ,
  checked_out BOOLEAN DEFAULT false,
  checked_out_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- STAFF TASKS TABLE
-- ============================================
-- Admin can assign specific tasks to staff members

CREATE TABLE IF NOT EXISTS staff_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Task details
  due_date DATE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),

  -- Assignment
  staff_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  assigned_by_admin_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Time
  due_time TIME,
  estimated_duration_minutes INTEGER,

  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  completion_notes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

-- Staff assignments indexes
CREATE INDEX IF NOT EXISTS idx_staff_assignments_date ON staff_assignments(date DESC);
CREATE INDEX IF NOT EXISTS idx_staff_assignments_staff ON staff_assignments(staff_id);
CREATE INDEX IF NOT EXISTS idx_staff_assignments_area ON staff_assignments(area_type);
CREATE INDEX IF NOT EXISTS idx_staff_assignments_status ON staff_assignments(status);

-- Staff tasks indexes
CREATE INDEX IF NOT EXISTS idx_staff_tasks_date ON staff_tasks(due_date DESC);
CREATE INDEX IF NOT EXISTS idx_staff_tasks_assigned_to ON staff_tasks(staff_id);
CREATE INDEX IF NOT EXISTS idx_staff_tasks_status ON staff_tasks(status);
CREATE INDEX IF NOT EXISTS idx_staff_tasks_priority ON staff_tasks(priority);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Staff assignments RLS
ALTER TABLE staff_assignments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Staff can view all assignments" ON staff_assignments;
DROP POLICY IF EXISTS "Admin can manage assignments" ON staff_assignments;
DROP POLICY IF EXISTS "Staff can check in/out of assignments" ON staff_assignments;

CREATE POLICY "Staff can view all assignments"
  ON staff_assignments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('staff', 'admin')
    )
  );

CREATE POLICY "Admin can manage assignments"
  ON staff_assignments FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Staff can check in/out of assignments"
  ON staff_assignments FOR UPDATE
  TO authenticated
  USING (staff_id = auth.uid())
  WITH CHECK (staff_id = auth.uid());

-- Staff tasks RLS
ALTER TABLE staff_tasks ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Staff can view their own tasks" ON staff_tasks;
DROP POLICY IF EXISTS "Admin can manage all tasks" ON staff_tasks;
DROP POLICY IF EXISTS "Staff can update their own task status" ON staff_tasks;

CREATE POLICY "Staff can view their own tasks"
  ON staff_tasks FOR SELECT
  TO authenticated
  USING (
    staff_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admin can manage all tasks"
  ON staff_tasks FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Staff can update their own task status"
  ON staff_tasks FOR UPDATE
  TO authenticated
  USING (staff_id = auth.uid())
  WITH CHECK (staff_id = auth.uid());

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================

-- Staff assignments trigger
CREATE OR REPLACE FUNCTION update_staff_assignments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS staff_assignments_updated_at ON staff_assignments;
CREATE TRIGGER staff_assignments_updated_at
  BEFORE UPDATE ON staff_assignments
  FOR EACH ROW
  EXECUTE FUNCTION update_staff_assignments_updated_at();

-- Staff tasks trigger
CREATE OR REPLACE FUNCTION update_staff_tasks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS staff_tasks_updated_at ON staff_tasks;
CREATE TRIGGER staff_tasks_updated_at
  BEFORE UPDATE ON staff_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_staff_tasks_updated_at();

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE staff_assignments IS 'Staff assignments to different areas/playgrounds throughout the day';
COMMENT ON TABLE staff_tasks IS 'Specific tasks assigned to staff members by admins';

-- Verify tables were created
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('staff_assignments', 'staff_tasks');
