package com.example.base.service.questionbank;

import com.example.base.dto.questionbank.request.QuestionUpsertRequest;
import com.example.base.entity.QuestionSkillType;
import com.example.base.entity.QuestionType;
import org.springframework.stereotype.Component;

import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.text.Normalizer;
import java.util.HexFormat;
import java.util.List;
import java.util.Locale;

@Component
public class QuestionDuplicateHashGenerator {
    public String generate(QuestionUpsertRequest request){
        if (request == null) {
            throw new IllegalArgumentException(
                    "Question request không được null"
            );
        }

        QuestionSkillType skillType =
                request.getSkillType();

        /*
         * Giữ nguyên cách tạo hash cũ cho Vocabulary và Grammar.
         * Nhờ vậy hash của dữ liệu cũ không bị thay đổi.
         */
        if (skillType != QuestionSkillType.reading
                && skillType != QuestionSkillType.listening) {

            return generate(
                    request.getQuestionType(),
                    request.getQuestionText(),
                    request.getCorrectAnswers()
            );
        }

        /*
         * Reading và Listening tính thêm resourceKey.
         */
        String resourceKey = buildResourceKey(request);

        return generateWithResource(
                resourceKey,
                request.getQuestionType(),
                request.getQuestionText(),
                request.getCorrectAnswers()
        );
    }


    public String generate(QuestionType questionType, String questionText, List<String> correctAnswers){
        try{
            MessageDigest digest = MessageDigest.getInstance("SHA-256"); // dùng sha-256 để tạo mã băm


            boolean isChoiceQuestion =
                    questionType == QuestionType.multiple_choice
                            || questionType == QuestionType.multiple_select; //biến cờ

            String hashQuestionType = isChoiceQuestion
         //gom 2 loại câu hỏi vào cùng 1 loại hash để chặn việc giống nội dung nhưng khác loại câu hỏi vẫn được add vào
                    ? QuestionType.multiple_choice.name()
                    : questionType == null
                    ? ""
                    : questionType.name();
            /*
             * Hai dạng câu hỏi lựa chọn dùng chung một nhóm hash để không thể
             * thêm lại cùng nội dung bằng cách đổi single choice thành multiple select.
             * Dùng tên multiple_choice để giữ nguyên hash của dữ liệu cũ.
             */
            addPart(digest, hashQuestionType); //tạo mã băm chung cho 2 loại câu hỏi đó
            addPart(digest,normalizeText(questionText)); // chuẩn hóa nội dung thành 1 dạng nhất quán và tạo băm chung cho chúng
            /*
             * Câu trắc nghiệm:
             * cùng nội dung luôn là duplicate,
             * không phụ thuộc đáp án đúng.
             */
            if (isChoiceQuestion) {
                return HexFormat.of()
                        .formatHex(digest.digest());
            } //chuyển kết quả băm thành hex
            List<String> normalizedAnswers = correctAnswers == null ? List.of():correctAnswers.stream() //kiểm tra rỗng
                    .map(this::normalizeText) //chuẩn hóa từng đáp án trong chuỗi
                    .filter(value->!value.isBlank()) //lọc các phần tử rỗng hoặc blank
                    .distinct()//loại bỏ trùng ( sau khi đã chuẩn hóa) và chỉ giữ lại 1
                    .sorted() // sắp xếp
                    .toList(); // thu thập kết quả
            addPart(digest,String.valueOf(normalizedAnswers.size())); // tạo băm cho số lượng phần tử
            for(String answer : normalizedAnswers){
                addPart(digest,answer); //tạo băm cho các đáp án ( check việc 2 đáp án trùng nhau trong 1 câu)
            }
            return HexFormat.of().formatHex(digest.digest()); //đưa về hex
        }catch (NoSuchAlgorithmException exception){
            throw new IllegalArgumentException("JVM không hỗ trợ SHA-256",
                    exception); // bắt lỗi sha-256
        }
    }
    private String normalizeText(String value){
        if(value==null){
            return "";
        }
        String unicodeNormalized = Normalizer.normalize(value,Normalizer.Form.NFKC);
        //chuẩn hóa chuỗi về 1 dạng duy nhất trông khác nhau về hình thức nhưng về mặt ngữ nghĩa/nội dung là giống nhau


        /*
         * Gộp space, tab, xuống dòng và Unicode separator
         * thành một dấu cách.
         */
        return unicodeNormalized.replaceAll("[\\p{Z}\\s]+", " ").trim().toLowerCase(Locale.ROOT);//xử lí khoảng trắng
    }

