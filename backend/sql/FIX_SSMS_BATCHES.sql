-- ==============================================================================
-- SCRIPT CHUẨN DÀNH RIÊNG CHO SQL SERVER (CÓ LỆNH GO TÁCH BATCH ĐỂ TRÁNH MSG 207)
-- ==============================================================================

-- BƯỚC 1: THÊM CỘT VÀO BẢNG error_reports VÀ TÁCH BATCH
IF COL_LENGTH('dbo.error_reports', 'reviewer_note') IS NULL
    ALTER TABLE dbo.error_reports ADD reviewer_note NVARCHAR(500) NULL;

IF COL_LENGTH('dbo.error_reports', 'reviewed_by') IS NULL
    ALTER TABLE dbo.error_reports ADD reviewed_by BIGINT NULL;

IF COL_LENGTH('dbo.error_reports', 'reviewed_at') IS NULL
    ALTER TABLE dbo.error_reports ADD reviewed_at DATETIME NULL;
GO

-- BƯỚC 2: THÊM CỘT VÀO BẢNG KanjiLessonModule VÀ TÁCH BATCH
IF COL_LENGTH('dbo.KanjiLessonModule', 'created_by') IS NULL
    ALTER TABLE dbo.KanjiLessonModule ADD created_by BIGINT NULL;

IF COL_LENGTH('dbo.KanjiLessonModule', 'updated_by') IS NULL
    ALTER TABLE dbo.KanjiLessonModule ADD updated_by BIGINT NULL;

IF COL_LENGTH('dbo.KanjiLessonModule', 'version') IS NULL
    ALTER TABLE dbo.KanjiLessonModule ADD version BIGINT NOT NULL CONSTRAINT DF_KanjiLessonModule_Version DEFAULT (0);
GO

-- BƯỚC 3: THÊM CỘT VÀO BẢNG KanjiDetail VÀ VocabularyItem VÀ TÁCH BATCH
IF COL_LENGTH('dbo.KanjiDetail', 'created_by') IS NULL
    ALTER TABLE dbo.KanjiDetail ADD created_by BIGINT NULL;

IF COL_LENGTH('dbo.KanjiDetail', 'updated_by') IS NULL
    ALTER TABLE dbo.KanjiDetail ADD updated_by BIGINT NULL;

IF COL_LENGTH('dbo.KanjiDetail', 'version') IS NULL
    ALTER TABLE dbo.KanjiDetail ADD version BIGINT NOT NULL CONSTRAINT DF_KanjiDetail_Version DEFAULT (0);
GO

IF COL_LENGTH('dbo.VocabularyItem', 'created_by') IS NULL
    ALTER TABLE dbo.VocabularyItem ADD created_by BIGINT NULL;

IF COL_LENGTH('dbo.VocabularyItem', 'updated_by') IS NULL
    ALTER TABLE dbo.VocabularyItem ADD updated_by BIGINT NULL;

IF COL_LENGTH('dbo.VocabularyItem', 'version') IS NULL
    ALTER TABLE dbo.VocabularyItem ADD version BIGINT NOT NULL CONSTRAINT DF_VocabularyItem_Version DEFAULT (0);
GO

-- BƯỚC 4: BÙ DỮ LIỆU CŨ (LÚC NÀY CỘT ĐÃ TỒN TẠI NÊN KHÔNG BỊ LỖI MSG 207)
DECLARE @default_admin BIGINT;
SELECT TOP 1 @default_admin = account_id FROM dbo.Account;

UPDATE dbo.KanjiLessonModule
SET created_by = ISNULL(created_by, @default_admin),
    updated_by = ISNULL(updated_by, @default_admin),
    version = ISNULL(version, 0);

UPDATE dbo.KanjiDetail
SET created_by = ISNULL(created_by, @default_admin),
    updated_by = ISNULL(updated_by, @default_admin),
    version = ISNULL(version, 0);

UPDATE dbo.VocabularyItem
SET created_by = ISNULL(created_by, @default_admin),
    updated_by = ISNULL(updated_by, @default_admin),
    version = ISNULL(version, 0);
GO
