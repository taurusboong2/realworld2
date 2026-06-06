export const usernamePattern = '[a-zA-Z0-9_-]+';

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

export const parseArticleTagList = (value: string): string[] => {
  return value
    .split(',')
    .map((tag) => tag.trim())
    .filter((tag, index, tags) => tag !== '' && tags.indexOf(tag) === index);
};

export const validateArticleTagList = (tags: string[]): string | null => {
  if (tags.length > validationLimits.articleTagCountMax) {
    return `태그는 최대 ${validationLimits.articleTagCountMax}개까지 입력할 수 있습니다.`;
  }

  const tooLongTag = tags.find(
    (tag) => tag.length > validationLimits.articleTagMax,
  );

  if (tooLongTag) {
    return `태그는 각각 ${validationLimits.articleTagMax}자 이하로 입력해주세요.`;
  }

  return null;
};
