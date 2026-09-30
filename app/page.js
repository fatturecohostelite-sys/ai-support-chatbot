import ChatWidget from "@/components/ChatWidget";

export default function HomePage() {
  return (
    <main className="mandy-page">
      <section className="mandy-shell">
        <header className="mandy-brand">
          <div className="mandy-mark" aria-label="Homy Host">HH</div>
          <h1>Mandy</h1>
          <p>Esperta AI sul mandato di Homy Host</p>
        </header>

        <div className="mandy-layout">
          <section className="mandy-info" aria-labelledby="mandy-info-title">
            <div className="mandy-info-icon" aria-hidden="true">🤖</div>
            <div>
              <h2 id="mandy-info-title">
                Mandy è un’esperta AI addestrata sul nuovo mandato Homy Host.
              </h2>
              <p>
                Il suo compito è aiutarti a capire le differenze tra il contratto attuale e il nuovo
                modello, spiegando anche gli aspetti economici, fiscali e operativi.
              </p>
              <p>
                Per ottenere il massimo, falle domande su questi argomenti. Può provare a rispondere
                anche ad altro, ma non dispone necessariamente di tutte le informazioni.
              </p>
              <p>
                <strong>Mandy può spiegare e semplificare</strong>, anche questioni tecniche, ma non
                può negoziare, modificare condizioni o creare eccezioni personalizzate.
              </p>
              <p>
                <strong>Sul mandato, invece, puoi metterla alla prova.</strong> Chiedile dettagli,
                falle domande tecniche o chiedile di rispiegarti qualcosa in modo più semplice.
              </p>
            </div>
          </section>

          <div className="mandy-chat-column">
            <ChatWidget />
          </div>
        </div>
      </section>
    </main>
  );
}
