const NAME_MAX = 150;
const DESCRIPTION_MAX = 500;

// Unicode letters/numbers keep valid Vietnamese, English, Japanese, and numeric names.
const CATEGORY_NAME_PATTERN = /^[\p{L}\p{N}]+(?:[ \u00a0]+[\p{L}\p{N}]+)*$/u;

export const validateVocabularyCategory = ({ name = '', description = '' }) => {
    const trimmedName = name.trim();
    const trimmedDescription = description.trim();

    if (!trimmedName) return 'Name is required';
    if (trimmedName.length > NAME_MAX) return `Name must not exceed ${NAME_MAX} characters`;
    if (!CATEGORY_NAME_PATTERN.test(trimmedName)) {
        return 'Name may contain only letters, numbers, and spaces';
    }
    if (trimmedDescription.length > DESCRIPTION_MAX) {
        return `Description must not exceed ${DESCRIPTION_MAX} characters`;
    }
    return '';
};

export { NAME_MAX, DESCRIPTION_MAX };