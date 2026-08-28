-- ==============================================================================
-- SCRIPT KHẮC PHỤC TRIỆT ĐỂ LỖI THIẾU CỘT CSDL (SQL SERVER)
-- Áp dụng cho: dbo.error_reports, dbo.KanjiLessonModule, dbo.KanjiDetail, dbo.VocabularyItem
-- ==============================================================================

USE [swp391]; -- Thay đổi tên database nếu bạn đặt tên khác (ví dụ: [SWP391])
GO

SET NOCOUNT ON;
GO

-- ==============================================================================
-- 1. BỔ SUNG CỘT CHO BẢNG dbo.error_reports
-- ==============================================================================
PRINT N'--> Đang kiểm tra và bổ sung cột cho dbo.error_reports...';

IF COL_LENGTH('dbo.error_reports', 'reviewer_note') IS NULL
BEGIN
    ALTER TABLE dbo.error_reports ADD reviewer_note NVARCHAR(500) NULL;
    PRINT N'    + Đã thêm cột reviewer_note vào error_reports';
END;

IF COL_LENGTH('dbo.error_reports', 'reviewed_by') IS NULL
BEGIN
    ALTER TABLE dbo.error_reports ADD reviewed_by BIGINT NULL;
    PRINT N'    + Đã thêm cột reviewed_by vào error_reports';
END;

IF COL_LENGTH('dbo.error_reports', 'reviewed_at') IS NULL
BEGIN
    ALTER TABLE dbo.error_reports ADD reviewed_at DATETIME NULL;
    PRINT N'    + Đã thêm cột reviewed_at vào error_reports';
END;

IF NOT EXISTS (
    SELECT 1 FROM sys.foreign_keys 
    WHERE name = 'FK_error_reports_reviewed_by' 
      AND parent_object_id = OBJECT_ID('dbo.error_reports')
)
BEGIN
    ALTER TABLE dbo.error_reports
    ADD CONSTRAINT FK_error_reports_reviewed_by
    FOREIGN KEY (reviewed_by) REFERENCES dbo.Account(account_id);
    PRINT N'    + Đã thêm FK_error_reports_reviewed_by';
END;
GO


-- ==============================================================================
-- 2. BỔ SUNG CỘT CHO BẢNG dbo.KanjiLessonModule
-- ==============================================================================
PRINT N'--> Đang kiểm tra và bổ sung cột cho dbo.KanjiLessonModule...';

-- Bổ sung created_by nếu chưa có
IF COL_LENGTH('dbo.KanjiLessonModule', 'created_by') IS NULL
BEGIN
    ALTER TABLE dbo.KanjiLessonModule ADD created_by BIGINT NULL;
    PRINT N'    + Đã thêm cột created_by vào KanjiLessonModule';
END;

-- Bổ sung updated_by
IF COL_LENGTH('dbo.KanjiLessonModule', 'updated_by') IS NULL
BEGIN
    ALTER TABLE dbo.KanjiLessonModule ADD updated_by BIGINT NULL;
    PRINT N'    + Đã thêm cột updated_by vào KanjiLessonModule';
END;

-- Bổ sung version (dành cho Optimistic Locking)
IF COL_LENGTH('dbo.KanjiLessonModule', 'version') IS NULL
BEGIN
    ALTER TABLE dbo.KanjiLessonModule ADD version BIGINT NOT NULL CONSTRAINT DF_KanjiLessonModule_Version DEFAULT (0);
    PRINT N'    + Đã thêm cột version vào KanjiLessonModule';
END;

-- Bù dữ liệu created_by / updated_by cho các dòng cũ nếu bị NULL (gán về tài khoản admin/lecturer đầu tiên)
DECLARE @default_account_id BIGINT;
SELECT TOP 1 @default_account_id = account_id FROM dbo.Account WHERE role IN ('Manager', 'Lecturer', 'Admin');
IF @default_account_id IS NULL
    SELECT TOP 1 @default_account_id = account_id FROM dbo.Account;

UPDATE dbo.KanjiLessonModule
SET created_by = ISNULL(created_by, @default_account_id),
    updated_by = ISNULL(updated_by, ISNULL(created_by, @default_account_id)),
    version = ISNULL(version, 0)
