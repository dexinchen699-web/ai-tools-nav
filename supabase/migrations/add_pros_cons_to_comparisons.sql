-- Add pros_cons JSONB field to comparisons table
-- Structure: { tool1_pros: string[], tool1_cons: string[], tool2_pros: string[], tool2_cons: string[] }

ALTER TABLE comparisons
  ADD COLUMN IF NOT EXISTS pros_cons JSONB DEFAULT NULL;

COMMENT ON COLUMN comparisons.pros_cons IS
  'Comparison-specific pros/cons per tool pair. Structure: { tool1_pros: string[], tool1_cons: string[], tool2_pros: string[], tool2_cons: string[] }';
