import { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { UserRound, Palette, ShieldCheck } from 'lucide-react';
import './Account.scss';

function Account() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const loadAccount = async () => {
      try {
        const token = localStorage.getItem('token');

        const response = await fetch(
          'http://localhost:5000/api/users/me',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || 'Unable to load account.'
          );
        }

        setFirstName(data.firstName);
        setLastName(data.lastName);
        setEmail(data.email);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadAccount();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const token = localStorage.getItem('token');

      const response = await fetch(
        'http://localhost:5000/api/users/me',
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: email.trim().toLowerCase(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || 'Unable to update account.'
        );
      }

      setFirstName(data.user.firstName);
      setLastName(data.user.lastName);
      setEmail(data.user.email);

      const storedUser = JSON.parse(
        localStorage.getItem('user') || '{}'
      );

      localStorage.setItem(
        'user',
        JSON.stringify({
          ...storedUser,
          firstName: data.user.firstName,
          lastName: data.user.lastName,
          email: data.user.email,
        })
      );

      setSuccess('Account updated successfully.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setPasswordSaving(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        'http://localhost:5000/api/users/me/password',
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ currentPassword, newPassword }),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Unable to change password.');
      }

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordSuccess('Password changed successfully.');
    } catch (err) {
      setPasswordError(err.message);
    } finally {
      setPasswordSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="account-page">
        <p>Loading account...</p>
      </main>
    );
  }

  return (
    <main className="account-page">
      <div className="account-content">
        <header className="account-page-heading">
          <h1>Account Settings</h1>
          <p>Manage your profile, appearance, and security.</p>
        </header>

        <div className="account-grid">
          <section className="account-panel account-profile">
            <h2><UserRound size={20} aria-hidden="true" />Personal Information</h2>
            <p className="account-panel-description">
              Update your name and email address.
            </p>

            <form onSubmit={handleSubmit}>
              <div className="account-field">
                <label htmlFor="accountFirstName">First Name</label>
                <input
                  id="accountFirstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>

              <div className="account-field">
                <label htmlFor="accountLastName">Last Name</label>
                <input
                  id="accountLastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>

              <div className="account-field">
                <label htmlFor="accountEmail">Email</label>
                <input
                  id="accountEmail"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {error && (
                <p
                  className="account-message account-message-error"
                  role="alert"
                >
                  {error}
                </p>
              )}

              {success && (
                <p
                  className="account-message account-message-success"
                  role="status"
                >
                  {success}
                </p>
              )}

              <button
                className="account-button"
                type="submit"
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </section>

          <div className="account-side-panels">
            <section className="account-panel">
              <h2><Palette size={20} aria-hidden="true" />Appearance</h2>
              <p className="account-panel-description">
                Choose how Campus Nav looks on your device.
              </p>

              <div className="account-field">
                <label htmlFor="accountTheme">Theme</label>
                <select
                  id="accountTheme"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                >
                  <option value="light">Light Mode</option>
                  <option value="dark">Dark Mode</option>
                </select>
              </div>
            </section>

            <section className="account-panel">
              <h2><ShieldCheck size={20} aria-hidden="true" />Security</h2>
              <p className="account-panel-description">
                Change your account password.
              </p>

              <form onSubmit={handlePasswordChange}>
                <div className="account-field">
                  <label htmlFor="currentPassword">
                    Current Password
                  </label>
                  <input
                    id="currentPassword"
                    type="password"
                    autoComplete="current-password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="account-field">
                  <label htmlFor="newPassword">New Password</label>
                  <input
                    id="newPassword"
                    type="password"
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    minLength={8}
                    required
                  />
                </div>

                <div className="account-field">
                  <label htmlFor="confirmPassword">
                    Confirm New Password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                {passwordError && (
                  <p
                    className="account-message account-message-error"
                    role="alert"
                  >
                    {passwordError}
                  </p>
                )}

                {passwordSuccess && (
                  <p
                    className="account-message account-message-success"
                    role="status"
                  >
                    {passwordSuccess}
                  </p>
                )}

                <button
                  className="account-button"
                  type="submit"
                  disabled={passwordSaving}
                >
                  {passwordSaving
                    ? 'Changing Password...'
                    : 'Change Password'}
                </button>
              </form>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Account;
