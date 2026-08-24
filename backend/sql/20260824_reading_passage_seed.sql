/*
 * Sample data for ReadingPassage (SQL Server).
 *
 * Prerequisites:
 *   1. dbo.ReadingPassage has been created.
 *   2. At least one active Lecturer account exists.
 *
 * Safe to run repeatedly: a passage is inserted only when the same
 * JLPT level and title do not already exist.
 */
SET NOCOUNT ON;
SET XACT_ABORT ON;

IF OBJECT_ID('dbo.ReadingPassage', 'U') IS NULL
    THROW 50001, 'Missing table dbo.ReadingPassage. Run 20260824_reading_passage.sql first.', 1;

DECLARE @LecturerId BIGINT;

SELECT TOP (1) @LecturerId = account_id
FROM dbo.Account
WHERE role = 'Lecturer'
  AND status = 'active'
  AND deleted_at IS NULL
ORDER BY account_id;

IF @LecturerId IS NULL
    THROW 50002, 'No active Lecturer account found. Create a Lecturer account before seeding reading passages.', 1;

BEGIN TRANSACTION;

INSERT INTO dbo.ReadingPassage
    (jlpt_level, title, content_furigana, translation, is_preview, created_by)
SELECT
    seed.jlpt_level,
    seed.title,
    seed.content_furigana,
    seed.translation,
    seed.is_preview,
    @LecturerId
