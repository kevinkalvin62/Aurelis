import { HeroStory } from "../components/hero-story";
import { ProductFrame } from "../components/product-frame";
import { Reveal } from "../components/reveal";
import { WaitlistCta } from "../components/waitlist-cta";

const certainties = [
  "Sabes qué tocarás.",
  "Sabes cuándo tocarás.",
  "Sabes que todos tienen la misma versión.",
];

export default function Home() {
  return (
    <main>
      <HeroStory />
      <section id="aurelis" className="story-section story-section--intro scroll-mt-8">
        <Reveal className="story-copy">
          <p className="eyebrow">Aurelis</p>
          <h2>
            Que tu ensayo empiece haciendo música.<span>No buscando archivos.</span>
          </h2>
          <p className="support-copy">
            Aurelis reúne canciones, programas y materiales para que cada músico llegue preparado
            antes del primer acorde.
          </p>
        </Reveal>
        <Reveal delay={0.12} className="product-stage">
          <ProductFrame
            src="/screens/home.png"
            alt="Pantalla real de inicio de Aurelis con el próximo programa y el repertorio reciente"
            label="Todo listo antes del primer acorde."
            priority
          />
        </Reveal>
      </section>

      <section className="story-section story-section--dark">
        <Reveal className="story-copy story-copy--narrow">
          <p className="story-number">01</p>
          <h2>Cada ensayo debería empezar aquí.</h2>
          <div className="certainty-list">
            {certainties.map((certainty) => (
              <p key={certainty}>{certainty}</p>
            ))}
          </div>
        </Reveal>
        <Reveal delay={0.1} className="product-stage product-stage--offset">
          <ProductFrame
            src="/screens/home.png"
            alt="Home real de Aurelis mostrando el siguiente programa"
          />
        </Reveal>
      </section>

      <section className="story-section story-section--reverse">
        <Reveal className="product-stage">
          <ProductFrame
            src="/screens/library.png"
            alt="Biblioteca real de Aurelis con búsqueda y repertorio ordenado"
            label="Tu repertorio, cuando lo necesitas."
          />
        </Reveal>
        <Reveal delay={0.1} className="story-copy">
          <p className="story-number">02</p>
          <h2>Encontrar una canción debería tomar segundos.</h2>
          <p className="support-copy">
            Escribes un nombre. La encuentras. Y vuelves a lo que estabas haciendo: música.
          </p>
        </Reveal>
      </section>

      <section className="program-story">
        <Reveal className="program-story__heading">
          <p className="story-number">03</p>
          <h2>El orden del evento ya no vive en WhatsApp.</h2>
          <p className="support-copy">
            El programa, la tonalidad y el material correcto viajan juntos.
          </p>
        </Reveal>
        <div className="program-story__screens">
          <Reveal className="program-screen program-screen--list">
            <ProductFrame
              src="/screens/programs.png"
              alt="Lista real de programas musicales en Aurelis"
            />
          </Reveal>
          <Reveal delay={0.12} className="program-screen program-screen--detail">
            <ProductFrame
              src="/screens/program-detail.png"
              alt="Programa real con canciones, instrumentos y tonalidades"
            />
          </Reveal>
          <Reveal delay={0.22} className="program-screen program-screen--song">
            <ProductFrame
              src="/screens/song.png"
              alt="Canción real con controles de transporte musical"
            />
          </Reveal>
        </div>
      </section>

      <section className="organization-story">
        <Reveal className="organization-story__copy">
          <p className="story-number">04</p>
          <h2>Cada integrante sabe qué debe tocar antes del ensayo.</h2>
          <p className="support-copy">
            Una biblioteca compartida. Un programa claro. La tranquilidad de llegar hablando el
            mismo idioma.
          </p>
        </Reveal>
        <div className="organization-story__screens">
          <Reveal className="org-screen org-screen--library">
            <ProductFrame
              src="/screens/organization-library.png"
              alt="Biblioteca compartida real de una organización en Aurelis"
            />
          </Reveal>
          <Reveal delay={0.14} className="org-screen org-screen--programs">
            <ProductFrame
              src="/screens/organization-programs.png"
              alt="Programas reales compartidos por una organización"
            />
          </Reveal>
        </div>
      </section>

      <section className="manifesto-section">
        <Reveal className="manifesto-section__inner">
          <p className="eyebrow">Nuestra filosofía</p>
          <blockquote>
            “No creemos que una aplicación deba pedir tu atención.
            <span>Creemos que debe devolverte tiempo.</span>Ese tiempo pertenece a la música.”
          </blockquote>
        </Reveal>
      </section>

      <section className="future-section">
        <Reveal className="future-section__inner">
          <p className="story-number">05</p>
          <h2>La música también merece tener memoria.</h2>
          <div className="future-copy">
            <p>Imagina abrir Aurelis dentro de cinco años.</p>
            <p>
              Recordar tu primera canción. Tu primer servicio. Los músicos con quienes compartiste
              escenario.
            </p>
            <p>Las canciones que marcaron una etapa.</p>
          </div>
          <p className="future-closing">
            No queremos guardar archivos.<span>Queremos conservar historias.</span>
          </p>
        </Reveal>
      </section>

      <section id="acompananos" className="cta-section">
        <Reveal className="cta-section__inner">
          <p className="eyebrow">Estamos construyendo Aurelis</p>
          <h2>Déjanos acompañarte desde el primer acorde.</h2>
          <p>Si quieres ser de los primeros músicos en probarla, este lugar también es tuyo.</p>
          <WaitlistCta />
        </Reveal>
      </section>

      <footer>
        <span className="footer-mark">A</span>
        <p>Aurelis</p>
        <p>La música siempre ocupa el centro.</p>
      </footer>
    </main>
  );
}
