/*
 * Upgrade script specifically for the schema in SWP391.sql.
 * Target: Microsoft SQL Server, database [swp391].
 *
 * Adds/upgrades:
 *   1. Reading Passage Management
 *   2. Listening Exercise Management
 *   3. QuestionSet-based JLPT exams, attempts, history and notes
 *
 * Existing JLPTMockTest/MockTestQuestion rows are copied to
 * QuestionSet/QuestionSetItem. Legacy tables are intentionally retained.
 */

USE [swp391];
GO

SET XACT_ABORT ON;
GO

IF OBJECT_ID('dbo.Account', 'U') IS NULL
    THROW 50001, 'Missing base table dbo.Account. Run SWP391.sql first.', 1;

IF OBJECT_ID('dbo.QuestionBank', 'U') IS NULL
    THROW 50002, 'Missing base table dbo.QuestionBank. Run SWP391.sql first.', 1;
GO

/* =====================================================================
   1. READING PASSAGE
   The base schema already has the required columns. Add useful indexes.
   ===================================================================== */
IF OBJECT_ID('dbo.ReadingPassage', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.ReadingPassage (
        passage_id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        jlpt_level NVARCHAR(20) NOT NULL,
        title NVARCHAR(200) NOT NULL,
        content_furigana NVARCHAR(MAX) NOT NULL,
        translation NVARCHAR(MAX) NULL,
        is_preview BIT NOT NULL CONSTRAINT DF_ReadingPassage_IsPreview DEFAULT 0,
        created_by BIGINT NOT NULL,
        created_at DATETIME2 NOT NULL CONSTRAINT DF_ReadingPassage_CreatedAt DEFAULT SYSDATETIME(),
        updated_at DATETIME2 NOT NULL CONSTRAINT DF_ReadingPassage_UpdatedAt DEFAULT SYSDATETIME(),
        CONSTRAINT FK_ReadingPassage_Account FOREIGN KEY (created_by) REFERENCES dbo.Account(account_id),
        CONSTRAINT CK_ReadingPassage_JlptLevel CHECK (jlpt_level IN ('N1','N2','N3','N4','N5'))
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID('dbo.ReadingPassage') AND name='IX_ReadingPassage_CreatedBy')
    CREATE INDEX IX_ReadingPassage_CreatedBy ON dbo.ReadingPassage(created_by);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID('dbo.ReadingPassage') AND name='IX_ReadingPassage_JlptLevel')
    CREATE INDEX IX_ReadingPassage_JlptLevel ON dbo.ReadingPassage(jlpt_level);
GO

/* =====================================================================
   2. LISTENING EXERCISE
   Upgrade legacy exercise_id/script columns without dropping the table.
   ===================================================================== */
