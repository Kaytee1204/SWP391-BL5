-- =====================================================================
-- JAPANESE LEARNING PLATFORM - DATABASE SCHEMA
-- Target engine: Microsoft SQL Server (T-SQL)
-- =====================================================================
-- Notes on scope (per project decisions):
-- 1) AI Speaking: only minimal scenario metadata + session logs are
--    stored here. Prompt design, persona config, semantic evaluation,
--    and scoring logic are handled entirely by the external AI provider
--    and are NOT modeled in this database.
-- 2) Payment: only transaction results (status, amount, provider
--    reference) are stored here. QR code generation, checksum,
--    webhook signature verification, and PayOS-side logic are NOT
--    modeled in this database - they belong to the integration layer.
--
-- Notes on T-SQL conversion from the original MySQL draft:
-- - AUTO_INCREMENT           -> IDENTITY(1,1)
-- - ENUM(...)                -> NVARCHAR(n) + CHECK (col IN (...))
-- - BOOLEAN / TRUE / FALSE   -> BIT / 1 / 0
-- - TEXT / LONGTEXT / JSON   -> NVARCHAR(MAX)
-- - VARCHAR                  -> NVARCHAR (Unicode, required for Japanese text)
-- - `updated_at` columns no longer have "ON UPDATE CURRENT_TIMESTAMP"
--   (not supported in T-SQL). The application layer must set
--   updated_at = SYSDATETIME() (or GETDATE()) on every UPDATE, or an
--   AFTER UPDATE trigger can be added per table if you prefer DB-level
--   enforcement.
-- =====================================================================


-- =====================================================================
-- 1. ACCOUNTS & AUTHENTICATION
-- =====================================================================

CREATE TABLE Account (
    account_id          BIGINT IDENTITY(1,1) PRIMARY KEY,
    email                NVARCHAR(255) NOT NULL UNIQUE,
    password_hash        NVARCHAR(255) NOT NULL,
    full_name            NVARCHAR(150) NOT NULL,
    avatar_url            NVARCHAR(500),
    role                 NVARCHAR(20) NOT NULL CHECK (role IN ('Student','Lecturer','Manager','Author')),
    jlpt_target_level     NVARCHAR(20) NULL CHECK (jlpt_target_level IN ('N5','N4','N3','N2','N1')),   -- only meaningful for Student
    status               NVARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive','deleted')),
    created_at           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at           DATETIME NULL
);

CREATE TABLE PasswordResetToken (
    token_id             BIGINT IDENTITY(1,1) PRIMARY KEY,
    account_id           BIGINT NOT NULL,
    token                NVARCHAR(255) NOT NULL UNIQUE,
    expires_at            DATETIME NOT NULL,
    used_at              DATETIME NULL,
    created_at           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (account_id) REFERENCES Account(account_id)
);


-- =====================================================================
-- 3. VOCABULARY MANAGEMENT
-- =====================================================================

CREATE TABLE VocabularyCategory (
    category_id          BIGINT IDENTITY(1,1) PRIMARY KEY,
    jlpt_level            NVARCHAR(20) NOT NULL CHECK (jlpt_level IN ('N5','N4','N3','N2','N1')),
    name                 NVARCHAR(150) NOT NULL,
    description           NVARCHAR(500),
    created_by           BIGINT NOT NULL,      -- Lecturer
    created_at           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES Account(account_id)
);

CREATE TABLE VocabularyItem (
    item_id              BIGINT IDENTITY(1,1) PRIMARY KEY,
    category_id           BIGINT NOT NULL,
    word                 NVARCHAR(100) NOT NULL,
    kanji                NVARCHAR(100),
    reading              NVARCHAR(150) NOT NULL,
    meaning              NVARCHAR(500) NOT NULL,
    audio_url             NVARCHAR(500),
    example_sentence       NVARCHAR(MAX),
    example_translation    NVARCHAR(MAX),
    is_preview            BIT NOT NULL DEFAULT 0,   -- visible to Guest preview
    created_at           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES VocabularyCategory(category_id)
);


-- =====================================================================
-- 4. KANJI MANAGEMENT
-- =====================================================================

