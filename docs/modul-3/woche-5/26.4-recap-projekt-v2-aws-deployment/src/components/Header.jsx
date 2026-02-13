// ===========================================================================
// HEADER.JSX - Einfache Anzeigekomponente
// ===========================================================================

function Header({ itemCount }) {
  return (
    <header className="header">
      <div className="header-content">
        <h1 className="header-title">Mini-Hub V2</h1>
        <p className="header-subtitle">
          Deine Linksammlung & Notizen
        </p>
      </div>

      <div className="header-stats">
        <span className="item-count">
          {itemCount} {itemCount === 1 ? 'Item' : 'Items'}
        </span>
      </div>
    </header>
  );
}

export default Header;
