'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { getApiErrorMessage } from '@/lib/api/error-message';
import { useAuth } from '@/lib/auth/use-auth';
import {
  validateEmail,
  validateHttpUrl,
  validateMaxLength,
  validateMinLength,
  validateRequiredFields,
  validateUsername,
  validationLimits,
} from '@/lib/validation';

export const SettingsProfileForm = () => {
  const router = useRouter();
  const { user, updateUser } = useAuth();
  const [username, setUsername] = useState(user?.username ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [bio, setBio] = useState(user?.bio ?? '');
  const [image, setImage] = useState(user?.image ?? '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const nextUsername = username.trim();
    const nextEmail = email.trim().toLowerCase();
    const trimmedBio = bio.trim();
    const trimmedImage = image.trim();
    const trimmedPassword = password.trim();
    const validationMessage =
      validateRequiredFields([
        { label: '사용자 이름을', value: nextUsername },
        { label: '이메일을', value: nextEmail },
      ]) ??
      validateMinLength(
        '사용자 이름은',
        nextUsername,
        validationLimits.usernameMin,
      ) ??
      validateMaxLength(
        '사용자 이름은',
        nextUsername,
        validationLimits.usernameMax,
      ) ??
      validateUsername(nextUsername) ??
      validateEmail(nextEmail) ??
      validateMaxLength('이메일은', nextEmail, validationLimits.emailMax) ??
      validateMaxLength('소개는', trimmedBio, validationLimits.bioMax) ??
      validateHttpUrl(trimmedImage) ??
      validateMaxLength(
        '이미지 URL은',
        trimmedImage,
        validationLimits.imageMax,
      ) ??
      validateMinLength(
        '새 비밀번호는',
        trimmedPassword,
        validationLimits.passwordMin,
      ) ??
      validateMaxLength(
        '새 비밀번호는',
        trimmedPassword,
        validationLimits.passwordMax,
      );

    if (validationMessage) {
      setError(validationMessage);
      return;
    }

    setIsSubmitting(true);

    try {
      const updatedUser = await updateUser({
        username: nextUsername,
        email: nextEmail,
        bio: trimmedBio,
        image: trimmedImage,
        ...(trimmedPassword ? { password: trimmedPassword } : {}),
      });

      setPassword('');
      setSuccess('Profile updated.');
      router.replace(`/profile/${updatedUser.username}`);
      router.refresh();
    } catch (updateError) {
      setError(getApiErrorMessage(updateError));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      className="protected-panel settings-form"
      noValidate
      onSubmit={handleSubmit}
    >
      <div className="settings-form-grid">
        <label className="form-field">
          <span>Username</span>
          <input
            type="text"
            autoComplete="username"
            required
            minLength={validationLimits.usernameMin}
            maxLength={validationLimits.usernameMax}
            title="사용자 이름은 한글, 영문, 숫자, 밑줄(_), 하이픈(-)만 사용할 수 있습니다."
            value={username}
            onChange={(event) => setUsername(event.target.value)}
          />
        </label>

        <label className="form-field">
          <span>Email</span>
          <input
            type="email"
            autoComplete="email"
            required
            maxLength={validationLimits.emailMax}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
      </div>

      <label className="form-field">
        <span>Image URL</span>
        <input
          type="url"
          placeholder="https://example.com/avatar.png"
          maxLength={validationLimits.imageMax}
          value={image}
          onChange={(event) => setImage(event.target.value)}
        />
      </label>

      <label className="form-field">
        <span>Bio</span>
        <textarea
          rows={5}
          maxLength={validationLimits.bioMax}
          value={bio}
          onChange={(event) => setBio(event.target.value)}
        />
      </label>

      <label className="form-field">
        <span>New Password</span>
        <input
          type="password"
          autoComplete="new-password"
          minLength={validationLimits.passwordMin}
          maxLength={validationLimits.passwordMax}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </label>

      {error ? <p className="form-error">{error}</p> : null}
      {success ? <p className="form-success">{success}</p> : null}

      <button
        type="submit"
        className="form-submit form-submit-inline"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Saving...' : 'Save Settings'}
      </button>
    </form>
  );
};
