import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { AnimatePresence, motion } from 'framer-motion';
import { useApp, isValidPassword } from '../../context/AppContext';

// ============================================================
//   Step 1: Verify username or email
//   Step 2: Answer security question + reset password
// ============================================================

export default function ForgotPasswordModal({ onClose }) {
  const { findUserForReset, resetPassword } = useApp();
  const [step, setStep] = useState(1);
  const [foundUser, setFoundUser] = useState(null);
  const [success, setSuccess] = useState(false);

  const {
    register: register1,
    handleSubmit: handleSubmit1,
    setError: setError1,
    clearErrors: clearErrors1,
    formState: { errors: errors1 }
  } = useForm();

  const {
    register: register2,
    handleSubmit: handleSubmit2,
    setError: setError2,
    clearErrors: clearErrors2,
    formState: { errors: errors2 },
    watch
  } = useForm();

  const newPassword = watch('newPassword');
  const confirmPassword = watch('confirmPassword');

  const onStep1 = async ({ identifier }) => {
    clearErrors1();
    if (!identifier.trim()) {
      setError1('identifier', { type: 'manual', message: 'Please enter your username or email.' });
      return;
    }
    const result = await findUserForReset(identifier.trim());
    if (!result.success) {
      setError1('identifier', { type: 'manual', message: result.error });
      return;
    }
    setFoundUser(result.user);
    setStep(2);
  };

  const onStep2 = async (data) => {
    clearErrors2();
    if (!data.email.trim()) {
      setError2('email', { type: 'manual', message: 'Email is required.' });
      return;
    }
    if (!data.securityAnswer.trim()) {
      setError2('securityAnswer', { type: 'manual', message: 'Answer is required.' });
      return;
    }
    if (!data.newPassword) {
      setError2('newPassword', { type: 'manual', message: 'New password is required.' });
      return;
    }
    if (!isValidPassword(data.newPassword)) {
      setError2('newPassword', { type: 'manual', message: 'At least 8 chars, 1 uppercase, 1 lowercase, 1 number.' });
      return;
    }
    if (!data.confirmPassword) {
      setError2('confirmPassword', { type: 'manual', message: 'Please confirm your new password.' });
      return;
    }
    if (data.newPassword !== data.confirmPassword) {
      setError2('confirmPassword', { type: 'manual', message: 'Passwords do not match.' });
      return;
    }

    const result = await resetPassword(foundUser.id, data.email, data.securityAnswer, data.newPassword);
    if (result.success) {
      setSuccess(true);
    } else {
      if (result.error) setError2('general', { type: 'manual', message: result.error });
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          className="modal-box"
          key={step}
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          style={{ maxWidth: 440 }}
        >
          <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>

          {step === 1 && (
            <>
              <h2 className="modal-title">Forgot Password</h2>
              <p style={{ fontFamily: 'var(--font-code)', fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', marginBottom: 20 }}>
                Please enter your username or email.
              </p>
              <form onSubmit={handleSubmit1(onStep1)} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="field-group">
                  <label className="field-label" htmlFor="fp-identifier">Username or Email</label>
                  <input
                    id="fp-identifier"
                    type="text"
                    className={`gf-input${errors1.identifier ? ' error' : ''}`}
                    placeholder="Enter username or email"
                    {...register1('identifier', { required: 'Please enter your username or email.' })}
                    onFocus={() => clearErrors1('identifier')}
                  />
                  {errors1.identifier && <span className="field-error">{errors1.identifier.message}</span>}
                </div>
                <button type="submit" id="fp-next-btn" className="gf-btn gf-btn-primary" style={{ width: '100%', marginTop: 4, letterSpacing: 1.5 }}>
                  Next →
                </button>
              </form>
            </>
          )}

          {step === 2 && !success && (
            <>
              <h2 className="modal-title">Reset Password</h2>
              <p style={{ fontFamily: 'var(--font-code)', fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', marginBottom: 20 }}>
                Answer your security question to reset your password.
              </p>
              <form onSubmit={handleSubmit2(onStep2)} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="field-group">
                  <label className="field-label" htmlFor="fp-email">Your Email</label>
                  <input
                    id="fp-email"
                    type="email"
                    className={`gf-input${errors2.email ? ' error' : ''}`}
                    placeholder="Confirm your email"
                    {...register2('email', { required: 'Email is required.' })}
                    onFocus={() => clearErrors2('email')}
                  />
                  {errors2.email && <span className="field-error">{errors2.email.message}</span>}
                </div>

                <div className="field-group">
                  <label className="field-label">Security Question</label>
                  <div className="gf-input" style={{ background: 'var(--accent-light)', cursor: 'default', color: 'var(--text-muted)', fontSize: 13 }}>
                    {foundUser?.securityQuestion}
                  </div>
                </div>

                <div className="field-group">
                  <label className="field-label" htmlFor="fp-answer">Your Answer</label>
                  <input
                    id="fp-answer"
                    type="text"
                    className={`gf-input${errors2.securityAnswer ? ' error' : ''}`}
                    placeholder="Type your answer"
                    {...register2('securityAnswer', { required: 'Answer is required.' })}
                    onFocus={() => clearErrors2('securityAnswer')}
                  />
                  {errors2.securityAnswer && <span className="field-error">{errors2.securityAnswer.message}</span>}
                </div>

                <div className="field-group">
                  <label className="field-label" htmlFor="fp-newpw">New Password</label>
                  <input
                    id="fp-newpw"
                    type="password"
                    className={`gf-input${errors2.newPassword ? ' error' : ''}`}
                    placeholder="Create new password"
                    {...register2('newPassword', { required: 'New password is required.' })}
                    onFocus={() => clearErrors2('newPassword')}
                  />
                  <span className="field-hint">At least 8 chars, 1 uppercase, 1 lowercase, 1 number.</span>
                  {errors2.newPassword && <span className="field-error">{errors2.newPassword.message}</span>}
                </div>

                <div className="field-group">
                  <label className="field-label" htmlFor="fp-confirmpw">Confirm New Password</label>
                  <input
                    id="fp-confirmpw"
                    type="password"
                    className={`gf-input${errors2.confirmPassword ? ' error' : ''}`}
                    placeholder="Re-enter new password"
                    {...register2('confirmPassword', { required: 'Please confirm your new password.' })}
                    onFocus={() => clearErrors2('confirmPassword')}
                  />
                  {errors2.confirmPassword && <span className="field-error">{errors2.confirmPassword.message}</span>}
                </div>

                {errors2.general && <div className="msg-error">{errors2.general.message}</div>}

                <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                  <button type="button" className="gf-btn gf-btn-ghost" style={{ flex: 1 }} onClick={() => setStep(1)}>
                    ← Back
                  </button>
                  <button type="submit" id="fp-reset-btn" className="gf-btn gf-btn-primary" style={{ flex: 2, letterSpacing: 1 }}>
                    Reset Password
                  </button>
                </div>
              </form>
            </>
          )}

          {step === 2 && success && (
            <div className="msg-success" style={{ textAlign: 'center', padding: '24px 16px', marginTop: 16 }}>
              ✅ Password changed successfully!<br />
              Please log in with your new password.
              <br />
              <button className="gf-btn gf-btn-ghost" style={{ marginTop: 16 }} onClick={onClose}>
                Back to Login
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}