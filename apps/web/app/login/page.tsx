'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState, type FormEvent } from 'react';
import { AuthFormShell } from '@/components/auth-form-shell';
import { getApiErrorMessage } from '@/lib/api/error-message';
import {
  getRegisterHref,
  getSafeRedirectPath,
} from '@/lib/auth/redirect';
import { useAuth } from '@/lib/auth/use-auth';
import {
  validateEmail,
  validateMaxLength,
  validateRequiredFields,
  validationLimits,
} from '@/lib/validation';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, status } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const redirectTo = getSafeRedirectPath(searchParams.get('redirectTo'));
  const isAuthReady = status !== 'loading';

  useEffect(() => {
    if (status !== 'authenticated') {
      return;
    }

    router.replace(redirectTo);
    router.refresh();
  }, [redirectTo, router, status]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    const trimmedEmail = email.trim().toLowerCase();
    const validationMessage =
      validateRequiredFields([
        { label: '이메일을', value: trimmedEmail },
        { label: '비밀번호를', value: password },
      ]) ??
      validateEmail(trimmedEmail) ??
      validateMaxLength('이메일은', trimmedEmail, validationLimits.emailMax) ??
      validateMaxLength('비밀번호는', password, validationLimits.passwordMax);

    if (validationMessage) {
      setErrorMessage(validationMessage);
      return;
    }

    setIsSubmitting(true);

    try {
      await login({ email: trimmedEmail, password });
      router.push(redirectTo);
      router.refresh();
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(error, '이메일 또는 비밀번호를 확인해주세요.'),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthFormShell
      eyebrow="Welcome back"
      title="계정으로 돌아와 글과 피드를 이어서 관리하세요."
      description="RealWorld API와 연결된 세션을 확인하고, 로그인 즉시 헤더와 이후 화면의 인증 상태를 갱신합니다."
      switchHref={getRegisterHref(redirectTo)}
      switchLabel="회원가입"
      switchText="아직 계정이 없나요?"
    >
      <form className="auth-form" noValidate onSubmit={handleSubmit}>
        <div className="form-field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={validationLimits.emailMax}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>

        <div className="form-field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            maxLength={validationLimits.passwordMax}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>

        {errorMessage ? (
          <p role="alert" className="form-error">
            {errorMessage}
          </p>
        ) : null}

        <button
          type="submit"
          className="form-submit"
          disabled={isSubmitting || !isAuthReady || status === 'authenticated'}
        >
          {isSubmitting
            ? '로그인 중'
            : status === 'authenticated'
              ? '이동 중'
              : '로그인'}
        </button>

        <Link href="/" className="auth-return-link">
          홈으로 돌아가기
        </Link>
      </form>
    </AuthFormShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