FROM (VALUES
    (
        N'N5',
        N'わたしの一日',
        N'<p>わたしは<ruby>毎朝<rt>まいあさ</rt></ruby>六時半に<ruby>起<rt>お</rt></ruby>きます。七時に<ruby>朝<rt>あさ</rt></ruby>ごはんを<ruby>食<rt>た</rt></ruby>べます。</p><p>八時に<ruby>学校<rt>がっこう</rt></ruby>へ行きます。学校で日本語を<ruby>勉強<rt>べんきょう</rt></ruby>します。午後四時に家へ<ruby>帰<rt>かえ</rt></ruby>ります。</p>',
        N'Tôi thức dậy lúc 6 giờ 30 mỗi sáng và ăn sáng lúc 7 giờ. Tôi đi học lúc 8 giờ, học tiếng Nhật ở trường và về nhà lúc 4 giờ chiều.',
        CAST(1 AS BIT)
    ),
    (
        N'N5',
        N'日曜日の公園',
        N'<p><ruby>日曜日<rt>にちようび</rt></ruby>に<ruby>家族<rt>かぞく</rt></ruby>と<ruby>公園<rt>こうえん</rt></ruby>へ行きました。天気はよかったです。</p><p><ruby>弟<rt>おとうと</rt></ruby>はボールで<ruby>遊<rt>あそ</rt></ruby>びました。わたしは木の下で本を<ruby>読<rt>よ</rt></ruby>みました。とても<ruby>楽<rt>たの</rt></ruby>しかったです。</p>',
        N'Chủ nhật tôi đi công viên cùng gia đình. Thời tiết rất đẹp. Em trai chơi bóng, còn tôi đọc sách dưới gốc cây. Đó là một ngày rất vui.',
        CAST(1 AS BIT)
    ),
    (
        N'N4',
        N'駅での忘れ物',
        N'<p>きのう、<ruby>電車<rt>でんしゃ</rt></ruby>を<ruby>降<rt>お</rt></ruby>りたあとで、かばんがないことに気づきました。すぐに<ruby>駅員<rt>えきいん</rt></ruby>さんに<ruby>相談<rt>そうだん</rt></ruby>しました。</p><p>かばんの色と中に入っている物を<ruby>説明<rt>せつめい</rt></ruby>すると、駅員さんが<ruby>忘<rt>わす</rt></ruby>れ物の<ruby>部屋<rt>へや</rt></ruby>を調べてくれました。十分後、かばんが見つかって安心しました。</p>',
        N'Hôm qua, sau khi xuống tàu tôi mới nhận ra mình không có túi. Tôi lập tức nhờ nhân viên nhà ga. Sau khi mô tả màu túi và đồ bên trong, họ kiểm tra phòng đồ thất lạc. Mười phút sau, chiếc túi được tìm thấy.',
        CAST(1 AS BIT)
    ),
    (
        N'N4',
        N'新しいアルバイト',
        N'<p>わたしは先月から<ruby>駅前<rt>えきまえ</rt></ruby>のパン屋でアルバイトをしています。仕事は朝七時から十一時までです。</p><p>初めはパンの名前を<ruby>覚<rt>おぼ</rt></ruby>えるのが大変でした。しかし、店長が<ruby>親切<rt>しんせつ</rt></ruby>に教えてくれたので、今はお客さんにおすすめのパンを<ruby>紹介<rt>しょうかい</rt></ruby>できるようになりました。</p>',
        N'Từ tháng trước tôi làm thêm ở tiệm bánh trước ga, từ 7 đến 11 giờ sáng. Ban đầu việc nhớ tên bánh rất khó, nhưng nhờ quản lý tận tình chỉ dẫn, giờ tôi đã có thể giới thiệu bánh cho khách.',
        CAST(0 AS BIT)
    ),
    (
        N'N3',
        N'自転車で通学する理由',
        N'<p>大学までバスで通うと四十分かかりますが、自転車なら二十五分ほどで<ruby>着<rt>つ</rt></ruby>きます。そのため、雨の日以外は自転車で<ruby>通学<rt>つうがく</rt></ruby>しています。</p><p>時間を<ruby>節約<rt>せつやく</rt></ruby>できるだけでなく、毎日<ruby>運動<rt>うんどう</rt></ruby>することにもなります。ただし、朝は道が<ruby>混<rt>こ</rt></ruby>むので、事故に<ruby>遭<rt>あ</rt></ruby>わないように気をつけています。</p>',
        N'Đi xe buýt đến đại học mất 40 phút, còn xe đạp chỉ khoảng 25 phút, nên trừ ngày mưa tôi đều đạp xe đi học. Cách này vừa tiết kiệm thời gian vừa giúp vận động, nhưng tôi luôn cẩn thận vì đường buổi sáng đông.',
        CAST(1 AS BIT)
    ),
    (
        N'N3',
        N'図書館の新しいサービス',
        N'<p>市立図書館では、今月から本を家まで<ruby>届<rt>とど</rt></ruby>けるサービスが始まりました。インターネットで<ruby>希望<rt>きぼう</rt></ruby>する本を予約すると、二日以内に届きます。</p><p>このサービスは、図書館へ行くことが難しい高齢者や体の不自由な人なら無料で<ruby>利用<rt>りよう</rt></ruby>できます。それ以外の人は、一回につき三百円が必要です。</p>',
        N'Thư viện thành phố bắt đầu dịch vụ giao sách tận nhà. Đặt sách qua mạng sẽ được giao trong hai ngày. Người cao tuổi hoặc người khuyết tật khó đến thư viện được dùng miễn phí; những người khác trả 300 yên mỗi lần.',
        CAST(0 AS BIT)
    ),
    (
        N'N2',
        N'働き方と休み方',
        N'<p>仕事の<ruby>効率<rt>こうりつ</rt></ruby>を上げるためには、長時間働き続けるより、<ruby>適切<rt>てきせつ</rt></ruby>に休むことが重要だと言われている。集中力は時間とともに低下するため、短い休憩を取ったほうが結果的に多くの仕事をこなせる。</p><p>ただし、休憩中も仕事のメールを確認していては、頭を十分に休ませることはできない。短時間でも仕事から完全に<ruby>離<rt>はな</rt></ruby>れ、気持ちを切り替えることが大切なのである。</p>',
        N'Để nâng cao hiệu suất, nghỉ ngơi hợp lý quan trọng hơn làm việc liên tục trong thời gian dài. Vì khả năng tập trung giảm dần, nghỉ ngắn giúp hoàn thành nhiều việc hơn. Tuy nhiên, nếu vẫn kiểm tra email công việc thì não chưa được nghỉ; cần thực sự tách khỏi công việc dù chỉ trong thời gian ngắn.',
        CAST(1 AS BIT)
    ),
    (
        N'N2',
        N'地域の祭りを残すために',
        N'<p>この町の祭りは三百年以上続いてきたが、近年は<ruby>担<rt>にな</rt></ruby>い手の不足が問題になっている。若者の多くが進学や就職で町を離れ、準備に参加する人が減ったからだ。</p><p>そこで町は、祭りの歴史を学校で教えたり、町外の人も参加できる<ruby>体験会<rt>たいけんかい</rt></ruby>を開いたりしている。伝統をそのまま守るだけでなく、時代に合った形で参加の機会を広げることが、祭りを未来へつなぐ鍵になるだろう。</p>',
        N'Lễ hội của thị trấn đã tồn tại hơn 300 năm nhưng gần đây thiếu người kế tục vì nhiều người trẻ rời quê. Chính quyền đưa lịch sử lễ hội vào trường học và tổ chức trải nghiệm cho người ngoài thị trấn. Mở rộng cơ hội tham gia theo cách phù hợp thời đại là chìa khóa duy trì truyền thống.',
        CAST(0 AS BIT)
    ),
    (
        N'N1',
        N'便利さがもたらす選択の負担',
        N'<p>技術の進歩によって、私たちは場所や時間に<ruby>縛<rt>しば</rt></ruby>られず、多様な商品やサービスを選べるようになった。選択肢が増えることは自由の拡大として歓迎される一方、何を選ぶべきか判断する負担も増している。</p><p>あらゆる可能性を比較して最善を求めようとすれば、決定までに多くの時間を費やし、選んだ後でさえ別の選択肢への未練が残る。便利さを本当の<ruby>豊<rt>ゆた</rt></ruby>かさに変えるには、選択肢の数ではなく、自分にとって何が十分なのかを見極める基準が必要なのではないだろうか。</p>',
        N'Công nghệ giúp ta lựa chọn hàng hóa và dịch vụ không bị giới hạn bởi thời gian, địa điểm. Tuy nhiên, nhiều lựa chọn cũng làm tăng gánh nặng quyết định. Nếu luôn so sánh để tìm phương án tốt nhất, ta tốn thời gian và vẫn nuối tiếc sau khi chọn. Muốn biến tiện lợi thành sự phong phú thật sự, cần tiêu chuẩn để biết điều gì là đủ với bản thân.',
        CAST(1 AS BIT)
    ),
    (
        N'N1',
        N'記憶と記録の関係',
        N'<p>写真や映像を手軽に残せるようになった結果、私たちは出来事を自分で<ruby>記憶<rt>きおく</rt></ruby>する必要がなくなったかのように感じる。しかし、記録は過去をそのまま保存するものではない。何を撮り、何を撮らなかったかという選択が、すでに記録の内容を形づくっている。</p><p>さらに、後から写真を繰り返し見ることで、実際の体験よりも写真に写った場面のほうが強く記憶に残ることもある。記録は記憶を補う一方で、記憶そのものを作り変える可能性も持っているのである。</p>',
        N'Việc dễ dàng lưu ảnh và video khiến ta tưởng không còn cần tự ghi nhớ. Nhưng bản ghi không bảo tồn nguyên vẹn quá khứ: lựa chọn chụp hay không chụp đã định hình nội dung. Xem lại ảnh nhiều lần còn có thể khiến cảnh trong ảnh lấn át trải nghiệm thật trong trí nhớ. Vì thế, bản ghi vừa bổ trợ vừa có thể tái tạo ký ức.',
        CAST(0 AS BIT)
    )
) AS seed(jlpt_level, title, content_furigana, translation, is_preview)
WHERE NOT EXISTS (
    SELECT 1
    FROM dbo.ReadingPassage existing
    WHERE existing.jlpt_level = seed.jlpt_level
      AND existing.title = seed.title
);

DECLARE @InsertedCount INT = @@ROWCOUNT;

COMMIT TRANSACTION;

SELECT
    @InsertedCount AS inserted_count,
    @LecturerId AS created_by,
    COUNT(*) AS total_sample_passages
FROM dbo.ReadingPassage
WHERE title IN (
    N'わたしの一日', N'日曜日の公園', N'駅での忘れ物', N'新しいアルバイト',
    N'自転車で通学する理由', N'図書館の新しいサービス', N'働き方と休み方',
    N'地域の祭りを残すために', N'便利さがもたらす選択の負担', N'記憶と記録の関係'
);
