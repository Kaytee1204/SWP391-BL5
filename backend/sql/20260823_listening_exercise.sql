/*
 * Run against database swp391_bl5.
 * Creates the table when missing and upgrades the legacy table in place.
 * No table or existing row is deleted.
 */
IF OBJECT_ID('dbo.ListeningExercise', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.ListeningExercise (
        listening_exercise_id BIGINT IDENTITY(1,1) PRIMARY KEY,
        jlpt_level NVARCHAR(20) NOT NULL,
        title NVARCHAR(200) NOT NULL,
        audio_url NVARCHAR(500) NOT NULL,
        audio_storage_name NVARCHAR(255) NOT NULL,
        audio_original_name NVARCHAR(255) NOT NULL,
        script_text NVARCHAR(MAX) NOT NULL,
        translation NVARCHAR(MAX) NULL,
        created_by BIGINT NOT NULL,
        created_at DATETIME2 NOT NULL CONSTRAINT DF_ListeningExercise_CreatedAt DEFAULT GETDATE(),
        updated_at DATETIME2 NOT NULL CONSTRAINT DF_ListeningExercise_UpdatedAt DEFAULT GETDATE(),
        CONSTRAINT FK_ListeningExercise_Account FOREIGN KEY (created_by)
            REFERENCES Account(account_id),
        CONSTRAINT CK_ListeningExercise_JlptLevel
            CHECK (jlpt_level IN ('N1', 'N2', 'N3', 'N4', 'N5'))
    );

    CREATE INDEX IX_ListeningExercise_CreatedBy ON dbo.ListeningExercise(created_by);
    CREATE INDEX IX_ListeningExercise_JlptLevel ON dbo.ListeningExercise(jlpt_level);
END;
ELSE
BEGIN
    /* Legacy column: exercise_id -> listening_exercise_id. */
    IF COL_LENGTH('dbo.ListeningExercise', 'listening_exercise_id') IS NULL
       AND COL_LENGTH('dbo.ListeningExercise', 'exercise_id') IS NOT NULL
    BEGIN
        EXEC sp_rename
            'dbo.ListeningExercise.exercise_id',
            'listening_exercise_id',
            'COLUMN';
    END;

    /* Legacy column: script -> script_text. */
    IF COL_LENGTH('dbo.ListeningExercise', 'script_text') IS NULL
       AND COL_LENGTH('dbo.ListeningExercise', 'script') IS NOT NULL
    BEGIN
        EXEC sp_rename
            'dbo.ListeningExercise.script',
            'script_text',
            'COLUMN';
    END;

    IF COL_LENGTH('dbo.ListeningExercise', 'audio_storage_name') IS NULL
        ALTER TABLE dbo.ListeningExercise
            ADD audio_storage_name NVARCHAR(255) NULL;

    IF COL_LENGTH('dbo.ListeningExercise', 'audio_original_name') IS NULL
        ALTER TABLE dbo.ListeningExercise
            ADD audio_original_name NVARCHAR(255) NULL;

    /*
     * Backfill legacy rows from audio_url before enforcing NOT NULL.
     * The current database may have no rows, but this also preserves populated tables.
     */
    EXEC(N'
        UPDATE dbo.ListeningExercise
        SET audio_storage_name = LEFT(
                RIGHT(audio_url, CHARINDEX(''/'', REVERSE(audio_url) + ''/'') - 1),
                255
            )
        WHERE audio_storage_name IS NULL;

        UPDATE dbo.ListeningExercise
        SET audio_original_name = audio_storage_name
        WHERE audio_original_name IS NULL;

        UPDATE dbo.ListeningExercise
        SET script_text = N''''
        WHERE script_text IS NULL;

        ALTER TABLE dbo.ListeningExercise
            ALTER COLUMN audio_storage_name NVARCHAR(255) NOT NULL;

        ALTER TABLE dbo.ListeningExercise
            ALTER COLUMN audio_original_name NVARCHAR(255) NOT NULL;

        ALTER TABLE dbo.ListeningExercise
            ALTER COLUMN script_text NVARCHAR(MAX) NOT NULL;
    ');

    IF NOT EXISTS (
        SELECT 1 FROM sys.indexes
        WHERE name = 'IX_ListeningExercise_CreatedBy'
          AND object_id = OBJECT_ID('dbo.ListeningExercise')
    )
        CREATE INDEX IX_ListeningExercise_CreatedBy
            ON dbo.ListeningExercise(created_by);

    IF NOT EXISTS (
        SELECT 1 FROM sys.indexes
        WHERE name = 'IX_ListeningExercise_JlptLevel'
          AND object_id = OBJECT_ID('dbo.ListeningExercise')
    )
        CREATE INDEX IX_ListeningExercise_JlptLevel
            ON dbo.ListeningExercise(jlpt_level);
END;
