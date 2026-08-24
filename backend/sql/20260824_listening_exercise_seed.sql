/*
 * Sample data for Listening Exercise Management (SQL Server).
 *
 * Creates 10 exercises: two exercises for each JLPT level N5-N1.
 * Safe to run repeatedly: the same JLPT level and title are not inserted twice.
 *
 * Audio note:
 *   The rows use local demo URLs in the form /media/listening/sample-*.mp3.
 *   To enable playback, place matching MP3 files in backend/uploads/listening,
 *   or replace audio_url/storage names with files uploaded through the UI.
 */
SET NOCOUNT ON;
SET XACT_ABORT ON;

IF OBJECT_ID('dbo.ListeningExercise', 'U') IS NULL
    THROW 50301, 'Missing table dbo.ListeningExercise. Run 20260823_listening_exercise.sql first.', 1;

IF COL_LENGTH('dbo.ListeningExercise', 'listening_exercise_id') IS NULL
    THROW 50302, 'Missing ListeningExercise.listening_exercise_id. Run the ListeningExercise migration first.', 1;

IF COL_LENGTH('dbo.ListeningExercise', 'audio_storage_name') IS NULL
    THROW 50303, 'Missing ListeningExercise.audio_storage_name. Run the ListeningExercise migration first.', 1;

DECLARE @LecturerId BIGINT;
DECLARE @SeededAt DATETIME2 = SYSDATETIME();

SELECT TOP (1) @LecturerId = account_id
FROM dbo.Account
WHERE role = 'Lecturer'
  AND status = 'active'
  AND deleted_at IS NULL
ORDER BY account_id;

IF @LecturerId IS NULL
    THROW 50304, 'No active Lecturer account found.', 1;

DECLARE @ListeningSeed TABLE (
    jlpt_level NVARCHAR(20) NOT NULL,
    title NVARCHAR(200) NOT NULL,
    audio_url NVARCHAR(500) NOT NULL,
    audio_storage_name NVARCHAR(255) NOT NULL,
    audio_original_name NVARCHAR(255) NOT NULL,
    script_text NVARCHAR(MAX) NOT NULL,
    translation NVARCHAR(MAX) NULL,
    is_preview BIT NOT NULL
);

INSERT INTO @ListeningSeed
    (jlpt_level, title, audio_url, audio_storage_name, audio_original_name,
     script_text, translation, is_preview)
