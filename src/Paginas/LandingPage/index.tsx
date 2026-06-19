import { useEffect, useState } from "react";
import "./landingPage.css"
import { Link } from "react-router-dom";

const LandingPage: React.FC = () => {
// 1. Estados
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Funciones del menú móvil
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMob = () => setIsMobileMenuOpen(false);

  // 2. Efecto para el Navbar Scrolled
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    // Verificar estado inicial
    handleScroll(); 
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 3. Efecto para accesibilidad del Menú Móvil (Escape y scroll lock)
  useEffect(() => {
    // Bloquear scroll del body si el menú está abierto
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    // Cerrar con tecla Escape
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMob();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = ''; // Limpieza
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMobileMenuOpen]);

  // 4. Efectos visuales (Scroll Reveal y Contadores)
  useEffect(() => {
    /* --- Scroll reveal --- */
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('on');
          revealObserver.unobserve(e.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.rv').forEach((el) => revealObserver.observe(el));

    /* --- Counters --- */
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        
        const el = e.target as HTMLElement;
        const targetAttr = el.dataset.target;
        if (!targetAttr) return;

        const end = parseInt(targetAttr, 10);
        const inc = end / (1800 / 16);
        let cur = 0;
        
        const t = setInterval(() => {
          cur = Math.min(cur + inc, end);
          el.textContent = Math.floor(cur).toString();
          
          if (cur >= end) clearInterval(t);
        }, 16);
        
        counterObserver.unobserve(el);
      });
    }, { threshold: 0.5 });

    document.querySelectorAll('.counter').forEach((c) => counterObserver.observe(c));

    return () => {
      revealObserver.disconnect();
      counterObserver.disconnect();
    };
  }, []); // Se ejecuta una vez al montar el componente

  // 5. Efecto para el Smooth Scroll de los enlaces internos
  useEffect(() => {
    const handleSmoothScroll = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Buscamos si el click provino de un enlace con href que empiece por '#'
      const a = target.closest('a[href^="#"]');
      
      if (a) {
        const href = a.getAttribute('href');
        if (href === '#' || href === '#contacto') return;
        
        const targetElement = document.querySelector(href || '');
        if (targetElement) {
          e.preventDefault();
          targetElement.scrollIntoView({ behavior: 'smooth' });
          closeMob(); // Cerramos el menú móvil automáticamente al navegar
        }
      }
    };

    document.addEventListener('click', handleSmoothScroll);
    return () => document.removeEventListener('click', handleSmoothScroll);
  }, []);
  return (
    <>
      {/* ════════════════ NAVBAR ════════════════ */}
      <nav className={`nav ${isScrolled ? 'scrolled' : ''}`} id="nav">
        <div className="nav-inner">
          <a href="#inicio" className="nav-logo">
            <div className="nav-logo-mark">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="34" height="34">
                <rect width="500" height="500" fill="#0D1654" rx="80" />
                <circle cx="270" cy="255" r="155" fill="#0A1248" opacity="0.7" />
                <line x1="130" y1="365" x2="130" y2="115" stroke="white" strokeWidth="52" strokeLinecap="round" />
                <line x1="130" y1="115" x2="370" y2="365" stroke="white" strokeWidth="52" strokeLinecap="round" />
                <line x1="370" y1="115" x2="370" y2="365" stroke="#F5A020" strokeWidth="52" strokeLinecap="round" />
                <circle cx="130" cy="115" r="14" fill="#F5A020" />
              </svg>
            </div>
            <span className="nav-logo-name">NEXIA</span>
          </a>

          <ul className="nav-links">
            <li><a href="#features">Funcionalidades</a></li>
            <li><a href="#how">Cómo funciona</a></li>
            <li><a href="#planes">Planes</a></li>
            <li><a href="#testimonios">Testimonios</a></li>
          </ul>

          <div className="nav-actions">
            <Link to="/login" className="nav-login">Iniciar Sesión</Link>
            <a href="#demo" className="btn btn-cta btn-desk">Solicitar demo</a>
          </div>

          <button 
            className="hamburger" 
            id="hamburger" 
            aria-label="Menú" 
            aria-expanded={isMobileMenuOpen}
            onClick={toggleMobileMenu}
          >
            <span></span><span></span><span></span>
          </button>
        </div>
      </nav>

      {/* Menú Móvil - Depende del CSS original para mostrarse u ocultarse, podrías agregar una clase dinámica aquí como className={`mob-nav ${isMobileMenuOpen ? 'open' : ''}`} */}
      {isMobileMenuOpen && (
        <div className="mob-nav" id="mobNav">
          <a href="#features" onClick={closeMob}>Funcionalidades</a>
          <a href="#how" onClick={closeMob}>Cómo funciona</a>
          <a href="#planes" onClick={closeMob}>Planes</a>
          <a href="#testimonios" onClick={closeMob}>Testimonios</a>
          <Link to="/login" className="mob-login">Iniciar sesión →</Link>
        </div>
      )}

      {/* ════════════════ HERO ════════════════ */}
      <section className="hero" id="inicio">
        <div className="wrap hero-body">
          {/* Left */}
          <div className="hero-left">
            <div className="hero-eyebrow">
              <span className="hero-dot"></span>
              <span className="hero-kicker">IA Pedagógica · SaaS Educativo · Argentina</span>
            </div>

            <h1 className="hero-h1">
              La plataforma que<br />
              <span className="accent">transforma</span><br />
              la educación.
            </h1>

            <p className="hero-sub">
              NEXIA democratiza el acceso a la tecnología educativa con una IA diseñada para enseñar, no para dar respuestas. Para cada institución del país.
            </p>

            <div className="hero-ctas">
              <a href="#demo" className="btn btn-cta btn-lg">Solicitar demo gratuita</a>
              <a href="#how" className="btn btn-out-d btn-lg">Ver cómo funciona</a>
            </div>

            <div className="hero-proof">
              <div className="hero-avs">
                <div className="hero-av">MC</div>
                <div className="hero-av">JP</div>
                <div className="hero-av">LA</div>
                <div className="hero-av">SR</div>
              </div>
              <p className="hero-proof-txt"><strong>+200 instituciones</strong> ya usan NEXIA</p>
            </div>
          </div>

          {/* Right — light dashboard mockup */}
          <div className="hero-right">
            <div className="dash-frame">
              <div className="db-chrome">
                <div className="db-dots">
                  <div className="db-dot d-r"></div>
                  <div className="db-dot d-y"></div>
                  <div className="db-dot d-g"></div>
                </div>
                <div className="db-url"><span>app.nexia.edu · Dashboard</span></div>
              </div>
              <div className="db-app">
                <div className="db-sb">
                  <div className="db-ico on"></div>
                  <div className="db-ico"></div>
                  <div className="db-ico"></div>
                  <div className="db-ico"></div>
                  <div className="db-ico"></div>
                </div>
                <div className="db-main">
                  <div className="db-topbar">
                    <span className="db-title">Dashboard general</span>
                    <div className="db-ava"></div>
                  </div>
                  <div className="db-kpis">
                    <div className="db-kpi"><div className="db-n on">87%</div><div className="db-l">Asistencia</div></div>
                    <div className="db-kpi"><div className="db-n">142</div><div className="db-l">Alumnos</div></div>
                    <div className="db-kpi"><div className="db-n on">12</div><div className="db-l">Materias</div></div>
                  </div>
                  <div className="db-chart">
                    <div className="db-chart-lbl">Rendimiento — últimas 7 semanas</div>
                    <div className="db-bars">
                      <div className="db-bar" style={{ height: '42%' }}></div>
                      <div className="db-bar" style={{ height: '60%' }}></div>
                      <div className="db-bar" style={{ height: '48%' }}></div>
                      <div className="db-bar hi" style={{ height: '84%' }}></div>
                      <div className="db-bar" style={{ height: '67%' }}></div>
                      <div className="db-bar" style={{ height: '55%' }}></div>
                      <div className="db-bar hi" style={{ height: '93%' }}></div>
                    </div>
                  </div>
                  <div className="db-tasks">
                    <div className="db-task"><div className="db-tdot" style={{ background: '#22C55E' }}></div><div className="db-tbar"></div><div className="db-tbadge"></div></div>
                    <div className="db-task"><div className="db-tdot" style={{ background: 'var(--orange)' }}></div><div className="db-tbar"></div><div className="db-tbadge"></div></div>
                    <div className="db-task"><div className="db-tdot" style={{ background: 'var(--navy-l)' }}></div><div className="db-tbar"></div><div className="db-tbadge"></div></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="fl-card fl1">
              <div className="fl-ico" style={{ background: 'var(--navy-ghost)' }}>📊</div>
              <div><div className="fl-val">−38%</div><div className="fl-lbl">Menos repitencia</div></div>
            </div>
            <div className="fl-card fl2">
              <div className="fl-ico" style={{ background: 'var(--orange-xs)' }}>🤖</div>
              <div><div className="fl-val">IA Activa</div><div className="fl-lbl">Tutor pedagógico 24/7</div></div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════ LOGOS ════════════════ */}
      <section className="logos-bar">
        <div className="wrap">
          <p className="logos-lbl">Instituciones que ya confían en NEXIA</p>
          <div className="logos-row">
            <span className="logo-chip">Colegio San Martín</span>
            <span className="logo-chip">Instituto Belgrano</span>
            <span className="logo-chip">Escuela N.º&nbsp;14</span>
            <span className="logo-chip">Colegio Del Valle</span>
            <span className="logo-chip">Instituto Rivadavia</span>
            <span className="logo-chip">E.T. N.º&nbsp;7</span>
          </div>
        </div>
      </section>

      {/* ════════════════ PROBLEM ════════════════ */}
      <section className="problem-sec">
        <div className="wrap">
          <div className="prob-header rv">
            <div className="eyebrow ey-n">El problema</div>
            <h2>El sistema educativo argentino<br />enfrenta un desafío real</h2>
            <p>No por falta de vocación. Sino por falta de las herramientas que el resto tiene desde hace años.</p>
          </div>

          <div className="prob-grid">
            <div className="prob-card rv">
              <div className="prob-num gr-n">42<span style={{ fontSize: '30px' }}>%</span></div>
              <div className="prob-title">Tasa de repitencia</div>
              <div className="prob-desc">En escuelas públicas argentinas, casi la mitad de los estudiantes repite por falta de seguimiento.</div>
            </div>
            <div className="prob-card rv d1">
              <div className="prob-num gr-n">7<span style={{ fontSize: '30px' }}>/10</span></div>
              <div className="prob-title">Docentes sin plataforma</div>
              <div className="prob-desc">La mayoría gestiona comunicación, entregas y clases a través de WhatsApp o papel.</div>
            </div>
            <div className="prob-card rv d2">
              <div className="prob-num gr-n">0</div>
              <div className="prob-title">Herramientas digitales</div>
              <div className="prob-desc">La mayoría de escuelas públicas no cuenta con ningún campus virtual ni sistema de gestión.</div>
            </div>
          </div>

          <div className="prob-answer rv">
            <h3>Creamos NEXIA para cambiar eso.</h3>
            <p>Una plataforma SaaS accesible para cualquier institución — pública o privada — que centraliza toda la experiencia educativa y la potencia con inteligencia artificial pedagógica real.</p>
          </div>
        </div>
      </section>

      {/* ════════════════ FEATURES BENTO ════════════════ */}
      <section className="features-sec" id="features">
        <div className="wrap">
          <div className="feat-head">
            <div className="eyebrow ey-n">Funcionalidades</div>
            <h2>Todo lo que tu institución<br />necesita, en un solo lugar</h2>
            <p>Desde la gestión de contenidos hasta la comunicación en tiempo real. NEXIA centraliza toda la experiencia educativa.</p>
          </div>

          <div className="bento">
            {/* IA Pedagógica */}
            <div className="bc bc-wide rv">
              <div className="bc-ico ico-o">🤖</div>
              <div className="bc-title">IA Pedagógica — el diferencial de NEXIA</div>
              <div className="bc-desc">Una IA diseñada con criterio pedagógico: no da respuestas directas, sino el contexto para que el alumno piense y aprenda de verdad.</div>
              <div className="bc-ai-body">
                <div className="ai-points">
                  <div className="ai-pt"><div className="ai-ck">✓</div>Accede al material real de cada docente para orientar por materia específica</div>
                  <div className="ai-pt"><div className="ai-ck">✓</div>Fomenta la lectura, el razonamiento crítico y el aprendizaje genuino</div>
                  <div className="ai-pt"><div className="ai-ck">✓</div>Disponible 24/7 como tutor personal de cada alumno sin costo extra</div>
                  <div className="ai-pt"><div className="ai-ck">✓</div>Reduce el uso irresponsable de tecnología en el aula</div>
                </div>
                <div className="mini-chat">
                  <div className="mc-head">
                    <div className="mc-ava">🤖</div>
                    <div style={{ flex: 1 }}><div className="mc-name">NEXIA AI · Asistente Pedagógico</div></div>
                    <div className="mc-dot"></div>
                  </div>
                  <div className="mm mm-u">¿Cuáles son las causas de la Primera Guerra Mundial?</div>
                  <div className="mm mm-a">Para analizarlo bien, primero entendamos el contexto: en 1914 Europa vivía un sistema de alianzas muy tenso. ¿Qué factores creés que podrían haber generado esa tensión?</div>
                  <div className="mm mm-u">Quizás el nacionalismo y las rivalidades...</div>
                </div>
              </div>
            </div>

            {/* Calendar */}
            <div className="bc rv d1">
              <div className="bc-ico ico-n">📅</div>
              <div className="bc-title">Calendario Académico</div>
              <div className="bc-desc">Exámenes, entregas y eventos con notificaciones automáticas para toda la comunidad.</div>
              <div className="mc-cal">
                <div className="mc-cal-lbl">Junio 2025</div>
                <div className="mc-cal-grid">
                  <div className="cal-d">L</div><div className="cal-d">M</div><div className="cal-d">X</div>
                  <div className="cal-d">J</div><div className="cal-d">V</div><div className="cal-d">S</div><div className="cal-d">D</div>
                  <div className="cal-d">2</div><div className="cal-d ev">3</div><div className="cal-d">4</div>
                  <div className="cal-d">5</div><div className="cal-d today">6</div><div className="cal-d">7</div><div className="cal-d">8</div>
                  <div className="cal-d">9</div><div className="cal-d dot">10</div><div className="cal-d">11</div>
                  <div className="cal-d">12</div><div className="cal-d ev">13</div><div className="cal-d">14</div><div className="cal-d">15</div>
                </div>
              </div>
            </div>

            {/* Messaging */}
            <div className="bc rv">
              <div className="bc-ico ico-n">💬</div>
              <div className="bc-title">Mensajería Integrada</div>
              <div className="bc-desc">Chat entre alumnos y docentes, grupos por materia y comunicados desde dirección.</div>
              <div className="mini-users">
                <div className="mu"><div className="mu-av" style={{ background: 'var(--navy)' }}>MC</div><div className="mu-lines"><div className="mu-l"></div><div className="mu-l"></div></div><div className="mu-tag">Nuevo</div></div>
                <div className="mu"><div className="mu-av" style={{ background: 'var(--orange-d)' }}>JP</div><div className="mu-lines"><div className="mu-l"></div><div className="mu-l"></div></div><div className="mu-tag">Nuevo</div></div>
                <div className="mu"><div className="mu-av" style={{ background: '#6A1B9A' }}>LA</div><div className="mu-lines"><div className="mu-l"></div><div className="mu-l"></div></div><span style={{ fontSize: '9px', color: 'var(--t4)' }}>Hoy</span></div>
              </div>
            </div>

            {/* Content */}
            <div className="bc rv d1">
              <div className="bc-ico ico-n">📂</div>
              <div className="bc-title">Gestión de Contenidos</div>
              <div className="bc-desc">PDFs, presentaciones y videos organizados por materia y accesibles desde cualquier dispositivo.</div>
              <div className="mini-files">
                <div className="mf"><div className="mf-ico">📄</div><div><div className="mf-n">Guía de estudio — Cap.4</div><div className="mf-s">Historia · 2.4 MB</div></div><div className="mf-b">PDF</div></div>
                <div className="mf"><div className="mf-ico">📊</div><div><div className="mf-n">Presentación — Revolución</div><div className="mf-s">Historia · 8.1 MB</div></div><div className="mf-b">PPT</div></div>
                <div className="mf"><div className="mf-ico">🔗</div><div><div className="mf-n">Video documental</div><div className="mf-s">Historia · YouTube</div></div><div className="mf-b">URL</div></div>
              </div>
            </div>

            {/* Dashboard */}
            <div className="bc rv d2">
              <div className="bc-ico ico-o">📊</div>
              <div className="bc-title">Dashboard Inteligente</div>
              <div className="bc-desc">Vista en tiempo real de actividades, calificaciones y progreso para alumnos y docentes.</div>
              <div className="mini-dash">
                <div className="md-kpis">
                  <div className="md-k"><div className="md-n gr-o">87%</div><div className="md-l">Asistencia</div></div>
                  <div className="md-k"><div className="md-n gr-n">4/5</div><div className="md-l">Entregas</div></div>
                </div>
                <div className="md-bars">
                  <div className="mb-b" style={{ height: '40%' }}></div><div className="mb-b h" style={{ height: '70%' }}></div>
                  <div className="mb-b" style={{ height: '55%' }}></div><div className="mb-b h" style={{ height: '90%' }}></div>
                  <div className="mb-b" style={{ height: '60%' }}></div><div className="mb-b h" style={{ height: '80%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════ HOW IT WORKS ════════════════ */}
      <section className="how-sec" id="how">
        <div className="wrap">
          <div className="how-head rv">
            <div className="eyebrow ey-n">Proceso</div>
            <h2>Comenzá en horas,<br />no en meses</h2>
            <p>Onboarding guiado y soporte dedicado para que tu institución esté operativa desde el primer día.</p>
          </div>
          <div className="steps">
            <div className="step rv"><div className="step-n">1</div><div className="step-title">Registrá tu institución</div><p className="step-desc">Completá el alta con los datos de tu colegio y elegí el plan que mejor se adapte a tus necesidades.</p></div>
            <div className="step rv d1"><div className="step-n">2</div><div className="step-title">Personalizá tu espacio</div><p className="step-desc">Logo, colores institucionales y estructura académica. NEXIA se adapta a tu identidad visual.</p></div>
            <div className="step rv d2"><div className="step-n">3</div><div className="step-title">Invitá a tu comunidad</div><p className="step-desc">Importá docentes y alumnos en minutos. Nuestro equipo te acompaña en todo el proceso.</p></div>
            <div className="step rv d3"><div className="step-n">4</div><div className="step-title">Transformá tu institución</div><p className="step-desc">Impacto en seguimiento académico, comunicación y resultados desde el primer día de uso.</p></div>
          </div>
        </div>
      </section>

      {/* ════════════════ STATS ════════════════ */}
      <section className="stats-sec">
        <div className="wrap">
          <div className="stats-grid">
            <div className="stat-bl rv"><div className="stat-n"><span className="counter" data-target="500">0</span><em>+</em></div><div className="stat-l">Instituciones activas</div></div>
            <div className="stat-bl rv d1"><div className="stat-n"><span className="counter" data-target="50">0</span><em>K+</em></div><div className="stat-l">Estudiantes beneficiados</div></div>
            <div className="stat-bl rv d2"><div className="stat-n"><span className="counter" data-target="38">0</span><em>%</em></div><div className="stat-l">Reducción de repitencia</div></div>
            <div className="stat-bl rv d3"><div className="stat-n"><span className="counter" data-target="98">0</span><em>%</em></div><div className="stat-l">Satisfacción docente</div></div>
          </div>
        </div>
      </section>

      {/* ════════════════ TESTIMONIALS ════════════════ */}
      <section className="test-sec" id="testimonios">
        <div className="wrap">
          <div className="test-head rv">
            <div className="eyebrow ey-n">Testimonios</div>
            <h2>Lo que dicen quienes<br />ya usan NEXIA</h2>
            <p>Docentes, directivos y estudiantes que transformaron su institución.</p>
          </div>
          <div className="test-grid">
            <article className="test-card rv">
              <div className="test-stars">★★★★★</div>
              <p className="test-text">"NEXIA cambió completamente cómo gestiono mi materia. El seguimiento de entregas y la comunicación son fluidos y profesionales. No puedo imaginar volver a WhatsApp para coordinar clases."</p>
              <div className="test-rule"></div>
              <div className="test-who"><div className="test-av">MC</div><div><div className="test-name">María Carmen Rodríguez</div><div className="test-role">Docente de Historia · Colegio San Martín</div></div></div>
            </article>
            <article className="test-card rv d1">
              <div className="test-stars">★★★★★</div>
              <p className="test-text">"La IA pedagógica es el diferencial que buscábamos. Los alumnos aprenden de verdad porque tienen que razonar. Los resultados en los exámenes mejoraron notablemente desde que implementamos NEXIA."</p>
              <div className="test-rule"></div>
              <div className="test-who"><div className="test-av" style={{ background: 'linear-gradient(135deg,#F57C00,#FF9800)' }}>JP</div><div><div className="test-name">Jorge Palomino</div><div className="test-role">Director · Instituto Belgrano</div></div></div>
            </article>
            <article className="test-card rv d2">
              <div className="test-stars">★★★★★</div>
              <p className="test-text">"Por fin tengo todo organizado: materiales, fechas de entrega, y puedo consultar dudas con la IA a cualquier hora. El dashboard me ayuda a no perder de vista ninguna tarea pendiente."</p>
              <div className="test-rule"></div>
              <div className="test-who"><div className="test-av" style={{ background: 'linear-gradient(135deg,#6A1B9A,#9C27B0)' }}>LG</div><div><div className="test-name">Lucía González</div><div className="test-role">Alumna 5.° año · E.T. N.º 7</div></div></div>
            </article>
          </div>
        </div>
      </section>

      {/* ════════════════ PRICING ════════════════ */}
      <section className="price-sec" id="planes">
        <div className="wrap">
          <div className="price-head rv">
            <div className="eyebrow ey-o">Planes y Precios</div>
            <h2>Un plan para cada institución</h2>
            <p>Sin costos ocultos. Sin contratos largos. Cancelá cuando quieras.</p>
          </div>
          <div className="price-grid">
            <div className="pc rv">
              <div className="pc-tier">Starter</div>
              <div className="pc-price">$4.900<sub>/mes</sub></div>
              <p className="pc-desc">Para instituciones pequeñas que comienzan su transformación digital.</p>
              <div className="pc-hr"></div>
              <div className="pc-feats">
                <div className="pc-feat"><div className="pc-ck">✓</div>Hasta 150 alumnos</div>
                <div className="pc-feat"><div className="pc-ck">✓</div>10 docentes incluidos</div>
                <div className="pc-feat"><div className="pc-ck">✓</div>Calendario y mensajería</div>
                <div className="pc-feat"><div className="pc-ck">✓</div>Dashboard básico</div>
                <div className="pc-feat"><div className="pc-ck">✓</div>Soporte por email</div>
              </div>
              <a href="#demo" className="btn-pc-out">Empezar prueba gratis</a>
            </div>
            <div className="pc pc-pop rv d1">
              <div className="pc-badge">Más popular</div>
              <div className="pc-tier">Profesional</div>
              <div className="pc-price">$12.900<sub>/mes</sub></div>
              <p className="pc-desc">Para instituciones que quieren aprovechar todo el potencial con IA incluida.</p>
              <div className="pc-hr"></div>
              <div className="pc-feats">
                <div className="pc-feat"><div className="pc-ck">✓</div>Hasta 800 alumnos</div>
                <div className="pc-feat"><div className="pc-ck">✓</div>Docentes ilimitados</div>
                <div className="pc-feat"><div className="pc-ck">✓</div>IA Pedagógica</div>
                <div className="pc-feat"><div className="pc-ck">✓</div>Analíticas avanzadas</div>
                <div className="pc-feat"><div className="pc-ck">✓</div>Personalización institucional</div>
                <div className="pc-feat"><div className="pc-ck">✓</div>Soporte prioritario 24/7</div>
              </div>
              <a href="#demo" className="btn-pc-cta">Solicitar demo</a>
            </div>
            <div className="pc rv d2">
              <div className="pc-tier">Enterprise</div>
              <div className="pc-price" style={{ fontSize: '28px', letterSpacing: '-1px' }}>A medida</div>
              <p className="pc-desc">Para redes de colegios, municipios o ministerios de educación.</p>
              <div className="pc-hr"></div>
              <div className="pc-feats">
                <div className="pc-feat"><div className="pc-ck">✓</div>Alumnos ilimitados</div>
                <div className="pc-feat"><div className="pc-ck">✓</div>Multi-institución</div>
                <div className="pc-feat"><div className="pc-ck">✓</div>IA personalizada por red</div>
                <div className="pc-feat"><div className="pc-ck">✓</div>API e integraciones propias</div>
                <div className="pc-feat"><div className="pc-ck">✓</div>SLA garantizado</div>
                <div className="pc-feat"><div className="pc-ck">✓</div>Gerente de cuenta dedicado</div>
              </div>
              <a href="#contacto" className="btn-pc-out">Contactar ventas</a>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════ CTA FINAL ════════════════ */}
      <section className="cta-sec" id="demo">
        <div className="cta-gl cg1"></div>
        <div className="cta-gl cg2"></div>
        <div className="wrap">
          <div className="cta-inner">
            <h2 className="cta-h2">Tu institución merece<br />tecnología de <em>primer nivel</em></h2>
            <p className="cta-sub">Únete a las instituciones que ya están reduciendo la repitencia y transformando la experiencia educativa en Argentina.</p>
            <div className="cta-btns">
              <a href="#" className="btn btn-cta btn-lg">Solicitar demo gratuita</a>
              <a href="#planes" className="btn btn-out-w btn-lg">Ver planes y precios</a>
            </div>
            <p className="cta-note">30 días de prueba gratuita · Cancelá cuando quieras</p>
          </div>
        </div>
      </section>

      {/* ════════════════ FOOTER ════════════════ */}
      <footer className="footer">
        <div className="wrap">
          <div className="footer-grid">
            <div>
              <div className="footer-brand">
                <div className="footer-brand-mark">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="30" height="30">
                    <rect width="500" height="500" fill="#0D1654" rx="80" />
                    <circle cx="270" cy="255" r="155" fill="#0A1248" opacity="0.7" />
                    <line x1="130" y1="365" x2="130" y2="115" stroke="white" strokeWidth="52" strokeLinecap="round" />
                    <line x1="130" y1="115" x2="370" y2="365" stroke="white" strokeWidth="52" strokeLinecap="round" />
                    <line x1="370" y1="115" x2="370" y2="365" stroke="#F5A020" strokeWidth="52" strokeLinecap="round" />
                    <circle cx="130" cy="115" r="14" fill="#F5A020" />
                  </svg>
                </div>
                <span className="footer-brand-name">NEXIA</span>
              </div>
              <p className="footer-tagline">Democratizando el acceso a la tecnología educativa en Argentina y Latinoamérica. Una IA que enseña a pensar.</p>
              <div className="footer-socials">
                <div className="fsoc">in</div><div className="fsoc">𝕏</div>
                <div className="fsoc">ig</div><div className="fsoc">▶</div>
              </div>
            </div>
            <nav className="fc">
              <h4>Plataforma</h4>
              <ul>
                <li><a href="#">Funcionalidades</a></li>
                <li><a href="#">IA Pedagógica</a></li>
                <li><a href="#">Dashboard</a></li>
                <li><a href="#">Integraciones</a></li>
                <li><a href="#">Seguridad</a></li>
              </ul>
            </nav>
            <nav className="fc">
              <h4>Empresa</h4>
              <ul>
                <li><a href="#">Acerca de NEXIA</a></li>
                <li><a href="#">El equipo</a></li>
                <li><a href="#">Impacto social</a></li>
                <li><a href="#">Blog educativo</a></li>
                <li><a href="#">Prensa</a></li>
              </ul>
            </nav>
            <nav className="fc">
              <h4>Soporte</h4>
              <ul>
                <li><a href="#">Centro de ayuda</a></li>
                <li><a href="#">Documentación</a></li>
                <li><a href="#">Contacto</a></li>
                <li><a href="#">Estado del sistema</a></li>
              </ul>
            </nav>
          </div>
          <div className="footer-bottom">
            <p className="footer-copy">© 2025 NEXIA — Desarrollado por estudiantes de 5.° año Informática, ORT Argentina.</p>
            <div className="footer-legal">
              <a href="#">Privacidad</a><a href="#">Términos de uso</a><a href="#">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default LandingPage;