import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPen, faCheck, faXmark, faLink } from '@fortawesome/free-solid-svg-icons';

const WishlistItem = ({ item, onUpdate, onDelete, isEditable = true }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(item);

  const save = () => {
    onUpdate(draft);
    setEditing(false);
  };

  const cancel = () => {
    setDraft(item);
    setEditing(false);
  };

  return (
    <div className="wish-item">
      {editing ? (
        <div className="wish-edit">
          <input
            className="input"
            placeholder="Title"
            value={draft.title}
            onChange={(e) => setDraft({ ...draft, title: e.target.value })}
          />
          <input
            className="input"
            placeholder="Link (optional)"
            value={draft.link || ''}
            onChange={(e) => setDraft({ ...draft, link: e.target.value })}
          />
          <textarea
            className="textarea"
            placeholder="Notes (size, colour, etc.)"
            value={draft.notes || ''}
            onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
          />
          <div className="row gap">
            <button className="btn primary" onClick={save}>
              <FontAwesomeIcon icon={faCheck} /> Save
            </button>
            <button className="btn ghost" onClick={cancel}>
              <FontAwesomeIcon icon={faXmark} /> Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="wish-view">
          <div className="wish-title">{item.title}</div>
          {item.link ? (
            <a className="wish-link" href={item.link} target="_blank" rel="noreferrer">
              <FontAwesomeIcon icon={faLink} /> View link
            </a>
          ) : null}
          {item.notes ? <div className="wish-notes">{item.notes}</div> : null}

          {isEditable && (
            <div className="wish-actions">
              <button className="icon-btn" title="Edit" onClick={() => setEditing(true)}>
                <FontAwesomeIcon icon={faPen} />
              </button>
              <button className="icon-btn danger" title="Delete" onClick={onDelete}>
                <FontAwesomeIcon icon={faTrash} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WishlistItem;

