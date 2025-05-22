-- =============================
-- Função genérica para updated_at + disabled_at
-- =============================
CREATE OR REPLACE FUNCTION set_meta_update_fields()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();

  IF NEW.status = false AND OLD.status = true THEN
    NEW.disabled_at := NOW();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================
-- Função para setar deleted_at (soft delete)
-- =============================
CREATE OR REPLACE FUNCTION set_deleted_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.deleted_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- =============================
-- Função para setar disabled_at 
-- =============================

CREATE OR REPLACE FUNCTION set_disabled_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = false AND OLD.status = true THEN
    NEW.disabled_at := NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================
-- SCHOOLS
-- =============================

CREATE TRIGGER schools_before_update
BEFORE UPDATE ON schools
FOR EACH ROW
EXECUTE FUNCTION set_meta_update_fields();

CREATE TRIGGER schools_soft_delete
BEFORE UPDATE ON schools
FOR EACH ROW
WHEN (OLD.status = true AND NEW.status = false)
EXECUTE FUNCTION set_deleted_at();

CREATE TRIGGER trg_disabled_at_school
BEFORE UPDATE ON school
FOR EACH ROW
EXECUTE FUNCTION set_disabled_at();


-- =============================
-- INTERLOCUTORS
-- =============================

CREATE TRIGGER interlocutors_before_update
BEFORE UPDATE ON interlocutors
FOR EACH ROW
EXECUTE FUNCTION set_meta_update_fields();

CREATE TRIGGER interlocutors_soft_delete
BEFORE UPDATE ON interlocutors
FOR EACH ROW
WHEN (OLD.status = true AND NEW.status = false)
EXECUTE FUNCTION set_deleted_at();

CREATE TRIGGER trg_disabled_at_interlocutors
BEFORE UPDATE ON interlocutors
FOR EACH ROW
EXECUTE FUNCTION set_disabled_at();


-- =============================
-- STUDENTS
-- =============================

CREATE TRIGGER students_before_update
BEFORE UPDATE ON students
FOR EACH ROW
EXECUTE FUNCTION set_meta_update_fields();

CREATE TRIGGER students_soft_delete
BEFORE UPDATE ON students
FOR EACH ROW
WHEN (OLD.status = true AND NEW.status = false)
EXECUTE FUNCTION set_deleted_at();

CREATE TRIGGER trg_disabled_at_students
BEFORE UPDATE ON students
FOR EACH ROW
EXECUTE FUNCTION set_disabled_at();


-- =============================
-- GREMIOS
-- =============================
CREATE TRIGGER gremios_before_update
BEFORE UPDATE ON gremios
FOR EACH ROW
EXECUTE FUNCTION set_meta_update_fields();

CREATE TRIGGER gremios_soft_delete
BEFORE UPDATE ON gremios
FOR EACH ROW
WHEN (OLD.status = true AND NEW.status = false)
EXECUTE FUNCTION set_deleted_at();

CREATE TRIGGER trg_disabled_at_gremios
BEFORE UPDATE ON gremios
FOR EACH ROW
EXECUTE FUNCTION set_disabled_at();


-- =============================
-- STUDENTS GREMIOS MEMBERS
-- =============================
CREATE TRIGGER studentsGremioMembers_before_update
BEFORE UPDATE ON students_gremio_members
FOR EACH ROW
EXECUTE FUNCTION set_meta_update_fields();

CREATE TRIGGER studentsGremioMembers_soft_delete
BEFORE UPDATE ON students_gremio_members
FOR EACH ROW
WHEN (OLD.status = true AND NEW.status = false)
EXECUTE FUNCTION set_deleted_at();

CREATE TRIGGER trg_disabled_at_students_gremio_members
BEFORE UPDATE ON students_gremio_members
FOR EACH ROW
EXECUTE FUNCTION set_disabled_at();
