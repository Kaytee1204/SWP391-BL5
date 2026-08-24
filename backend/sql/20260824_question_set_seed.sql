/*
 * Sample data for QuestionBank, QuestionSet and QuestionSetItem (SQL Server).
 *
 * Creates:
 *   - 20 reading questions (4 questions for each JLPT level N5-N1)
 *   - 5 reading question sets (one set for each JLPT level)
 *   - question ordering inside each set
 *
 * Prerequisites:
 *   1. Run 20260824_update_from_SWP391.sql.
 *   2. Run 20260824_questionbank_resources.sql.
 *   3. Run 20260824_reading_passage_seed.sql.
 *   4. At least one active Lecturer account exists.
 *
 * Safe to run repeatedly. Existing sample questions, sets and links are reused.
 */
SET NOCOUNT ON;
SET XACT_ABORT ON;

IF OBJECT_ID('dbo.QuestionBank', 'U') IS NULL
    THROW 50101, 'Missing table dbo.QuestionBank.', 1;

IF OBJECT_ID('dbo.QuestionSet', 'U') IS NULL
    THROW 50102, 'Missing table dbo.QuestionSet.', 1;

IF OBJECT_ID('dbo.QuestionSetItem', 'U') IS NULL
    THROW 50103, 'Missing table dbo.QuestionSetItem.', 1;

IF OBJECT_ID('dbo.ReadingPassage', 'U') IS NULL
    THROW 50104, 'Missing table dbo.ReadingPassage.', 1;

IF COL_LENGTH('dbo.QuestionBank', 'reading_passage_id') IS NULL
    THROW 50105, 'Missing QuestionBank.reading_passage_id. Run 20260824_questionbank_resources.sql first.', 1;

DECLARE @LecturerId BIGINT;
DECLARE @SeededAt DATETIME2 = SYSDATETIME();

SELECT TOP (1) @LecturerId = account_id
FROM dbo.Account
WHERE role = 'Lecturer'
  AND status = 'active'
  AND deleted_at IS NULL
ORDER BY account_id;

IF @LecturerId IS NULL
    THROW 50106, 'No active Lecturer account found.', 1;

DECLARE @QuestionSeed TABLE (
    jlpt_level VARCHAR(20) NOT NULL,
    passage_title NVARCHAR(200) NOT NULL,
    question_text NVARCHAR(1000) NOT NULL,
    question_type VARCHAR(25) NOT NULL,
    choices NVARCHAR(MAX) NULL,
    correct_answer NVARCHAR(MAX) NOT NULL,
    explanation NVARCHAR(MAX) NULL
);

INSERT INTO @QuestionSeed
    (jlpt_level, passage_title, question_text, question_type, choices, correct_answer, explanation)
