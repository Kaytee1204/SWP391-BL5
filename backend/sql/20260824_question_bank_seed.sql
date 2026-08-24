/*
 * Sample data for the Question Bank page (SQL Server).
 *
 * Creates 20 standalone questions:
 *   - 10 vocabulary questions
 *   - 10 grammar questions
 *   - 4 questions for each JLPT level from N5 to N1
 *
 * This seed does not add questions to a QuestionSet and does not require
 * ReadingPassage or ListeningExercise data.
 *
 * Safe to run repeatedly: existing questions with the same skill, level and
 * question text are reused instead of being inserted again.
 */
SET NOCOUNT ON;
SET XACT_ABORT ON;

IF OBJECT_ID('dbo.QuestionBank', 'U') IS NULL
    THROW 50201, 'Missing table dbo.QuestionBank.', 1;

IF COL_LENGTH('dbo.QuestionBank', 'duplicate_hash') IS NULL
    THROW 50202, 'Missing QuestionBank.duplicate_hash. Run the QuestionBank migration first.', 1;

DECLARE @LecturerId BIGINT;
DECLARE @SeededAt DATETIME2 = SYSDATETIME();

SELECT TOP (1) @LecturerId = account_id
FROM dbo.Account
WHERE role = 'Lecturer'
  AND status = 'active'
  AND deleted_at IS NULL
ORDER BY account_id;

IF @LecturerId IS NULL
    THROW 50203, 'No active Lecturer account found.', 1;

DECLARE @QuestionSeed TABLE (
    skill_type VARCHAR(20) NOT NULL,
    jlpt_level VARCHAR(20) NOT NULL,
    question_text NVARCHAR(1000) NOT NULL,
    question_type VARCHAR(25) NOT NULL,
    choices NVARCHAR(MAX) NULL,
    correct_answer NVARCHAR(MAX) NOT NULL,
    explanation NVARCHAR(MAX) NULL
);

INSERT INTO @QuestionSeed
    (skill_type, jlpt_level, question_text, question_type,
     choices, correct_answer, explanation)
