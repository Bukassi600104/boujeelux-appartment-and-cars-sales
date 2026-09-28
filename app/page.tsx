import { ArrowRight, Menu, MessageCircle } from "lucide-react";

const makes = ["Lexus", "Mercedes-Benz", "Toyota"];

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
          <a href="#featured">Cars</a>
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
            <a href="#featured">Cars</a>
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
    </main>
  );
}