VALUES
    ('N5', N'わたしの一日',
     N'「わたし」は毎朝何時に起きますか。', 'multiple_choice',
     N'["六時","六時半","七時","八時"]', N'["六時半"]',
     N'本文の最初に「毎朝六時半に起きます」とあります。'),
    ('N5', N'わたしの一日',
     N'学校で何を勉強しますか。', 'multiple_choice',
     N'["英語","数学","日本語","音楽"]', N'["日本語"]',
     N'本文では学校で日本語を勉強すると述べています。'),
    ('N5', N'日曜日の公園',
     N'弟は公園で何をしましたか。', 'multiple_choice',
     N'["本を読みました","ボールで遊びました","寝ました","走りませんでした"]', N'["ボールで遊びました"]',
     N'弟はボールで遊びました。'),
    ('N5', N'日曜日の公園',
     N'「わたし」はどこで本を読みましたか。', 'multiple_choice',
     N'["家の中","学校","木の下","駅"]', N'["木の下"]',
     N'本文に「木の下で本を読みました」とあります。'),

    ('N4', N'駅での忘れ物',
     N'電車を降りたあと、何がないことに気づきましたか。', 'multiple_choice',
     N'["かばん","財布","傘","切符"]', N'["かばん"]',
     N'電車を降りたあとで、かばんがないことに気づきました。'),
    ('N4', N'駅での忘れ物',
     N'かばんが見つかるまで、どのくらいかかりましたか。', 'multiple_choice',
     N'["五分","十分","二十分","一時間"]', N'["十分"]',
     N'駅員に相談してから十分後に見つかりました。'),
    ('N4', N'新しいアルバイト',
     N'アルバイトは何時までですか。', 'multiple_choice',
     N'["午前七時","午前九時","午前十一時","午後十一時"]', N'["午前十一時"]',
     N'仕事は朝七時から十一時までです。'),
    ('N4', N'新しいアルバイト',
     N'初めに大変だったことは何ですか。', 'multiple_choice',
     N'["早く起きること","パンの名前を覚えること","店を掃除すること","お客さんと話すこと"]', N'["パンの名前を覚えること"]',
     N'初めはパンの名前を覚えるのが大変だったと書かれています。'),

    ('N3', N'自転車で通学する理由',
     N'筆者が雨の日以外に自転車で通学する主な理由は何ですか。', 'multiple_choice',
     N'["バスより安いからだけ","大学まで歩けないから","バスより早く着き、運動にもなるから","友達と一緒に帰れるから"]', N'["バスより早く着き、運動にもなるから"]',
     N'自転車は所要時間が短く、毎日の運動にもなると説明されています。'),
    ('N3', N'自転車で通学する理由',
     N'朝、自転車に乗るとき何に気をつけていますか。', 'multiple_choice',
     N'["道を間違えないこと","事故に遭わないこと","雨が降らないこと","バスの時間"]', N'["事故に遭わないこと"]',
     N'朝は道が混むため、事故に遭わないよう注意しています。'),
    ('N3', N'図書館の新しいサービス',
     N'予約した本はいつまでに届きますか。', 'multiple_choice',
     N'["当日","二日以内","一週間以内","一か月以内"]', N'["二日以内"]',
     N'インターネットで予約すると二日以内に届きます。'),
    ('N3', N'図書館の新しいサービス',
     N'サービスを無料で利用できるのは誰ですか。', 'multiple_choice',
     N'["市内の学生全員","本を十冊以上借りる人","図書館へ行くのが難しい高齢者や体の不自由な人","インターネットを使わない人"]', N'["図書館へ行くのが難しい高齢者や体の不自由な人"]',
     N'本文で無料利用の対象が明確に説明されています。'),

    ('N2', N'働き方と休み方',
     N'本文によると、短い休憩を取る利点は何ですか。', 'multiple_choice',
     N'["勤務時間が必ず短くなる","結果的に多くの仕事をこなせる","メールの数が減る","仕事を忘れられる"]', N'["結果的に多くの仕事をこなせる"]',
     N'集中力の低下を防ぎ、結果として多くの仕事を処理できると述べています。'),
    ('N2', N'働き方と休み方',
     N'筆者が望ましいと考える休憩の取り方はどれですか。', 'multiple_choice',
     N'["仕事のメールだけを確認する","次の仕事の計画を立てる","短時間でも仕事から完全に離れる","休憩せず早く帰る"]', N'["短時間でも仕事から完全に離れる"]',
     N'頭を休ませるには仕事から完全に離れて気持ちを切り替える必要があります。'),
    ('N2', N'地域の祭りを残すために',
     N'祭りの担い手が不足している原因は何ですか。', 'multiple_choice',
     N'["祭りの歴史が短いから","若者が進学や就職で町を離れたから","準備の費用が無料だから","町外の人が多すぎるから"]', N'["若者が進学や就職で町を離れたから"]',
     N'若者が町を離れ、準備に参加する人が減ったことが原因です。'),
    ('N2', N'地域の祭りを残すために',
     N'筆者が祭りを未来へつなぐ鍵だと考えていることは何ですか。', 'multiple_choice',
     N'["昔の方法を一切変えないこと","祭りの日数を減らすこと","時代に合った形で参加の機会を広げること","学校で祭りを禁止すること"]', N'["時代に合った形で参加の機会を広げること"]',
     N'伝統を守りつつ、参加方法を時代に合わせて広げることが重要だと結論づけています。'),

    ('N1', N'便利さがもたらす選択の負担',
     N'選択肢が増えることで生じる問題として、筆者が指摘しているものは何か。', 'multiple_choice',
     N'["商品がすべて高価になること","判断の負担が増し、選んだ後も未練が残ること","技術の進歩が止まること","自由が完全に失われること"]', N'["判断の負担が増し、選んだ後も未練が残ること"]',
     N'比較と決定に時間がかかり、決定後にも他の選択肢への未練が残ると論じています。'),
    ('N1', N'便利さがもたらす選択の負担',
     N'便利さを本当の豊かさに変えるために必要なものは何か。', 'multiple_choice',
     N'["可能な限り多くの商品","他人と同じ判断","自分にとって何が十分かを見極める基準","決定を避け続ける態度"]', N'["自分にとって何が十分かを見極める基準"]',
     N'文章の最終文が筆者の主張を示しています。'),
    ('N1', N'記憶と記録の関係',
     N'筆者によると、記録が過去をそのまま保存するものではないのはなぜか。', 'multiple_choice',
     N'["写真はすぐ消えるから","撮影する内容の選択が記録を形づくるから","映像には音がないから","人は写真を見ないから"]', N'["撮影する内容の選択が記録を形づくるから"]',
     N'何を撮るか、撮らないかという選択がすでに記録の内容に影響します。'),
    ('N1', N'記憶と記録の関係',
     N'写真を繰り返し見ることには、どのような可能性があるか。', 'multiple_choice',
     N'["実際の体験より写真の場面が強く記憶に残る","過去の出来事を完全に消す","撮影していない場面だけを思い出す","記憶を一切変化させない"]', N'["実際の体験より写真の場面が強く記憶に残る"]',
     N'記録は記憶を補うだけでなく、記憶そのものを作り変える可能性があります。');