VALUES
    /* ================================================================
       N5
       ================================================================ */
    (N'N5', N'朝の予定',
     N'/media/listening/sample-n5-morning-plan.mp3',
     N'sample-n5-morning-plan.mp3', N'n5-morning-plan.mp3',
     N'女：田中さん、あした何時に学校へ行きますか。 男：八時に行きます。七時半に家を出ます。 女：そうですか。わたしも八時に行きます。',
     N'Nữ: Tanaka, ngày mai bạn đi đến trường lúc mấy giờ? Nam: Tôi đi lúc 8 giờ. Tôi rời nhà lúc 7 giờ 30. Nữ: Vậy à. Tôi cũng đi lúc 8 giờ.',
     CAST(1 AS BIT)),
    (N'N5', N'スーパーでの買い物',
     N'/media/listening/sample-n5-shopping.mp3',
     N'sample-n5-shopping.mp3', N'n5-shopping.mp3',
     N'男：りんごを三つください。 女：はい。バナナも買いますか。 男：いいえ、きょうはりんごだけです。',
     N'Nam: Cho tôi ba quả táo. Nữ: Vâng. Anh có mua chuối không? Nam: Không, hôm nay tôi chỉ mua táo.',
     CAST(1 AS BIT)),

    /* ================================================================
       N4
       ================================================================ */
    (N'N4', N'図書館の約束',
     N'/media/listening/sample-n4-library.mp3',
     N'sample-n4-library.mp3', N'n4-library.mp3',
     N'女：日曜日、図書館でいっしょに勉強しませんか。 男：いいですね。何時に会いましょうか。 女：午後一時はどうですか。 男：すみません、一時はアルバイトがあります。三時なら大丈夫です。',
     N'Nữ: Chủ nhật chúng ta cùng học ở thư viện nhé? Nam: Hay đấy. Mấy giờ gặp nhau? Nữ: 1 giờ chiều thì sao? Nam: Xin lỗi, lúc 1 giờ tôi phải làm thêm. 3 giờ thì được.',
     CAST(1 AS BIT)),
    (N'N4', N'忘れた傘',
     N'/media/listening/sample-n4-umbrella.mp3',
     N'sample-n4-umbrella.mp3', N'n4-umbrella.mp3',
     N'男：すみません。きのう、この店に傘を忘れました。 女：どんな傘ですか。 男：青くて、白い花がついています。 女：少々お待ちください。確認してきます。',
     N'Nam: Xin lỗi, hôm qua tôi để quên ô ở cửa hàng này. Nữ: Chiếc ô như thế nào? Nam: Nó màu xanh và có hoa trắng. Nữ: Xin chờ một chút, tôi sẽ kiểm tra.',
     CAST(0 AS BIT)),

    /* ================================================================
       N3
       ================================================================ */
    (N'N3', N'電車の遅れ',
     N'/media/listening/sample-n3-train-delay.mp3',
     N'sample-n3-train-delay.mp3', N'n3-train-delay.mp3',
     N'ただいま、事故のため中央線の電車が約二十分遅れています。新宿方面へお急ぎのお客様は、地下鉄をご利用ください。ご迷惑をおかけして申し訳ございません。',
     N'Hiện tại, do tai nạn nên tàu tuyến Chuo đang chậm khoảng 20 phút. Hành khách cần đi gấp về hướng Shinjuku vui lòng sử dụng tàu điện ngầm. Chúng tôi xin lỗi vì sự bất tiện.',
     CAST(1 AS BIT)),
    (N'N3', N'週末のイベント',
     N'/media/listening/sample-n3-weekend-event.mp3',
     N'sample-n3-weekend-event.mp3', N'n3-weekend-event.mp3',
     N'女：週末の国際交流イベント、申し込んだ？ 男：まだだよ。土曜日と日曜日、どちらに参加するか迷っているんだ。 女：日曜日はもう満員らしいよ。 男：じゃあ、土曜日に申し込まないとね。',
     N'Nữ: Bạn đăng ký sự kiện giao lưu quốc tế cuối tuần chưa? Nam: Chưa. Tôi đang phân vân tham gia thứ Bảy hay Chủ nhật. Nữ: Hình như Chủ nhật đã đủ người rồi. Nam: Vậy phải đăng ký thứ Bảy thôi.',
     CAST(0 AS BIT)),

    /* ================================================================
       N2
       ================================================================ */
    (N'N2', N'会議時間の変更',
     N'/media/listening/sample-n2-meeting-change.mp3',
     N'sample-n2-meeting-change.mp3', N'n2-meeting-change.mp3',
     N'部長：明日の企画会議ですが、取引先との打ち合わせが入ったため、開始を三十分遅らせます。社員：では、十時半からですね。部長：はい。会議室も三階から五階に変更になったので、参加者に知らせてください。',
     N'Trưởng phòng: Cuộc họp kế hoạch ngày mai sẽ bắt đầu muộn 30 phút vì có lịch gặp đối tác. Nhân viên: Vậy là từ 10 giờ 30 phải không? Trưởng phòng: Đúng. Phòng họp cũng đổi từ tầng 3 lên tầng 5, hãy thông báo cho người tham dự.',
     CAST(1 AS BIT)),
    (N'N2', N'健康診断のお知らせ',
     N'/media/listening/sample-n2-health-check.mp3',
     N'sample-n2-health-check.mp3', N'n2-health-check.mp3',
     N'来週月曜日から水曜日まで、社員の健康診断を実施します。受付時間は午前九時から十一時半までです。当日は朝食を取らず、社員証を持って二階の会議室へ来てください。',
     N'Từ thứ Hai đến thứ Tư tuần sau sẽ tổ chức khám sức khỏe nhân viên. Thời gian tiếp nhận từ 9 giờ đến 11 giờ 30 sáng. Hôm đó vui lòng không ăn sáng, mang theo thẻ nhân viên và đến phòng họp tầng 2.',
     CAST(0 AS BIT)),

    /* ================================================================
       N1
       ================================================================ */
    (N'N1', N'地域開発に関する意見',
     N'/media/listening/sample-n1-community-development.mp3',
     N'sample-n1-community-development.mp3', N'n1-community-development.mp3',
     N'確かに新しい商業施設ができれば、地域の雇用は増えるでしょう。しかし、交通量の増加や昔からの商店への影響も無視できません。目先の経済効果だけで判断せず、住民の生活環境を含めて長期的に検討する必要があります。',
     N'Đúng là một cơ sở thương mại mới có thể tạo thêm việc làm cho khu vực. Tuy nhiên, không thể bỏ qua việc giao thông gia tăng và ảnh hưởng đến các cửa hàng lâu đời. Không nên chỉ đánh giá lợi ích kinh tế trước mắt mà cần xem xét dài hạn, bao gồm cả môi trường sống của cư dân.',
     CAST(1 AS BIT)),
    (N'N1', N'研究発表への助言',
     N'/media/listening/sample-n1-research-presentation.mp3',
     N'sample-n1-research-presentation.mp3', N'n1-research-presentation.mp3',
     N'教授：データの分析自体は興味深いのですが、先行研究との違いが十分に示されていません。結果を増やすより、研究の独自性がどこにあるのかを冒頭で明確にしたほうが、聞き手には伝わりやすいでしょう。',
     N'Giáo sư: Bản thân phần phân tích dữ liệu rất thú vị, nhưng sự khác biệt với các nghiên cứu trước chưa được trình bày đầy đủ. Thay vì bổ sung thêm kết quả, nếu làm rõ ngay từ đầu điểm độc đáo của nghiên cứu thì người nghe sẽ dễ hiểu hơn.',
     CAST(0 AS BIT));

BEGIN TRY
    BEGIN TRANSACTION;

    INSERT INTO dbo.ListeningExercise
        (jlpt_level, title, audio_url, audio_storage_name, audio_original_name,
         script_text, translation, is_preview, created_by, created_at, updated_at)
    SELECT
        seed.jlpt_level,
        seed.title,
        seed.audio_url,
        seed.audio_storage_name,
        seed.audio_original_name,
        seed.script_text,
        seed.translation,
        seed.is_preview,
        @LecturerId,
        @SeededAt,
        @SeededAt
    FROM @ListeningSeed seed
    WHERE NOT EXISTS (
        SELECT 1
        FROM dbo.ListeningExercise existing
        WHERE existing.jlpt_level = seed.jlpt_level
          AND existing.title = seed.title
    );

    DECLARE @InsertedExercises INT = @@ROWCOUNT;

    COMMIT TRANSACTION;

    SELECT
        @InsertedExercises AS inserted_exercises,
        @LecturerId AS created_by;

    SELECT
        exercise.jlpt_level,
        COUNT(*) AS sample_exercise_count
    FROM dbo.ListeningExercise exercise
    JOIN @ListeningSeed seed
      ON seed.jlpt_level = exercise.jlpt_level
     AND seed.title = exercise.title
    GROUP BY exercise.jlpt_level
    ORDER BY exercise.jlpt_level DESC;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION;

    THROW;
END CATCH;
