/* QuestionSet is the exam. Upgrades empty legacy TestAttempt tables in place. */
IF COL_LENGTH('dbo.QuestionSet','duration_minutes') IS NULL
    ALTER TABLE dbo.QuestionSet ADD duration_minutes INT NOT NULL CONSTRAINT DF_QuestionSet_Duration DEFAULT 60;

IF COL_LENGTH('dbo.TestAttempt','test_id') IS NOT NULL
BEGIN
    DECLARE @fk sysname;
    SELECT @fk=fk.name FROM sys.foreign_keys fk JOIN sys.foreign_key_columns fkc ON fk.object_id=fkc.constraint_object_id JOIN sys.columns c ON c.object_id=fkc.parent_object_id AND c.column_id=fkc.parent_column_id WHERE fk.parent_object_id=OBJECT_ID('dbo.TestAttempt') AND c.name='test_id';
    IF @fk IS NOT NULL EXEC('ALTER TABLE dbo.TestAttempt DROP CONSTRAINT ['+@fk+']');
    EXEC sp_rename 'dbo.TestAttempt.test_id','question_set_id','COLUMN';
END;
IF NOT EXISTS(SELECT 1 FROM sys.foreign_keys WHERE name='FK_TestAttempt_QuestionSet')
    ALTER TABLE dbo.TestAttempt ADD CONSTRAINT FK_TestAttempt_QuestionSet FOREIGN KEY(question_set_id) REFERENCES dbo.QuestionSet(question_set_id);
IF COL_LENGTH('dbo.TestAttemptAnswer','note') IS NULL ALTER TABLE dbo.TestAttemptAnswer ADD note NVARCHAR(1000) NULL;
IF COL_LENGTH('dbo.TestAttemptAnswer','answered_at') IS NULL ALTER TABLE dbo.TestAttemptAnswer ADD answered_at DATETIME2 NULL;