CREATE TABLE KanjiLessonModule (
    module_id            BIGINT IDENTITY(1,1) PRIMARY KEY,
    jlpt_level            NVARCHAR(20) NOT NULL CHECK (jlpt_level IN ('N5','N4','N3','N2','N1')),
    title                NVARCHAR(150) NOT NULL,
    description           NVARCHAR(500),
    created_by           BIGINT NOT NULL,
    created_at           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES Account(account_id)
);

CREATE TABLE KanjiDetail (
    kanji_id             BIGINT IDENTITY(1,1) PRIMARY KEY,
    module_id             BIGINT NOT NULL,
    character            NVARCHAR(10) NOT NULL,
    onyomi               NVARCHAR(200),
    kunyomi              NVARCHAR(200),
    stroke_order_url       NVARCHAR(500),
    meaning              NVARCHAR(300) NOT NULL,
    compound_words         NVARCHAR(MAX),
    is_preview            BIT NOT NULL DEFAULT 0,
    created_at           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (module_id) REFERENCES KanjiLessonModule(module_id)
);


-- =====================================================================
-- 2. STUDENT PERSONAL STUDY TOOLS
-- =====================================================================

CREATE TABLE PersonalVocabularyDeck (
    deck_id              BIGINT IDENTITY(1,1) PRIMARY KEY,
    student_id           BIGINT NOT NULL,
    title                NVARCHAR(150) NOT NULL,
    description           NVARCHAR(500),
    created_at           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES Account(account_id)
);

CREATE TABLE PersonalVocabularyDeckItem (
    deck_id              BIGINT NOT NULL,
    vocabulary_item_id    BIGINT NOT NULL,
    added_at             DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (deck_id, vocabulary_item_id),
    FOREIGN KEY (deck_id) REFERENCES PersonalVocabularyDeck(deck_id) ON DELETE CASCADE,
    FOREIGN KEY (vocabulary_item_id) REFERENCES VocabularyItem(item_id)
);

CREATE TABLE PersonalKanjiDeck (
    deck_id              BIGINT IDENTITY(1,1) PRIMARY KEY,
    student_id           BIGINT NOT NULL,
    title                NVARCHAR(150) NOT NULL,
    description           NVARCHAR(500),
    created_at           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES Account(account_id)
);

CREATE TABLE PersonalKanjiDeckItem (
    deck_id              BIGINT NOT NULL,
    kanji_id             BIGINT NOT NULL,
    memorization_note     NVARCHAR(500),
    added_at             DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (deck_id, kanji_id),
    FOREIGN KEY (deck_id) REFERENCES PersonalKanjiDeck(deck_id) ON DELETE CASCADE,
    FOREIGN KEY (kanji_id) REFERENCES KanjiDetail(kanji_id)
);

CREATE TABLE StudyGoal (
    student_id           BIGINT PRIMARY KEY,
    daily_target_words    INT DEFAULT 0,
    reminder_time         TIME NULL,
    is_active            BIT NOT NULL DEFAULT 1,       -- "Delete Study Schedule" -> set FALSE / clear fields
    updated_at           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES Account(account_id)
);

CREATE TABLE LessonNote (
    note_id              BIGINT IDENTITY(1,1) PRIMARY KEY,
    student_id           BIGINT NOT NULL,
    ref_type             NVARCHAR(20) NOT NULL CHECK (ref_type IN ('vocabulary','kanji','grammar','listening','reading')),
    ref_id               BIGINT NOT NULL,      -- points to the relevant content item (polymorphic reference)
    content              NVARCHAR(MAX) NOT NULL,
    created_at           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES Account(account_id)
);

CREATE TABLE ContentErrorReport (
    report_id            BIGINT IDENTITY(1,1) PRIMARY KEY,
    student_id           BIGINT NOT NULL,
    content_type         NVARCHAR(20) NOT NULL CHECK (content_type IN ('vocabulary','kanji','grammar','listening','reading','question','mock_test')),
    content_id           BIGINT NOT NULL,      -- polymorphic reference to the reported content
    description           NVARCHAR(MAX) NOT NULL,
    status               NVARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open','approved','rejected','corrected','cancelled')),
    resolved_by           BIGINT NULL,          -- Lecturer account_id
    resolution_note       NVARCHAR(500),
    created_at           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES Account(account_id),
    FOREIGN KEY (resolved_by) REFERENCES Account(account_id)
);

