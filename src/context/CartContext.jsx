import { createContext, useContext, useState, useCallback, useEffect } from 'react'

// ─────────────────────────────────────────────
// WHY A CART CONTEXT?
//
// The cart needs to be accessible from:
//   - GemStoneList   (add to cart button on each card)
//   - GemStoneDetail (add to cart button on detail page)
//   - Navbar         (cart item count badge)
//   - Cart page      (view, remove, clear)
//
// Without context we would have to pass cartItems and
// setCartItems as props through every component between
// them. That is prop drilling and it breaks quickly.
// Context puts the cart at the top of the app and every
// component reads it directly with useCart().
//
// WHY localStorage?
// If the user adds items and then refreshes the page,
// their cart should still be there. localStorage persists
// data across page refreshes. We save the cart there on
// every change and read it back on startup.
// ─────────────────────────────────────────────

const CartContext = createContext(null)

const CART_KEY = 'gemvault_cart'

// ─────────────────────────────────────────────
// Read cart from localStorage on startup
// ─────────────────────────────────────────────

function getStoredCart() {
  try {
    const raw = localStorage.getItem(CART_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    // Make sure it is an array — guard against corrupted data
    return Array.isArray(parsed) ? parsed : []
  } catch {
    // JSON.parse can throw if the stored value is corrupted
    return []
  }
}

// ─────────────────────────────────────────────
// What we store per cart item:
// We store a SNAPSHOT of the gem at the time it was
// added. We do NOT store the full gem object — only
// the fields we need to display the cart.
//
// WHY a snapshot and not just the id?
// If we stored only the id we would need to fetch
// gem details every time the cart page loads.
// A snapshot means the cart works offline and is
// instant to render.
// ─────────────────────────────────────────────

function buildCartItem(gem) {
  return {
    id:            gem.id,
    name:          gem.name,
    sku:           gem.sku,
    gemType:       gem.gemType,
    price:         gem.price,
    thumbnailUrl:  gem.thumbnailUrl  || null,
    weightInCarats: gem.weightInCarats || null,
    color:         gem.color         || null,
    shape:         gem.shape         || null,
    // Quantity starts at 1.
    // Most gemstones are unique so quantity > 1 is rare,
    // but we support it for stones with stockQuantity > 1.
    quantity:      1,
    // Record when it was added so we can sort by it
    addedAt:       Date.now(),
  }
}

// ─────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────

export function CartProvider({ children }) {
  // Lazy initial state — reads from localStorage once on mount
  const [items, setItems] = useState(() => getStoredCart())

  // ── Persist to localStorage on every change ──
  // This useEffect runs every time `items` changes.
  // It serialises the cart to JSON and saves it.
  useEffect(() => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(items))
    } catch {
      // localStorage can throw if storage quota is exceeded.
      // We silently ignore this — cart still works in memory.
    }
  }, [items])

  // ── addToCart ──────────────────────────────
  // If gem is already in the cart, increase quantity by 1.
  // If not, add a new cart item with quantity 1.
  const addToCart = useCallback((gem) => {
    setItems(prev => {
      const existing = prev.find(item => item.id === gem.id)
      if (existing) {
        // Increment quantity of existing item
        return prev.map(item =>
          item.id === gem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      // Add new item
      return [...prev, buildCartItem(gem)]
    })
  }, [])

  // ── removeFromCart ─────────────────────────
  // Remove one item completely regardless of quantity
  const removeFromCart = useCallback((gemId) => {
    setItems(prev => prev.filter(item => item.id !== gemId))
  }, [])

  // ── updateQuantity ─────────────────────────
  // Set a specific quantity. If quantity reaches 0,
  // remove the item from the cart entirely.
  const updateQuantity = useCallback((gemId, quantity) => {
    const qty = Math.max(0, Math.floor(quantity)) // no negatives, no decimals
    if (qty === 0) {
      setItems(prev => prev.filter(item => item.id !== gemId))
    } else {
      setItems(prev =>
        prev.map(item =>
          item.id === gemId ? { ...item, quantity: qty } : item
        )
      )
    }
  }, [])

  // ── clearCart ──────────────────────────────
  // Remove all items — used after a successful order
  const clearCart = useCallback(() => {
    setItems([])
  }, [])

  // ── isInCart ───────────────────────────────
  // Returns true if a gem is already in the cart.
  // Used by GemCard and GemStoneDetail to show
  // "In cart" state on the add button.
  const isInCart = useCallback((gemId) => {
    return items.some(item => item.id === gemId)
  }, [items])

  // ── Derived values ─────────────────────────
  // Computed from items so they are always in sync.

  // Total number of individual items (sum of all quantities)
  // e.g. 2 rubies + 1 diamond = cartCount 3
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0)

  // Total price of everything in the cart
  const cartTotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity, 0
  )

  const value = {
    items,           // the full array of cart items
    cartCount,       // total quantity across all items — used for badge
    cartTotal,       // total price — used in cart summary
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    isInCart,
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

// ─────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>')
  return ctx
}