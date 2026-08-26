/*
 * Reading Passage Management schema for SQL Server.
 * Safe to run repeatedly: creates only missing table/indexes.
 */
IF OBJECT_ID('dbo.ReadingPassage', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.ReadingPassage (
        passage_id BIGINT IDENTITY(1,1) NOT NULL,
        jlpt_level NVARCHAR(20) NOT NULL,
        title NVARCHAR(200) NOT NULL,
        content_furigana NVARCHAR(MAX) NOT NULL,
        translation NVARCHAR(MAX) NULL,
        is_preview BIT NOT NULL
            CONSTRAINT DF_ReadingPassage_IsPreview DEFAULT 0,
        created_by BIGINT NOT NULL,
        created_at DATETIME2 NOT NULL
            CONSTRAINT DF_ReadingPassage_CreatedAt DEFAULT GETDATE(),
        updated_at DATETIME2 NOT NULL
            CONSTRAINT DF_ReadingPassage_UpdatedAt DEFAULT GETDATE(),

        CONSTRAINT PK_ReadingPassage
            PRIMARY KEY (passage_id),
        CONSTRAINT FK_ReadingPassage_Account
            FOREIGN KEY (created_by) REFERENCES dbo.Account(account_id),
        CONSTRAINT CK_ReadingPassage_JlptLevel
            CHECK (jlpt_level IN ('N1', 'N2', 'N3', 'N4', 'N5'))
    );
END;

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = 'IX_ReadingPassage_CreatedBy'
      AND object_id = OBJECT_ID('dbo.ReadingPassage')
)
    CREATE INDEX IX_ReadingPassage_CreatedBy
        ON dbo.ReadingPassage(created_by);

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = 'IX_ReadingPassage_JlptLevel'
      AND object_id = OBJECT_ID('dbo.ReadingPassage')
)
    CREATE INDEX IX_ReadingPassage_JlptLevel
        ON dbo.ReadingPassage(jlpt_level);
