export const validationLimits = {
  usernameMin: 3,
  usernameMax: 30,
  passwordMin: 8,
  passwordMax: 72,
  emailMax: 254,
  bioMax: 500,
  imageMax: 2048,
  articleTitleMax: 120,
  articleDescriptionMax: 300,
  articleBodyMax: 20000,
  articleTagMax: 30,
  articleTagCountMax: 20,
  commentBodyMax: 2000,
} as const;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const usernamePattern = /^[\p{L}\p{N}_-]+$/u;

export type RequiredField = {
  label: string;
  value: string;
};

export const validationMessages = {
  required: (target: string) => `${target} 입력해주세요.`,
  maxLength: (target: string, max: number) =>
    `${target} ${max}자 이하로 입력해주세요.`,
  minLength: (target: string, min: number) =>
    `${target} ${min}자 이상 입력해주세요.`,
  email: '이메일 주소 형식이 올바르지 않습니다.',
  imageUrl: '이미지 URL은 http:// 또는 https://로 시작하는 주소여야 합니다.',
  username:
    '사용자 이름은 한글, 영문, 숫자, 밑줄(_), 하이픈(-)만 사용할 수 있습니다.',
} as const;

export const validateRequiredFields = (
  fields: RequiredField[],
): string | null => {
  const missingField = fields.find((field) => field.value.trim() === '');

  return missingField ? validationMessages.required(missingField.label) : null;
};

export const validateMaxLength = (
  label: string,
  value: string,
  max: number,
): string | null => {
  return value.length > max ? validationMessages.maxLength(label, max) : null;
};

export const validateMinLength = (
  label: string,
  value: string,
  min: number,
): string | null => {
  return value.length > 0 && value.length < min
    ? validationMessages.minLength(label, min)
    : null;
};

export const validateEmail = (value: string): string | null => {
  return value !== '' && !emailPattern.test(value)
    ? validationMessages.email
    : null;
};

export const validateUsername = (value: string): string | null => {
  if (value === '') {
    return null;
  }

  return usernamePattern.test(value) ? null : validationMessages.username;
};

export const validateHttpUrl = (value: string): string | null => {
  if (value === '') {
    return null;
  }

  try {
    const url = new URL(value);

    return url.protocol === 'http:' || url.protocol === 'https:'
      ? null
      : validationMessages.imageUrl;
  } catch {
    return validationMessages.imageUrl;
  }
};

export const parseArticleTagList = (value: string): string[] => {
  return value
    .split(',')
    .map((tag) => tag.trim())
    .filter((tag, index, tags) => tag !== '' && tags.indexOf(tag) === index);
};

export const validateArticleTagList = (tags: string[]): string | null => {
  if (tags.length > validationLimits.articleTagCountMax) {
    return `태그는 최대 ${validationLimits.articleTagCountMax}개까지 입력해주세요.`;
  }

  const tooLongTag = tags.find(
    (tag) => tag.length > validationLimits.articleTagMax,
  );

  if (tooLongTag) {
    return `태그는 각각 ${validationLimits.articleTagMax}자 이하로 입력해주세요.`;
  }

  return null;
};