VALUES
    /* ================================================================
       N5
       ================================================================ */
    ('vocabulary', 'N5',
     N'「水」の読み方はどれですか。', 'multiple_choice',
     N'["みず","みち","みせ","みみ"]', N'["みず"]',
     N'「水」は「みず」と読み、nghĩa là nước.'),
    ('vocabulary', 'N5',
     N'「大きい」の反対の意味を持つ言葉はどれですか。', 'multiple_choice',
     N'["長い","小さい","新しい","高い"]', N'["小さい"]',
     N'「大きい」の反対は「小さい」です。'),
    ('grammar', 'N5',
     N'わたしは毎朝パン（　）食べます。', 'multiple_choice',
     N'["が","を","に","で"]', N'["を"]',
     N'「食べます」の対象を示すため、助詞「を」を使います。'),
    ('grammar', 'N5',
     N'きのう、学校へ（　）。', 'fill_blank',
     NULL, N'["行きました"]',
     N'「きのう」は過去を表すため、「行きました」が正解です。'),

    /* ================================================================
       N4
       ================================================================ */
    ('vocabulary', 'N4',
     N'「予約」の意味として最も近いものはどれですか。', 'multiple_choice',
     N'["予定を前もって申し込むこと","約束を断ること","料金を計算すること","場所を掃除すること"]', N'["予定を前もって申し込むこと"]',
     N'「予約」は、席やサービスなどを前もって確保することです。'),
    ('vocabulary', 'N4',
     N'電車に傘を忘れたので、駅の（　）に聞きました。', 'multiple_choice',
     N'["店員","駅員","会社員","銀行員"]', N'["駅員"]',
     N'駅で働いている人は「駅員」です。'),
    ('grammar', 'N4',
     N'日本へ行く（　）、日本語を勉強しています。', 'multiple_choice',
     N'["ために","ながら","そうに","までに"]', N'["ために"]',
     N'目的を表す「ために」を使います。'),
    ('grammar', 'N4',
     N'この漢字の読み方を教えて（　）ませんか。', 'fill_blank',
     NULL, N'["くれ"]',
     N'「～てくれませんか」は、相手に丁寧に依頼する表現です。'),

    /* ================================================================
       N3
       ================================================================ */
    ('vocabulary', 'N3',
     N'「節約」の使い方として最も適切な文はどれですか。', 'multiple_choice',
     N'["水を節約するため、シャワーを短くした。","風邪を節約して学校を休んだ。","駅まで節約して歩いた。","友達と節約を話した。"]', N'["水を節約するため、シャワーを短くした。"]',
     N'「節約する」は、お金・時間・資源などを無駄にしないという意味です。'),
    ('vocabulary', 'N3',
     N'「混雑」の意味として最も近いものはどれですか。', 'multiple_choice',
     N'["人や物が多くて込み合うこと","道が広くて静かなこと","予定が急に変わること","物が完全になくなること"]', N'["人や物が多くて込み合うこと"]',
     N'「混雑」は、人や車などが多く、込み合っている状態です。'),
    ('grammar', 'N3',
     N'毎日練習したので、日本語で話せる（　）なりました。', 'multiple_choice',
     N'["ことに","ように","ために","そうに"]', N'["ように"]',
     N'能力や状態の変化には「～ようになる」を使います。'),
    ('grammar', 'N3',
     N'雨が降っている（　）、試合は予定どおり行われた。', 'fill_blank',
     NULL, N'["のに"]',
     N'予想と異なる結果を表す逆接には「のに」を使います。'),

    /* ================================================================
       N2
       ================================================================ */
    ('vocabulary', 'N2',
     N'「担い手」の意味として最も適切なものはどれですか。', 'multiple_choice',
     N'["責任を持って仕事や役割を引き受ける人","荷物を預ける場所","計画に反対する人","昔の道具を修理する人"]', N'["責任を持って仕事や役割を引き受ける人"]',
     N'「担い手」は、ある活動や役割を中心となって支える人を指します。'),
    ('vocabulary', 'N2',
     N'新しい制度の目的を住民に（　）する必要がある。', 'multiple_choice',
     N'["徹底","納得","短縮","上達"]', N'["徹底"]',
     N'「周知徹底する」のように、内容を隅々まで知らせる意味で「徹底」を使います。'),
    ('grammar', 'N2',
     N'この仕事は経験がある人でない（　）、任せることはできない。', 'multiple_choice',
     N'["かぎり","ことには","ものなら","ばかりか"]', N'["ことには"]',
     N'「～ないことには」は、前の条件が満たされなければ後件が成立しないことを表します。'),
    ('grammar', 'N2',
     N'彼は忙しいと言い（　）、毎週旅行に出かけている。', 'fill_blank',
     NULL, N'["ながらも"]',
     N'「～ながらも」は、前件から予想される結果と異なる事実を示します。'),

    /* ================================================================
       N1
       ================================================================ */
    ('vocabulary', 'N1',
     N'「見極める」の意味として最も近いものはどれですか。', 'multiple_choice',
     N'["十分に確認して本質や結果を判断する","見たものをすぐに忘れる","他人の意見をそのまま受け入れる","問題を意図的に避ける"]', N'["十分に確認して本質や結果を判断する"]',
     N'「見極める」は、よく観察・検討して正しく判断することです。'),
    ('vocabulary', 'N1',
     N'「彼の説明は要点を得ていて、実に（　）だった」に入る最も適切な言葉はどれですか。', 'multiple_choice',
     N'["簡潔","安易","露骨","希薄"]', N'["簡潔"]',
     N'要点がまとまり無駄がない説明には「簡潔」が適切です。'),
    ('grammar', 'N1',
     N'十分な調査なしに結論を出すのは、危険（　）。', 'multiple_choice',
     N'["にたえない","でなくてなんだろう","を禁じ得ない","極まりない"]', N'["極まりない"]',
     N'「～極まりない」は、程度がこの上なく高いことを表します。'),
    ('grammar', 'N1',
     N'周囲の反対（　）、彼女は新しい事業を始めた。', 'fill_blank',
     NULL, N'["をものともせず"]',
     N'「～をものともせず」は、困難や反対を問題にせず行動することを表します。');

BEGIN TRY
    BEGIN TRANSACTION;

    INSERT INTO dbo.QuestionBank
        (skill_type, jlpt_level, question_text, question_type, choices,
         correct_answer, explanation, duplicate_hash, created_by,
         reading_passage_id, listening_exercise_id, created_at, updated_at)
    SELECT
        seed.skill_type,
        seed.jlpt_level,
        seed.question_text,
        seed.question_type,
        seed.choices,
        seed.correct_answer,
        seed.explanation,
        CONVERT(VARCHAR(64), HASHBYTES(
            'SHA2_256',
            CONCAT(
                N'question-bank-seed|', seed.skill_type, N'|',
                seed.jlpt_level, N'|', seed.question_text
            )
        ), 2),
        @LecturerId,
        NULL,
        NULL,
        @SeededAt,
        @SeededAt
    FROM @QuestionSeed seed
    WHERE NOT EXISTS (
        SELECT 1
        FROM dbo.QuestionBank existing
        WHERE existing.skill_type = seed.skill_type
          AND existing.jlpt_level = seed.jlpt_level
          AND existing.question_text = seed.question_text
    );

    DECLARE @InsertedQuestions INT = @@ROWCOUNT;

    COMMIT TRANSACTION;

    SELECT
        @InsertedQuestions AS inserted_questions,
        @LecturerId AS created_by;

    SELECT
        question.skill_type,
        question.jlpt_level,
        COUNT(*) AS sample_question_count
    FROM dbo.QuestionBank question
    JOIN @QuestionSeed seed
      ON seed.skill_type = question.skill_type
     AND seed.jlpt_level = question.jlpt_level
     AND seed.question_text = question.question_text
    GROUP BY question.skill_type, question.jlpt_level
    ORDER BY question.jlpt_level DESC, question.skill_type;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION;

    THROW;
END CATCH;