CREATE TABLE NotificationConfig (
    student_id           BIGINT PRIMARY KEY,
    reminder_enabled      BIT NOT NULL DEFAULT 1,
    push_enabled          BIT NOT NULL DEFAULT 1,
    updated_at           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES Account(account_id)
);


-- =====================================================================
-- 5. FLASHCARD (SYSTEM DEFAULT DECKS)
-- =====================================================================

CREATE TABLE FlashcardDeck (
    deck_id              BIGINT IDENTITY(1,1) PRIMARY KEY,
    title                NVARCHAR(150) NOT NULL,
    description           NVARCHAR(500),
    created_by           BIGINT NOT NULL,      -- Lecturer
    created_at           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES Account(account_id)
);

CREATE TABLE FlashcardDeckItem (
    deck_id              BIGINT NOT NULL,
    item_type             NVARCHAR(20) NOT NULL CHECK (item_type IN ('vocabulary','kanji')),
    item_id              BIGINT NOT NULL,      -- polymorphic reference to VocabularyItem or KanjiDetail
    PRIMARY KEY (deck_id, item_type, item_id),
    FOREIGN KEY (deck_id) REFERENCES FlashcardDeck(deck_id) ON DELETE CASCADE
);


-- =====================================================================
-- 6. GRAMMAR MANAGEMENT
-- =====================================================================

CREATE TABLE GrammarPattern (
    pattern_id            BIGINT IDENTITY(1,1) PRIMARY KEY,
    jlpt_level            NVARCHAR(20) NOT NULL CHECK (jlpt_level IN ('N5','N4','N3','N2','N1')),
    title                NVARCHAR(200) NOT NULL,
    structure             NVARCHAR(300) NOT NULL,
    usage_note            NVARCHAR(MAX),
    created_by           BIGINT NOT NULL,
    created_at           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES Account(account_id)
);

CREATE TABLE GrammarExample (
    example_id            BIGINT IDENTITY(1,1) PRIMARY KEY,
    pattern_id             BIGINT NOT NULL,
    sentence_jp            NVARCHAR(MAX) NOT NULL,
    translation           NVARCHAR(MAX) NOT NULL,
    audio_url             NVARCHAR(500),
    created_at           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pattern_id) REFERENCES GrammarPattern(pattern_id) ON DELETE CASCADE
);


-- =====================================================================
-- 7. LISTENING MANAGEMENT
-- =====================================================================

CREATE TABLE ListeningExercise (
    exercise_id            BIGINT IDENTITY(1,1) PRIMARY KEY,
    jlpt_level            NVARCHAR(20) NOT NULL CHECK (jlpt_level IN ('N5','N4','N3','N2','N1')),
    title                NVARCHAR(200) NOT NULL,
    audio_url             NVARCHAR(500) NOT NULL,
    script                NVARCHAR(MAX),
    translation           NVARCHAR(MAX),
    is_preview            BIT NOT NULL DEFAULT 0,
    created_by           BIGINT NOT NULL,
    created_at           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES Account(account_id)
);


-- =====================================================================
-- 8. READING MANAGEMENT
-- =====================================================================

CREATE TABLE ReadingPassage (
    passage_id            BIGINT IDENTITY(1,1) PRIMARY KEY,
    jlpt_level            NVARCHAR(20) NOT NULL CHECK (jlpt_level IN ('N5','N4','N3','N2','N1')),
    title                NVARCHAR(200) NOT NULL,
    content_furigana       NVARCHAR(MAX) NOT NULL,
    translation           NVARCHAR(MAX),
    is_preview            BIT NOT NULL DEFAULT 0,
    created_by           BIGINT NOT NULL,
    created_at           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES Account(account_id)
);


-- =====================================================================
-- 9. QUESTION BANK & JLPT MOCK TEST
-- =====================================================================

