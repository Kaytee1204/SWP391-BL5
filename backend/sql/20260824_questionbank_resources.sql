/*
 * QuestionBank resource migration
 *
 * Mục đích:
 *   - Câu hỏi Reading có thể tham chiếu ReadingPassage.
 *   - Câu hỏi Listening có thể tham chiếu ListeningExercise.
 *   - Không xóa cascade passage/audio khi xóa câu hỏi.
 *   - Cho phép dữ liệu Reading/Listening cũ tạm thời chưa có resource.
 *
 * Có thể chạy file này nhiều lần.
 */

SET XACT_ABORT ON;
SET NOCOUNT ON;

BEGIN TRY
    BEGIN TRANSACTION;

    IF OBJECT_ID('dbo.QuestionBank', 'U') IS NULL
        THROW 50001, 'Missing table dbo.QuestionBank.', 1;

    IF OBJECT_ID('dbo.ReadingPassage', 'U') IS NULL
        THROW 50002, 'Missing table dbo.ReadingPassage. Run the ReadingPassage migration first.', 1;

    IF OBJECT_ID('dbo.ListeningExercise', 'U') IS NULL
        THROW 50003, 'Missing table dbo.ListeningExercise. Run the ListeningExercise migration first.', 1;

    /* ================================================================
       1. Thêm hai khóa ngoại nullable vào QuestionBank
       ================================================================ */

    IF COL_LENGTH('dbo.QuestionBank', 'reading_passage_id') IS NULL
    BEGIN
        ALTER TABLE dbo.QuestionBank
        ADD reading_passage_id BIGINT NULL;
    END;

    IF COL_LENGTH('dbo.QuestionBank', 'listening_exercise_id') IS NULL
    BEGIN
        ALTER TABLE dbo.QuestionBank
        ADD listening_exercise_id BIGINT NULL;
    END;

    /* ================================================================
       2. Tạo foreign key

       Không dùng ON DELETE CASCADE:
       passage/audio đang được sử dụng phải được service chặn xóa.
       ================================================================ */

    IF NOT EXISTS (
        SELECT 1
        FROM sys.foreign_keys
        WHERE name = 'FK_QuestionBank_ReadingPassage'
          AND parent_object_id = OBJECT_ID('dbo.QuestionBank')
    )
    BEGIN
        ALTER TABLE dbo.QuestionBank WITH CHECK
        ADD CONSTRAINT FK_QuestionBank_ReadingPassage
            FOREIGN KEY (reading_passage_id)
            REFERENCES dbo.ReadingPassage(passage_id);

        ALTER TABLE dbo.QuestionBank
        CHECK CONSTRAINT FK_QuestionBank_ReadingPassage;
    END;

    IF NOT EXISTS (
        SELECT 1
        FROM sys.foreign_keys
        WHERE name = 'FK_QuestionBank_ListeningExercise'
          AND parent_object_id = OBJECT_ID('dbo.QuestionBank')
    )
    BEGIN
        ALTER TABLE dbo.QuestionBank WITH CHECK
        ADD CONSTRAINT FK_QuestionBank_ListeningExercise
            FOREIGN KEY (listening_exercise_id)
            REFERENCES dbo.ListeningExercise(listening_exercise_id);

        ALTER TABLE dbo.QuestionBank
        CHECK CONSTRAINT FK_QuestionBank_ListeningExercise;
    END;

    /* ================================================================
       3. Tạo index cho truy vấn câu hỏi theo passage/audio
       ================================================================ */

    IF NOT EXISTS (
        SELECT 1
        FROM sys.indexes
        WHERE name = 'IX_QuestionBank_ReadingPassage'
          AND object_id = OBJECT_ID('dbo.QuestionBank')
    )
    BEGIN
        CREATE INDEX IX_QuestionBank_ReadingPassage
            ON dbo.QuestionBank(reading_passage_id)
            WHERE reading_passage_id IS NOT NULL;
    END;

    IF NOT EXISTS (
        SELECT 1
        FROM sys.indexes
        WHERE name = 'IX_QuestionBank_ListeningExercise'
          AND object_id = OBJECT_ID('dbo.QuestionBank')
    )
    BEGIN
        CREATE INDEX IX_QuestionBank_ListeningExercise
            ON dbo.QuestionBank(listening_exercise_id)
            WHERE listening_exercise_id IS NOT NULL;
    END;

    /* ================================================================
       4. Constraint bảo vệ loại liên kết

       Constraint này vẫn cho phép Reading/Listening cũ có cả hai ID NULL.
       Câu hỏi mới được backend bắt buộc chọn resource.

       Quy tắc:
         reading    -> không được có listening_exercise_id
         listening  -> không được có reading_passage_id
         vocabulary/grammar -> cả hai ID phải NULL
       ================================================================ */

    IF NOT EXISTS (
        SELECT 1
        FROM sys.check_constraints
        WHERE name = 'CK_QuestionBank_ResourceLink'
          AND parent_object_id = OBJECT_ID('dbo.QuestionBank')
    )
    BEGIN
        ALTER TABLE dbo.QuestionBank WITH CHECK
        ADD CONSTRAINT CK_QuestionBank_ResourceLink
        CHECK (
            (skill_type = 'reading'
                AND listening_exercise_id IS NULL)
            OR
            (skill_type = 'listening'
                AND reading_passage_id IS NULL)
            OR
            (skill_type IN ('vocabulary', 'grammar')
                AND reading_passage_id IS NULL
                AND listening_exercise_id IS NULL)
        );

        ALTER TABLE dbo.QuestionBank
        CHECK CONSTRAINT CK_QuestionBank_ResourceLink;
    END;

    COMMIT TRANSACTION;

    PRINT 'QuestionBank Reading/Listening resource migration completed successfully.';
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION;

    THROW;
END CATCH;

/* ====================================================================
   Kiểm tra kết quả sau migration
   ==================================================================== */

SELECT
    q.question_id,
    q.skill_type,
    q.jlpt_level,
    q.reading_passage_id,
    rp.title AS reading_passage_title,
    q.listening_exercise_id,
    le.title AS listening_exercise_title
FROM dbo.QuestionBank q
LEFT JOIN dbo.ReadingPassage rp
    ON rp.passage_id = q.reading_passage_id
LEFT JOIN dbo.ListeningExercise le
    ON le.listening_exercise_id = q.listening_exercise_id
ORDER BY q.question_id;

/*
 * Sau khi đã gắn resource cho toàn bộ câu Reading/Listening cũ,
 * có thể thay CK_QuestionBank_ResourceLink bằng constraint nghiêm ngặt:
 *
 * CHECK (
 *     (skill_type = 'reading'
 *         AND reading_passage_id IS NOT NULL
 *         AND listening_exercise_id IS NULL)
 *     OR
 *     (skill_type = 'listening'
 *         AND reading_passage_id IS NULL
 *         AND listening_exercise_id IS NOT NULL)
 *     OR
 *     (skill_type IN ('vocabulary', 'grammar')
 *         AND reading_passage_id IS NULL
 *         AND listening_exercise_id IS NULL)
 * )
 */
