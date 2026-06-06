import { ApiError } from '@/lib/api/client';
import { validationLimits } from '@/lib/validation';

type ErrorRecord = Record<string, unknown>;

const fieldLabels: Record<string, string> = {
  'article.body': '본문',
  'article.description': '요약',
  'article.tagList': '태그',
  'article.title': '제목',
  'comment.body': '댓글',
  'user.bio': '소개',
  'user.email': '이메일',
  'user.image': '이미지 URL',
  'user.password': '비밀번호',
  'user.username': '사용자 이름',
};

const requiredTargets: Record<string, string> = {
  'article.body': '본문을',
  'article.description': '요약을',
  'article.title': '제목을',
  'comment.body': '댓글 내용을',
  'user.email': '이메일을',
  'user.password': '비밀번호를',
  'user.username': '사용자 이름을',
};

const subjectTargets: Record<string, string> = {
  'article.body': '본문은',
  'article.description': '요약은',
  'article.tagList': '태그는',
  'article.title': '제목은',
  'comment.body': '댓글은',
  'user.bio': '소개는',
  'user.email': '이메일은',
  'user.image': '이미지 URL은',
  'user.password': '비밀번호는',
  'user.username': '사용자 이름은',
};

const fieldLimits: Record<string, { max?: number; min?: number }> = {
  'article.body': { max: validationLimits.articleBodyMax },
  'article.description': { max: validationLimits.articleDescriptionMax },
  'article.tagList': { max: validationLimits.articleTagMax },
  'article.title': { max: validationLimits.articleTitleMax },
  'comment.body': { max: validationLimits.commentBodyMax },
  'user.bio': { max: validationLimits.bioMax },
  'user.email': { max: validationLimits.emailMax },
  'user.image': { max: validationLimits.imageMax },
  'user.password': {
    max: validationLimits.passwordMax,
    min: validationLimits.passwordMin,
  },
  'user.username': {
    max: validationLimits.usernameMax,
    min: validationLimits.usernameMin,
  },
};

const isErrorRecord = (value: unknown): value is ErrorRecord => {
  return typeof value === 'object' && value !== null;
};

const translateValidationMessage = (message: string): string => {
  const fieldKey = Object.keys(fieldLabels).find((key) =>
    message.startsWith(`${key} `),
  );

  if (!fieldKey) {
    if (message.includes('article.tagList')) {
      return `태그는 각각 ${validationLimits.articleTagMax}자 이하로 입력해주세요.`;
    }

    if (message.includes('must be defined')) {
      return '입력한 정보를 다시 확인해주세요.';
    }

    if (message.includes('should not exist')) {
      return '입력값에 허용되지 않는 항목이 포함되어 있습니다.';
    }

    if (message === 'Unauthorized') {
      return '로그인이 필요합니다.';
    }

    return message;
  }

  const label = fieldLabels[fieldKey];
  const limits = fieldLimits[fieldKey];
  const requiredTarget = requiredTargets[fieldKey] ?? `${label}을`;
  const subjectTarget = subjectTargets[fieldKey] ?? `${label}은`;

  if (message.includes('should not be empty')) {
    return `${requiredTarget} 입력해주세요.`;
  }

  if (message.includes('must be an email')) {
    return '이메일 주소 형식이 올바르지 않습니다.';
  }

  if (message.includes('must be a URL address')) {
    return '이미지 URL은 http:// 또는 https://로 시작하는 주소여야 합니다.';
  }

  if (message.includes('must match')) {
    return '사용자 이름은 한글, 영문, 숫자, 밑줄(_), 하이픈(-)만 사용할 수 있습니다.';
  }

  if (message.includes('must be longer than or equal to')) {
    return `${subjectTarget} ${limits?.min ?? '필요한'}자 이상 입력해주세요.`;
  }

  if (message.includes('must be shorter than or equal to')) {
    return `${subjectTarget} ${limits?.max ?? '허용된'}자 이하로 입력해주세요.`;
  }

  if (message.includes('must contain no more than')) {
    return `태그는 최대 ${validationLimits.articleTagCountMax}개까지 입력해주세요.`;
  }

  if (message.includes('must be an array')) {
    return '태그 형식이 올바르지 않습니다.';
  }

  if (message.includes('must be a string')) {
    return `${label} 형식이 올바르지 않습니다.`;
  }

  return message;
};

const readMessage = (value: unknown): string | null => {
  if (typeof value === 'string') {
    return translateValidationMessage(value);
  }

  if (Array.isArray(value)) {
    const messages = value
      .map((item) => readMessage(item))
      .filter((item): item is string => item !== null);

    return messages.length > 0 ? messages.join(', ') : null;
  }

  if (isErrorRecord(value)) {
    const nestedMessages = Object.entries(value)
      .map(([key, nestedValue]) => {
        const message = readMessage(nestedValue);
        return message ? `${key} ${message}` : null;
      })
      .filter((item): item is string => item !== null);

    return nestedMessages.length > 0 ? nestedMessages.join(', ') : null;
  }

  return null;
};

export const getApiErrorMessage = (
  error: unknown,
  fallback = '요청을 처리하지 못했습니다.',
): string => {
  if (error instanceof ApiError) {
    if (isErrorRecord(error.response)) {
      const errors = readMessage(error.response.errors);
      const message = readMessage(error.response.message);
      return errors ?? message ?? error.message ?? fallback;
    }

    return error.message || fallback;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
};
