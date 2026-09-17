function ReferrerCard({ referrer }) {
  return (
    <article className="referrer-card">
      <div className="profile-header">
        <div className="avatar">{referrer.name.charAt(0)}</div>
        <div>
          <h3>{referrer.name}</h3>
          <p>{referrer.title}</p>
        </div>
      </div>

      <div className="referrer-meta">
        <span>⭐ {referrer.rating}</span>
        <span>{referrer.location}</span>
      </div>

      <div className="match-box">
        <span>{referrer.match}% Match</span>
      </div>

      <ul className="mini-stats">
        <li>
          <strong>{referrer.successful}</strong>
          <span>Successful referrals</span>
        </li>
        <li>
          <strong>{referrer.response}%</strong>
          <span>Response rate</span>
        </li>
      </ul>

      <div className="product-pills">
        {referrer.products.map((product) => (
          <span key={product}>{product}</span>
        ))}
      </div>

      <button className="secondary-btn wide">Request Referral</button>
    </article>
  )
}

export default ReferrerCard
