/*
    Migration: Kanji/Vocabulary audit columns and optimistic locking
    Database : Microsoft SQL Server

    Cach dung:
      - Chon dung database cua ung dung, sau do chay TOAN BO file nay mot lan.
      - Script khong su dung GO, nen co the chay bang SSMS, Azure Data Studio,
        sqlcmd, hoac mot migration tool nhu mot script duy nhat.
      - Script co the chay lai. Neu lan chay truoc bi dung giua chung, script se
        bo qua cac thanh phan da ton tai va tiep tuc phan con thieu.

    Du lieu cu:
      - KanjiDetail lay created_by tu KanjiLessonModule.
      - VocabularyItem lay created_by tu VocabularyCategory.
      - updated_by mac dinh bang created_by; version mac dinh bang 0.
*/

SET NOCOUNT ON;
SET XACT_ABORT ON;

/* Kiem tra schema dau vao truoc khi thay doi du lieu. */
IF OBJECT_ID(N'dbo.KanjiDetail', N'U') IS NULL
    THROW 51000, 'Missing required table dbo.KanjiDetail.', 1;

IF OBJECT_ID(N'dbo.KanjiLessonModule', N'U') IS NULL
    THROW 51001, 'Missing required table dbo.KanjiLessonModule.', 1;

IF OBJECT_ID(N'dbo.VocabularyItem', N'U') IS NULL
    THROW 51002, 'Missing required table dbo.VocabularyItem.', 1;

IF OBJECT_ID(N'dbo.VocabularyCategory', N'U') IS NULL
    THROW 51003, 'Missing required table dbo.VocabularyCategory.', 1;

IF OBJECT_ID(N'dbo.Account', N'U') IS NULL
    THROW 51004, 'Missing required table dbo.Account.', 1;

IF COL_LENGTH(N'dbo.KanjiLessonModule', N'created_by') IS NULL
    THROW 51005, 'Missing required column dbo.KanjiLessonModule.created_by.', 1;

IF COL_LENGTH(N'dbo.VocabularyCategory', N'created_by') IS NULL
    THROW 51006, 'Missing required column dbo.VocabularyCategory.created_by.', 1;

IF COL_LENGTH(N'dbo.Account', N'account_id') IS NULL
    THROW 51007, 'Missing required column dbo.Account.account_id.', 1;

