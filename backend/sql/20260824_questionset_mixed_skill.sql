/* Allow a full JLPT QuestionSet to contain questions from every skill. */
IF EXISTS (
    SELECT 1 FROM sys.check_constraints
    WHERE name = 'CK_QuestionSet_SkillType'
      AND parent_object_id = OBJECT_ID('dbo.QuestionSet')
)
    ALTER TABLE dbo.QuestionSet DROP CONSTRAINT CK_QuestionSet_SkillType;

ALTER TABLE dbo.QuestionSet WITH CHECK ADD CONSTRAINT CK_QuestionSet_SkillType
CHECK (skill_type IN ('vocabulary', 'grammar', 'listening', 'reading', 'mixed'));