CREATE TABLE QuestionBank (
    question_id            BIGINT IDENTITY(1,1) PRIMARY KEY,
    skill_type             NVARCHAR(20) NOT NULL CHECK (skill_type IN ('vocabulary','grammar','listening','reading')),
    jlpt_level            NVARCHAR(20) NOT NULL CHECK (jlpt_level IN ('N5','N4','N3','N2','N1')),
    question_text          NVARCHAR(MAX) NOT NULL,
    question_type          NVARCHAR(25) NOT NULL CHECK (question_type IN ('multiple_choice','fill_blank')),
    choices               NVARCHAR(MAX),                 -- e.g. ["A. ...","B. ...","C. ...","D. ..."]
    correct_answer         NVARCHAR(MAX) NOT NULL,         -- e.g. ["切符"] for a single answer, or ["行きます","行く"] for accepted variants (fill_blank/reading)
    explanation           NVARCHAR(MAX),
    created_by            BIGINT NOT NULL,
    created_at            DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at            DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES Account(account_id)
);
-- Note: "Answer & Explanation" CRUD operates on the correct_answer / explanation
-- fields of this same table - no separate table needed.

CREATE TABLE JLPTMockTest (
    test_id               BIGINT IDENTITY(1,1) PRIMARY KEY,
    jlpt_level            NVARCHAR(20) NOT NULL CHECK (jlpt_level IN ('N5','N4','N3','N2','N1')),
    title                NVARCHAR(200) NOT NULL,
    duration_minutes        INT NOT NULL,
    created_by            BIGINT NOT NULL,
    created_at            DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at            DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES Account(account_id)
);