BEGIN TRY
    BEGIN TRANSACTION;

    /*
        Dung dynamic SQL cho cac lenh tham chieu cot moi. SQL Server thuong bien
        dich ca batch truoc khi ALTER TABLE chay; cach nay tranh loi Msg 207
        "Invalid column name" khi chay file lan dau.
    */

    /* ---------- KanjiDetail ---------- */
    IF COL_LENGTH(N'dbo.KanjiDetail', N'created_by') IS NULL
        EXEC sys.sp_executesql
            N'ALTER TABLE dbo.KanjiDetail ADD created_by BIGINT NULL;';

    IF COL_LENGTH(N'dbo.KanjiDetail', N'updated_by') IS NULL
        EXEC sys.sp_executesql
            N'ALTER TABLE dbo.KanjiDetail ADD updated_by BIGINT NULL;';

    IF COL_LENGTH(N'dbo.KanjiDetail', N'version') IS NULL
        EXEC sys.sp_executesql
            N'ALTER TABLE dbo.KanjiDetail ADD version BIGINT NULL;';

    EXEC sys.sp_executesql N'
        UPDATE kd
        SET
            created_by = COALESCE(kd.created_by, km.created_by),
            updated_by = COALESCE(kd.updated_by, kd.created_by, km.created_by),
            version = COALESCE(kd.version, 0)
        FROM dbo.KanjiDetail AS kd
        INNER JOIN dbo.KanjiLessonModule AS km
            ON km.module_id = kd.module_id
        WHERE kd.created_by IS NULL
           OR kd.updated_by IS NULL
           OR kd.version IS NULL;

        IF EXISTS
        (
            SELECT 1
            FROM dbo.KanjiDetail
            WHERE created_by IS NULL
               OR updated_by IS NULL
               OR version IS NULL
        )
            THROW 51010,
                ''Cannot backfill dbo.KanjiDetail. Check module_id and the parent created_by values.'',
                1;
    ';

    IF EXISTS
    (
        SELECT 1
        FROM sys.columns
        WHERE object_id = OBJECT_ID(N'dbo.KanjiDetail')
          AND name = N'created_by'
          AND is_nullable = 1
    )
        EXEC sys.sp_executesql
            N'ALTER TABLE dbo.KanjiDetail ALTER COLUMN created_by BIGINT NOT NULL;';

    IF EXISTS
    (
        SELECT 1
        FROM sys.columns
        WHERE object_id = OBJECT_ID(N'dbo.KanjiDetail')
          AND name = N'updated_by'
          AND is_nullable = 1
    )
        EXEC sys.sp_executesql
            N'ALTER TABLE dbo.KanjiDetail ALTER COLUMN updated_by BIGINT NOT NULL;';

    IF EXISTS
    (
        SELECT 1
        FROM sys.columns
        WHERE object_id = OBJECT_ID(N'dbo.KanjiDetail')
          AND name = N'version'
          AND is_nullable = 1
    )
        EXEC sys.sp_executesql
            N'ALTER TABLE dbo.KanjiDetail ALTER COLUMN version BIGINT NOT NULL;';

    IF NOT EXISTS
    (
        SELECT 1
        FROM sys.default_constraints AS dc
        INNER JOIN sys.columns AS c
            ON c.object_id = dc.parent_object_id
           AND c.column_id = dc.parent_column_id
        WHERE dc.parent_object_id = OBJECT_ID(N'dbo.KanjiDetail')
          AND c.name = N'version'
    )
        EXEC sys.sp_executesql N'
            ALTER TABLE dbo.KanjiDetail
            ADD CONSTRAINT DF_KanjiDetail_Version DEFAULT (0) FOR version;
        ';

    IF NOT EXISTS
    (
        SELECT 1
        FROM sys.foreign_key_columns AS fkc
        INNER JOIN sys.columns AS c
            ON c.object_id = fkc.parent_object_id
           AND c.column_id = fkc.parent_column_id
        WHERE fkc.parent_object_id = OBJECT_ID(N'dbo.KanjiDetail')
          AND c.name = N'created_by'
          AND fkc.referenced_object_id = OBJECT_ID(N'dbo.Account')
    )
        EXEC sys.sp_executesql N'
            ALTER TABLE dbo.KanjiDetail WITH CHECK
            ADD CONSTRAINT FK_KanjiDetail_CreatedBy
                FOREIGN KEY (created_by) REFERENCES dbo.Account(account_id);
        ';

    IF NOT EXISTS
    (
        SELECT 1
        FROM sys.foreign_key_columns AS fkc
        INNER JOIN sys.columns AS c
            ON c.object_id = fkc.parent_object_id
           AND c.column_id = fkc.parent_column_id
        WHERE fkc.parent_object_id = OBJECT_ID(N'dbo.KanjiDetail')
          AND c.name = N'updated_by'
          AND fkc.referenced_object_id = OBJECT_ID(N'dbo.Account')
    )
        EXEC sys.sp_executesql N'
            ALTER TABLE dbo.KanjiDetail WITH CHECK
            ADD CONSTRAINT FK_KanjiDetail_UpdatedBy
                FOREIGN KEY (updated_by) REFERENCES dbo.Account(account_id);
        ';

    /* ---------- VocabularyItem ---------- */
    IF COL_LENGTH(N'dbo.VocabularyItem', N'created_by') IS NULL
        EXEC sys.sp_executesql
            N'ALTER TABLE dbo.VocabularyItem ADD created_by BIGINT NULL;';

    IF COL_LENGTH(N'dbo.VocabularyItem', N'updated_by') IS NULL
        EXEC sys.sp_executesql
            N'ALTER TABLE dbo.VocabularyItem ADD updated_by BIGINT NULL;';

    IF COL_LENGTH(N'dbo.VocabularyItem', N'version') IS NULL
        EXEC sys.sp_executesql
            N'ALTER TABLE dbo.VocabularyItem ADD version BIGINT NULL;';

    EXEC sys.sp_executesql N'
        UPDATE vi
        SET
            created_by = COALESCE(vi.created_by, vc.created_by),
            updated_by = COALESCE(vi.updated_by, vi.created_by, vc.created_by),
            version = COALESCE(vi.version, 0)
        FROM dbo.VocabularyItem AS vi
        INNER JOIN dbo.VocabularyCategory AS vc
            ON vc.category_id = vi.category_id
        WHERE vi.created_by IS NULL
           OR vi.updated_by IS NULL
           OR vi.version IS NULL;

        IF EXISTS
        (
            SELECT 1
            FROM dbo.VocabularyItem
            WHERE created_by IS NULL
               OR updated_by IS NULL
               OR version IS NULL
        )
            THROW 51011,
                ''Cannot backfill dbo.VocabularyItem. Check category_id and the parent created_by values.'',
                1;
    ';

    IF EXISTS
    (
        SELECT 1
        FROM sys.columns
        WHERE object_id = OBJECT_ID(N'dbo.VocabularyItem')
          AND name = N'created_by'
          AND is_nullable = 1
    )
        EXEC sys.sp_executesql
            N'ALTER TABLE dbo.VocabularyItem ALTER COLUMN created_by BIGINT NOT NULL;';

    IF EXISTS
    (
        SELECT 1
        FROM sys.columns
        WHERE object_id = OBJECT_ID(N'dbo.VocabularyItem')
          AND name = N'updated_by'
          AND is_nullable = 1
    )
        EXEC sys.sp_executesql
            N'ALTER TABLE dbo.VocabularyItem ALTER COLUMN updated_by BIGINT NOT NULL;';

    IF EXISTS
    (
        SELECT 1
        FROM sys.columns
        WHERE object_id = OBJECT_ID(N'dbo.VocabularyItem')
          AND name = N'version'
          AND is_nullable = 1
    )
        EXEC sys.sp_executesql
            N'ALTER TABLE dbo.VocabularyItem ALTER COLUMN version BIGINT NOT NULL;';

    IF NOT EXISTS
    (
        SELECT 1
        FROM sys.default_constraints AS dc
        INNER JOIN sys.columns AS c
            ON c.object_id = dc.parent_object_id
           AND c.column_id = dc.parent_column_id
        WHERE dc.parent_object_id = OBJECT_ID(N'dbo.VocabularyItem')
          AND c.name = N'version'
    )
        EXEC sys.sp_executesql N'
            ALTER TABLE dbo.VocabularyItem
            ADD CONSTRAINT DF_VocabularyItem_Version DEFAULT (0) FOR version;
        ';

    IF NOT EXISTS
    (
        SELECT 1
        FROM sys.foreign_key_columns AS fkc
        INNER JOIN sys.columns AS c
            ON c.object_id = fkc.parent_object_id
           AND c.column_id = fkc.parent_column_id
        WHERE fkc.parent_object_id = OBJECT_ID(N'dbo.VocabularyItem')
          AND c.name = N'created_by'
          AND fkc.referenced_object_id = OBJECT_ID(N'dbo.Account')
    )
        EXEC sys.sp_executesql N'
            ALTER TABLE dbo.VocabularyItem WITH CHECK
            ADD CONSTRAINT FK_VocabularyItem_CreatedBy
                FOREIGN KEY (created_by) REFERENCES dbo.Account(account_id);
        ';

    IF NOT EXISTS
    (
        SELECT 1
        FROM sys.foreign_key_columns AS fkc
        INNER JOIN sys.columns AS c
            ON c.object_id = fkc.parent_object_id
           AND c.column_id = fkc.parent_column_id
        WHERE fkc.parent_object_id = OBJECT_ID(N'dbo.VocabularyItem')
          AND c.name = N'updated_by'
          AND fkc.referenced_object_id = OBJECT_ID(N'dbo.Account')
    )
        EXEC sys.sp_executesql N'
            ALTER TABLE dbo.VocabularyItem WITH CHECK
            ADD CONSTRAINT FK_VocabularyItem_UpdatedBy
                FOREIGN KEY (updated_by) REFERENCES dbo.Account(account_id);
        ';

    COMMIT TRANSACTION;

    SELECT N'Migration completed successfully.' AS migration_status;
END TRY
BEGIN CATCH
    IF XACT_STATE() <> 0
        ROLLBACK TRANSACTION;

    THROW;
END CATCH;
