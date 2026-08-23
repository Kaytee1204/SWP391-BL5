export const QUESTION_SET_SKILLS = [
  { value: '', label: 'Tất cả kỹ năng' },
  { value: 'vocabulary', label: 'Vocabulary', icon: '📖' },
  { value: 'grammar', label: 'Grammar', icon: '✍️' },
  { value: 'listening', label: 'Listening', icon: '🎧' },
  { value: 'reading', label: 'Reading', icon: '📑' }
];

export const QUESTION_SET_LEVELS = ['', 'N5', 'N4', 'N3', 'N2', 'N1'];

export const SKILL_META = {
  vocabulary: { label: 'Vocabulary', icon: '📖', color: '#0369a1', background: '#e0f2fe' },
  grammar: { label: 'Grammar', icon: '✍️', color: '#7e22ce', background: '#f3e8ff' },
  listening: { label: 'Listening', icon: '🎧', color: '#047857', background: '#d1fae5' },
  reading: { label: 'Reading', icon: '📑', color: '#b45309', background: '#fef3c7' }
};

export const QUESTION_TYPE_LABELS = {
  multiple_choice: 'Chọn một',
  multiple_select: 'Chọn nhiều',
  fill_blank: 'Điền từ'
};
