/*
 * QuestionSet publication migration (Microsoft SQL Server)
 *
 * Mục tiêu:
 * - DRAFT: chỉ có trong kho quản lý đề; Student không được làm bài.
 * - PUBLISHED: Student được nhìn thấy và làm bài.
 *
 * Script có thể chạy lại nhiều lần. Cột visibility cũ (nếu có) được giữ lại
 * để tránh xóa dữ liệu ngoài ý muốn; backend mới không còn sử dụng cột đó.
 */

SET NOCOUNT ON;
SET XACT_ABORT ON;

BEGIN TRY
    BEGIN TRANSACTION;

    IF OBJECT_ID(N'dbo.QuestionSet', N'U') IS NULL
        THROW 50001, N'Không tìm thấy bảng dbo.QuestionSet.', 1;

    /* Thêm cột và gán DRAFT cho toàn bộ dữ liệu hiện có. */
    IF COL_LENGTH(N'dbo.QuestionSet', N'publication_status') IS NULL
    BEGIN
        ALTER TABLE dbo.QuestionSet
        ADD publication_status VARCHAR(20) NOT NULL
            CONSTRAINT DF_QuestionSet_publication_status
            DEFAULT ('DRAFT') WITH VALUES;
    END;

    /* Chỉ sửa bản ghi null/không hợp lệ nếu cột đã tồn tại từ trước. */
    UPDATE dbo.QuestionSet
    SET publication_status = 'DRAFT'
    WHERE publication_status IS NULL
       OR publication_status NOT IN ('DRAFT', 'PUBLISHED');

    /* Bảo đảm cột luôn có default DRAFT. */
    IF NOT EXISTS (
        SELECT 1
        FROM sys.default_constraints dc
        INNER JOIN sys.columns c
            ON c.object_id = dc.parent_object_id
           AND c.column_id = dc.parent_column_id
        WHERE dc.parent_object_id = OBJECT_ID(N'dbo.QuestionSet')
          AND c.name = N'publication_status'
    )
    BEGIN
        ALTER TABLE dbo.QuestionSet
        ADD CONSTRAINT DF_QuestionSet_publication_status
            DEFAULT ('DRAFT') FOR publication_status;
    END;

    /* Chỉ chấp nhận hai trạng thái mà backend hỗ trợ. */
    IF NOT EXISTS (
        SELECT 1
        FROM sys.check_constraints
        WHERE parent_object_id = OBJECT_ID(N'dbo.QuestionSet')
          AND name = N'CK_QuestionSet_publication_status'
    )
    BEGIN
        ALTER TABLE dbo.QuestionSet WITH CHECK
        ADD CONSTRAINT CK_QuestionSet_publication_status
            CHECK (publication_status IN ('DRAFT', 'PUBLISHED'));

        ALTER TABLE dbo.QuestionSet
        CHECK CONSTRAINT CK_QuestionSet_publication_status;
    END;

    /* Hỗ trợ truy vấn nhanh danh sách đề PUBLISHED cho Student. */
    IF NOT EXISTS (
        SELECT 1
        FROM sys.indexes
        WHERE object_id = OBJECT_ID(N'dbo.QuestionSet')
          AND name = N'IX_QuestionSet_publication_status'
    )
    BEGIN
        CREATE NONCLUSTERED INDEX IX_QuestionSet_publication_status
            ON dbo.QuestionSet(publication_status);
    END;

    COMMIT TRANSACTION;

    SELECT
        publication_status,
        COUNT(*) AS question_set_count
    FROM dbo.QuestionSet
    GROUP BY publication_status
    ORDER BY publication_status;
END TRY
BEGIN CATCH
    IF XACT_STATE() <> 0
        ROLLBACK TRANSACTION;

    THROW;
END CATCH;