WHERE created_by IS NULL OR updated_by IS NULL OR version IS NULL;

-- Thêm Foreign Key nếu chưa có
IF NOT EXISTS (
    SELECT 1 FROM sys.foreign_keys 
    WHERE name = 'FK_KanjiLessonModule_CreatedBy' 
      AND parent_object_id = OBJECT_ID('dbo.KanjiLessonModule')
)
BEGIN
    ALTER TABLE dbo.KanjiLessonModule
    ADD CONSTRAINT FK_KanjiLessonModule_CreatedBy
    FOREIGN KEY (created_by) REFERENCES dbo.Account(account_id);
END;

IF NOT EXISTS (
    SELECT 1 FROM sys.foreign_keys 
    WHERE name = 'FK_KanjiLessonModule_UpdatedBy' 
      AND parent_object_id = OBJECT_ID('dbo.KanjiLessonModule')
)
BEGIN
    ALTER TABLE dbo.KanjiLessonModule
    ADD CONSTRAINT FK_KanjiLessonModule_UpdatedBy
    FOREIGN KEY (updated_by) REFERENCES dbo.Account(account_id);
    PRINT N'    + Đã thêm FK_KanjiLessonModule_UpdatedBy';
END;
GO


-- ==============================================================================
-- 3. ĐỒNG BỘ CỘT CHO BẢNG dbo.KanjiDetail & dbo.VocabularyItem (Phòng ngừa)
-- ==============================================================================
PRINT N'--> Đang kiểm tra bảng dbo.KanjiDetail & dbo.VocabularyItem...';

-- KanjiDetail
IF COL_LENGTH('dbo.KanjiDetail', 'created_by') IS NULL
    ALTER TABLE dbo.KanjiDetail ADD created_by BIGINT NULL;

IF COL_LENGTH('dbo.KanjiDetail', 'updated_by') IS NULL
    ALTER TABLE dbo.KanjiDetail ADD updated_by BIGINT NULL;

IF COL_LENGTH('dbo.KanjiDetail', 'version') IS NULL
    ALTER TABLE dbo.KanjiDetail ADD version BIGINT NOT NULL CONSTRAINT DF_KanjiDetail_Version DEFAULT (0);

-- Bù dữ liệu cho KanjiDetail
UPDATE kd
SET kd.created_by = ISNULL(kd.created_by, km.created_by),
    kd.updated_by = ISNULL(kd.updated_by, ISNULL(kd.created_by, km.created_by)),
    kd.version = ISNULL(kd.version, 0)
FROM dbo.KanjiDetail kd
LEFT JOIN dbo.KanjiLessonModule km ON kd.module_id = km.module_id
WHERE kd.created_by IS NULL OR kd.updated_by IS NULL OR kd.version IS NULL;

-- VocabularyItem
IF COL_LENGTH('dbo.VocabularyItem', 'created_by') IS NULL
    ALTER TABLE dbo.VocabularyItem ADD created_by BIGINT NULL;

IF COL_LENGTH('dbo.VocabularyItem', 'updated_by') IS NULL
    ALTER TABLE dbo.VocabularyItem ADD updated_by BIGINT NULL;

IF COL_LENGTH('dbo.VocabularyItem', 'version') IS NULL
    ALTER TABLE dbo.VocabularyItem ADD version BIGINT NOT NULL CONSTRAINT DF_VocabularyItem_Version DEFAULT (0);

UPDATE vi
SET vi.created_by = ISNULL(vi.created_by, vc.created_by),
    vi.updated_by = ISNULL(vi.updated_by, ISNULL(vi.created_by, vc.created_by)),
    vi.version = ISNULL(vi.version, 0)
FROM dbo.VocabularyItem vi
LEFT JOIN dbo.VocabularyCategory vc ON vi.category_id = vc.category_id
WHERE vi.created_by IS NULL OR vi.updated_by IS NULL OR vi.version IS NULL;
GO

PRINT N'======================================================';
PRINT N'✅ HOÀN TẤT CẬP NHẬT CSDL! KHÔNG CÒN LỖI THIẾU CỘT.';
PRINT N'======================================================';
