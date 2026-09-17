import { useEffect, useRef, useState } from 'react'

function Navbar({ currentUser, onOpenLogin, onOpenRegister, onLogout, onOpenHome, onOpenCategory }) {
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef(null)

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  return (
    <header className="topbar">
      <div className="brand-wrap">
        <div className="brand-mark">R</div>
        <div>
          <button type="button" className="brand-name brand-button" onClick={onOpenHome}>ReferLink</button>
          <div className="brand-tag">Smart referral marketplace</div>
        </div>
      </div>

      <nav className="main-nav" aria-label="Main navigation">
        <button type="button" onClick={onOpenHome}>Home</button>
        <button type="button" onClick={() => onOpenCategory('credit')}>Credit Cards</button>
        <button type="button" onClick={() => onOpenCategory('education')}>Education</button>
        <button type="button" onClick={() => onOpenCategory('upi')}>UPI Payments</button>
        <a href="#my-referrals">My Referrals</a>
        <a href="#dashboard">Dashboard</a>
      </nav>

      <div className="nav-actions">
        {currentUser ? (
          <div className="user-menu" ref={userMenuRef}>
            <button
              type="button"
              className="user-pill user-menu-trigger"
              onClick={() => setUserMenuOpen((isOpen) => !isOpen)}
              aria-expanded={userMenuOpen}
              aria-haspopup="menu"
            >
              {currentUser.name}
            </button>
            {userMenuOpen && (
              <div className="user-menu-dropdown" role="menu">
                <button type="button" onClick={() => { setUserMenuOpen(false); onLogout() }}>Log out</button>
              </div>
            )}
          </div>
        ) : (
          <>
            <button type="button" className="secondary-btn" onClick={onOpenLogin}>Log in</button>
            <button type="button" className="primary-btn" onClick={onOpenRegister}>Get started</button>
          </>
        )}
      </div>
    </header>
  )
}

export default Navbar
