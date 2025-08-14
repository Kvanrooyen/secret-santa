import React, { useEffect, useMemo, useState } from 'react';
import WishlistItem from './WishlistItem';
import { LS_KEYS } from '../constants';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faListCheck, faGift } from '@fortawesome/free-solid-svg-icons';

const loadAllWishlists = () => {
  try {
    return JSON.parse(localStorage.getItem(LS_KEYS.WISHLISTS) || '{}');
  } catch {
    return {};
  }
};

const saveAllWishlists = (wishlists) => {
  localStorage.setItem(LS_KEYS.WISHLISTS, JSON.stringify(wishlists));
};

const WishlistSection = ({ userId, isOwner = true }) => {
  const [allWishlists, setAllWishlists] = useState(loadAllWishlists());
  const items = useMemo(() => allWishlists[userId] || [], [allWishlists, userId]);

  const [newItem, setNewItem] = useState({
    title: '',
    link: '',
    notes: ''
  });

  const [isFormExpanded, setIsFormExpanded] = useState(false);

  useEffect(() => {
    saveAllWishlists(allWishlists);
  }, [allWishlists]);

  const addItem = () => {
    if (!newItem.title.trim()) return;

    const item = {
      ...newItem,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString()
    };

    setAllWishlists(prev => ({
      ...prev,
      [userId]: [item, ...(prev[userId] || [])]
    }));

    // Reset form
    setNewItem({ title: '', link: '', notes: '' });
    setIsFormExpanded(false);
  };

  const updateItem = (id, updatedData) => {
    setAllWishlists(prev => ({
      ...prev,
      [userId]: (prev[userId] || []).map(item =>
        item.id === id ? { ...item, ...updatedData } : item
      )
    }));
  };

  const deleteItem = (id) => {
    setAllWishlists(prev => ({
      ...prev,
      [userId]: (prev[userId] || []).filter(item => item.id !== id)
    }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    addItem();
  };

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-icon">
          <FontAwesomeIcon icon={faListCheck} />
        </div>
        <h3 className="card-title">
          {isOwner ? 'My Wishlist' : "Recipient's Wishlist"}
        </h3>
      </div>

      {isOwner && (
        <div className="wishlist-form">
          <div className="form-header" style={{ marginBottom: '1rem' }}>
            <h4 style={{ margin: 0, color: 'var(--text-primary)' }}>
              Add New Item
            </h4>
            <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              What would you like for Christmas?
            </p>
          </div>

          <form onSubmit={handleFormSubmit}>
            <div className="form-row">
              <input
                className="form-input"
                placeholder="Item title (e.g., 'Cozy winter sweater')"
                value={newItem.title}
                onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                required
              />
            </div>

            {(isFormExpanded || newItem.link || newItem.notes) && (
              <>
                <div className="form-row">
                  <input
                    className="form-input"
                    placeholder="Link to product (optional)"
                    type="url"
                    value={newItem.link}
                    onChange={(e) => setNewItem({ ...newItem, link: e.target.value })}
                  />
                </div>
                <div className="form-row">
                  <textarea
                    className="form-input textarea"
                    placeholder="Additional notes (size, color, specific brand, where to find it...)"
                    value={newItem.notes}
                    onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
                    rows="3"
                  />
                </div>
              </>
            )}

            <div className="form-actions" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <button 
                type="submit"
                className="btn btn-primary" 
                disabled={!newItem.title.trim()}
              >
                <FontAwesomeIcon icon={faPlus} />
                Add to Wishlist
              </button>
              
              {!isFormExpanded && !newItem.link && !newItem.notes && (
                <button 
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => setIsFormExpanded(true)}
                >
                  Add details
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      <div className="wishlist-items">
        {items.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">
              <FontAwesomeIcon icon={faGift} />
            </div>
            <p>
              {isOwner 
                ? "Your wishlist is empty. Add some items above!" 
                : "No items in their wishlist yet."
              }
            </p>
          </div>
        ) : (
          <>
            <div className="items-header" style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              marginBottom: '1rem',
              paddingBottom: '0.5rem',
              borderBottom: '1px solid var(--border)'
            }}>
              <p style={{ 
                margin: 0, 
                color: 'var(--text-muted)', 
                fontSize: '0.9rem' 
              }}>
                {items.length} item{items.length !== 1 ? 's' : ''}
              </p>
            </div>
            
            {items.map(item => (
              <WishlistItem
                key={item.id}
                item={item}
                isEditable={isOwner}
                onUpdate={(updatedData) => updateItem(item.id, updatedData)}
                onDelete={() => deleteItem(item.id)}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default WishlistSection;