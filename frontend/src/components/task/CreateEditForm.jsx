import {useState} from 'react';
import './CreateEditForm.css';

function CreateEditForm({ onClose, onSubmit, initialData = null }) {
  const isEdit = initialData !== null;

  const [title, setTitle] = useState(initialData?.title ?? '');
  const [instructions, setInstructions] = useState(initialData?.instructions ?? '');
  const [objectives, setObjectives] = useState(initialData?.objectives ?? ['']);
  const [timeLimit, setTimeLimit] = useState(initialData?.timeLimit ?? '');
  const [rewardCoins, setRewardCoins] = useState(initialData?.rewardCoins ?? '');

  const handleObjectiveChange = (index, value) => {
    const updated = [...objectives];
    updated[index] = value;
    setObjectives(updated);
  };

  const addObjective = () => {
    setObjectives([...objectives, '']);
  };

  const removeObjective = (index) => {
    setObjectives(objectives.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    const taskData = {
      id: initialData?.id ?? `task-${Date.now()}`,
      type: 'mytask',
      title,
      instructions,
      objectives: objectives.filter((obj) => obj.trim() !== ''),
      timeLimit: Number(timeLimit),
      rewardCoins: Number(rewardCoins),
      status: initialData?.status ?? 'open',
      assignee: initialData?.assignee ?? null,
      createdBy: initialData?.createdBy ?? { id: 'user-001', name: 'Me' },
      createdAt: initialData?.createdAt ?? new Date().toISOString(),
      expiredAt:
        initialData?.expiredAt ??
        new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    };
    onSubmit(taskData);
    onClose();
  };

  return (
    <div className="form-overlay" onClick={onClose}>
      <div className="form-container" onClick={(e) => e.stopPropagation()}>

        <div className="form-header">
          <h2 className="form-title">{isEdit ? 'Edit Task' : 'Create Task'}</h2>
          <button className="form-close" onClick={onClose}>✕</button>
        </div>

        <div className="form-body">

          <div className="form-field">
            <label className="form-label">Title</label>
            <input
              className="form-input"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title..."
            />
          </div>

          <div className="form-field">
            <label className="form-label">Instructions</label>
            <textarea
              className="form-input form-textarea"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="What needs to be done..."
              rows={3}
            />
          </div>

          <div className="form-field">
            <label className="form-label">Objectives</label>
            {objectives.map((obj, index) => (
              <div key={index} className="form-objective-row">
                <input
                  className="form-input"
                  type="text"
                  value={obj}
                  onChange={(e) => handleObjectiveChange(index, e.target.value)}
                  placeholder={`Objective ${index + 1}...`}
                />
                {objectives.length > 1 && (
                  <button
                    className="form-objective-remove"
                    onClick={() => removeObjective(index)}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            <button className="form-objective-add" onClick={addObjective}>
              + Add Objective
            </button>
          </div>

          <div className="form-field">
            <label className="form-label">Time Limit (hours)</label>
            <input
              className="form-input form-input--short"
              type="number"
              min="1"
              value={timeLimit}
              onChange={(e) => setTimeLimit(e.target.value)}
              placeholder="e.g. 2"
            />
          </div>

          <div className="form-field">
            <label className="form-label">
              Reward Coins
            </label>
            <input
              className="form-input form-input--short"
              type="number"
              min="1"
              value={rewardCoins}
              onChange={(e) => setRewardCoins(e.target.value)}
              placeholder="e.g. 10"
            />
            <p className="form-reward-note">
              * A bond of equal coins will be locked from your wallet when you
              create this task. Coins are returned if the task is cancelled.
            </p>
          </div>

        </div>

        <div className="form-footer">
          <button className="form-btn form-btn--submit" onClick={handleSubmit}>
            {isEdit ? 'Done' : 'Create'}
          </button>
        </div>

      </div>
    </div>
  );
}

export default CreateEditForm;
