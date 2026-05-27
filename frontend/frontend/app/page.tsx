import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--surface)] text-[var(--on-surface)]">
      <nav className="fixed top-0 z-50 w-full glass-nav">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
          <div className="text-2xl font-black tracking-tight text-[var(--primary)]">
            TunHire
          </div>
          <div className="hidden items-center gap-8 md:flex">
            <a
              className="text-sm font-semibold text-[var(--on-surface-variant)] transition-colors hover:text-[var(--primary)]"
              href="#candidats"
            >
              Candidats
            </a>
            <a
              className="text-sm font-semibold text-[var(--on-surface-variant)] transition-colors hover:text-[var(--primary)]"
              href="#recruteurs"
            >
              Recruteurs
            </a>
            <a
              className="text-sm font-semibold text-[var(--on-surface-variant)] transition-colors hover:text-[var(--primary)]"
              href="#ia"
            >
              IA &amp; Matching
            </a>
            <a
              className="text-sm font-semibold text-[var(--on-surface-variant)] transition-colors hover:text-[var(--primary)]"
              href="#apropos"
            >
              À propos
            </a>
          </div>
          <div className="flex items-center gap-4">
            <Link
              className="hidden text-sm font-semibold text-[var(--on-surface-variant)] transition-colors hover:text-[var(--primary)] sm:inline-flex"
              href="/login"
            >
              Connexion
            </Link>
            <Link
              className="rounded-2xl bg-[var(--primary)] px-6 py-2.5 text-sm font-semibold text-[var(--on-primary)] shadow-lg transition-transform hover:-translate-y-0.5"
              href="/login?view=register"
            >
              Inscription
            </Link>
          </div>
        </div>
      </nav>

      <header className="relative overflow-hidden pb-20 pt-32">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_#00daf328,_#f7f9fb_60%)]" />
        <div className="absolute -right-20 top-16 h-72 w-72 rounded-full bg-[#00daf3]/10 blur-3xl" />
        <div className="absolute -left-16 bottom-10 h-72 w-72 rounded-full bg-[#69ff87]/10 blur-3xl" />
        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-12 px-6 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <span className="label-uppercase inline-flex rounded-full bg-[#00e3fd]/20 px-4 py-1.5 text-[10px] font-bold text-[var(--secondary)]">
              Recrutement augmenté
            </span>
            <h1 className="mt-6 font-headline text-5xl font-extrabold leading-[1.05] text-[var(--primary)] md:text-7xl">
              Le recrutement d'exception en Tunisie,
              <span className="block text-[var(--secondary)]">propulsé par l'IA.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-[var(--on-surface-variant)] md:text-xl">
              TunHire connecte les talents premium aux entreprises ambitieuses grâce à une analyse sémantique locale, des scores de compatibilité transparents et une expérience éditoriale soignée.
            </p>

            <div className="mt-10 flex max-w-3xl flex-col gap-3 rounded-3xl bg-[var(--surface-container-lowest)] p-3 editorial-shadow md:flex-row md:items-center">
              <div className="flex flex-1 items-center gap-3 rounded-2xl bg-[var(--surface-container-low)] px-4">
                <span className="h-2 w-2 rounded-full bg-[var(--secondary)]" />
                <input
                  aria-label="Métier ou compétence"
                  className="w-full bg-transparent py-4 text-sm font-medium text-[var(--on-surface)] placeholder:text-[var(--on-surface-variant)] focus:outline-none"
                  placeholder="Métier ou compétence"
                  type="text"
                />
              </div>
              <div className="flex flex-1 items-center gap-3 rounded-2xl bg-[var(--surface-container-low)] px-4">
                <span className="h-2 w-2 rounded-full bg-[var(--secondary)]" />
                <input
                  aria-label="Ville"
                  className="w-full bg-transparent py-4 text-sm font-medium text-[var(--on-surface)] placeholder:text-[var(--on-surface-variant)] focus:outline-none"
                  placeholder="Tunis, Sfax, Sousse..."
                  type="text"
                />
              </div>
              <button
                className="rounded-2xl bg-[var(--secondary)] px-8 py-4 text-sm font-semibold text-white transition-colors hover:bg-[var(--primary)]"
                type="button"
              >
                Trouver des opportunités
              </button>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-3">
                  <img
                    alt="Professionnelle tunisienne"
                    className="h-10 w-10 rounded-full border-2 border-white object-cover"
                    loading="lazy"
                    src="https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=200&q=80"
                  />
                  <img
                    alt="Ingénieur tunisien"
                    className="h-10 w-10 rounded-full border-2 border-white object-cover"
                    loading="lazy"
                    src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80"
                  />
                  <img
                    alt="Équipe tech"
                    className="h-10 w-10 rounded-full border-2 border-white object-cover"
                    loading="lazy"
                    src="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=200&q=80"
                  />
                </div>
                <p className="text-sm font-medium text-[var(--on-surface-variant)]">
                  Déjà adopté par <span className="font-bold text-[var(--primary)]">500+</span> entreprises tech
                </p>
              </div>
              <div className="flex items-center gap-8">
                <div>
                  <p className="text-2xl font-headline font-extrabold text-[var(--primary)]">94%</p>
                  <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--on-surface-variant)]">
                    précision IA
                  </p>
                </div>
                <div>
                  <p className="text-2xl font-headline font-extrabold text-[var(--primary)]">48h</p>
                  <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--on-surface-variant)]">
                    shortlists
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative lg:col-span-5">
            <div className="relative overflow-hidden rounded-[2.5rem] bg-[var(--surface-container-lowest)] editorial-shadow">
              <img
                alt="Bureau moderne à Tunis"
                className="h-[560px] w-full object-cover"
                loading="lazy"
                src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=900&q=80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#001e40]/65 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 flex items-center gap-4 rounded-2xl bg-white/85 p-5 backdrop-blur-xl">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#00e3fd]/30 text-[var(--secondary)]">
                  <span className="text-lg font-bold">AI</span>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--secondary)]">
                    Match prioritaire
                  </p>
                  <p className="text-sm font-semibold text-[var(--primary)]">
                    Lead Data Engineer recommandé
                  </p>
                </div>
                <div className="ml-auto rounded-full bg-gradient-to-r from-[#006875] to-[#69ff87] px-3 py-1 text-xs font-bold text-white">
                  98% compatibilité
                </div>
              </div>
            </div>
            <div className="absolute -right-6 top-12 hidden rounded-3xl bg-[var(--surface-container-highest)] p-5 text-[var(--primary)] ambient-shadow lg:block">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Score IA</p>
              <p className="mt-2 text-3xl font-headline font-extrabold">9.6</p>
              <p className="text-xs text-[var(--on-surface-variant)]">Ajustement culturel</p>
            </div>
          </div>
        </div>
      </header>

      <section id="ia" className="bg-[var(--surface-container-low)] py-24">
        <div className="mx-auto w-full max-w-7xl px-6">
          <div className="text-center">
            <p className="label-uppercase text-[10px] font-bold text-[var(--secondary)]">Cadre de précision</p>
            <h2 className="mt-4 font-headline text-4xl font-extrabold text-[var(--primary)] md:text-5xl">
              Une intelligence recrutement de bout en bout
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-[var(--on-surface-variant)]">
              Notre moteur analyse le marché tunisien en temps réel, compare les compétences et anticipe la compatibilité pour réduire les erreurs de recrutement.
            </p>
          </div>
          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="rounded-[2rem] bg-[var(--surface-container-lowest)] p-8 editorial-shadow">
              <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#00e3fd]/20 text-[var(--secondary)]">
                <span className="text-2xl font-bold">01</span>
              </div>
              <h3 className="font-headline text-xl font-bold text-[var(--primary)]">Matching cognitif</h3>
              <p className="mt-3 text-sm leading-relaxed text-[var(--on-surface-variant)]">
                Des scores de compatibilité expliqués, basés sur la technicité, la culture d'entreprise et le potentiel d'évolution.
              </p>
              <div className="mt-6 flex items-center gap-2">
                <div className="h-2 w-24 rounded-full bg-gradient-to-r from-[#006875] to-[#69ff87]" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--secondary)]">IA match</span>
              </div>
            </div>
            <div className="rounded-[2rem] bg-[var(--primary)] p-8 text-white editorial-shadow md:translate-y-6">
              <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-[#00daf3]">
                <span className="text-2xl font-bold">02</span>
              </div>
              <h3 className="font-headline text-xl font-bold">Recherche sémantique</h3>
              <p className="mt-3 text-sm leading-relaxed text-white/70">
                L'IA comprend les contextes projet, les soft skills et les signaux faibles pour détecter des talents rares.
              </p>
              <div className="mt-6 rounded-xl bg-white/5 p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#00daf3]">Commande IA</p>
                <p className="mt-2 text-xs italic text-white/70">
                  "Montre-moi des designers UI ayant livré des apps fintech en Afrique du Nord."
                </p>
              </div>
            </div>
            <div className="rounded-[2rem] bg-[var(--surface-container-lowest)] p-8 editorial-shadow">
              <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#69ff87]/20 text-[#1f7a3f]">
                <span className="text-2xl font-bold">03</span>
              </div>
              <h3 className="font-headline text-xl font-bold text-[var(--primary)]">Extraction d'expertise</h3>
              <p className="mt-3 text-sm leading-relaxed text-[var(--on-surface-variant)]">
                Les CV sont transformés en profils exploitables et vérifiés par des assessments automatisés.
              </p>
              <div className="mt-6 rounded-xl bg-[var(--surface-container-low)] p-4">
                <p className="text-xs font-semibold text-[var(--primary)]">Signal IA: 12 compétences critiques détectées</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="candidats" className="py-24">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-16 px-6 lg:grid-cols-2">
          <div className="order-2 lg:order-1">
            <div className="relative rounded-[2.5rem] bg-[var(--surface-container-low)] p-4 editorial-shadow">
              <div className="rounded-[2rem] bg-[var(--surface-container-lowest)] p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-headline text-lg font-bold text-[var(--primary)]">Tableau de bord</h4>
                    <p className="text-xs text-[var(--on-surface-variant)]">Bienvenue, Ahmed</p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--surface-container-highest)] text-[var(--primary)]">
                    <span className="text-sm font-bold">3</span>
                  </div>
                </div>
                <div className="mt-10 space-y-4">
                  <div className="flex items-center justify-between rounded-2xl bg-[var(--surface)] p-4 transition-colors hover:bg-[var(--surface-container-highest)]">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--primary)] text-white">
                        TN
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[var(--primary)]">Senior UI Designer</p>
                        <p className="text-xs text-[var(--on-surface-variant)]">TechTunisia - La Marsa</p>
                      </div>
                    </div>
                    <span className="rounded-full bg-[#00e3fd]/20 px-3 py-1 text-[10px] font-bold text-[var(--secondary)]">
                      92% match
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-[var(--surface)] p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--secondary)] text-white">
                        S
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[var(--primary)]">Growth Manager</p>
                        <p className="text-xs text-[var(--on-surface-variant)]">Sousse Startup Lab - Hybride</p>
                      </div>
                    </div>
                    <span className="rounded-full bg-[#69ff87]/30 px-3 py-1 text-[10px] font-bold text-[#0b5a2a]">
                      Nouveau
                    </span>
                  </div>
                </div>
                <div className="mt-8">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--primary)]">
                    <span>Progression</span>
                    <span className="text-[var(--secondary)]">48% global</span>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-[var(--surface-container-highest)]">
                    <div className="h-2 w-1/2 rounded-full bg-[var(--secondary)]" />
                  </div>
                </div>
              </div>
              <div className="absolute -right-16 top-20 h-36 w-36 rounded-full bg-[#00daf3]/20 blur-3xl" />
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <p className="label-uppercase text-[10px] font-bold text-[var(--secondary)]">Expérience candidat</p>
            <h2 className="mt-4 font-headline text-4xl font-extrabold text-[var(--primary)] md:text-5xl">
              Des opportunités qui viennent à vous.
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-[var(--on-surface-variant)]">
              Fini le scrolling interminable. TunHire détecte les rôles qui respectent votre trajectoire, votre énergie et votre ambition.
            </p>
            <div className="mt-8 space-y-6">
              <div className="flex gap-4">
                <div className="mt-1 h-6 w-6 rounded-full bg-[#006875]/10" />
                <div>
                  <p className="text-sm font-bold text-[var(--primary)]">Compatibilité transparente</p>
                  <p className="text-sm text-[var(--on-surface-variant)]">
                    Comprenez pourquoi vous êtes en haut de la pile.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="mt-1 h-6 w-6 rounded-full bg-[#006875]/10" />
                <div>
                  <p className="text-sm font-bold text-[var(--primary)]">Badge de compétences vérifiées</p>
                  <p className="text-sm text-[var(--on-surface-variant)]">
                    Valorisez vos forces avec des tests courts et précis.
                  </p>
                </div>
              </div>
            </div>
            <button
              className="mt-10 rounded-2xl bg-[var(--primary)] px-10 py-4 text-sm font-semibold text-[var(--on-primary)] shadow-lg transition-transform hover:-translate-y-0.5"
              type="button"
            >
              Créer mon profil gratuit
            </button>
          </div>
        </div>
      </section>

      <section id="recruteurs" className="relative overflow-hidden bg-[var(--primary)] py-24 text-white">
        <div className="pointer-events-none absolute inset-0 opacity-10">
          <svg className="h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 100">
            <path d="M0,50 Q25,30 50,50 T100,50" fill="none" stroke="white" strokeWidth="0.6" />
            <path d="M0,62 Q25,42 50,62 T100,62" fill="none" stroke="white" strokeWidth="0.6" />
            <path d="M0,74 Q25,54 50,74 T100,74" fill="none" stroke="white" strokeWidth="0.6" />
          </svg>
        </div>
        <div className="relative mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-14 px-6 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <p className="label-uppercase text-[10px] font-bold text-[#00daf3]">Solutions entreprises</p>
            <h2 className="mt-4 font-headline text-4xl font-extrabold md:text-5xl">
              Un recrutement de précision à grande échelle.
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-white/70">
              Gagnez du temps sans perdre l'exigence. L'IA priorise les profils, génère des fiches de poste et orchestre vos pipelines de recrutement.
            </p>
            <div className="mt-10 grid grid-cols-2 gap-8">
              <div>
                <p className="text-3xl font-headline font-extrabold">70%</p>
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/60">
                  temps de recrutement
                </p>
              </div>
              <div>
                <p className="text-3xl font-headline font-extrabold">94%</p>
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/60">
                  taux de match
                </p>
              </div>
            </div>
            <button
              className="mt-12 rounded-2xl bg-[#00e3fd] px-10 py-4 text-sm font-semibold text-[#003366] transition-transform hover:-translate-y-0.5"
              type="button"
            >
              Planifier une démo
            </button>
          </div>
          <div className="lg:col-span-6">
            <div className="rounded-[3rem] bg-white/5 p-8 backdrop-blur-xl">
              <div className="space-y-6">
                <div className="rounded-2xl bg-white p-6 text-[var(--primary)] ambient-shadow">
                  <div className="flex items-center gap-4">
                    <img
                      alt="Candidat cloud"
                      className="h-12 w-12 rounded-full object-cover"
                      loading="lazy"
                      src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-bold">Sami Ben Jomaa</p>
                      <p className="text-xs text-[var(--on-surface-variant)]">Senior Cloud Architect</p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border-4 border-[#00daf3]/20">
                      <span className="text-[10px] font-black text-[var(--secondary)]">98</span>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="rounded-md bg-[var(--surface-container-low)] px-2 py-1 text-[10px] font-bold uppercase text-[var(--primary)]">
                      AWS Pro
                    </span>
                    <span className="rounded-md bg-[var(--surface-container-low)] px-2 py-1 text-[10px] font-bold uppercase text-[var(--primary)]">
                      Kubernetes
                    </span>
                    <span className="rounded-md bg-[var(--surface-container-low)] px-2 py-1 text-[10px] font-bold uppercase text-[var(--primary)]">
                      DevOps
                    </span>
                  </div>
                  <div className="mt-4 flex items-center gap-2 rounded-lg bg-[#69ff87]/20 p-3">
                    <span className="text-[10px] font-bold text-[#0b5a2a]">IA: top 2% Tunisie</span>
                  </div>
                </div>
                <div className="rounded-2xl bg-[#003366] p-6 text-white">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#00daf3]">
                      IA contenu
                    </p>
                    <span className="text-sm font-bold">+</span>
                  </div>
                  <p className="mt-4 text-sm text-white/70">
                    "Génère une fiche de poste pour un Lead Developer dans une fintech à Tunis, orientée sécurité et croissance."
                  </p>
                  <div className="mt-4 flex gap-2">
                    <div className="h-1 w-12 rounded-full bg-[#00daf3]" />
                    <div className="h-1 w-12 rounded-full bg-white/20" />
                    <div className="h-1 w-12 rounded-full bg-white/20" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[var(--surface-container-lowest)] py-14">
        <div className="mx-auto w-full max-w-7xl px-6">
          <p className="text-center text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--on-surface-variant)]">
            Ils font confiance à TunHire
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-12 text-[var(--primary)]/60">
            <span className="font-headline text-2xl font-extrabold tracking-tight">TECH-TN</span>
            <span className="font-headline text-2xl font-extrabold tracking-tight">CART-HAGE</span>
            <span className="font-headline text-2xl font-extrabold tracking-tight">SAHARA.AI</span>
            <span className="font-headline text-2xl font-extrabold tracking-tight">MEDITERRANEA</span>
            <span className="font-headline text-2xl font-extrabold tracking-tight">NORTHHUB</span>
          </div>
        </div>
      </section>

      <section id="apropos" className="py-24">
        <div className="mx-auto w-full max-w-7xl px-6">
          <div className="rounded-[2.5rem] bg-[var(--surface-container-low)] p-12 editorial-shadow">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
              <div>
                <p className="label-uppercase text-[10px] font-bold text-[var(--secondary)]">Vision TunHire</p>
                <h2 className="mt-4 font-headline text-4xl font-extrabold text-[var(--primary)]">
                  Une plateforme d'excellence pour le marché tunisien.
                </h2>
                <p className="mt-6 text-lg text-[var(--on-surface-variant)]">
                  Nous construisons un environnement premium, inspiré des publications éditoriales, pour offrir une expérience claire, humaine et responsable.
                </p>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-2xl bg-[var(--surface-container-lowest)] p-6">
                  <p className="text-sm font-bold text-[var(--primary)]">Éthique et confiance</p>
                  <p className="mt-2 text-sm text-[var(--on-surface-variant)]">
                    Transparence sur les scores et les données utilisées.
                  </p>
                </div>
                <div className="rounded-2xl bg-[var(--surface-container-lowest)] p-6">
                  <p className="text-sm font-bold text-[var(--primary)]">Impact local</p>
                  <p className="mt-2 text-sm text-[var(--on-surface-variant)]">
                    Conçu pour les besoins du marché tunisien et maghrébin.
                  </p>
                </div>
                <div className="rounded-2xl bg-[var(--surface-container-lowest)] p-6">
                  <p className="text-sm font-bold text-[var(--primary)]">Précision continue</p>
                  <p className="mt-2 text-sm text-[var(--on-surface-variant)]">
                    L'IA apprend en continu pour améliorer les recommandations.
                  </p>
                </div>
                <div className="rounded-2xl bg-[var(--surface-container-lowest)] p-6">
                  <p className="text-sm font-bold text-[var(--primary)]">Qualité éditoriale</p>
                  <p className="mt-2 text-sm text-[var(--on-surface-variant)]">
                    Une interface soignée pour des décisions plus rapides.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-[var(--surface-container-low)]">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-10 px-6 py-12 md:grid-cols-4">
          <div className="md:col-span-1">
            <p className="text-lg font-bold text-[var(--primary)]">TunHire</p>
            <p className="mt-3 text-xs leading-relaxed text-[var(--on-surface-variant)]">
              L'intelligence du recrutement pour le marché tunisien. Des décisions plus rapides, plus justes, plus humaines.
            </p>
          </div>
  
        </div>
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-4 px-6 pb-10 text-xs uppercase tracking-[0.2em] text-[var(--on-surface-variant)] md:flex-row">
          <p>© 2026 TunHire. Excellence IA pour le recrutement tunisien.</p>
          <div className="flex items-center gap-6">
          </div>
        </div>
      </footer>
    </div>
  );
}