DECLARE @SetSeed TABLE (
    jlpt_level VARCHAR(20) NOT NULL PRIMARY KEY,
    title NVARCHAR(200) NOT NULL,
    description NVARCHAR(1000) NOT NULL,
    duration_minutes INT NOT NULL
);

INSERT INTO @SetSeed (jlpt_level, title, description, duration_minutes)
VALUES
    ('N5', N'Bộ đọc hiểu JLPT N5 - Cơ bản', N'Bộ câu hỏi mẫu luyện đọc các chủ đề sinh hoạt hằng ngày ở trình độ N5.', 15),
    ('N4', N'Bộ đọc hiểu JLPT N4 - Sơ cấp', N'Bộ câu hỏi mẫu luyện tìm thông tin cụ thể trong bài đọc trình độ N4.', 20),
    ('N3', N'Bộ đọc hiểu JLPT N3 - Trung cấp', N'Bộ câu hỏi mẫu luyện đọc thông báo và đoạn văn giải thích ở trình độ N3.', 25),
    ('N2', N'Bộ đọc hiểu JLPT N2 - Nâng cao', N'Bộ câu hỏi mẫu luyện xác định nguyên nhân và ý chính ở trình độ N2.', 30),
    ('N1', N'Bộ đọc hiểu JLPT N1 - Chuyên sâu', N'Bộ câu hỏi mẫu luyện phân tích lập luận và quan điểm của tác giả ở trình độ N1.', 35);

DECLARE @ExpectedPassageCount INT;

SELECT @ExpectedPassageCount = COUNT(*)
FROM @QuestionSeed seed
WHERE EXISTS (
    SELECT 1
    FROM dbo.ReadingPassage passage
    WHERE passage.jlpt_level = seed.jlpt_level
      AND passage.title = seed.passage_title
);

IF @ExpectedPassageCount <> 20
    THROW 50107, 'One or more sample reading passages are missing. Run 20260824_reading_passage_seed.sql first.', 1;