IF OBJECT_ID('dbo.ListeningExercise', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.ListeningExercise (
        listening_exercise_id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        jlpt_level NVARCHAR(20) NOT NULL,
        title NVARCHAR(200) NOT NULL,
        audio_url NVARCHAR(500) NOT NULL,
        script_text NVARCHAR(MAX) NOT NULL,
        translation NVARCHAR(MAX) NULL,
        is_preview BIT NOT NULL CONSTRAINT DF_ListeningExercise_IsPreview DEFAULT 0,
        audio_storage_name NVARCHAR(255) NOT NULL,
        audio_original_name NVARCHAR(255) NOT NULL,
        created_by BIGINT NOT NULL,
        created_at DATETIME2 NOT NULL CONSTRAINT DF_ListeningExercise_CreatedAt DEFAULT SYSDATETIME(),
        updated_at DATETIME2 NOT NULL CONSTRAINT DF_ListeningExercise_UpdatedAt DEFAULT SYSDATETIME(),
        CONSTRAINT FK_ListeningExercise_Account FOREIGN KEY(created_by) REFERENCES dbo.Account(account_id),
        CONSTRAINT CK_ListeningExercise_JlptLevel CHECK(jlpt_level IN ('N1','N2','N3','N4','N5'))
    );
END;
ELSE
BEGIN
    IF COL_LENGTH('dbo.ListeningExercise','listening_exercise_id') IS NULL
       AND COL_LENGTH('dbo.ListeningExercise','exercise_id') IS NOT NULL
        EXEC sp_rename 'dbo.ListeningExercise.exercise_id', 'listening_exercise_id', 'COLUMN';

    IF COL_LENGTH('dbo.ListeningExercise','script_text') IS NULL
       AND COL_LENGTH('dbo.ListeningExercise','script') IS NOT NULL
        EXEC sp_rename 'dbo.ListeningExercise.script', 'script_text', 'COLUMN';

    IF COL_LENGTH('dbo.ListeningExercise','audio_storage_name') IS NULL
        ALTER TABLE dbo.ListeningExercise ADD audio_storage_name NVARCHAR(255) NULL;

    IF COL_LENGTH('dbo.ListeningExercise','audio_original_name') IS NULL
        ALTER TABLE dbo.ListeningExercise ADD audio_original_name NVARCHAR(255) NULL;
END;
GO

UPDATE dbo.ListeningExercise
SET script_text=N''
WHERE script_text IS NULL;

UPDATE dbo.ListeningExercise
SET audio_storage_name=LEFT(
    RIGHT(audio_url, CHARINDEX('/', REVERSE(audio_url) + '/') - 1), 255)
WHERE audio_storage_name IS NULL;

UPDATE dbo.ListeningExercise
SET audio_original_name=audio_storage_name
WHERE audio_original_name IS NULL;

ALTER TABLE dbo.ListeningExercise ALTER COLUMN script_text NVARCHAR(MAX) NOT NULL;
ALTER TABLE dbo.ListeningExercise ALTER COLUMN audio_storage_name NVARCHAR(255) NOT NULL;
ALTER TABLE dbo.ListeningExercise ALTER COLUMN audio_original_name NVARCHAR(255) NOT NULL;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID('dbo.ListeningExercise') AND name='IX_ListeningExercise_CreatedBy')
    CREATE INDEX IX_ListeningExercise_CreatedBy ON dbo.ListeningExercise(created_by);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID('dbo.ListeningExercise') AND name='IX_ListeningExercise_JlptLevel')
    CREATE INDEX IX_ListeningExercise_JlptLevel ON dbo.ListeningExercise(jlpt_level);
GO

/* =====================================================================
   3. QUESTION BANK COMPATIBILITY
   The application requires multiple_select and duplicate_hash.
   ===================================================================== */
DECLARE @questionTypeCheck sysname;
SELECT TOP 1 @questionTypeCheck=cc.name
FROM sys.check_constraints cc
WHERE cc.parent_object_id=OBJECT_ID('dbo.QuestionBank')
  AND cc.definition LIKE '%question_type%';

IF @questionTypeCheck IS NOT NULL
    EXEC('ALTER TABLE dbo.QuestionBank DROP CONSTRAINT [' + @questionTypeCheck + ']');

IF NOT EXISTS (
    SELECT 1 FROM sys.check_constraints
    WHERE parent_object_id=OBJECT_ID('dbo.QuestionBank')
      AND name='CK_QuestionBank_QuestionType'
)
    ALTER TABLE dbo.QuestionBank WITH CHECK ADD CONSTRAINT CK_QuestionBank_QuestionType
    CHECK(question_type IN ('multiple_choice','multiple_select','fill_blank'));

IF COL_LENGTH('dbo.QuestionBank','duplicate_hash') IS NULL
    ALTER TABLE dbo.QuestionBank ADD duplicate_hash VARCHAR(64) NULL;
GO

UPDATE dbo.QuestionBank
SET duplicate_hash=CONVERT(VARCHAR(64), HASHBYTES('SHA2_256',
    CONCAT(question_id,'|',skill_type,'|',jlpt_level,'|',question_text,'|',correct_answer)), 2)
WHERE duplicate_hash IS NULL OR duplicate_hash='';

ALTER TABLE dbo.QuestionBank ALTER COLUMN duplicate_hash VARCHAR(64) NOT NULL;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID('dbo.QuestionBank') AND name='UX_QuestionBank_DuplicateHash')
    CREATE UNIQUE INDEX UX_QuestionBank_DuplicateHash ON dbo.QuestionBank(duplicate_hash);
GO

/* =====================================================================
   4. QUESTION SET = JLPT EXAM
   ===================================================================== */
