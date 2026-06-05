'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { getApiErrorMessage } from '@/lib/api/error-message';
import { useAuth } from '@/lib/auth/use-auth';

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

  const canSubmit = username.trim() !== '' && email.trim() !== '';

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const nextUsername = username.trim();
    const nextEmail = email.trim();

    if (!nextUsername || !nextEmail) {
      setError('Username and email are required.');
      return;
    }

    setIsSubmitting(true);

    try {
      const updatedUser = await updateUser({
        username: nextUsername,
        email: nextEmail,
        bio: bio.trim(),
        image: image.trim(),
        ...(password.trim() ? { password: password.trim() } : {}),
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
    <form className="protected-panel settings-form" onSubmit={handleSubmit}>
      <div className="settings-form-grid">
        <label className="form-field">
          <span>Username</span>
          <input
            type="text"
            autoComplete="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
          />
        </label>

        <label className="form-field">
          <span>Email</span>
          <input
            type="email"
            autoComplete="email"
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
          value={image}
          onChange={(event) => setImage(event.target.value)}
        />
      </label>

      <label className="form-field">
        <span>Bio</span>
        <textarea
          value={bio}
          onChange={(event) => setBio(event.target.value)}
        />
      </label>

      <label className="form-field">
        <span>New Password</span>
        <input
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </label>

      {error ? <p className="form-error">{error}</p> : null}
      {success ? <p className="form-success">{success}</p> : null}

      <button
        type="submit"
        className="form-submit form-submit-inline"
        disabled={!canSubmit || isSubmitting}
      >
        {isSubmitting ? 'Saving...' : 'Save Settings'}
      </button>
    </form>
  );
};