CREATE TABLE MockTestQuestion (
    test_id               BIGINT NOT NULL,
    question_id            BIGINT NOT NULL,
    order_no              INT NOT NULL,
    PRIMARY KEY (test_id, question_id),
    FOREIGN KEY (test_id) REFERENCES JLPTMockTest(test_id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES QuestionBank(question_id)
);


-- =====================================================================
-- 10. TEST TAKING (STUDENT)
-- =====================================================================

CREATE TABLE TestAttempt (
    attempt_id            BIGINT IDENTITY(1,1) PRIMARY KEY,
    student_id            BIGINT NOT NULL,
    test_id               BIGINT NOT NULL,
    score                BIGINT,
    total_score            BIGINT,
    status                NVARCHAR(21) NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress','submitted')),
    review_note            NVARCHAR(1000),         -- "Add Note to Test Result"
    started_at            DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    submitted_at           DATETIME NULL,
    FOREIGN KEY (student_id) REFERENCES Account(account_id),
    FOREIGN KEY (test_id) REFERENCES JLPTMockTest(test_id)
);

CREATE TABLE TestAttemptAnswer (
    attempt_id            BIGINT NOT NULL,
    question_id            BIGINT NOT NULL,
    selected_answer         NVARCHAR(500),
    is_correct             BIT,
    PRIMARY KEY (attempt_id, question_id),
    FOREIGN KEY (attempt_id) REFERENCES TestAttempt(attempt_id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES QuestionBank(question_id)
);


-- =====================================================================
-- 11. COURSE & LEARNING PATH
-- =====================================================================

CREATE TABLE Course (
    course_id             BIGINT IDENTITY(1,1) PRIMARY KEY,
    jlpt_level            NVARCHAR(20) NOT NULL CHECK (jlpt_level IN ('N5','N4','N3','N2','N1')),
    title                NVARCHAR(200) NOT NULL,
    description           NVARCHAR(MAX),
    created_by            BIGINT NOT NULL,
    created_at            DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at            DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES Account(account_id)
);

CREATE TABLE CourseLesson (
    lesson_id             BIGINT IDENTITY(1,1) PRIMARY KEY,
    course_id             BIGINT NOT NULL,
    order_no              INT NOT NULL,
    skill_type             NVARCHAR(20) NOT NULL CHECK (skill_type IN ('vocabulary','kanji','grammar','listening','reading')),
    content_ref_id          BIGINT NOT NULL,      -- polymorphic reference based on skill_type
    is_preview             BIT NOT NULL DEFAULT 0,
    FOREIGN KEY (course_id) REFERENCES Course(course_id) ON DELETE CASCADE
);
-- IMPORTANT: content_ref_id is a polymorphic reference (points to
-- VocabularyCategory, KanjiLessonModule, GrammarPattern,
-- ListeningExercise, or ReadingPassage depending on skill_type), so it
-- cannot have a database-level FOREIGN KEY / ON DELETE CASCADE.
-- The application/service layer MUST check and clean up (or block
-- deletion of) any CourseLesson rows referencing a content item before
-- that item is deleted, to avoid orphaned references.

CREATE TABLE Enrollment (
    enrollment_id          BIGINT IDENTITY(1,1) PRIMARY KEY,
    student_id            BIGINT NOT NULL,
    course_id             BIGINT NOT NULL,
    enrolled_at            DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    progress_percent        DECIMAL(5,2) NOT NULL DEFAULT 0,
    UNIQUE (student_id, course_id),
    FOREIGN KEY (student_id) REFERENCES Account(account_id),
    FOREIGN KEY (course_id) REFERENCES Course(course_id)
);

CREATE TABLE LessonProgress (
    student_id            BIGINT NOT NULL,
    lesson_id             BIGINT NOT NULL,
    completed_at           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (student_id, lesson_id),
    FOREIGN KEY (student_id) REFERENCES Account(account_id),
    FOREIGN KEY (lesson_id) REFERENCES CourseLesson(lesson_id)
);


-- =====================================================================
-- 14. PAYMENT (RESULT DATA ONLY - PayOS QR/webhook logic is external)
-- =====================================================================

CREATE TABLE Payment (
    payment_id             BIGINT IDENTITY(1,1) PRIMARY KEY,
    student_id             BIGINT NOT NULL,
    package_type            NVARCHAR(30) NOT NULL CHECK (package_type IN ('ai_speaking_lifetime')),
    amount                DECIMAL(12,2) NOT NULL,
    currency              NVARCHAR(10) NOT NULL DEFAULT 'VND',
    payos_order_code         NVARCHAR(100) NOT NULL UNIQUE,   -- reference id returned by PayOS
    status                NVARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid','cancelled','failed')),
    created_at             DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    paid_at                DATETIME NULL,
    FOREIGN KEY (student_id) REFERENCES Account(account_id)
);
-- Note: QR code generation, checksum, and webhook signature
-- verification are handled by the PayOS integration layer.
-- This table only stores the resulting transaction status.

CREATE TABLE RefundRequest (
    refund_id              BIGINT IDENTITY(1,1) PRIMARY KEY,
    payment_id             BIGINT NOT NULL,
    student_id             BIGINT NOT NULL,
    reason                NVARCHAR(MAX),
    status                NVARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
    requested_at            DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resolved_at             DATETIME NULL,
    resolved_by             BIGINT NULL,           -- Manager account_id
    FOREIGN KEY (payment_id) REFERENCES Payment(payment_id),
    FOREIGN KEY (student_id) REFERENCES Account(account_id),
    FOREIGN KEY (resolved_by) REFERENCES Account(account_id)
);


-- =====================================================================
-- 12. AI SPEAKING (METADATA + LOG ONLY - evaluation logic is external)
-- =====================================================================

CREATE TABLE AISpeakingScenario (
    scenario_id            BIGINT IDENTITY(1,1) PRIMARY KEY,
    jlpt_level             NVARCHAR(20) NOT NULL CHECK (jlpt_level IN ('N5','N4','N3','N2','N1')),
    title                 NVARCHAR(200) NOT NULL,
    description            NVARCHAR(MAX),                  -- high-level topic/context only
    target_role             NVARCHAR(100) NULL,      -- role the student plays, e.g. "Customer buying a train ticket"
    ai_role                NVARCHAR(100) NULL,      -- role the AI plays, e.g. "Ticket counter staff"
    suggested_vocab          NVARCHAR(MAX) NULL,             -- e.g. ["切符 (kippu)", "予約 (yoyaku)"], shown to student before starting
    created_by             BIGINT NOT NULL,        -- Lecturer
    created_at             DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at             DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES Account(account_id)
);
-- Note: AI persona, prompt design, dialogue format, and scoring rules
-- are configured directly with the external AI provider and are NOT
-- stored in this table.

CREATE TABLE AISpeakingAccess (
    student_id            BIGINT PRIMARY KEY,
    payment_id             BIGINT NOT NULL,        -- references the completed payment that unlocked access
    granted_at             DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES Account(account_id),
    FOREIGN KEY (payment_id) REFERENCES Payment(payment_id)
);
-- Existence of a row = lifetime access unlocked. No expiry field.

CREATE TABLE AISpeakingSessionLog (
    session_id             BIGINT IDENTITY(1,1) PRIMARY KEY,
    student_id            BIGINT NOT NULL,
    scenario_id            BIGINT NOT NULL,
    status                NVARCHAR(21) NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress','completed','cancelled','error')),
    started_at             DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ended_at               DATETIME NULL,           -- may remain NULL if session ends abnormally; rely on `status` instead
    score                 DECIMAL(5,2) NULL,       -- final score returned by the AI provider, stored for history
    external_session_ref     NVARCHAR(255),           -- opaque reference id from the AI provider, if needed
    FOREIGN KEY (student_id) REFERENCES Account(account_id),
    FOREIGN KEY (scenario_id) REFERENCES AISpeakingScenario(scenario_id)
);
-- Note: conversation transcript, audio, and detailed AI feedback are
-- NOT stored here - only the summary needed for "View AI Speaking History".


-- =====================================================================
-- 13. CULTURE ARTICLE (AUTHOR)
-- =====================================================================

CREATE TABLE CultureArticle (
    article_id             BIGINT IDENTITY(1,1) PRIMARY KEY,
    title                 NVARCHAR(200) NOT NULL,
    content               NVARCHAR(MAX) NOT NULL,
    cover_image_url          NVARCHAR(500),
    author_id              BIGINT NOT NULL,
    status                NVARCHAR(20) NOT NULL DEFAULT 'published' CHECK (status IN ('draft','published')),
    published_at            DATETIME NULL,
    created_at             DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at             DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES Account(account_id)
);


-- =====================================================================
-- 15. INDEXES (PERFORMANCE)
-- =====================================================================
-- Account(email) and Enrollment(student_id, course_id) are already
-- covered by UNIQUE constraints above. Additional indexes for
-- frequently filtered/joined columns:

CREATE INDEX idx_vocab_category ON VocabularyItem(category_id);
CREATE INDEX idx_kanji_module ON KanjiDetail(module_id);
CREATE INDEX idx_grammar_example_pattern ON GrammarExample(pattern_id);
CREATE INDEX idx_mocktest_question ON MockTestQuestion(question_id);

CREATE INDEX idx_personal_vocab_deck_student ON PersonalVocabularyDeck(student_id);
CREATE INDEX idx_personal_kanji_deck_student ON PersonalKanjiDeck(student_id);
CREATE INDEX idx_lesson_note_student ON LessonNote(student_id);
CREATE INDEX idx_error_report_student ON ContentErrorReport(student_id);
CREATE INDEX idx_error_report_status ON ContentErrorReport(status);

CREATE INDEX idx_test_attempt_student ON TestAttempt(student_id);
CREATE INDEX idx_test_attempt_test ON TestAttempt(test_id);

CREATE INDEX idx_course_lesson_course ON CourseLesson(course_id);
CREATE INDEX idx_lesson_progress_student ON LessonProgress(student_id);

CREATE INDEX idx_speaking_session_student ON AISpeakingSessionLog(student_id);
CREATE INDEX idx_speaking_session_scenario ON AISpeakingSessionLog(scenario_id);

CREATE INDEX idx_payment_student ON Payment(student_id);
CREATE INDEX idx_payment_status ON Payment(status);
CREATE INDEX idx_refund_payment ON RefundRequest(payment_id);
CREATE INDEX idx_refund_status ON RefundRequest(status);

CREATE INDEX idx_culture_article_author ON CultureArticle(author_id);