IF OBJECT_ID('dbo.QuestionSet','U') IS NULL
BEGIN
    CREATE TABLE dbo.QuestionSet (
        question_set_id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        title NVARCHAR(200) NOT NULL,
        description NVARCHAR(1000) NULL,
        skill_type VARCHAR(20) NOT NULL,
        jlpt_level VARCHAR(20) NOT NULL,
        duration_minutes INT NOT NULL CONSTRAINT DF_QuestionSet_Duration DEFAULT 60,
        created_by BIGINT NOT NULL,
        created_at DATETIME2 NOT NULL CONSTRAINT DF_QuestionSet_CreatedAt DEFAULT SYSDATETIME(),
        updated_at DATETIME2 NOT NULL CONSTRAINT DF_QuestionSet_UpdatedAt DEFAULT SYSDATETIME(),
        CONSTRAINT FK_QuestionSet_Account FOREIGN KEY(created_by) REFERENCES dbo.Account(account_id),
        CONSTRAINT CK_QuestionSet_SkillType CHECK(skill_type IN ('vocabulary','grammar','listening','reading','mixed')),
        CONSTRAINT CK_QuestionSet_JlptLevel CHECK(jlpt_level IN ('N1','N2','N3','N4','N5'))
    );
END;
GO

/* Copy legacy mock tests while preserving IDs referenced by TestAttempt. */
IF OBJECT_ID('dbo.JLPTMockTest','U') IS NOT NULL
BEGIN
    SET IDENTITY_INSERT dbo.QuestionSet ON;

    INSERT INTO dbo.QuestionSet
        (question_set_id,title,description,skill_type,jlpt_level,duration_minutes,created_by,created_at,updated_at)
    SELECT
        t.test_id,t.title,N'Migrated from JLPTMockTest','mixed',t.jlpt_level,
        t.duration_minutes,t.created_by,t.created_at,t.updated_at
    FROM dbo.JLPTMockTest t
    WHERE NOT EXISTS (
        SELECT 1 FROM dbo.QuestionSet qs WHERE qs.question_set_id=t.test_id
    );

    SET IDENTITY_INSERT dbo.QuestionSet OFF;
END;
GO

IF OBJECT_ID('dbo.QuestionSetItem','U') IS NULL
BEGIN
    CREATE TABLE dbo.QuestionSetItem (
        question_set_item_id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        question_set_id BIGINT NOT NULL,
        question_id BIGINT NOT NULL,
        question_order INT NOT NULL,
        CONSTRAINT FK_QuestionSetItem_Set FOREIGN KEY(question_set_id) REFERENCES dbo.QuestionSet(question_set_id) ON DELETE CASCADE,
        CONSTRAINT FK_QuestionSetItem_Question FOREIGN KEY(question_id) REFERENCES dbo.QuestionBank(question_id),
        CONSTRAINT UK_QuestionSetItem_Set_Question UNIQUE(question_set_id,question_id),
        CONSTRAINT UK_QuestionSetItem_Set_Order UNIQUE(question_set_id,question_order)
    );
END;
GO

IF OBJECT_ID('dbo.MockTestQuestion','U') IS NOT NULL
BEGIN
    INSERT INTO dbo.QuestionSetItem(question_set_id,question_id,question_order)
    SELECT m.test_id,m.question_id,m.order_no
    FROM dbo.MockTestQuestion m
    WHERE EXISTS (SELECT 1 FROM dbo.QuestionSet qs WHERE qs.question_set_id=m.test_id)
      AND NOT EXISTS (
          SELECT 1 FROM dbo.QuestionSetItem i
          WHERE i.question_set_id=m.test_id AND i.question_id=m.question_id
      );
END;
GO

/* =====================================================================
   5. TEST ATTEMPT NOW REFERENCES QUESTION SET
   ===================================================================== */
IF OBJECT_ID('dbo.TestAttempt','U') IS NULL
BEGIN
    CREATE TABLE dbo.TestAttempt (
        attempt_id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        student_id BIGINT NOT NULL,
        question_set_id BIGINT NOT NULL,
        score BIGINT NULL,
        total_score BIGINT NULL,
        status NVARCHAR(21) NOT NULL CONSTRAINT DF_TestAttempt_Status DEFAULT 'in_progress',
        review_note NVARCHAR(1000) NULL,
        started_at DATETIME2 NOT NULL CONSTRAINT DF_TestAttempt_StartedAt DEFAULT SYSDATETIME(),
        submitted_at DATETIME2 NULL,
        CONSTRAINT FK_TestAttempt_Student FOREIGN KEY(student_id) REFERENCES dbo.Account(account_id),
        CONSTRAINT FK_TestAttempt_QuestionSet FOREIGN KEY(question_set_id) REFERENCES dbo.QuestionSet(question_set_id),
        CONSTRAINT CK_TestAttempt_Status CHECK(status IN ('in_progress','submitted','expired'))
    );
