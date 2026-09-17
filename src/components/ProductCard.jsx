function ProductCard({ product }) {
  return (
    <article className={`product-card accent-${product.accent}`}>
      <div className="card-header">
        <span className="product-tag">{product.category}</span>
        {product.verified && <span className="verified-pill">✓ Verified</span>}
      </div>

      <h3>{product.name}</h3>
      <p className="provider">{product.provider}</p>

      <div className="metrics-row">
        <div>
          <span className="metric-label">Annual fee</span>
          <strong>{product.annualFee}</strong>
        </div>
        <div>
          <span className="metric-label">Referrers</span>
          <strong>{product.availableReferrers}</strong>
        </div>
      </div>

      <p className="benefit">{product.cashback}</p>

      <div className="card-footer">
        <div>
          <span className="match-label">Match</span>
          <strong>{product.match}%</strong>
        </div>
        <button className="primary-btn small" type="button">Get referral</button>
      </div>
    </article>
  )
}

export default ProductCard
