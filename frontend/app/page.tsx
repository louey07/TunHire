import Link from "next/link";
import HeroSearch from "@/components/marketing/HeroSearch";

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--surface)] text-[var(--on-surface)]">
      <nav className="fixed top-0 z-50 w-full glass-nav">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
          <div className="text-2xl font-black tracking-tight text-[var(--primary)]">
            TunHire
          </div>
          <div className="hidden items-center gap-8 md:flex">
            <Link
              className="text-sm font-semibold text-[var(--on-surface-variant)] transition-colors hover:text-[var(--primary)]"
              href="/jobs"
            >
              Offres
            </Link>
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
              IA
            </a>
            <a
              className="text-sm font-semibold text-[var(--on-surface-variant)] transition-colors hover:text-[var(--primary)]"
              href="#collaboration"
            >
              Chat
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
              Plateforme de recrutement · Tunisie
            </span>
            <h1 className="mt-6 font-headline text-5xl font-extrabold leading-[1.05] text-[var(--primary)] md:text-7xl">
              Trouvez, classez et échangez
              <span className="block text-[var(--secondary)]">
                avec les bons talents.
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-[var(--on-surface-variant)] md:text-xl">
              Offres d&apos;emploi, analyse de CV par IA, classement des
              candidatures avec scores expliqués, et messagerie recruteur–candidat
              — le tout dans une interface claire et moderne.
            </p>

            <HeroSearch />

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                className="rounded-2xl bg-[var(--primary)] px-8 py-3.5 text-sm font-semibold text-[var(--on-primary)] shadow-lg transition-transform hover:-translate-y-0.5"
                href="/login?view=register"
              >
                Je cherche un emploi
              </Link>
              <Link
                className="rounded-2xl border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] px-8 py-3.5 text-sm font-semibold text-[var(--primary)] transition-transform hover:-translate-y-0.5"
                href="/login?view=register"
              >
                Je recrute
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap gap-8">
              <div>
                <p className="text-2xl font-headline font-extrabold text-[var(--primary)]">
                  CV
                </p>
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--on-surface-variant)]">
                  parsing automatique
                </p>
              </div>
              <div>
                <p className="text-2xl font-headline font-extrabold text-[var(--primary)]">
                  IA v2
                </p>
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--on-surface-variant)]">
                  scores + écarts
                </p>
              </div>
              <div>
                <p className="text-2xl font-headline font-extrabold text-[var(--primary)]">
                  Chat
                </p>
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--on-surface-variant)]">
                  temps réel
                </p>
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
              <div className="absolute bottom-6 left-6 right-6 space-y-3 rounded-2xl bg-white/90 p-5 backdrop-blur-xl">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#00e3fd]/30 text-[var(--secondary)]">
                    <span className="text-lg font-bold">AI</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--secondary)]">
                      Classement IA
                    </p>
                    <p className="text-sm font-semibold text-[var(--primary)]">
                      Développeur Full Stack — 87%
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-[#ffebee] px-2.5 py-1 text-[10px] font-semibold text-[#b71c1c]">
                    Expérience senior requise
                  </span>
                  <span className="rounded-full bg-[#fff3e0] px-2.5 py-1 text-[10px] font-semibold text-[#e65100]">
                    Remote partiel
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-[var(--on-surface-variant)]">
                  Profil solide en React et Spring Boot, avec un écart modéré sur
                  l&apos;expérience senior demandée.
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section id="ia" className="bg-[var(--surface-container-low)] py-24">
        <div className="mx-auto w-full max-w-7xl px-6">
          <div className="text-center">
            <p className="label-uppercase text-[10px] font-bold text-[var(--secondary)]">
              Intelligence recrutement
            </p>
            <h2 className="mt-4 font-headline text-4xl font-extrabold text-[var(--primary)] md:text-5xl">
              De l&apos;analyse de CV au classement expliqué
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-[var(--on-surface-variant)]">
              Le moteur IA compare profils et offres de façon structurée, avec
              des scores transparents pour aider les recruteurs à décider plus
              vite.
            </p>
          </div>
          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="rounded-[2rem] bg-[var(--surface-container-lowest)] p-8 editorial-shadow">
              <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#00e3fd]/20 text-[var(--secondary)]">
                <span className="text-2xl font-bold">01</span>
              </div>
              <h3 className="font-headline text-xl font-bold text-[var(--primary)]">
                Analyse de CV
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-[var(--on-surface-variant)]">
                Importez un PDF : compétences, formation, langues et résumé sont
                extraits automatiquement dans le profil candidat.
              </p>
              <div className="mt-6 rounded-xl bg-[var(--surface-container-low)] p-4">
                <p className="text-xs font-semibold text-[var(--primary)]">
                  12 compétences détectées · 2 langues · résumé IA
                </p>
              </div>
            </div>
            <div className="rounded-[2rem] bg-[var(--primary)] p-8 text-white editorial-shadow md:translate-y-6">
              <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-[#00daf3]">
                <span className="text-2xl font-bold">02</span>
              </div>
              <h3 className="font-headline text-xl font-bold">
                Classement hybride
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-white/70">
                Embeddings sémantiques, règles métier et analyse LLM produisent
                un score, des écarts et un résumé pour chaque candidature.
              </p>
              <div className="mt-6 flex items-center gap-2">
                <div className="h-2 w-24 rounded-full bg-gradient-to-r from-[#00daf3] to-[#69ff87]" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#00daf3]">
                  v2 rank
                </span>
              </div>
            </div>
            <div className="rounded-[2rem] bg-[var(--surface-container-lowest)] p-8 editorial-shadow">
              <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#69ff87]/20 text-[#1f7a3f]">
                <span className="text-2xl font-bold">03</span>
              </div>
              <h3 className="font-headline text-xl font-bold text-[var(--primary)]">
                Cache intelligent
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-[var(--on-surface-variant)]">
                Les scores sont mis en cache et recalculés uniquement si le
                profil ou l&apos;offre change — affichage instantané au
                reclassement.
              </p>
              <div className="mt-6 rounded-xl bg-[var(--surface-container-low)] p-4">
                <p className="text-xs font-semibold text-[var(--primary)]">
                  Sync-on-read · hash de version profil
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="collaboration" className="py-24">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-16 px-6 lg:grid-cols-2">
          <div>
            <p className="label-uppercase text-[10px] font-bold text-[var(--secondary)]">
              Collaboration
            </p>
            <h2 className="mt-4 font-headline text-4xl font-extrabold text-[var(--primary)] md:text-5xl">
              Messagerie et notifications intégrées
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-[var(--on-surface-variant)]">
              Les recruteurs contactent les candidats directement depuis la
              fiche profil. Les messages non lus et les mises à jour de statut
              apparaissent comme indicateurs dans la barre latérale.
            </p>
            <div className="mt-8 space-y-6">
              <div className="flex gap-4">
                <div className="mt-1 h-6 w-6 shrink-0 rounded-full bg-[#006875]/10" />
                <div>
                  <p className="text-sm font-bold text-[var(--primary)]">
                    Chat direct recruteur ↔ candidat
                  </p>
                  <p className="text-sm text-[var(--on-surface-variant)]">
                    WebSocket temps réel, conversations par entreprise.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="mt-1 h-6 w-6 shrink-0 rounded-full bg-[#006875]/10" />
                <div>
                  <p className="text-sm font-bold text-[var(--primary)]">
                    Badges non lus
                  </p>
                  <p className="text-sm text-[var(--on-surface-variant)]">
                    Points rouges sur Chat, Candidats et Mes candidatures.
                  </p>
                </div>
              </div>
            </div>
            <Link
              className="mt-10 inline-flex rounded-2xl bg-[var(--primary)] px-10 py-4 text-sm font-semibold text-[var(--on-primary)] shadow-lg transition-transform hover:-translate-y-0.5"
              href="/login"
            >
              Se connecter
            </Link>
          </div>
          <div className="rounded-[2.5rem] bg-[var(--surface-container-low)] p-4 editorial-shadow">
            <div className="rounded-[2rem] bg-[var(--surface-container-lowest)] p-6">
              <div className="flex items-center justify-between border-b border-[var(--outline-variant)] pb-4">
                <p className="font-headline text-sm font-bold text-[var(--primary)]">
                  Messages
                </p>
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
                </span>
              </div>
              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-3 rounded-2xl bg-[var(--surface-container-low)] p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--primary)] text-xs font-bold text-white">
                    MR
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[var(--primary)]">
                      Marie R. — TechCorp
                    </p>
                    <p className="text-xs text-[var(--on-surface-variant)]">
                      Bonjour, votre profil nous intéresse…
                    </p>
                  </div>
                  <span className="h-2 w-2 rounded-full bg-red-500" />
                </div>
                <div className="flex items-center gap-3 rounded-2xl p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--secondary)] text-xs font-bold text-white">
                    TH
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[var(--primary)]">
                      Équipe TechCorp
                    </p>
                    <p className="text-xs text-[var(--on-surface-variant)]">
                      Entretien confirmé pour jeudi
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="candidats" className="bg-[var(--surface-container-low)] py-24">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-16 px-6 lg:grid-cols-2">
          <div className="order-2 lg:order-1">
            <div className="relative rounded-[2.5rem] bg-[var(--surface-container-lowest)] p-4 editorial-shadow">
              <div className="rounded-[2rem] bg-[var(--surface)] p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-headline text-lg font-bold text-[var(--primary)]">
                      Mes candidatures
                    </h4>
                    <p className="text-xs text-[var(--on-surface-variant)]">
                      Suivi en temps réel
                    </p>
                  </div>
                  <span className="relative flex h-3 w-3">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500" />
                  </span>
                </div>
                <div className="mt-8 space-y-4">
                  <div className="flex items-center justify-between rounded-2xl bg-[var(--surface-container-low)] p-4">
                    <div>
                      <p className="text-sm font-semibold text-[var(--primary)]">
                        Développeur Full Stack
                      </p>
                      <p className="text-xs text-[var(--on-surface-variant)]">
                        TechCorp · Tunis · Hybride
                      </p>
                    </div>
                    <span className="rounded-full bg-[#69ff87]/30 px-3 py-1 text-[10px] font-bold text-[#0b5a2a]">
                      Entretien
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-[var(--surface-container-low)] p-4">
                    <div>
                      <p className="text-sm font-semibold text-[var(--primary)]">
                        Data Analyst
                      </p>
                      <p className="text-xs text-[var(--on-surface-variant)]">
                        FinStart · Sfax · Sur site
                      </p>
                    </div>
                    <span className="rounded-full bg-[#00e3fd]/20 px-3 py-1 text-[10px] font-bold text-[var(--secondary)]">
                      En cours
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <p className="label-uppercase text-[10px] font-bold text-[var(--secondary)]">
              Expérience candidat
            </p>
            <h2 className="mt-4 font-headline text-4xl font-extrabold text-[var(--primary)] md:text-5xl">
              Postulez, suivez, échangez.
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-[var(--on-surface-variant)]">
              Recherchez des offres avec filtres avancés, enrichissez votre
              profil via CV, et restez informé des changements de statut.
            </p>
            <div className="mt-8 space-y-6">
              <div className="flex gap-4">
                <div className="mt-1 h-6 w-6 shrink-0 rounded-full bg-[#006875]/10" />
                <div>
                  <p className="text-sm font-bold text-[var(--primary)]">
                    Recherche d&apos;offres filtrée
                  </p>
                  <p className="text-sm text-[var(--on-surface-variant)]">
                    Mode de travail, contrat, expérience et localisation.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="mt-1 h-6 w-6 shrink-0 rounded-full bg-[#006875]/10" />
                <div>
                  <p className="text-sm font-bold text-[var(--primary)]">
                    Profil enrichi par CV
                  </p>
                  <p className="text-sm text-[var(--on-surface-variant)]">
                    Compétences, formation et langues importées automatiquement.
                  </p>
                </div>
              </div>
            </div>
            <Link
              className="mt-10 inline-flex rounded-2xl bg-[var(--primary)] px-10 py-4 text-sm font-semibold text-[var(--on-primary)] shadow-lg transition-transform hover:-translate-y-0.5"
              href="/login?view=register"
            >
              Créer mon compte candidat
            </Link>
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
            <p className="label-uppercase text-[10px] font-bold text-[#00daf3]">
              Solutions entreprises
            </p>
            <h2 className="mt-4 font-headline text-4xl font-extrabold md:text-5xl">
              Pilotez vos recrutements de A à Z.
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-white/70">
              Publiez des offres, classez les candidatures par IA, consultez les
              CV en PDF et prenez vos décisions depuis une fiche candidat
              complète.
            </p>
            <div className="mt-10 grid grid-cols-2 gap-8">
              <div>
                <p className="text-3xl font-headline font-extrabold">IA</p>
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/60">
                  classement + écarts
                </p>
              </div>
              <div>
                <p className="text-3xl font-headline font-extrabold">Équipe</p>
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/60">
                  multi-recruteurs
                </p>
              </div>
            </div>
            <Link
              className="mt-12 inline-flex rounded-2xl bg-[#00e3fd] px-10 py-4 text-sm font-semibold text-[#003366] transition-transform hover:-translate-y-0.5"
              href="/login?view=register"
            >
              Créer un compte recruteur
            </Link>
          </div>
          <div className="lg:col-span-6">
            <div className="rounded-[3rem] bg-white/5 p-8 backdrop-blur-xl">
              <div className="rounded-2xl bg-white p-6 text-[var(--primary)] ambient-shadow">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--primary)] text-sm font-bold text-white">
                    SB
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold">Sami Ben Jomaa</p>
                    <p className="text-xs text-[var(--on-surface-variant)]">
                      Développeur Full Stack · 5 ans
                    </p>
                  </div>
                  <div className="rounded-full bg-gradient-to-r from-[#006875] to-[#69ff87] px-3 py-1 text-xs font-bold text-white">
                    87%
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-md bg-[var(--surface-container-low)] px-2 py-1 text-[10px] font-bold uppercase text-[var(--primary)]">
                    React
                  </span>
                  <span className="rounded-md bg-[var(--surface-container-low)] px-2 py-1 text-[10px] font-bold uppercase text-[var(--primary)]">
                    Spring Boot
                  </span>
                  <span className="rounded-md bg-[var(--surface-container-low)] px-2 py-1 text-[10px] font-bold uppercase text-[var(--primary)]">
                    PostgreSQL
                  </span>
                </div>
                <div className="mt-4 space-y-2 rounded-lg bg-[var(--surface-container-low)] p-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--secondary)]">
                    Analyse IA
                  </p>
                  <p className="text-xs leading-relaxed text-[var(--on-surface-variant)]">
                    Bon alignement technique ; écart sur le niveau senior et le
                    mode remote partiel.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[var(--surface-container-lowest)] py-14">
        <div className="mx-auto w-full max-w-7xl px-6">
          <p className="text-center text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--on-surface-variant)]">
            Stack technique
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-8 text-sm font-semibold text-[var(--primary)]/70">
            <span>Next.js</span>
            <span className="text-[var(--outline-variant)]">·</span>
            <span>Spring Boot</span>
            <span className="text-[var(--outline-variant)]">·</span>
            <span>FastAPI</span>
            <span className="text-[var(--outline-variant)]">·</span>
            <span>PostgreSQL</span>
            <span className="text-[var(--outline-variant)]">·</span>
            <span>Groq</span>
          </div>
        </div>
      </section>

      <section id="apropos" className="py-24">
        <div className="mx-auto w-full max-w-7xl px-6">
          <div className="rounded-[2.5rem] bg-[var(--surface-container-low)] p-12 editorial-shadow">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
              <div>
                <p className="label-uppercase text-[10px] font-bold text-[var(--secondary)]">
                  Vision TunHire
                </p>
                <h2 className="mt-4 font-headline text-4xl font-extrabold text-[var(--primary)]">
                  Une plateforme complète pour le marché tunisien.
                </h2>
                <p className="mt-6 text-lg text-[var(--on-surface-variant)]">
                  Projet de fin d&apos;études couvrant authentification, gestion
                  d&apos;entreprises, offres, candidatures, IA et messagerie —
                  avec une interface soignée et des scores transparents.
                </p>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-2xl bg-[var(--surface-container-lowest)] p-6">
                  <p className="text-sm font-bold text-[var(--primary)]">
                    Scores expliqués
                  </p>
                  <p className="mt-2 text-sm text-[var(--on-surface-variant)]">
                    Écarts et résumés IA visibles par les recruteurs.
                  </p>
                </div>
                <div className="rounded-2xl bg-[var(--surface-container-lowest)] p-6">
                  <p className="text-sm font-bold text-[var(--primary)]">
                    Impact local
                  </p>
                  <p className="mt-2 text-sm text-[var(--on-surface-variant)]">
                    Conçu pour les besoins du marché tunisien.
                  </p>
                </div>
                <div className="rounded-2xl bg-[var(--surface-container-lowest)] p-6">
                  <p className="text-sm font-bold text-[var(--primary)]">
                    Collaboration intégrée
                  </p>
                  <p className="mt-2 text-sm text-[var(--on-surface-variant)]">
                    Chat et notifications sans outil externe.
                  </p>
                </div>
                <div className="rounded-2xl bg-[var(--surface-container-lowest)] p-6">
                  <p className="text-sm font-bold text-[var(--primary)]">
                    Qualité éditoriale
                  </p>
                  <p className="mt-2 text-sm text-[var(--on-surface-variant)]">
                    Interface claire pour des décisions plus rapides.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-[var(--surface-container-low)]">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-10 px-6 py-12 md:grid-cols-4">
          <div className="md:col-span-2">
            <p className="text-lg font-bold text-[var(--primary)]">TunHire</p>
            <p className="mt-3 max-w-sm text-xs leading-relaxed text-[var(--on-surface-variant)]">
              Recrutement intelligent pour le marché tunisien — offres,
              candidatures, classement IA et messagerie.
            </p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--primary)]">
              Plateforme
            </p>
            <div className="mt-4 flex flex-col gap-2">
              <Link
                className="text-sm text-[var(--on-surface-variant)] hover:text-[var(--primary)]"
                href="/jobs"
              >
                Voir les offres
              </Link>
              <Link
                className="text-sm text-[var(--on-surface-variant)] hover:text-[var(--primary)]"
                href="/login"
              >
                Connexion
              </Link>
              <Link
                className="text-sm text-[var(--on-surface-variant)] hover:text-[var(--primary)]"
                href="/login?view=register"
              >
                Inscription
              </Link>
            </div>
          </div>
        </div>
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-4 border-t border-[var(--outline-variant)] px-6 py-6 text-xs text-[var(--on-surface-variant)] md:flex-row">
          <p>© 2026 TunHire. Projet PFE — recrutement augmenté par l&apos;IA.</p>
        </div>
      </footer>
    </div>
  );
}