END;
ELSE IF COL_LENGTH('dbo.TestAttempt','test_id') IS NOT NULL
BEGIN
    DECLARE @attemptTestFk sysname;
    SELECT TOP 1 @attemptTestFk=fk.name
    FROM sys.foreign_keys fk
    JOIN sys.foreign_key_columns fkc ON fkc.constraint_object_id=fk.object_id
    JOIN sys.columns c ON c.object_id=fkc.parent_object_id AND c.column_id=fkc.parent_column_id
    WHERE fk.parent_object_id=OBJECT_ID('dbo.TestAttempt') AND c.name='test_id';

    IF @attemptTestFk IS NOT NULL
        EXEC('ALTER TABLE dbo.TestAttempt DROP CONSTRAINT [' + @attemptTestFk + ']');

    EXEC sp_rename 'dbo.TestAttempt.test_id','question_set_id','COLUMN';
END;
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.foreign_keys
    WHERE parent_object_id=OBJECT_ID('dbo.TestAttempt')
      AND name='FK_TestAttempt_QuestionSet'
)
    ALTER TABLE dbo.TestAttempt ADD CONSTRAINT FK_TestAttempt_QuestionSet
    FOREIGN KEY(question_set_id) REFERENCES dbo.QuestionSet(question_set_id);
GO

DECLARE @attemptStatusCheck sysname;
SELECT TOP 1 @attemptStatusCheck=cc.name
FROM sys.check_constraints cc
WHERE cc.parent_object_id=OBJECT_ID('dbo.TestAttempt')
  AND cc.definition LIKE '%status%';

IF @attemptStatusCheck IS NOT NULL
    EXEC('ALTER TABLE dbo.TestAttempt DROP CONSTRAINT [' + @attemptStatusCheck + ']');

ALTER TABLE dbo.TestAttempt WITH CHECK ADD CONSTRAINT CK_TestAttempt_Status
CHECK(status IN ('in_progress','submitted','expired'));
GO

IF OBJECT_ID('dbo.TestAttemptAnswer','U') IS NULL
BEGIN
    CREATE TABLE dbo.TestAttemptAnswer (
        attempt_id BIGINT NOT NULL,
        question_id BIGINT NOT NULL,
        selected_answer NVARCHAR(MAX) NULL,
        is_correct BIT NULL,
        note NVARCHAR(1000) NULL,
        answered_at DATETIME2 NULL,
        CONSTRAINT PK_TestAttemptAnswer PRIMARY KEY(attempt_id,question_id),
        CONSTRAINT FK_TestAttemptAnswer_Attempt FOREIGN KEY(attempt_id) REFERENCES dbo.TestAttempt(attempt_id) ON DELETE CASCADE,
        CONSTRAINT FK_TestAttemptAnswer_Question FOREIGN KEY(question_id) REFERENCES dbo.QuestionBank(question_id)
    );
END;
ELSE
BEGIN
    IF COL_LENGTH('dbo.TestAttemptAnswer','note') IS NULL
        ALTER TABLE dbo.TestAttemptAnswer ADD note NVARCHAR(1000) NULL;

    IF COL_LENGTH('dbo.TestAttemptAnswer','answered_at') IS NULL
        ALTER TABLE dbo.TestAttemptAnswer ADD answered_at DATETIME2 NULL;
END;
GO

ALTER TABLE dbo.TestAttemptAnswer ALTER COLUMN selected_answer NVARCHAR(MAX) NULL;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID('dbo.TestAttempt') AND name='IX_TestAttempt_Student')
    CREATE INDEX IX_TestAttempt_Student ON dbo.TestAttempt(student_id,started_at DESC);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID('dbo.TestAttempt') AND name='IX_TestAttempt_QuestionSet')
    CREATE INDEX IX_TestAttempt_QuestionSet ON dbo.TestAttempt(question_set_id);
GO

PRINT 'SWP391 database upgrade completed successfully.';
GO
