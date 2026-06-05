'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState, type FormEvent } from 'react';
import { AuthFormShell } from '@/components/auth-form-shell';
import { getApiErrorMessage } from '@/lib/api/error-message';
import { getLoginHref, getSafeRedirectPath } from '@/lib/auth/redirect';
import { useAuth } from '@/lib/auth/use-auth';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register, status } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const redirectTo = getSafeRedirectPath(searchParams.get('redirectTo'));
  const loginHref = getLoginHref(redirectTo);
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
    setIsSubmitting(true);

    try {
      await register({ username, email, password });
      router.push(redirectTo);
      router.refresh();
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(error, '회원가입 정보를 다시 확인해주세요.'),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthFormShell
      eyebrow="Start writing"
      title="새 계정을 만들고 RealWorld 흐름에 합류하세요."
      description="회원가입 성공 시 백엔드 세션을 그대로 인증 상태에 반영하고, 앱 전역에서 현재 유저를 즉시 사용할 수 있게 합니다."
      switchHref={loginHref}
      switchLabel="로그인"
      switchText="이미 계정이 있나요?"
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="form-field">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            required
            value={username}
            onChange={(event) => setUsername(event.target.value)}
          />
        </div>

        <div className="form-field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
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
            autoComplete="new-password"
            required
            minLength={8}
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
            ? '계정 생성 중'
            : status === 'authenticated'
              ? '이동 중'
              : '회원가입'}
        </button>
      </form>
    </AuthFormShell>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
