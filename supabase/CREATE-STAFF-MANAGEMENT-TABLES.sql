-- Staff Assignments Table
CREATE TABLE IF NOT EXISTS staff_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_date DATE NOT NULL,
  staff_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  area_type VARCHAR(50) NOT NULL,
  area_name VARCHAR(100),
  shift_start TIME NOT NULL,
  shift_end TIME NOT NULL,
  assignment_notes TEXT,
  assigned_by_admin_id UUID REFERENCES auth.users(id),
  status VARCHAR(20) DEFAULT 'scheduled',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Staff Tasks Table
CREATE TABLE IF NOT EXISTS staff_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_date DATE NOT NULL,
  assigned_to_staff_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_title VARCHAR(200) NOT NULL,
  task_description TEXT,
  priority VARCHAR(20) DEFAULT 'medium',
  task_status VARCHAR(20) DEFAULT 'pending',
  assigned_by_admin_id UUID REFERENCES auth.users(id),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_staff_assignments_date ON staff_assignments(assignment_date);
CREATE INDEX IF NOT EXISTS idx_staff_assignments_staff_id ON staff_assignments(staff_id);
CREATE INDEX IF NOT EXISTS idx_staff_assignments_status ON staff_assignments(status);

CREATE INDEX IF NOT EXISTS idx_staff_tasks_date ON staff_tasks(task_date);
CREATE INDEX IF NOT EXISTS idx_staff_tasks_staff_id ON staff_tasks(assigned_to_staff_id);
CREATE INDEX IF NOT EXISTS idx_staff_tasks_status ON staff_tasks(task_status);

-- Enable Row Level Security
ALTER TABLE staff_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for staff_assignments
CREATE POLICY "Staff can view their own assignments"
  ON staff_assignments FOR SELECT
  USING (
    auth.uid() = staff_id OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'staff')
    )
  );

CREATE POLICY "Admins can insert assignments"
  ON staff_assignments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update assignments"
  ON staff_assignments FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete assignments"
  ON staff_assignments FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for staff_tasks
CREATE POLICY "Staff can view their own tasks"
  ON staff_tasks FOR SELECT
  USING (
    auth.uid() = assigned_to_staff_id OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'staff')
    )
  );

CREATE POLICY "Admins can insert tasks"
  ON staff_tasks FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins and assigned staff can update tasks"
  ON staff_tasks FOR UPDATE
  USING (
    auth.uid() = assigned_to_staff_id OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete tasks"
  ON staff_tasks FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for staff_assignments
DROP TRIGGER IF EXISTS update_staff_assignments_updated_at ON staff_assignments;
CREATE TRIGGER update_staff_assignments_updated_at
  BEFORE UPDATE ON staff_assignments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add triggers for staff_tasks
DROP TRIGGER IF EXISTS update_staff_tasks_updated_at ON staff_tasks;
CREATE TRIGGER update_staff_tasks_updated_at
  BEFORE UPDATE ON staff_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