BEGIN TRY
    BEGIN TRANSACTION;

    INSERT INTO dbo.QuestionBank
        (skill_type, jlpt_level, question_text, question_type, choices,
         correct_answer, explanation, duplicate_hash, created_by,
         reading_passage_id, listening_exercise_id, created_at, updated_at)
    SELECT
        'reading',
        seed.jlpt_level,
        seed.question_text,
        seed.question_type,
        seed.choices,
        seed.correct_answer,
        seed.explanation,
        CONVERT(VARCHAR(64), HASHBYTES(
            'SHA2_256',
            CONCAT(N'question-set-seed|', passage.passage_id, N'|', seed.question_text)
        ), 2),
        @LecturerId,
        passage.passage_id,
        NULL,
        @SeededAt,
        @SeededAt
    FROM @QuestionSeed seed
    JOIN dbo.ReadingPassage passage
      ON passage.jlpt_level = seed.jlpt_level
     AND passage.title = seed.passage_title
    WHERE NOT EXISTS (
        SELECT 1
        FROM dbo.QuestionBank existing
        WHERE existing.skill_type = 'reading'
          AND existing.reading_passage_id = passage.passage_id
          AND existing.question_text = seed.question_text
    );

    DECLARE @InsertedQuestions INT = @@ROWCOUNT;

    INSERT INTO dbo.QuestionSet
        (title, description, skill_type, jlpt_level, duration_minutes,
         created_by, created_at, updated_at)
    SELECT
        seed.title,
        seed.description,
        'reading',
        seed.jlpt_level,
        seed.duration_minutes,
        @LecturerId,
        @SeededAt,
        @SeededAt
    FROM @SetSeed seed
    WHERE NOT EXISTS (
        SELECT 1
        FROM dbo.QuestionSet existing
        WHERE existing.title = seed.title
    );

    DECLARE @InsertedSets INT = @@ROWCOUNT;

    ;WITH SeededQuestions AS (
        SELECT
            question_set.question_set_id,
            question.question_id,
            ROW_NUMBER() OVER (
                PARTITION BY question_set.question_set_id
                ORDER BY passage.passage_id, question.question_id
            ) AS question_order
        FROM @SetSeed set_seed
        JOIN dbo.QuestionSet question_set
          ON question_set.title = set_seed.title
        JOIN @QuestionSeed question_seed
          ON question_seed.jlpt_level = set_seed.jlpt_level
        JOIN dbo.ReadingPassage passage
          ON passage.jlpt_level = question_seed.jlpt_level
         AND passage.title = question_seed.passage_title
        JOIN dbo.QuestionBank question
          ON question.skill_type = 'reading'
         AND question.reading_passage_id = passage.passage_id
         AND question.question_text = question_seed.question_text
    )
    INSERT INTO dbo.QuestionSetItem
        (question_set_id, question_id, question_order)
    SELECT
        seeded.question_set_id,
        seeded.question_id,
        seeded.question_order
    FROM SeededQuestions seeded
    WHERE NOT EXISTS (
        SELECT 1
        FROM dbo.QuestionSetItem existing
        WHERE existing.question_set_id = seeded.question_set_id
          AND existing.question_id = seeded.question_id
    )
      AND NOT EXISTS (
        SELECT 1
        FROM dbo.QuestionSetItem existing_order
        WHERE existing_order.question_set_id = seeded.question_set_id
          AND existing_order.question_order = seeded.question_order
    );

    DECLARE @InsertedItems INT = @@ROWCOUNT;

    COMMIT TRANSACTION;

    SELECT
        @InsertedQuestions AS inserted_questions,
        @InsertedSets AS inserted_question_sets,
        @InsertedItems AS inserted_set_items,
        @LecturerId AS created_by;

    SELECT
        question_set.question_set_id,
        question_set.title,
        question_set.jlpt_level,
        question_set.duration_minutes,
        COUNT(item.question_set_item_id) AS question_count
    FROM dbo.QuestionSet question_set
    JOIN @SetSeed seed
      ON seed.title = question_set.title
    LEFT JOIN dbo.QuestionSetItem item
      ON item.question_set_id = question_set.question_set_id
    GROUP BY
        question_set.question_set_id,
        question_set.title,
        question_set.jlpt_level,
        question_set.duration_minutes
    ORDER BY question_set.jlpt_level DESC;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION;

    THROW;
END CATCH;
