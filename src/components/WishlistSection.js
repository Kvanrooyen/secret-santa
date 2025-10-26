import React, { useEffect, useMemo, useState } from 'react';
import { saveWishlistItem, updateWishlistItem, deleteWishlistItem, getMyWishlist } from '../utils/wishlistService';
import WishlistItem from './WishlistItem';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faListCheck, faGift, faEuroSign } from '@fortawesome/free-solid-svg-icons';

const WishlistSection = ({ userId, userEmail, isOwner = true }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form state
  const [newItem, setNewItem] = useState({
    title: '',
    link: '',
    price: '',
    notes: ''
  });

  const [isFormExpanded, setIsFormExpanded] = useState(false);

  // Create user object for encryption service
  const user = useMemo(() => {
    if (!userId || !userEmail) return null;
    return { id: userId, email: userEmail };
  }, [userId, userEmail]);

  const canSubmit = useMemo(() => {
    return Boolean(user && newItem.title.trim());
  }, [user, newItem.title]);

  // Fetch items for this user
  useEffect(() => {
    let active = true;

    async function load() {
      if (!user) {
        setItems([]);
        setError(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const { data, error: fetchError } = await getMyWishlist(user);

        if (!active) return;
        if (fetchError) throw new Error(fetchError);

        setItems(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!active) return;
        setError(e?.message || 'Failed to load wishlist.');
        setItems([]);
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => { active = false; };
  }, [user]);

  // Add item
  const addItem = async () => {
    if (!canSubmit || !newItem.title.trim() || !newItem.link.trim() || !newItem.price) return;

    try {
      setError(null);

      const { error: saveError } = await saveWishlistItem(newItem, user);

      if (saveError) throw new Error(saveError.message || 'Failed to save item');

      // Reload the list to get the new item with proper ID and timestamps
      const { data, error: fetchError } = await getMyWishlist(user);
      if (fetchError) throw new Error(fetchError);

      setItems(Array.isArray(data) ? data : []);

      // Reset form
      setNewItem({ title: '', link: '', price: '', notes: '' });
      setIsFormExpanded(false);
    } catch (e) {
      setError(e?.message || 'Failed to add item.');
    }
  };

  // Update item
  const updateItem = async (id, updatedData) => {
    try {
      setError(null);

      const { error: updateError } = await updateWishlistItem(id, updatedData, user);

      if (updateError) throw new Error(updateError.message || 'Failed to update item');

      // Update local state
      setItems(prev => prev.map(item =>
        item.id === id ? { ...item, ...updatedData } : item
      ));
    } catch (e) {
      setError(e?.message || 'Failed to update item.');
    }
  };

  // Delete item
  const deleteItem = async (id) => {
    try {
      setError(null);

      const { error: deleteError } = await deleteWishlistItem(id, userId);

      if (deleteError) throw new Error(deleteError.message || 'Failed to delete item');

      // Update local state
      setItems(prev => prev.filter(item => item.id !== id));
    } catch (e) {
      setError(e?.message || 'Failed to delete item.');
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    addItem();
  };

  const calculateTotal = () => {
    return items.reduce((total, item) => total + (parseFloat(item.price) || 0), 0);
  };

  const formatPrice = (price) => {
    const num = parseFloat(price);
    return isNaN(num) ? '€0.00' : `€${num.toFixed(2)}`;
  };

  if (loading) {
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
        <div className="wishlist-items">
          <div className="skeleton skeleton--md" />
          <div className="skeleton skeleton--md" />
          <div className="skeleton skeleton--md" />
        </div>
      </div>
    );
  }

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

      {/* Error banner */}
      {error && (
        <div className="alert alert--error" role="alert" style={{ margin: '1rem' }}>
          {error}
        </div>
      )}

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

            <div className="form-row">
              <input
                className="form-input"
                placeholder="Link to product"
                type="url"
                value={newItem.link}
                onChange={(e) => setNewItem({ ...newItem, link: e.target.value })}
                required
              />
            </div>

            <div className="form-row">
              <div className="price-input-container" style={{ position: 'relative' }}>
                <FontAwesomeIcon 
                  icon={faEuroSign} 
                  style={{ 
                    position: 'absolute', 
                    left: '12px', 
                    top: '50%', 
                    transform: 'translateY(-50%)', 
                    color: 'var(--text-muted)',
                    fontSize: '0.9rem'
                  }} 
                />
                <input
                  className="form-input"
                  placeholder="Price in euros"
                  type="number"
                  step="0.01"
                  min="0"
                  value={newItem.price}
                  onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                  style={{ paddingLeft: '32px' }}
                  required
                />
              </div>
            </div>

            {(isFormExpanded || newItem.notes) && (
              <div className="form-row">
                <textarea
                  className="form-input textarea"
                  placeholder="Additional notes (size, color, specific brand, where to find it...)"
                  value={newItem.notes}
                  onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
                  rows="3"
                />
              </div>
            )}

            <div className="form-actions" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <button 
                type="submit"
                className="btn btn-primary" 
                disabled={!newItem.title.trim() || !newItem.link.trim() || !newItem.price}
              >
                <FontAwesomeIcon icon={faPlus} />
                Add to Wishlist
              </button>
              
              {!isFormExpanded && !newItem.notes && (
                <button 
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => setIsFormExpanded(true)}
                >
                  Add notes
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
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: 'var(--primary)',
                fontWeight: '600',
                fontSize: '1.1rem'
              }}>
                <span>Total:</span>
                <span>{formatPrice(calculateTotal())}</span>
              </div>
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