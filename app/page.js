import ChatWidget from "@/components/ChatWidget";
import knowledgeBase from "@/lib/knowledgeBase";

const SERVICE_ICONS = ["🚨", "🚿", "🔥", "🚽", "🛁"];

const STATS = [
  { value: "500+", label: "Jobs completed" },
  { value: "4.9★", label: "Average rating" },
  { value: "24/7", label: "Emergency line" },
  { value: "12-mo", label: "Workmanship warranty" },
];

const TESTIMONIALS = [
  {
    quote:
      "Had a burst pipe at 11pm and someone was at our door within the hour. Fixed, cleaned up, gone by midnight.",
    name: "Dana R.",
    context: "Emergency leak repair, Hollow Creek",
  },
  {
    quote:
      "Got a clear quote before anything started, no surprise fees on the bill. Will use them again.",
    name: "Marcus T.",
    context: "Water heater install, Metro Ridge",
  },
  {
    quote:
      "Asked their chat widget a pricing question at midnight and got a real answer instantly instead of waiting for a callback.",
    name: "Priya S.",
    context: "Drain cleaning, Pinewood Heights",
  },
];

export default function HomePage() {
  return (
    <main style={s.page}>
      <header style={s.header}>
        <div style={s.nav}>
          <div style={s.logo}>🔧 AquaFix Plumbing</div>
          <nav style={s.navLinks}>
            <a href="#services" className="nav-link">Services</a>
            <a href="#pricing" className="nav-link">Pricing</a>
            <a href="#reviews" className="nav-link">Reviews</a>
            <a href="#faq" className="nav-link">FAQ</a>
            <a href="#contact" className="nav-link">Contact</a>
          </nav>
        </div>

        <div style={s.hero}>
          <h1 style={s.h1}>{knowledgeBase.business.tagline}</h1>
          <p style={s.heroSub}>
            Licensed, bonded, and insured plumbers serving Metro Ridge and the
            surrounding suburbs. Got a question? Click the chat bubble in the
            bottom-right corner — our AI assistant knows our real pricing,
            hours, and policies.
          </p>
          <div style={s.heroCtas}>
            <a href={`tel:${knowledgeBase.business.phone}`} className="btn-primary">
              Call {knowledgeBase.business.phone}
            </a>
            <a href="#contact" className="btn-secondary">Get a Free Quote</a>
          </div>
        </div>

        <div style={s.statsBar}>
          {STATS.map((stat) => (
            <div key={stat.label} className="stat-card">
              <div style={s.statValue}>{stat.value}</div>
              <div style={s.statLabel}>{stat.label}</div>
            </div>
          ))}
        </div>
      </header>

      <section id="services" style={s.section}>
        <h2 style={s.h2}>Services</h2>
        <div style={s.grid}>
          {knowledgeBase.services.map((svc, i) => (
            <div key={svc.name} className="service-card">
              <div style={s.cardIcon}>{SERVICE_ICONS[i]}</div>
              <h3 style={s.cardTitle}>{svc.name}</h3>
              <p style={s.cardPrice}>{svc.price}</p>
              <p style={s.cardNotes}>{svc.notes}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="pricing" style={{ ...s.section, background: "#f2f7fa" }}>
        <h2 style={s.h2}>Hours &amp; Service Area</h2>
        <div style={s.twoCol}>
          <div>
            <h3 style={s.h3}>Hours</h3>
            <ul style={s.list}>
              {knowledgeBase.hours.map((h) => (
                <li key={h.day}>
                  <strong>{h.day}:</strong> {h.time}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 style={s.h3}>Service Area</h3>
            <p>{knowledgeBase.serviceArea}</p>
          </div>
        </div>
      </section>

      <section id="reviews" style={s.section}>
        <h2 style={s.h2}>What Customers Say</h2>
        <div style={s.grid}>
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="testimonial-card">
              <p style={s.testimonialQuote}>&ldquo;{t.quote}&rdquo;</p>
              <p style={s.testimonialName}>{t.name}</p>
              <p style={s.testimonialContext}>{t.context}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="faq" style={{ ...s.section, background: "#f2f7fa" }}>
        <h2 style={s.h2}>Frequently Asked Questions</h2>
        <div style={s.faqList}>
          {knowledgeBase.faqs.map((f) => (
            <details key={f.q} className="faq-item">
              <summary style={s.faqQ}>{f.q}</summary>
              <p style={s.faqA}>{f.a}</p>
            </details>
          ))}
        </div>
        <p style={s.faqNote}>
          Don't see your question? Ask the chat assistant in the bottom-right corner —
          it's built on this exact FAQ and pricing data.
        </p>
      </section>

      <footer id="contact" style={s.footer}>
        <p>
          {knowledgeBase.business.name} · {knowledgeBase.business.address} ·{" "}
          {knowledgeBase.business.phone} · {knowledgeBase.business.email}
        </p>
        <p style={s.footerNote}>
          See{" "}
          <a href="/embed-demo.html" style={s.footerLink}>
            embed-demo.html
          </a>{" "}
          for an example of the same widget embedded on a plain HTML page via a
          single script tag.
        </p>
      </footer>

      <ChatWidget />
    </main>
  );
}

const s = {
  page: { fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", color: "#1a2733" },
  header: { background: "linear-gradient(135deg,#0b6e99,#0a5678)", color: "#fff" },
  nav: {
    maxWidth: 1000,
    margin: "0 auto",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "18px 24px",
  },
  logo: { fontWeight: 800, fontSize: 18 },
  navLinks: { display: "flex", gap: 22 },
  hero: { maxWidth: 720, margin: "0 auto", padding: "56px 24px 48px", textAlign: "center" },
  h1: { fontSize: 36, lineHeight: 1.2, margin: "0 0 16px" },
  heroSub: { fontSize: 16, opacity: 0.92, marginBottom: 28 },
  heroCtas: { display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" },
  statsBar: {
    maxWidth: 900,
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 12,
    padding: "0 24px 56px",
  },
  statValue: { fontSize: 24, fontWeight: 800 },
  statLabel: { fontSize: 12.5, opacity: 0.85, marginTop: 4 },
  section: { maxWidth: 1000, margin: "0 auto", padding: "56px 24px" },
  h2: { fontSize: 26, marginBottom: 24 },
  h3: { fontSize: 17, marginBottom: 10 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px,1fr))", gap: 16 },
  cardIcon: { fontSize: 22, marginBottom: 10 },
  cardTitle: { fontSize: 16, margin: "0 0 8px" },
  cardPrice: { color: "#0b6e99", fontWeight: 700, margin: "0 0 8px" },
  cardNotes: { fontSize: 13.5, color: "#4a5b66", margin: 0 },
  twoCol: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 },
  list: { lineHeight: 1.9, paddingLeft: 18 },
  testimonialQuote: { fontSize: 14.5, lineHeight: 1.6, color: "#2b3a44", margin: "0 0 14px" },
  testimonialName: { fontWeight: 700, fontSize: 13.5, margin: 0 },
  testimonialContext: { fontSize: 12.5, color: "#6b7a83", margin: "2px 0 0" },
  faqList: { display: "flex", flexDirection: "column", gap: 10 },
  faqQ: { fontWeight: 600, padding: "12px 0" },
  faqA: { marginTop: -6, marginBottom: 14, color: "#3d4d57", fontSize: 14.5 },
  faqNote: { marginTop: 20, fontSize: 13.5, color: "#5b6b75" },
  footer: { background: "#0a1f2b", color: "#cfe0e8", textAlign: "center", padding: "32px 24px", fontSize: 13.5 },
  footerNote: { marginTop: 8, opacity: 0.8 },
  footerLink: { color: "#7fc7e6" },
};
