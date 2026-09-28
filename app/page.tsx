import { ArrowRight, Menu, MessageCircle } from "lucide-react";

const makes = ["Lexus", "Mercedes-Benz", "Toyota"];

const inventory = [
  { name: "Lexus LX 600", make: "Lexus", image: "/inventory/lexus-lx600.webp", alt: "Front view of a dark grey Lexus LX 600" },
  { name: "2019 Toyota Corolla", make: "Toyota", image: "/inventory/toyota-corolla-2019.webp", alt: "Blue 2019 Toyota Corolla from the front side" },
  { name: "Mercedes-Benz GLE", make: "Mercedes-Benz", image: "/inventory/mercedes-gle-white.webp", alt: "White Mercedes-Benz GLE from the front side" },
  { name: "2017 Lexus RX 350", make: "Lexus", image: "/inventory/lexus-rx350-2017.webp", alt: "Black 2017 Lexus RX 350 from the front side" },
  { name: "2018 Mercedes-Benz GLE 350", make: "Mercedes-Benz", image: "/inventory/mercedes-gle-350.webp", alt: "Dark blue 2018 Mercedes-Benz GLE 350 from the rear side" },
  { name: "Lexus RX 350", make: "Lexus", image: "/inventory/lexus-rx350-blue.webp", alt: "Blue Lexus RX 350 from the front side" },
];

export default function Home() {
  return (
    <main className="page-shell" id="home">
      <header className="site-header">
        <a className="wordmark" href="#home" aria-label="Chida Moore Automobiles home">
          <span>CHIDA MOORE</span>
          <small>AUTOMOBILES</small>
        </a>

        <nav className="desktop-nav" aria-label="Primary navigation">
          <a className="active" href="#home">Home</a>
          <a href="#inventory">Cars</a>
          <a href="#makes">Brands</a>
          <a href="#contact">Contact</a>
        </nav>

        <a className="nav-cta" href="https://wa.me/" target="_blank" rel="noreferrer">
          WhatsApp enquiry <ArrowRight aria-hidden="true" size={17} />
        </a>

        <details className="mobile-nav">
          <summary aria-label="Open navigation"><Menu aria-hidden="true" size={23} /></summary>
          <nav aria-label="Mobile navigation">
            <a href="#home">Home</a>
            <a href="#inventory">Cars</a>
            <a href="#makes">Brands</a>
            <a href="https://wa.me/" target="_blank" rel="noreferrer">WhatsApp enquiry</a>
          </nav>
        </details>
      </header>

      <section className="hero" id="featured" aria-labelledby="hero-title">
        <div className="hero-monogram" aria-hidden="true">CHIDA</div>

        <div className="hero-copy">
          <p className="eyebrow">Premium motoring, personally selected</p>
          <h1 id="hero-title">Your Journey,<br />Your Car,<br />Your Way.</h1>
          <p className="hero-description">Find the right vehicle for the way you live, drive and move.</p>
          <a className="mobile-primary" href="https://wa.me/" target="_blank" rel="noreferrer">
            Enquire on WhatsApp <ArrowRight aria-hidden="true" size={18} />
          </a>
        </div>

        <div className="vehicle-visual">
          <div className="vehicle-meta left" aria-hidden="true">
            <strong>2017</strong>
            <span>Model year</span>
          </div>
          <img
            src="/lexus-rx350-cutout.webp"
            alt="Front view of a black 2017 Lexus RX 350 with its headlights on"
            width="1278"
            height="1278"
            fetchPriority="high"
          />
          <div className="vehicle-shadow" aria-hidden="true" />
        </div>

        <aside className="hero-aside" id="contact">
          <div className="vehicle-meta">
            <strong>RX 350</strong>
            <span>Featured Lexus</span>
          </div>
          <div className="enquiry-note">
            <span className="gold-dot" aria-hidden="true" />
            <p>Interested in this vehicle?</p>
            <small>Speak directly with our sales team.</small>
          </div>
          <a className="primary-cta" href="https://wa.me/" target="_blank" rel="noreferrer">
            Get started <ArrowRight aria-hidden="true" size={18} />
          </a>
        </aside>
      </section>

      <section className="make-strip" id="makes" aria-label="Selected marques">
        <p>Selected marques</p>
        <div className="make-list">
          {makes.map((make) => <span key={make}>{make}</span>)}
        </div>
        <a href="https://wa.me/" target="_blank" rel="noreferrer">
          Source a vehicle <MessageCircle aria-hidden="true" size={17} />
        </a>
      </section>

      <section className="inventory-section" id="inventory" aria-labelledby="inventory-title">
        <div className="inventory-inner">
          <header className="inventory-header">
            <div>
              <p className="inventory-eyebrow">Available now</p>
              <h2 id="inventory-title">Selected vehicles</h2>
            </div>
            <p>Explore a curated selection from our current inventory.</p>
          </header>

          <div className="inventory-grid">
            {inventory.map((vehicle, index) => (
              <article className="vehicle-card" key={vehicle.name}>
                <div className="card-number" aria-hidden="true">0{index + 1}</div>
                <div className="card-image-stage">
                  <img src={vehicle.image} alt={vehicle.alt} width="1100" height="760" loading="lazy" />
                  <span className="card-ground-shadow" aria-hidden="true" />
                </div>
                <div className="card-content">
                  <div>
                    <p>{vehicle.make}</p>
                    <h3>{vehicle.name}</h3>
                  </div>
                  <span className="availability"><i aria-hidden="true" /> Available</span>
                  <a href="#contact">Explore vehicle <ArrowRight aria-hidden="true" size={18} /></a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