    /**
     * Ghi cả độ dài và nội dung vào MessageDigest.
     * Việc này tránh trường hợp ghép chuỗi gây ra hash không rõ ràng.
     *
     * Ví dụ:
     * ["ab", "c"] và ["a", "bc"] không được tạo cùng dữ liệu đầu vào.
     */
    private String generateWithResource(
            String resourceKey,
            QuestionType questionType,
            String questionText,
            List<String> correctAnswers
    ) {
        try {
            MessageDigest digest =
                    MessageDigest.getInstance("SHA-256");

            /*
             * Ví dụ:
             * reading:12
             * listening:8
             */
            addPart(digest, resourceKey);

            appendQuestionData(
                    digest,
                    questionType,
                    questionText,
                    correctAnswers
            );

            return HexFormat.of()
                    .formatHex(digest.digest());

        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalArgumentException(
                    "JVM không hỗ trợ SHA-256",
                    exception
            );
        }
    }

    /**
     * Tạo khóa xác định passage/audio được câu hỏi sử dụng.
     */
    private String buildResourceKey(
            QuestionUpsertRequest request
    ) {
        if (request.getSkillType()
                == QuestionSkillType.reading) {

            if (request.getReadingPassageId() == null) {
                throw new IllegalArgumentException(
                        "Câu hỏi Reading phải có readingPassageId"
                );
            }

            return "reading:"
                    + request.getReadingPassageId();
        }

        if (request.getSkillType()
                == QuestionSkillType.listening) {

            if (request.getListeningExerciseId() == null) {
                throw new IllegalArgumentException(
                        "Câu hỏi Listening phải có listeningExerciseId"
                );
            }

            return "listening:"
                    + request.getListeningExerciseId();
        }

        return "";
    }

    /**
     * Ghi loại câu hỏi, nội dung và đáp án vào digest.
     */
    private void appendQuestionData(
            MessageDigest digest,
            QuestionType questionType,
            String questionText,
            List<String> correctAnswers
    ) {
        boolean isChoiceQuestion =
                questionType == QuestionType.multiple_choice
                        || questionType
                        == QuestionType.multiple_select;

        /*
         * multiple_choice và multiple_select dùng chung nhóm hash.
         * Việc đổi loại chọn một thành chọn nhiều không giúp tạo
         * một câu hỏi trùng.
         */
        String hashQuestionType;

        if (isChoiceQuestion) {
            hashQuestionType =
                    QuestionType.multiple_choice.name();
        } else if (questionType == null) {
            hashQuestionType = "";
        } else {
            hashQuestionType = questionType.name();
        }

        addPart(digest, hashQuestionType);
        addPart(
                digest,
                normalizeText(questionText)
        );

        /*
         * Với câu hỏi lựa chọn, chỉ cần cùng resource và cùng
         * questionText là được xem là trùng.
         *
         * Không phụ thuộc vào đáp án đúng.
         */
        if (isChoiceQuestion) {
            return;
        }

        /*
         * Với fill_blank, đáp án đúng cũng tham gia vào hash.
         */
        List<String> normalizedAnswers =
                correctAnswers == null
                        ? List.of()
                        : correctAnswers.stream()
                        .map(this::normalizeText)
                        .filter(
                                answer ->
                                        !answer.isBlank()
                        )
                        .distinct()
                        .sorted()
                        .toList();

        addPart(
                digest,
                String.valueOf(
                        normalizedAnswers.size()
                )
        );

        for (String answer : normalizedAnswers) {
            addPart(digest, answer);
        }
    }
    private void addPart(MessageDigest digest,String value){
        String safeValue =
                value == null ? "" : value;

        byte[] bytes =
                safeValue.getBytes(
                        StandardCharsets.UTF_8
                );

        byte[] lengthBytes =
                ByteBuffer.allocate(Integer.BYTES)
                        .putInt(bytes.length)
                        .array();

        digest.update(lengthBytes);
        digest.update(bytes);
    }
}
