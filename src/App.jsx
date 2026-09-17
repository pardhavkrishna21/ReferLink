import { useEffect, useState } from 'react'
import './App.css'
import Navbar from './components/Navbar'
import ProductCard from './components/ProductCard'
import { categoryCollections, lifecycle, products, referralPartners, referralRecords, stats } from './data/mockData'

const STORAGE_KEY = 'referlink_accounts'
const SESSION_KEY = 'referlink_session'

function getStoredAccounts() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

function getStoredSession() {
  try {
    const saved = localStorage.getItem(SESSION_KEY)
    return saved ? JSON.parse(saved) : null
  } catch {
    return null
  }
}

function App() {
  const [authOpen, setAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState('login')
  const [currentUser, setCurrentUser] = useState(() => getStoredSession())
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [activePage, setActivePage] = useState('home')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [selectedProductPartners, setSelectedProductPartners] = useState([])
  const [attributionStatus, setAttributionStatus] = useState('')
  const [connections, setConnections] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('referlink_connections') || '[]')
    } catch {
      return []
    }
  })
  const [employeeForm, setEmployeeForm] = useState({ company: '', workEmail: '', workId: '', proofName: '', referralCode: '' })
  const [employeeStatus, setEmployeeStatus] = useState('')
  const [selectedPartner, setSelectedPartner] = useState(null)
  const [partnerType, setPartnerType] = useState('all')
  const [userProofForm, setUserProofForm] = useState({ accountType: '', accountId: '', aadhaar: '', phone: '', proofName: '', referralCode: '' })
  const [userPhoneVerified, setUserPhoneVerified] = useState(false)
  const [userProofStatus, setUserProofStatus] = useState('')
  const [submittedPartners, setSubmittedPartners] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('referlink_submitted_partners') || '[]')
    } catch {
      return []
    }
  })
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(currentUser))
    } else {
      localStorage.removeItem(SESSION_KEY)
    }
  }, [currentUser])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setError('')
    setSuccess('')
  }

  const openAuth = (mode) => {
    setAuthMode(mode)
    setForm({ name: '', email: '', phone: '', password: '' })
    setError('')
    setSuccess('')
    setAuthOpen(true)
  }

  const closeAuth = () => {
    setAuthOpen(false)
    setError('')
    setSuccess('')
    setForm({ name: '', email: '', phone: '', password: '' })
  }

  const validateEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  const validatePhone = (value) => /^\d{10}$/.test(String(value).replace(/\D/g, ''))

  const handleRegister = (event) => {
    event.preventDefault()

    const { name, email, phone, password } = form

    if (!name.trim() || !email.trim() || !phone.trim() || !password.trim()) {
      setError('Please fill in all fields to create your account.')
      return
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address.')
      return
    }

    const cleanPhone = String(phone).replace(/\D/g, '')
    if (!validatePhone(cleanPhone)) {
      setError('Phone number must be a valid 10-digit number.')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.')
      return
    }

    const accounts = getStoredAccounts()
    const duplicate = accounts.some(
      (account) =>
        account.email.toLowerCase() === email.toLowerCase() ||
        account.phone.replace(/\D/g, '') === cleanPhone,
    )

    if (duplicate) {
      setError('An account with this email or phone number already exists.')
      return
    }

    const newUser = {
      name: name.trim(),
      email: email.trim(),
      phone: cleanPhone,
      password,
    }

    const updatedAccounts = [...accounts, newUser]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedAccounts))
    setCurrentUser({
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
    })
    closeAuth()
  }

  const handleLogin = (event) => {
    event.preventDefault()

    const loginValue = (form.email || form.phone).trim()
    if (!loginValue || !form.password.trim()) {
      setError('Enter your email or phone number and password to continue.')
      return
    }

    const accounts = getStoredAccounts()
    const normalizedValue = loginValue.toLowerCase()
    const matchedUser = accounts.find((account) => {
      const sameEmail = account.email.toLowerCase() === normalizedValue
      const samePhone = account.phone.replace(/\D/g, '') === loginValue.replace(/\D/g, '')
      return sameEmail || samePhone
    })

    if (!matchedUser || matchedUser.password !== form.password) {
      setError('Invalid email/phone or password. Please try again.')
      return
    }

    setCurrentUser({
      name: matchedUser.name,
      email: matchedUser.email,
      phone: matchedUser.phone,
    })
    closeAuth()
  }

  const handleLogout = () => {
    setCurrentUser(null)
    setAuthOpen(false)
    setForm({ name: '', email: '', phone: '', password: '' })
  }

  const handleGoogleAuth = () => {
    const googleUser = {
      name: 'Google User',
      email: 'google.user@example.com',
      phone: '0000000000',
      password: 'google-authenticated',
    }
    const accounts = getStoredAccounts()
    const updatedAccounts = accounts.some((account) => account.email === googleUser.email)
      ? accounts
      : [...accounts, googleUser]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedAccounts))
    setCurrentUser({ name: googleUser.name, email: googleUser.email, phone: googleUser.phone })
    setSuccess('Google account connected successfully.')
    closeAuth()
  }

  const openCategoryPage = (categoryId) => {
    setSelectedCategory(categoryId)
    setActivePage(categoryId)
    window.history.replaceState({}, '', `#${categoryId}`)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const openHomePage = () => {
    setSelectedCategory('all')
    setActivePage('home')
    window.history.replaceState({}, '', '#platform')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleEmployeeChange = (event) => {
    const { name, value, files } = event.target
    setEmployeeForm((previous) => ({ ...previous, [name]: files?.[0]?.name ?? value }))
    setEmployeeStatus('')
  }

  const handleEmployeeVerification = (event) => {
    event.preventDefault()
    if (!currentUser) {
      openAuth('login')
      return
    }

    const { company, workEmail, workId, proofName, referralCode } = employeeForm
    if (!company.trim() || !workEmail.trim() || !workId.trim() || !proofName || !referralCode.trim()) {
      setEmployeeStatus('Add the company, work email, employee ID, latest payslip, and referral code to continue.')
      return
    }

    const verifications = JSON.parse(localStorage.getItem('referlink_employee_verifications') || '[]')
    verifications.push({
      category: activePage,
      company: company.trim(),
      workEmail: workEmail.trim(),
      workId: workId.trim(),
      proofName,
      referralCode: referralCode.trim(),
      user: currentUser.email,
      status: 'Under review',
    })
    localStorage.setItem('referlink_employee_verifications', JSON.stringify(verifications))
    const partner = {
      id: `submitted-employee-${verifications.length + 1}`, category: activePage, type: 'employee', name: currentUser.name,
      role: `${company.trim()} employee`, product: activeCategory?.title, rate: 'New', completed: 0, rating: 'Pending', location: 'Verified member',
      proof: 'Work email, employee ID, and payslip submitted', organization: company.trim(), workId: `Submitted · ${workId.trim()}`, payslip: 'Latest payslip submitted', accountProof: '',
      process: ['Review the product details', 'Use the submitted employee referral code', 'Complete the official provider process'], code: referralCode.trim(),
    }
    const updatedPartners = [...submittedPartners, partner]
    localStorage.setItem('referlink_submitted_partners', JSON.stringify(updatedPartners))
    setSubmittedPartners(updatedPartners)
    setEmployeeStatus('Submitted. Your employee referral code will appear in this category after review.')
    setEmployeeForm({ company: '', workEmail: '', workId: '', proofName: '', referralCode: '' })
  }

  const handleUserProofChange = (event) => {
    const { name, value, files } = event.target
    setUserProofForm((previous) => ({ ...previous, [name]: files?.[0]?.name ?? value }))
    setUserProofStatus('')
  }

  const verifyUserPhone = () => {
    if (!/^\d{10}$/.test(userProofForm.phone.replace(/\D/g, ''))) {
      setUserProofStatus('Enter a valid 10-digit phone number before verifying it.')
      return
    }
    setUserPhoneVerified(true)
    setUserProofStatus('Phone number verified in demo mode.')
  }

  const handleUserProofSubmit = (event) => {
    event.preventDefault()
    if (!currentUser) {
      openAuth('login')
      return
    }

    const { accountType, accountId, aadhaar, phone, proofName, referralCode } = userProofForm
    if (!accountType.trim() || !accountId.trim() || !/^\d{12}$/.test(aadhaar.replace(/\D/g, '')) || !/^\d{10}$/.test(phone.replace(/\D/g, '')) || !userPhoneVerified || !proofName || !referralCode.trim()) {
      setUserProofStatus('Add Aadhaar, verify your 10-digit phone number, submit account proof, and add your referral code.')
      return
    }

    localStorage.setItem('referlink_user_verification', JSON.stringify({
      category: activePage, accountType, accountId, aadhaar: `••••••••${aadhaar.slice(-4)}`, phone: phone.replace(/\D/g, ''), proofName, referralCode, user: currentUser.email, status: 'Under review',
    }))
    const partner = {
      id: `submitted-user-${submittedPartners.length + 1}`, category: activePage, type: 'user', name: currentUser.name,
      role: `Verified ${accountType.trim()} holder`, product: activeCategory?.title, rate: 'New', completed: 0, rating: 'Pending', location: 'Verified member',
      proof: 'Aadhaar, phone, and account ownership submitted', organization: '', workId: '', payslip: '', accountProof: 'Aadhaar, verified phone, and account proof submitted',
      process: ['Review the product details', 'Use the submitted user referral code', 'Complete the official provider process'], code: referralCode.trim(),
    }
    const updatedPartners = [...submittedPartners, partner]
    localStorage.setItem('referlink_submitted_partners', JSON.stringify(updatedPartners))
    setSubmittedPartners(updatedPartners)
    setUserProofStatus('Submitted. Your user referral code will appear in this category after review.')
    setUserProofForm({ accountType: '', accountId: '', aadhaar: '', phone: '', proofName: '', referralCode: '' })
    setUserPhoneVerified(false)
  }

  const filteredProducts =
    selectedCategory === 'all'
      ? products
      : products.filter((product) => product.group === selectedCategory)

  const activeCategory = categoryCollections.find((category) => category.id === activePage)
  const allReferralPartners = [...referralPartners, ...submittedPartners]
  const categoryPartners = allReferralPartners.filter((partner) => partner.category === activePage)
  const visiblePartners = partnerType === 'all' ? categoryPartners : categoryPartners.filter((partner) => partner.type === partnerType)

  const openProductDetails = (product) => {
    setSelectedProduct(product)
    setSelectedProductPartners([])
    setAttributionStatus('')
  }

  const closeProductDetails = () => {
    setSelectedProduct(null)
    setSelectedProductPartners([])
    setAttributionStatus('')
  }

  const productPartners = selectedProduct
    ? allReferralPartners.filter((partner) => partner.category === selectedProduct.group)
    : []

  const handlePartnerAttribution = () => {
    if (selectedProductPartners.length === 0) return
    if (!currentUser) {
      openAuth('login')
      return
    }

    const connections = JSON.parse(localStorage.getItem('referlink_connections') || '[]')
    const newConnections = selectedProductPartners.map((partner) => ({
      product: selectedProduct.name,
      partner: partner.name,
      partnerType: partner.type,
      code: partner.code,
      conversionRate: partner.rate,
      referredUser: currentUser.name,
      referredUserEmail: currentUser.email,
      createdAt: new Date().toISOString(),
    }))
    localStorage.setItem('referlink_connections', JSON.stringify([...connections, ...newConnections]))
    setConnections((previous) => [...previous, ...newConnections])
    setAttributionStatus(`${newConnections.length} selected referral links are recorded for your account.`)
  }

  return (
    <div className="app-shell">
      <Navbar
        currentUser={currentUser}
        onOpenLogin={() => openAuth('login')}
        onOpenRegister={() => openAuth('register')}
        onLogout={handleLogout}
        onOpenHome={openHomePage}
        onOpenCategory={openCategoryPage}
      />

      {selectedProduct && (
        <div className="auth-overlay" onClick={closeProductDetails}>
          <div className="detail-modal" onClick={(event) => event.stopPropagation()}>
            <div className="auth-header">
              <div>
                <span className="eyebrow">Referral details</span>
                <h3>{selectedProduct.name}</h3>
              </div>
              <button type="button" className="close-btn" onClick={closeProductDetails}>×</button>
            </div>

            <div className="detail-grid">
              <div>
                <p className="detail-provider">{selectedProduct.provider}</p>
                <div className="detail-badges">
                  <span>{selectedProduct.category}</span>
                  {selectedProduct.verified && <span>Verified</span>}
                </div>
                <p className="detail-text">{selectedProduct.cashback}</p>
              </div>

              <div className="detail-metrics">
                <div>
                  <span>Annual fee</span>
                  <strong>{selectedProduct.annualFee}</strong>
                </div>
                <div>
                  <span>Referrers</span>
                  <strong>{selectedProduct.availableReferrers}</strong>
                </div>
                <div>
                  <span>Rating</span>
                  <strong>{selectedProduct.rating}</strong>
                </div>
                <div>
                  <span>Match</span>
                  <strong>{selectedProduct.match}%</strong>
                </div>
              </div>
            </div>

            <div className="detail-features">
              <h4>Why users choose this</h4>
              <ul>
                <li>Fast referral eligibility checks</li>
                <li>Verified user network and response tracking</li>
                <li>Official onboarding assistance without fake promises</li>
              </ul>
            </div>

            <div className="product-referral-options">
              <div className="product-referral-heading">
                <div>
                  <span className="eyebrow">Get referral</span>
                  <h4>Choose who will refer you</h4>
                </div>
                <span>{productPartners.length} available</span>
              </div>
              <div className="product-partner-list">
                {productPartners.map((partner) => (
                  <button
                    type="button"
                    className={`product-partner-option ${selectedProductPartners.some((selected) => selected.id === partner.id) ? 'selected' : ''}`}
                    key={partner.id}
                    onClick={() => {
                      setSelectedProductPartners((previous) => previous.some((selected) => selected.id === partner.id)
                        ? previous.filter((selected) => selected.id !== partner.id)
                        : [...previous, partner])
                      setAttributionStatus('')
                    }}
                  >
                    <span className={`partner-avatar ${partner.type}`}>{partner.name.charAt(0)}</span>
                    <span className="product-partner-info">
                      <strong>{partner.name}</strong>
                      <small>{partner.role}</small>
                      <small>Referral link: {partner.code}</small>
                    </span>
                    <span className="product-partner-rate"><strong>{partner.rate}</strong><small>success</small></span>
                    {partner.type === 'employee' && <span className="employee-highlight">Organization employee</span>}
                  </button>
                ))}
              </div>
            </div>

            {selectedProductPartners.length > 0 && (
              <div className="selected-partner-detail">
                <div>
                  <span className="eyebrow">Selected referral links ({selectedProductPartners.length})</span>
                  <h4>Review every selected referrer</h4>
                  <div className="selected-partner-list">
                    {selectedProductPartners.map((partner) => (
                      <div className="selected-partner-item" key={partner.id}>
                        <strong>{partner.name}</strong>
                        <span className={`selected-partner-badge ${partner.type}`}>
                          {partner.type === 'employee' ? 'Organization employee' : 'Verified user'}
                        </span>
                        {partner.type === 'employee' ? (
                          <small>{partner.organization} · {partner.workId} · {partner.payslip}</small>
                        ) : (
                          <small>{partner.accountProof}</small>
                        )}
                        <small>Conversion: {partner.rate} · Code: {partner.code}</small>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="selected-process-box">
                  <span>Process for selected links</span>
                  <ol>
                    {selectedProductPartners[0].process.map((step) => <li key={step}>{step}</li>)}
                  </ol>
                  <small>Use each code only on the official provider page.</small>
                </div>
                <button type="button" className="primary-btn" onClick={handlePartnerAttribution}>You referred me</button>
              </div>
            )}

            {attributionStatus && <div className="auth-success request-status">{attributionStatus}</div>}

            <div className="detail-actions">
              <button type="button" className="secondary-btn" onClick={closeProductDetails}>Close</button>
              <button type="button" className="primary-btn" onClick={() => {
                if (selectedProductPartners.length > 0) {
                  handlePartnerAttribution()
                } else {
                  setAttributionStatus('Select one or more people above to get their referral links.')
                }
              }}>
                Get referral
              </button>
            </div>
          </div>
        </div>
      )}

      {authOpen && (
        <div className="auth-overlay" onClick={closeAuth}>
          <div className="auth-modal" onClick={(event) => event.stopPropagation()}>
            <div className="auth-header">
              <div>
                <span className="eyebrow">Account access</span>
                <h3>{authMode === 'login' ? 'Log in to ReferLink' : 'Create your account'}</h3>
              </div>
              <button type="button" className="close-btn" onClick={closeAuth}>×</button>
            </div>

            <div className="auth-toggle">
              <button
                type="button"
                className={authMode === 'login' ? 'mode-btn active' : 'mode-btn'}
                onClick={() => openAuth('login')}
              >
                Log in
              </button>
              <button
                type="button"
                className={authMode === 'register' ? 'mode-btn active' : 'mode-btn'}
                onClick={() => openAuth('register')}
              >
                Register
              </button>
            </div>

            <form onSubmit={authMode === 'login' ? handleLogin : handleRegister} className="auth-form">
              {authMode === 'register' && (
                <label className="auth-field">
                  <span>Full name</span>
                  <input
                    type="text"
                    name="name"
                    placeholder="Your full name"
                    value={form.name}
                    onChange={handleChange}
                  />
                </label>
              )}

              <label className="auth-field">
                <span>{authMode === 'login' ? 'Email or phone number' : 'Email address'}</span>
                <input
                  type="text"
                  name="email"
                  placeholder={authMode === 'login' ? 'Email or phone number' : 'you@example.com'}
                  value={form.email}
                  onChange={handleChange}
                />
              </label>

              {authMode === 'register' && (
                <label className="auth-field">
                  <span>Phone number</span>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="10-digit phone number"
                    value={form.phone}
                    onChange={handleChange}
                  />
                </label>
              )}

              <label className="auth-field">
                <span>Password</span>
                <input
                  type="password"
                  name="password"
                  placeholder="Enter password"
                  value={form.password}
                  onChange={handleChange}
                />
              </label>

              {error && <div className="auth-error">{error}</div>}
              {success && <div className="auth-success">{success}</div>}

              <button type="submit" className="primary-btn auth-submit">
                {authMode === 'login' ? 'Log in' : 'Register account'}
              </button>

              <div className="auth-divider"><span>or</span></div>

              <button type="button" className="google-btn" onClick={handleGoogleAuth}>
                <svg className="google-mark" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#4285F4" d="M21.35 12.27c0-.79-.07-1.55-.23-2.27H12v4.3h5.24a4.48 4.48 0 0 1-1.94 2.94v2.82h3.57c2.09-1.93 3.3-4.77 3.3-7.79Z" />
                  <path fill="#34A853" d="M12 21.5c2.98 0 5.48-.99 7.3-2.68l-3.57-2.82c-.99.66-2.25 1.05-3.73 1.05-2.87 0-5.3-1.94-6.17-4.55H2.14v2.91A11.02 11.02 0 0 0 12 21.5Z" />
                  <path fill="#FBBC05" d="M5.83 12.5A6.63 6.63 0 0 1 5.48 10c0-.87.15-1.72.35-2.5V4.59H2.14A11 11 0 0 0 1 10c0 1.77.42 3.45 1.14 4.91l3.69-2.41Z" />
                  <path fill="#EA4335" d="M12 2.95c1.62 0 3.08.56 4.23 1.66l3.17-3.17C17.47-.43 14.98-1.5 12-1.5A11.02 11.02 0 0 0 2.14 4.59l3.69 2.91C6.7 4.89 9.13 2.95 12 2.95Z" transform="translate(0 3)" />
                </svg>
                {authMode === 'register' ? 'Register with Google' : 'Continue with Google'}
              </button>

              {authMode === 'login' ? (
                <p className="auth-switch">No account? <button type="button" onClick={() => openAuth('register')}>Register here</button></p>
              ) : (
                <p className="auth-switch">Already have an account? <button type="button" onClick={() => openAuth('login')}>Log in</button></p>
              )}
            </form>
          </div>
        </div>
      )}

      {activePage !== 'home' ? (
        <main className="category-page">
          <section className={`category-hero accent-${activeCategory?.accent ?? 'blue'}`}>
            <div>
              <button type="button" className="back-link" onClick={openHomePage}>Back to marketplace</button>
              <span className="eyebrow">Dedicated referral page</span>
              <h1>{activeCategory?.title}</h1>
              <p>{activeCategory?.description}</p>
              <div className="provider-strip">
                {activeCategory?.providers.map((provider) => <span key={provider}>{provider}</span>)}
              </div>
            </div>
            <div className="category-hero-note">
              <strong>Verified people only</strong>
              <span>Every referral partner is reviewed before being listed.</span>
            </div>
          </section>

          <section className="section-block category-products">
            <div className="section-header compact">
              <div>
                <span className="eyebrow">{activeCategory?.title} marketplace</span>
                <h2>Choose a trusted referral opportunity.</h2>
              </div>
              <button type="button" className="secondary-btn" onClick={() => openCategoryPage('credit')}>Credit cards</button>
            </div>
            <div className="product-grid">
              {filteredProducts.map((product) => (
                <div key={product.id} onClick={() => openProductDetails(product)} className="product-clickable">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </section>

          <section className="section-block partner-section">
            <div className="section-header compact">
              <div>
                <span className="eyebrow">Available referral partners</span>
                <h2>Choose a verified person before you start.</h2>
                <p className="section-description">Compare referral success rates and select a person to see their process and code. No request is needed.</p>
              </div>
              <div className="partner-filters">
                {[
                  ['all', 'All partners'],
                  ['employee', 'Organization employees'],
                  ['user', 'Verified account holders'],
                ].map(([type, label]) => (
                  <button key={type} type="button" className={partnerType === type ? 'filter active' : 'filter'} onClick={() => setPartnerType(type)}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="partner-grid">
              {visiblePartners.map((partner) => (
                <article className={`partner-card ${selectedPartner?.id === partner.id ? 'selected' : ''}`} key={partner.id}>
                  <div className="partner-card-top">
                    <div className={`partner-avatar ${partner.type}`}>{partner.name.charAt(0)}</div>
                    <div>
                      <h3>{partner.name}</h3>
                      <p>{partner.role}</p>
                    </div>
                    <span className={`partner-type ${partner.type}`}>{partner.type === 'employee' ? 'Employee' : 'User'}</span>
                  </div>
                  <div className="partner-product">{partner.product}</div>
                  <div className="partner-stats">
                    <div><strong>{partner.rate}</strong><span>Referral rate</span></div>
                    <div><strong>{partner.completed}</strong><span>Completed</span></div>
                    <div><strong>{partner.rating}</strong><span>Rating</span></div>
                  </div>
                  <p className="partner-proof">{partner.proof} · {partner.location}</p>
                  <button type="button" className="primary-btn wide" onClick={() => setSelectedPartner(partner)}>
                    {selectedPartner?.id === partner.id ? 'Selected partner' : 'See referral process'}
                  </button>
                </article>
              ))}
            </div>

            {selectedPartner && (
              <div className="partner-detail">
                <div>
                  <span className="eyebrow">Selected referral partner</span>
                  <h3>{selectedPartner.name} · {selectedPartner.product}</h3>
                  <p>{selectedPartner.proof}. Follow these steps through the official provider channel.</p>
                </div>
                <ol className="partner-process">
                  {selectedPartner.process.map((step) => <li key={step}>{step}</li>)}
                </ol>
                <div className="referral-code-box">
                  <span>Demo referral code</span>
                  <strong>{selectedPartner.code}</strong>
                  <small>Use only on the official {selectedPartner.product} provider page.</small>
                </div>
              </div>
            )}
          </section>

          <section className="verification-section">
            <div className="verification-copy">
              <span className="eyebrow">Authorized partner program</span>
              <h2>Only accept referrals from verified employees.</h2>
              <p>
                A company employee can share an official referral opportunity, but ReferLink
                reviews their work identity first. Never pay anyone who cannot prove their connection
                to the corresponding provider.
              </p>
              <div className="verification-points">
                <span>Work email from the provider</span>
                <span>Employee or working ID</span>
                <span>Recent payslip or employment proof</span>
              </div>
            </div>

            <form className="verification-form" onSubmit={handleEmployeeVerification}>
              <h3>Become an authorized {activeCategory?.title} partner</h3>
              <label className="auth-field">
                <span>Company or provider</span>
                <input name="company" value={employeeForm.company} onChange={handleEmployeeChange} placeholder="e.g. HDFC Bank" />
              </label>
              <label className="auth-field">
                <span>Official work email</span>
                <input type="email" name="workEmail" value={employeeForm.workEmail} onChange={handleEmployeeChange} placeholder="name@company.com" />
              </label>
              <label className="auth-field">
                <span>Employee / working ID</span>
                <input name="workId" value={employeeForm.workId} onChange={handleEmployeeChange} placeholder="Your employee ID" />
              </label>
              <label className="upload-field">
                <span>Last payslip or employment proof</span>
                <input type="file" name="proofName" accept=".pdf,.png,.jpg,.jpeg" onChange={handleEmployeeChange} />
              </label>
              <label className="auth-field">
                <span>Official referral code</span>
                <input name="referralCode" value={employeeForm.referralCode} onChange={handleEmployeeChange} placeholder="e.g. HDFC-EMP-1234" />
              </label>
              {employeeStatus && <div className="auth-success">{employeeStatus}</div>}
              <button type="submit" className="primary-btn wide">Submit employee referral</button>
              <small>Demo mode: files are represented by their filename and are not uploaded to a server.</small>
            </form>
          </section>

          <section className="verification-section normal-user-section">
            <div className="verification-copy">
              <span className="eyebrow">Verified account holder program</span>
              <h2>Have a real account? Become a community referrer.</h2>
              <p>Normal users can list referrals too. Submit proof that you own or use the corresponding account so people can distinguish genuine users from anonymous requests.</p>
              <div className="verification-points">
                <span>Account ownership proof</span>
                <span>Identity verification</span>
                <span>Referral history review</span>
              </div>
            </div>

            <form className="verification-form" onSubmit={handleUserProofSubmit}>
              <h3>Verify your {activeCategory?.title} account</h3>
              <label className="auth-field">
                <span>Account type or provider</span>
                <input name="accountType" value={userProofForm.accountType} onChange={handleUserProofChange} placeholder="e.g. HDFC credit card" />
              </label>
              <label className="auth-field">
                <span>Account reference</span>
                <input name="accountId" value={userProofForm.accountId} onChange={handleUserProofChange} placeholder="Last four digits or member ID" />
              </label>
              <label className="auth-field">
                <span>Aadhaar number</span>
                <input name="aadhaar" inputMode="numeric" maxLength="12" value={userProofForm.aadhaar} onChange={handleUserProofChange} placeholder="12-digit Aadhaar number" />
              </label>
              <label className="auth-field">
                <span>Phone number</span>
                <div className="verify-phone-row">
                  <input name="phone" type="tel" maxLength="10" value={userProofForm.phone} onChange={(event) => { handleUserProofChange(event); setUserPhoneVerified(false) }} placeholder="10-digit phone number" />
                  <button type="button" className="secondary-btn" onClick={verifyUserPhone}>{userPhoneVerified ? 'Verified' : 'Verify'}</button>
                </div>
              </label>
              <label className="upload-field">
                <span>Ownership or statement proof</span>
                <input type="file" name="proofName" accept=".pdf,.png,.jpg,.jpeg" onChange={handleUserProofChange} />
              </label>
              <label className="auth-field">
                <span>Your referral code</span>
                <input name="referralCode" value={userProofForm.referralCode} onChange={handleUserProofChange} placeholder="e.g. USER-REF-1234" />
              </label>
              {userProofStatus && <div className="auth-success">{userProofStatus}</div>}
              <button type="submit" className="primary-btn wide">Submit user referral</button>
              <small>Demo mode: files are represented by their filename and are not uploaded to a server.</small>
            </form>
          </section>
        </main>
      ) : (
      <main>
        <section className="hero-section" id="platform">
          <div className="hero-copy">
            <span className="eyebrow">A practical referral directory</span>
            <h1>Find a referral from someone who has actually used it.</h1>
            <p>
              Compare popular products, see who is sharing the referral, and follow the
              official provider process. ReferLink keeps the useful details in one place.
            </p>

            <div className="cta-row">
              <button className="primary-btn" type="button" onClick={() => openAuth('register')}>
                Browse referrals
              </button>
              <button className="secondary-btn" type="button" onClick={() => document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' })}>
                Explore categories
              </button>
            </div>

            <div className="stats-grid">
              {stats.map((stat) => (
                <div className="stat-box" key={stat.label}>
                  <strong>{stat.value}</strong>
                  <span>{stat.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="hero-panel">
            <div className="panel-top">
              <span className="panel-badge">Example listing</span>
              <span className="panel-score">Verified profile</span>
            </div>

            <div className="profile-box">
              <div className="mini-avatar">P</div>
              <div>
                <h3>Priya Sharma</h3>
                <p>Verified referrer, 21 successful referrals</p>
              </div>
            </div>

            <div className="product-summary">
              <span className="summary-label">Product</span>
              <h4>HDFC MoneyBack Credit Card</h4>
            </div>

            <div className="score-list">
              <div>
                <span>Product match</span>
                <strong>40%</strong>
              </div>
              <div>
                <span>Response rate</span>
                <strong>97%</strong>
              </div>
              <div>
                <span>Rating</span>
                <strong>4.9/5</strong>
              </div>
            </div>

              <button className="primary-btn wide" type="button" onClick={() => openAuth('register')}>
              See referral options
            </button>
          </div>
        </section>

        <section className="section-block overview-section" id="overview">
          <div className="overview-copy">
            <span className="eyebrow">How ReferLink works</span>
            <h2>Useful information before you click apply.</h2>
            <p>
              Each listing shows the product, the person sharing it, and the steps they
              followed. You decide whether the offer is right for you.
            </p>
          </div>

          <div className="overview-metrics">
            <div className="overview-metric">
              <span>Referral conversion</span>
              <strong>68%</strong>
              <div className="metric-progress"><span style={{ width: '68%' }}></span></div>
              <small>Requests that move from interest to a completed referral</small>
            </div>
            <div className="overview-metric">
              <span>Average response time</span>
              <strong>18 min</strong>
              <small>Typical time for a verified referrer to respond</small>
            </div>
            <div className="overview-metric">
              <span>Successful outcomes</span>
              <strong>8,670</strong>
              <small>Completed referrals across the ReferLink marketplace</small>
            </div>
          </div>
        </section>

        <section className="section-block" id="products">
          <div className="section-header">
            <div>
              <span className="eyebrow">Popular products</span>
              <h2>
                {selectedCategory === 'all'
                  ? 'Choose a product that fits your profile.'
                  : `${categoryCollections.find((category) => category.id === selectedCategory)?.title ?? 'Selected'} products`}
              </h2>
            </div>
            <div className="filter-tags">
              <button
                type="button"
                className={selectedCategory === 'all' ? 'filter active' : 'filter'}
                onClick={() => setSelectedCategory('all')}
              >
                All
              </button>
              {categoryCollections.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  className={selectedCategory === category.id ? 'filter active' : 'filter'}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.title}
                </button>
              ))}
            </div>
          </div>

          <div className="product-grid">
            {filteredProducts.map((product) => (
              <div key={product.id} onClick={() => openProductDetails(product)} className="product-clickable">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </section>

        <section className="section-block" id="categories">
          <div className="section-header">
            <div>
              <span className="eyebrow">Explore categories</span>
              <h2>More referral categories beyond credit cards.</h2>
            </div>
          </div>

          <div className="category-grid">
            {categoryCollections.map((category) => (
              <button
                key={category.id}
                type="button"
                className={`category-card accent-${category.accent}`}
                onClick={() => {
                  setSelectedCategory(category.id)
                  document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })
                }}
              >
                <img className="category-image" src={category.image} alt={`${category.title} referral options`} />
                <span className="category-label">{category.title}</span>
                <h3>{category.title}</h3>
                <p>{category.description}</p>
                <div className="category-providers">
                  {category.providers.map((provider) => (
                    <span key={provider}>{provider}</span>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="section-block" id="my-referrals">
          <div className="section-header compact">
            <div>
              <span className="eyebrow">My referrals</span>
              <h2>Every request, response, and outcome in one place.</h2>
            </div>
            <button type="button" className="secondary-btn" onClick={() => openAuth('register')}>Create referral</button>
          </div>

          <div className="referral-list">
            {referralRecords.map((referral) => (
              <article className="referral-row" key={referral.id}>
                <div className="referral-main">
                  <span className="referral-id">{referral.id} · {referral.created}</span>
                  <h3>{referral.product}</h3>
                  <p>{referral.provider} · Referrer: {referral.referrer}</p>
                </div>
                <div className="referral-progress">
                  <span>{referral.progress}</span>
                  <div className="progress-track"><span style={{ width: referral.conversion }}></span></div>
                </div>
                <span className={`status-pill ${referral.status.toLowerCase()}`}>{referral.status}</span>
              </article>
            ))}
          </div>
        </section>

        <section className="section-block dashboard-section" id="dashboard">
          <div className="section-header compact">
            <div>
              <span className="eyebrow">Referral tracking</span>
              <h2>See completed, pending, and converting referrals at a glance.</h2>
            </div>
          </div>

          <div className="dashboard-grid">
            <div className="dashboard-card">
              <h3>My Referral</h3>
              <div className="request-summary">
                <div>
                  <span className="summary-label">Product</span>
                  <strong>HDFC Credit Card</strong>
                </div>
                <span className="status-pill success">Accepted</span>
              </div>

              <ol className="timeline">
                {lifecycle.map((step, index) => (
                  <li key={step} className={index < 2 ? 'active' : ''}>
                    <span className="dot"></span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="dashboard-card analytics">
              <h3>Referral performance</h3>
              <div className="metric-stack">
                <div>
                  <span>Total requests</span>
                  <strong>32</strong>
                </div>
                <div>
                  <span>Pending</span>
                  <strong>7</strong>
                </div>
                <div>
                  <span>Completed</span>
                  <strong>18</strong>
                </div>
                <div>
                  <span>Conversion</span>
                  <strong>68%</strong>
                </div>
              </div>

              <div className="chart-heading"><span>Monthly conversion</span><strong>Jan - Jun</strong></div>
              <div className="bar-chart" aria-label="Monthly referral conversion graph">
                <span style={{ height: '48%' }}><small>48%</small></span>
                <span style={{ height: '58%' }}><small>58%</small></span>
                <span style={{ height: '52%' }}><small>52%</small></span>
                <span style={{ height: '68%' }}><small>68%</small></span>
                <span style={{ height: '74%' }}><small>74%</small></span>
                <span style={{ height: '82%' }}><small>82%</small></span>
              </div>
              <div className="chart-labels"><span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span></div>
            </div>
          </div>

          <div className="connection-grid">
            <div className="connection-card">
              <span className="eyebrow">Referred me</span>
              <h3>People who referred you</h3>
              {connections.length > 0 ? connections.slice(-3).map((connection) => (
                <div className="connection-row" key={`${connection.code}-${connection.createdAt}`}>
                  <div><strong>{connection.partner}</strong><span>{connection.product}</span></div>
                  <span className="status-pill completed">Code used</span>
                </div>
              )) : <p className="empty-connection">Select a referral partner and click “You referred me” to record the connection.</p>}
            </div>
            <div className="connection-card">
              <span className="eyebrow">I referred</span>
              <h3>People you referred</h3>
              {connections.length > 0 ? connections.slice(-3).map((connection) => (
                <div className="connection-row" key={`${connection.referredUserEmail}-${connection.createdAt}`}>
                  <div><strong>{connection.referredUser}</strong><span>{connection.product} · {connection.code}</span></div>
                  <span className="status-pill accepted">Attributed</span>
                </div>
              )) : <p className="empty-connection">Your outgoing referral relationships will appear here.</p>}
            </div>
          </div>
        </section>
      </main>
      )}
    </div>
  )
}

export default App
