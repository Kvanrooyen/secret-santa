import React, { useEffect, useState, useCallback } from "react";
import WishlistItem from "./WishlistItem";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faListCheck,
  faGift,
  faEuroSign,
} from "@fortawesome/free-solid-svg-icons";
import {
  saveWishlistItem,
  getMyWishlist,
  updateWishlistItem,
  deleteWishlistItem,
  getGifteeWishlist,
} from "../utils/wishlistService";

const WishlistSection = ({ user, isOwner = true }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newItem, setNewItem] = useState({
    title: "",
    link: "",
    price: "",
    notes: "",
  });
  const [isFormExpanded, setIsFormExpanded] = useState(false);

  // Load wishlist when component mounts or user changes
  const loadWishlist = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      let data, error;

      if (isOwner) {
        // Load my own wishlist
        ({ data, error } = await getMyWishlist(user));
      } else {
        // Load giftee's wishlist (for secret santa assignment)
        ({ data, error } = await getGifteeWishlist(user.id));
      }

      if (error) {
        console.error("Error loading wishlist:", error);
        setItems([]);
      } else {
        setItems(data || []);
      }
    } catch (err) {
      console.error("Unexpected error loading wishlist:", err);
      setItems([]);
    }
    setLoading(false);
  }, [user, isOwner]);

  useEffect(() => {
    if (user) {
      loadWishlist();
    }
  }, [user, loadWishlist]);

  const addItem = async () => {
    if (!newItem.title.trim() || !newItem.link.trim() || !newItem.price) return;

    try {
      const { error } = await saveWishlistItem(
        {
          title: newItem.title,
          link: newItem.link,
          price: parseFloat(newItem.price) || 0,
          notes: newItem.notes,
        },
        user
      );

      if (error) {
        console.error("Error saving item:", error);
        return;
      }

      // Refresh the list
      await loadWishlist();

      // Reset form
      setNewItem({ title: "", link: "", price: "", notes: "" });
      setIsFormExpanded(false);
    } catch (err) {
      console.error("Unexpected error saving item:", err);
    }
  };

  const updateItem = async (itemId, updatedData) => {
    try {
      const { error } = await updateWishlistItem(itemId, updatedData, user);
      if (error) {
        console.error("Error updating item:", error);
        return;
      }

      // Refresh the list
      await loadWishlist();
    } catch (err) {
      console.error("Unexpected error updating item:", err);
    }
  };

  const deleteItem = async (itemId) => {
    try {
      const { error } = await deleteWishlistItem(itemId, user.id);
      if (error) {
        console.error("Error deleting item:", error);
        return;
      }

      // Refresh the list
      await loadWishlist();
    } catch (err) {
      console.error("Unexpected error deleting item:", err);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    addItem();
  };

  const calculateTotal = () => {
    return items.reduce(
      (total, item) => total + (parseFloat(item.price) || 0),
      0
    );
  };

  const formatPrice = (price) => {
    const num = parseFloat(price);
    return isNaN(num) ? "€0.00" : `€${num.toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="card">
        <div className="card-header">
          <div className="card-icon">
            <FontAwesomeIcon icon={faListCheck} />
          </div>
          <h3 className="card-title">Loading wishlist...</h3>
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
          {isOwner ? "My Wishlist" : `${user.name}'s Wishlist`}
        </h3>
      </div>

      {isOwner && (
        <div className="wishlist-form">
          <div className="form-header" style={{ marginBottom: "1rem" }}>
            <h4 style={{ margin: 0, color: "var(--text-primary)" }}>
              Add New Item
            </h4>
            <p
              style={{
                margin: "0.25rem 0 0 0",
                color: "var(--text-muted)",
                fontSize: "0.9rem",
              }}
            >
              What would you like for Christmas?
            </p>
          </div>

          <form onSubmit={handleFormSubmit}>
            <div className="form-row">
              <input
                className="form-input"
                placeholder="Item title (e.g., 'Cozy winter sweater')"
                value={newItem.title}
                onChange={(e) =>
                  setNewItem({ ...newItem, title: e.target.value })
                }
                required
              />
            </div>

            <div className="form-row">
              <input
                className="form-input"
                placeholder="Link to product"
                type="url"
                value={newItem.link}
                onChange={(e) =>
                  setNewItem({ ...newItem, link: e.target.value })
                }
                required
              />
            </div>

            <div className="form-row">
              <div
                className="price-input-container"
                style={{ position: "relative" }}
              >
                <FontAwesomeIcon
                  icon={faEuroSign}
                  style={{
                    position: "absolute",
                    left: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--text-muted)",
                    fontSize: "0.9rem",
                  }}
                />
                <input
                  className="form-input"
                  placeholder="Price in euros"
                  type="number"
                  step="0.01"
                  min="0"
                  value={newItem.price}
                  onChange={(e) =>
                    setNewItem({ ...newItem, price: e.target.value })
                  }
                  style={{ paddingLeft: "32px" }}
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
                  onChange={(e) =>
                    setNewItem({ ...newItem, notes: e.target.value })
                  }
                  rows="3"
                />
              </div>
            )}

            <div
              className="form-actions"
              style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}
            >
              <button
                type="submit"
                className="btn btn-primary"
                disabled={
                  !newItem.title.trim() ||
                  !newItem.link.trim() ||
                  !newItem.price
                }
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
                : `${user.name} hasn't added any items yet.`}
            </p>
          </div>
        ) : (
          <>
            <div
              className="items-header"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "1rem",
                paddingBottom: "0.5rem",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <p
                style={{
                  margin: 0,
                  color: "var(--text-muted)",
                  fontSize: "0.9rem",
                }}
              >
                {items.length} item{items.length !== 1 ? "s" : ""}
              </p>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  color: "var(--primary)",
                  fontWeight: "600",
                  fontSize: "1.1rem",
                }}
              >
                <span>Total:</span>
                <span>{formatPrice(calculateTotal())}</span>
              </div>
            </div>

            {items.map((item) => (
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
