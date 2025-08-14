import React, { useEffect, useMemo, useState } from 'react';
import WishlistItem from './WishlistItem';
import { LS_KEYS } from '../constants';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faListCheck } from '@fortawesome/free-solid-svg-icons';

const loadAllWishlists = () => {
  try {
    return JSON.parse(localStorage.getItem(LS_KEYS.WISHLISTS) || '{}');
  } catch {
    return {};
  }
};

const saveAllWishlists = (obj) => {
  localStorage.setItem(LS_KEYS.WISHLISTS, JSON.stringify(obj));
};

const WishlistSection = ({ userId, isOwner = true }) => {
  const [all, setAll] = useState(loadAllWishlists());
  const items = useMemo(() => all[userId] || [], [all, userId]);

  const [newItem, setNewItem] = useState({ title: '', link: '', notes: '' });

  useEffect(() => {
    saveAllWishlists(all);
  }, [all]);

  const addItem = () => {
    if (!newItem.title.trim()) return;
    const item = { ...newItem, id: crypto.randomUUID() };
    setAll((prev) => ({ ...prev, [userId]: [item, ...(prev[userId] || [])] }));
    setNewItem({ title: '', link: '', notes: '' });
  };

  const updateItem = (id, next) => {
    setAll((prev) => ({
      ...prev,
      [userId]: (prev[userId] || []).map((it) => (it.id === id ? next : it)),
    }));
  };

  const deleteItem = (id) => {
    setAll((prev) => ({
      ...prev,
      [userId]: (prev[userId] || []).filter((it) => it.id !== id),
    }));
  };

  return (
    <section className="card">
      <div className="card-header">
        <FontAwesomeIcon icon={faListCheck} className="icon-left" />
        <h3 className="card-title">{isOwner ? 'My Wishlist' : "Recipient's Wishlist"}</h3>
      </div>

      {isOwner && (
        <div className="wish-form">
          <input
            className="input"
            placeholder="Item title (required)"
            value={newItem.title}
            onChange={(e) => setNewItem((s) => ({ ...s, title: e.target.value }))}
          />
          <input
            className="input"
            placeholder="Link (optional)"
            value={newItem.link}
            onChange={(e) => setNewItem((s) => ({ ...s, link: e.target.value }))}
          />
          <textarea
            className="textarea"
            placeholder="Notes (size, colour, where to buy...)"
            value={newItem.notes}
            onChange={(e) => setNewItem((s) => ({ ...s, notes: e.target.value }))}
          />
          <button className="btn primary" onClick={addItem}>
            <FontAwesomeIcon icon={faPlus} /> Add Item
          </button>
        </div>
      )}

      <div className="wish-list">
        {items.length === 0 ? (
          <div className="empty">No items yet.</div>
        ) : (
          items.map((item) => (
            <WishlistItem
              key={item.id}
              item={item}
              isEditable={isOwner}
              onUpdate={(next) => updateItem(item.id, { ...item, ...next })}
              onDelete={() => deleteItem(item.id)}
            />
          ))
        )}
      </div>
    </section>
  );
};

export default WishlistSection;

