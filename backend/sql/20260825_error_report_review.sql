-- Run against the SWP391 database. The guards make this migration safe to rerun.
IF COL_LENGTH('dbo.error_reports', 'reviewer_note') IS NULL
    ALTER TABLE dbo.error_reports ADD reviewer_note NVARCHAR(500) NULL;
GO

IF COL_LENGTH('dbo.error_reports', 'reviewed_by') IS NULL
    ALTER TABLE dbo.error_reports ADD reviewed_by BIGINT NULL;
GO

IF COL_LENGTH('dbo.error_reports', 'reviewed_at') IS NULL
    ALTER TABLE dbo.error_reports ADD reviewed_at DATETIME NULL;
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.foreign_keys
    WHERE name = 'FK_error_reports_reviewed_by'
      AND parent_object_id = OBJECT_ID('dbo.error_reports')
)
    ALTER TABLE dbo.error_reports
    ADD CONSTRAINT FK_error_reports_reviewed_by
    FOREIGN KEY (reviewed_by) REFERENCES dbo.Account(account_id);
GO