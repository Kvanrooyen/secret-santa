import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTrash, 
  faPen, 
  faCheck, 
  faXmark, 
  faExternalLinkAlt,
  faStickyNote
} from '@fortawesome/free-solid-svg-icons';

const WishlistItem = ({ item, onUpdate, onDelete, isEditable = true }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(item);

  const handleSave = () => {
    if (!editForm.title.trim()) return;
    onUpdate(editForm);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditForm(item);
    setIsEditing(false);
  };

  const handleEdit = () => {
    setEditForm(item);
    setIsEditing(true);
  };

  if (isEditing) {
    return (
      <div className="wishlist-item editing">
        <div className="edit-form">
          <div className="form-row">
            <input
              className="form-input"
              placeholder="Item title"
              value={editForm.title}
              onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
              autoFocus
            />
          </div>
          
          <div className="form-row">
            <input
              className="form-input"
              placeholder="Link (optional)"
              type="url"
              value={editForm.link || ''}
              onChange={(e) => setEditForm({ ...editForm, link: e.target.value })}
            />
          </div>
          
          <div className="form-row">
            <textarea
              className="form-input textarea"
              placeholder="Notes (size, color, preferences...)"
              value={editForm.notes || ''}
              onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
              rows="3"
            />
          </div>
          
          <div className="item-actions">
            <button 
              className="btn btn-primary btn-sm" 
              onClick={handleSave}
              disabled={!editForm.title.trim()}
            >
              <FontAwesomeIcon icon={faCheck} />
              Save
            </button>
            <button className="btn btn-ghost btn-sm" onClick={handleCancel}>
              <FontAwesomeIcon icon={faXmark} />
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="wishlist-item">
      <div className="item-content">
        <div className="item-header">
          <h4 className="item-title">{item.title}</h4>
          {item.link && (
            <a 
              href={item.link} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="item-link"
              title="View link"
            >
              <FontAwesomeIcon icon={faExternalLinkAlt} />
              <span>Link</span>
            </a>
          )}
        </div>
        
        {item.notes && (
          <div className="item-notes">
            <FontAwesomeIcon icon={faStickyNote} className="notes-icon" />
            <span>{item.notes}</span>
          </div>
        )}
        
        {isEditable && (
          <div className="item-actions">
            <button className="icon-btn" onClick={handleEdit} title="Edit item">
              <FontAwesomeIcon icon={faPen} />
            </button>
            <button className="icon-btn danger" onClick={onDelete} title="Delete item">
              <FontAwesomeIcon icon={faTrash} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistItem;