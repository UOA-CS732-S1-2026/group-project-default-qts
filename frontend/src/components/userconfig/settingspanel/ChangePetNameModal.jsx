import { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import MiniModal from './MiniModal';

export default function ChangePetNameModal({ onClose }) {
  const { currentUser, updatePetName } = useApp();
  const [newPetName, setNewPetName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!newPetName.trim()) { setError('Pet name is required.'); return; }
    const res = await updatePetName(newPetName.trim());
    if (res.success) setSuccess(true);
    else setError(res.error);
  }

  return (
    <MiniModal title="Change Pet Name" onClose={onClose}>
      {success ? (
        <div className="msg-success" style={{ marginTop: 12 }}>Pet name updated successfully!</div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
          <div className="field-group">
            <label className="field-label">Current Pet Name</label>
            <div className="gf-input" style={{ background: 'var(--accent-light)', color: 'var(--text-muted)', cursor: 'default' }}>
              {currentUser?.petName || '(not set)'}
            </div>
          </div>
          <div className="field-group">
            <label className="field-label" htmlFor="new-petname">New Pet Name</label>
            <input
              id="new-petname"
              type="text"
              className={`gf-input${error ? ' error' : ''}`}
              placeholder="Name your buddy"
              value={newPetName}
              onChange={(e) => { setNewPetName(e.target.value); setError(''); }}
            />
            {error && <span className="field-error">{error}</span>}
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <button type="button" className="gf-btn gf-btn-ghost" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
            <button type="submit" id="save-petname-btn" className="gf-btn gf-btn-primary" style={{ flex: 1 }}>Save</button>
          </div>
        </form>
      )}
    </MiniModal>
  );
}