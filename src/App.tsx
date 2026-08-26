import {
  ArrowLeft,
  ArrowRight,
  Bell,
  Bookmark,
  CalendarDays,
  Check,
  ChevronRight,
  CircleAlert,
  CloudRain,
  Compass,
  Footprints,
  Headphones,
  Languages,
  LocateFixed,
  Map,
  MapPin,
  Menu,
  MessageCircleMore,
  Navigation,
  RotateCcw,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Star,
  Sun,
  Utensils,
  VolumeX,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import {
  languages,
  localize,
  places,
  regionLabels,
  regions,
  uiCopy,
  type Category,
  type Language,
  type Place,
  type Tab,
} from './data';
import { generateDocent, isGeminiConfigured } from './services/api';

const STORAGE_KEY = 'lala-demo-preferences-v1';

interface Preferences {
  onboarded: boolean;
  language: Language;
  region: string;
  travelStyle: string;
}

const defaultPreferences: Preferences = {
  onboarded: false,
  language: 'ko',
  region: regions[0],
  travelStyle: 'planned',
};

function readPreferences(): Preferences {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value ? { ...defaultPreferences, ...JSON.parse(value) } : defaultPreferences;
  } catch {
    return defaultPreferences;
  }
}

function App() {
  const [preferences, setPreferences] = useState<Preferences>(readPreferences);
  const [activeTab, setActiveTab] = useState<Tab>('map');
  const [selectedPlace, setSelectedPlace] = useState<Place>(places[0]);
  const [detailOpen, setDetailOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  const copy = uiCopy[preferences.language];
  const hasDemoCoverage = preferences.region === regions[0];
  const regionLabel = localize(regionLabels[preferences.region] ?? regionLabels[regions[0]], preferences.language).value;

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    document.documentElement.lang = preferences.language;
  }, [preferences]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const openPlace = (place: Place) => {
    setSelectedPlace(place);
    setDetailOpen(true);
  };

  const changeTab = (tab: Tab) => {
    setActiveTab(tab);
    setDetailOpen(false);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const toggleSaved = (placeId: string) => {
    setSavedIds((current) =>
      current.includes(placeId) ? current.filter((id) => id !== placeId) : [...current, placeId],
    );
  };

  const chooseDemoRegion = () => {
    setPreferences((current) => ({ ...current, region: regions[0] }));
  };

  const resetDemo = () => {
    localStorage.removeItem(STORAGE_KEY);
    setPreferences(defaultPreferences);
    setSettingsOpen(false);
    setActiveTab('map');
  };

  return (
    <div className="app-shell">
      <SideNavigation activeTab={activeTab} copy={copy} onChange={changeTab} />

      <div className="app-stage">
        <AppHeader
          copy={copy}
          region={regionLabel}
          onRegion={() => setSettingsOpen(true)}
          onSettings={() => setSettingsOpen(true)}
        />

        <main className={`view view-${activeTab}`}>
          {activeTab === 'map' && (
            <MapView
              copy={copy}
              language={preferences.language}
              selectedPlace={selectedPlace}
              hasDemoCoverage={hasDemoCoverage}
              onSelect={setSelectedPlace}
              onOpen={openPlace}
              onChooseDemoRegion={chooseDemoRegion}
            />
          )}
          {activeTab === 'search' && (
            <SearchView
              copy={copy}
              language={preferences.language}
              regionLabel={regionLabel}
              hasDemoCoverage={hasDemoCoverage}
              onRegion={() => setSettingsOpen(true)}
              onChooseDemoRegion={chooseDemoRegion}
              onOpen={openPlace}
            />
          )}
          {activeTab === 'plan' && (
            <PlanView copy={copy} language={preferences.language} hasDemoCoverage={hasDemoCoverage} onChooseDemoRegion={chooseDemoRegion} onOpen={openPlace} setToast={setToast} />
          )}
          {activeTab === 'signals' && (
            <SignalsView copy={copy} language={preferences.language} hasDemoCoverage={hasDemoCoverage} onChooseDemoRegion={chooseDemoRegion} onOpen={openPlace} setToast={setToast} />
          )}
        </main>

        <BottomNavigation activeTab={activeTab} copy={copy} onChange={changeTab} />
      </div>

      {detailOpen && (
        <PlaceDetail
          place={selectedPlace}
          language={preferences.language}
          copy={copy}
          saved={savedIds.includes(selectedPlace.id)}
          onSave={() => toggleSaved(selectedPlace.id)}
          onClose={() => setDetailOpen(false)}
          setToast={setToast}
        />
      )}

      {settingsOpen && (
        <SettingsPanel
          preferences={preferences}
          copy={copy}
          onChange={setPreferences}
          onClose={() => setSettingsOpen(false)}
          onReset={resetDemo}
        />
      )}

      {!preferences.onboarded && (
        <Onboarding preferences={preferences} onComplete={setPreferences} />
      )}

      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  );
}

function AppHeader({
  copy,
  region,
  onRegion,
  onSettings,
}: {
  copy: Record<string, string>;
  region: string;
  onRegion: () => void;
  onSettings: () => void;
}) {
  return (
    <header className="app-header">
      <button className="region-button" onClick={onRegion} aria-label={`${copy.currentRegion}: ${region}`}>
        <MapPin size={18} aria-hidden="true" />
        <span><small>{copy.currentRegion}</small>{region}</span>
        <ChevronRight size={16} aria-hidden="true" />
      </button>
      <div className="wordmark" aria-label="LALA">LALA</div>
      <div className="header-actions">
        <span className="demo-badge">{copy.demoData}</span>
        <button className="icon-button" aria-label={copy.notifications}><Bell size={20} /></button>
        <button className="icon-button" onClick={onSettings} aria-label={copy.settings}><Settings size={20} /></button>
      </div>
    </header>
  );
}

const navItems: Array<{ id: Tab; icon: typeof Search }> = [
  { id: 'search', icon: Search },
  { id: 'map', icon: Map },
  { id: 'plan', icon: CalendarDays },
  { id: 'signals', icon: MessageCircleMore },
];

function NavigationItems({ activeTab, copy, onChange }: { activeTab: Tab; copy: Record<string, string>; onChange: (tab: Tab) => void }) {
  return navItems.map(({ id, icon: Icon }) => (
    <button
      key={id}
      className={activeTab === id ? 'nav-item active' : 'nav-item'}
      onClick={() => onChange(id)}
      aria-current={activeTab === id ? 'page' : undefined}
      data-testid={`nav-${id}`}
    >
      <Icon size={21} aria-hidden="true" />
      <span>{copy[id]}</span>
    </button>
  ));
}

function SideNavigation({ activeTab, copy, onChange }: { activeTab: Tab; copy: Record<string, string>; onChange: (tab: Tab) => void }) {
  return (
    <aside className="side-navigation">
      <div className="side-wordmark">LALA</div>
      <NavigationItems activeTab={activeTab} copy={copy} onChange={onChange} />
      <div className="side-note"><ShieldCheck size={16} /> {copy.evidenceFirst}</div>
    </aside>
  );
}

function BottomNavigation({ activeTab, copy, onChange }: { activeTab: Tab; copy: Record<string, string>; onChange: (tab: Tab) => void }) {
  return <nav className="bottom-navigation" aria-label={copy.mainNavigation}><NavigationItems activeTab={activeTab} copy={copy} onChange={onChange} /></nav>;
}

function MapView({
  copy,
  language,
  selectedPlace,
  hasDemoCoverage,
  onSelect,
  onOpen,
  onChooseDemoRegion,
}: {
  copy: Record<string, string>;
  language: Language;
  selectedPlace: Place;
  hasDemoCoverage: boolean;
  onSelect: (place: Place) => void;
  onOpen: (place: Place) => void;
  onChooseDemoRegion: () => void;
}) {
  const [category, setCategory] = useState<Category>('all');
  const visible = category === 'all' ? places : places.filter((place) => place.category === category);
  const selectedName = localize(selectedPlace.name, language);

  if (!hasDemoCoverage) {
    return <RegionCoverageEmpty copy={copy} variant="map" onChooseDemoRegion={onChooseDemoRegion} />;
  }

  return (
    <section className="map-view" aria-label={copy.map}>
      <div className="category-bar" role="group" aria-label={copy.categoryFilter}>
        {(['all', 'culture', 'food', 'local'] as Category[]).map((item) => (
          <button key={item} className={category === item ? 'chip selected' : 'chip'} onClick={() => setCategory(item)} aria-pressed={category === item}>
            {copy[item]}
          </button>
        ))}
      </div>

      <img className="map-image" src="./assets/map.jpg" alt={copy.mapAlt} />
      <div className="map-scrim" aria-hidden="true" />

      {visible.map((place) => {
        const selected = selectedPlace.id === place.id;
        const Icon = place.category === 'food' ? Utensils : place.category === 'culture' ? Compass : Star;
        return (
          <button
            key={place.id}
            className={`map-marker ${place.category} ${selected ? 'selected' : ''}`}
            style={place.position}
            onClick={() => onSelect(place)}
            aria-label={`${localize(place.name, language).value}, ${place.distanceKm}km`}
            aria-pressed={selected}
          >
            <Icon size={18} aria-hidden="true" />
          </button>
        );
      })}

      <div className="weather-summary"><Sun size={18} /><span>24°C</span><small>{copy.pmModerate}</small></div>

      <div className="place-rail" aria-live="polite">
        <img src={selectedPlace.image} alt="" />
        <div className="place-rail-copy">
          <span className="eyebrow"><Sparkles size={14} /> {copy.evidence}</span>
          <strong>{selectedName.value}</strong>
          {selectedName.fallback && <span className="fallback-badge">English fallback</span>}
          <p>{localize(selectedPlace.reason, language).value}</p>
          <small>{localize(selectedPlace.source, language).value} · {localize(selectedPlace.dataAsOf, language).value}</small>
        </div>
        <button className="primary-icon-button" onClick={() => onOpen(selectedPlace)} aria-label={`${selectedName.value}, ${copy.details}`}><ArrowRight size={20} /></button>
      </div>
    </section>
  );
}

function SearchView({
  copy,
  language,
  regionLabel,
  hasDemoCoverage,
  onRegion,
  onChooseDemoRegion,
  onOpen,
}: {
  copy: Record<string, string>;
  language: Language;
  regionLabel: string;
  hasDemoCoverage: boolean;
  onRegion: () => void;
  onChooseDemoRegion: () => void;
  onOpen: (place: Place) => void;
}) {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<'distance' | 'popular'>('distance');
  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const filtered = hasDemoCoverage && normalized
      ? places.filter((place) => `${place.name.ko} ${place.name.en}`.toLowerCase().includes(normalized))
      : hasDemoCoverage ? places : [];
    return [...filtered].sort((a, b) => sort === 'distance' ? a.distanceKm - b.distanceKm : a.id.localeCompare(b.id));
  }, [hasDemoCoverage, query, sort]);

  return (
    <section className="content-view search-view">
      <div className="search-box">
        <Search size={20} aria-hidden="true" />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={copy.searchPlaceholder} aria-label={copy.searchPlaceholder} />
        {query && <button className="icon-button compact" onClick={() => setQuery('')} aria-label={copy.clearSearch}><X size={17} /></button>}
      </div>

      <div className="context-row">
        <span><MapPin size={16} /> {copy.currentRegion}: <strong>{regionLabel}</strong></span>
        <button className="text-button" onClick={onRegion}>{copy.change}</button>
      </div>

      {!hasDemoCoverage ? (
        <RegionCoverageEmpty copy={copy} onChooseDemoRegion={onChooseDemoRegion} />
      ) : <>
      <div className="segmented-control" aria-label={copy.sortResults}>
        <button className={sort === 'distance' ? 'active' : ''} onClick={() => setSort('distance')} aria-pressed={sort === 'distance'}><Navigation size={15} /> {copy.distance}</button>
        <button className={sort === 'popular' ? 'active' : ''} onClick={() => setSort('popular')} aria-pressed={sort === 'popular'}><Star size={15} /> {copy.popular}</button>
      </div>

      <section className="theme-band" aria-labelledby="theme-title">
        <div className="section-heading"><div><span className="eyebrow">{copy.explore}</span><h2 id="theme-title">{copy.recent}</h2></div></div>
        <div className="recent-chips">
          {places.slice(0, 3).map((place) => {
            const term = localize(place.name, language).value;
            return <button key={place.id} className="chip" onClick={() => setQuery(term)}>{term}</button>;
          })}
        </div>
      </section>

      <section aria-labelledby="result-title">
        <div className="section-heading"><div><span className="eyebrow">{copy.demoData}</span><h2 id="result-title">{copy.search}</h2></div><span>{results.length}</span></div>
        {results.length ? (
          <div className="search-results">
            {results.map((place) => (
              <button key={place.id} className="search-result" onClick={() => onOpen(place)}>
                <img src={place.image} alt="" />
                <span className="result-copy">
                  <strong>{localize(place.name, language).value}</strong>
                  <small>{localize(place.region, language).value} · {place.distanceKm} km</small>
                  <span>{localize(place.reason, language).value}</span>
                  <small>{localize(place.dataAsOf, language).value}</small>
                </span>
                <ChevronRight size={18} aria-hidden="true" />
              </button>
            ))}
          </div>
        ) : (
          <div className="empty-state"><Search size={28} /><strong>{copy.noResults}</strong><button className="secondary-button" onClick={() => setQuery('')}>{copy.reset}</button></div>
        )}
      </section>
      </>}
    </section>
  );
}

function PlanView({
  copy,
  language,
  hasDemoCoverage,
  onChooseDemoRegion,
  onOpen,
  setToast,
}: {
  copy: Record<string, string>;
  language: Language;
  hasDemoCoverage: boolean;
  onChooseDemoRegion: () => void;
  onOpen: (place: Place) => void;
  setToast: (value: string) => void;
}) {
  const [alternativeApplied, setAlternativeApplied] = useState(false);
  const slotPlaces = [places[3], places[1], alternativeApplied ? places[2] : places[0], null];
  const slotLabels = [copy.morning, copy.lunch, copy.afternoon, copy.evening];
  const times = ['09:00', '12:30', '15:00', '18:30'];

  const applyAlternative = () => {
    setAlternativeApplied(true);
    setToast(copy.applyAlternative);
  };

  const undo = () => {
    setAlternativeApplied(false);
    setToast(copy.undo);
  };

  if (!hasDemoCoverage) {
    return <RegionCoverageEmpty copy={copy} variant="page" onChooseDemoRegion={onChooseDemoRegion} />;
  }

  return (
    <section className="content-view plan-view">
      <div className="intervention-banner">
        <CloudRain size={24} aria-hidden="true" />
        <div><span className="eyebrow">{copy.forecastContext}</span><strong>{copy.intervention}</strong><small>{localize(places[2].dataAsOf, language).value}</small></div>
        {alternativeApplied && <button className="text-button" onClick={undo}><RotateCcw size={16} /> {copy.undo}</button>}
      </div>

      <div className="section-heading"><div><span className="eyebrow">{copy.fourSlotRhythm}</span><h1>{copy.plan}</h1></div><span>2026.08.26</span></div>

      <div className="timeline">
        {slotPlaces.map((place, index) => (
          <div className="timeline-group" key={slotLabels[index]}>
            <div className="time-label"><span>{slotLabels[index]}</span><strong>{times[index]}</strong></div>
            {place ? (
              <article className={`plan-slot ${index === 2 ? 'affected' : ''}`}>
                <img src={place.image} alt="" />
                <div>
                  <span className="eyebrow">{index === 2 ? copy.evidence : copy[place.category]}</span>
                  <h2>{localize(place.name, language).value}</h2>
                  <p>{localize(place.reason, language).value}</p>
                  <button className="text-button" onClick={() => onOpen(place)}>{copy.viewPlace} <ChevronRight size={15} /></button>
                </div>
                {index === 2 && !alternativeApplied && (
                  <div className="alternative-actions">
                    <button className="secondary-button" onClick={() => setToast(copy.keepPlan)}>{copy.keepPlan}</button>
                    <button className="primary-button" onClick={applyAlternative}>{copy.applyAlternative}</button>
                  </div>
                )}
              </article>
            ) : (
              <article className="plan-slot open-slot"><CircleAlert size={22} /><div><h2>{copy.openSlot}</h2><p>{copy.noCandidate}</p></div></article>
            )}
            {index < slotPlaces.length - 1 && <div className="route-connector"><Footprints size={15} /><span>{copy.estimated} {index === 1 ? 25 : 15} min</span><ArrowRight size={14} /></div>}
          </div>
        ))}
      </div>
    </section>
  );
}

function SignalsView({
  copy,
  language,
  hasDemoCoverage,
  onChooseDemoRegion,
  onOpen,
  setToast,
}: {
  copy: Record<string, string>;
  language: Language;
  hasDemoCoverage: boolean;
  onChooseDemoRegion: () => void;
  onOpen: (place: Place) => void;
  setToast: (value: string) => void;
}) {
  const signals = [
    { place: places[3], image: './assets/botanical-cafe.jpg', mentions: 38, organic: 31, label: copy.quiet, note: copy.filteredNote },
    { place: places[1], image: './assets/night-market.jpg', mentions: 64, organic: 48, label: copy.active, note: copy.privacyNote },
  ];

  if (!hasDemoCoverage) {
    return <RegionCoverageEmpty copy={copy} variant="page" onChooseDemoRegion={onChooseDemoRegion} />;
  }

  return (
    <section className="content-view signals-view">
      <div className="section-heading"><div><span className="eyebrow">{copy.governedAggregate}</span><h1>{copy.signals}</h1></div></div>
      <div className="governance-notice"><ShieldCheck size={22} /><div><strong>{copy.signalTitle}</strong><p>{copy.signalDisclosure}</p></div></div>
      <div className="signal-list">
        {signals.map(({ place, image, mentions, organic, label, note }) => (
          <article className="signal-card" key={place.id}>
            <img src={image} alt="" />
            <div className="signal-body">
              <div className="signal-title"><div><span className="eyebrow">{label} · {localize(place.dataAsOf, language).value}</span><h2>{localize(place.name, language).value}</h2></div><span className="signal-status">{organic}/{mentions} {copy.organic}</span></div>
              <p>{localize(place.reason, language).value}</p>
              <small><ShieldCheck size={14} /> {note}</small>
              <div className="signal-actions"><button className="secondary-button" onClick={() => onOpen(place)}>{copy.viewPlace}</button><button className="primary-button" onClick={() => setToast(copy.addPlan)}>{copy.addPlan}</button></div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function RegionCoverageEmpty({
  copy,
  variant = 'inline',
  onChooseDemoRegion,
}: {
  copy: Record<string, string>;
  variant?: 'inline' | 'page' | 'map';
  onChooseDemoRegion: () => void;
}) {
  return (
    <section className={`coverage-state ${variant === 'page' ? 'content-view page-coverage' : variant === 'map' ? 'map-coverage' : 'inline-coverage'}`} aria-live="polite">
      <div className="coverage-symbol"><MapPin size={26} aria-hidden="true" /></div>
      <span className="eyebrow"><ShieldCheck size={14} /> {copy.evidenceFirst}</span>
      <h1>{copy.coverageUnavailable}</h1>
      <p>{copy.coverageBody}</p>
      <button className="primary-button" onClick={onChooseDemoRegion}>
        <Navigation size={17} aria-hidden="true" /> {copy.chooseDemoRegion}
      </button>
    </section>
  );
}

function PlaceDetail({
  place,
  language,
  copy,
  saved,
  onSave,
  onClose,
  setToast,
}: {
  place: Place;
  language: Language;
  copy: Record<string, string>;
  saved: boolean;
  onSave: () => void;
  onClose: () => void;
  setToast: (value: string) => void;
}) {
  const name = localize(place.name, language);
  const docent = localize(place.docent, language);
  const [liveDocent, setLiveDocent] = useState<string | null>(null);
  const [docentStatus, setDocentStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [geminiAvailability, setGeminiAvailability] = useState<'checking' | 'configured' | 'unconfigured'>('checking');

  useEffect(() => {
    let active = true;
    void isGeminiConfigured().then((configured) => {
      if (active) setGeminiAvailability(configured ? 'configured' : 'unconfigured');
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    setLiveDocent(null);
    setDocentStatus('idle');
  }, [place.id, language]);

  const requestLiveDocent = async () => {
    if (geminiAvailability !== 'configured') return;
    setDocentStatus('loading');
    try {
      const script = await generateDocent({
        placeName: name.value,
        region: localize(place.region, language).value,
        language,
        evidence: {
          reason: localize(place.reason, language).value,
          source: localize(place.source, language).value,
          dataAsOf: localize(place.dataAsOf, language).value,
        },
      });
      setLiveDocent(script);
      setDocentStatus('ready');
    } catch {
      setLiveDocent(null);
      setDocentStatus('error');
    }
  };

  return (
    <div className="drawer-layer" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <aside className="detail-drawer" role="dialog" aria-modal="true" aria-labelledby="detail-title">
        <div className="detail-hero">
          <img src={place.image} alt={name.value} />
          <button className="icon-button floating back" onClick={onClose} aria-label={copy.close}><ArrowLeft size={20} /></button>
          <span className="weather-chip"><Sun size={16} /> {localize(place.weather, language).value}</span>
        </div>
        <div className="detail-content">
          <div className="detail-title-row"><div><h1 id="detail-title">{name.value}</h1><span><MapPin size={15} /> {localize(place.region, language).value}</span>{name.fallback && <span className="fallback-badge">English content fallback</span>}</div><button className={saved ? 'save-button saved' : 'save-button'} onClick={onSave} aria-pressed={saved}><Bookmark size={19} fill={saved ? 'currentColor' : 'none'} /> {saved ? copy.saved : copy.save}</button></div>
          <div className="detail-actions"><button className="primary-button" onClick={() => setToast(copy.addPlan)}><CalendarDays size={17} /> {copy.addPlan}</button><button className="secondary-button" onClick={() => setToast(copy.route)}><Navigation size={17} /> {copy.route}</button></div>

          <section className="docent-section">
            <div className="section-heading"><div><span className="eyebrow"><Headphones size={14} /> {copy.textFirst}</span><h2>{copy.docent}</h2></div></div>
            <p>{liveDocent ?? docent.value}</p>
            <div className="docent-controls">
              <button className="secondary-button" onClick={requestLiveDocent} disabled={geminiAvailability !== 'configured' || docentStatus === 'loading'}>
                <Sparkles size={17} aria-hidden="true" />
                {geminiAvailability === 'checking' ? copy.checkingGemini : docentStatus === 'loading' ? copy.generatingDocent : copy.generateWithGemini}
              </button>
              {docentStatus === 'ready' && <span className="docent-status ready" role="status">{copy.liveDocentReady}</span>}
              {docentStatus === 'error' && <span className="docent-status error" role="status">{copy.liveDocentUnavailable}</span>}
              {geminiAvailability === 'unconfigured' && <span className="docent-status error" role="status">{copy.liveDocentUnavailable}</span>}
            </div>
            <div className="audio-disabled"><VolumeX size={18} /><span>{copy.audioUnavailable}</span></div>
          </section>

          <section className="evidence-section">
            <div className="section-heading"><div><span className="eyebrow">{copy.transparentEvidence}</span><h2>{copy.evidence}</h2></div></div>
            <dl className="evidence-list">
              <div><dt>{copy.source}</dt><dd>{localize(place.source, language).value}</dd></div>
              <div><dt>{copy.updated}</dt><dd>{localize(place.dataAsOf, language).value}</dd></div>
              <div><dt>{copy.reason}</dt><dd>{localize(place.reason, language).value}</dd></div>
            </dl>
          </section>

          <section className="gallery-section" aria-label={copy.gallery}>
            <img src="./assets/installation.jpg" alt="" />
            <img src="./assets/sculpture-garden.jpg" alt="" />
          </section>
        </div>
      </aside>
    </div>
  );
}

function SettingsPanel({
  preferences,
  copy,
  onChange,
  onClose,
  onReset,
}: {
  preferences: Preferences;
  copy: Record<string, string>;
  onChange: (value: Preferences) => void;
  onClose: () => void;
  onReset: () => void;
}) {
  return (
    <div className="drawer-layer" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <aside className="settings-drawer" role="dialog" aria-modal="true" aria-labelledby="settings-title">
        <div className="drawer-header"><h2 id="settings-title">{copy.settings}</h2><button className="icon-button" onClick={onClose} aria-label={copy.close}><X size={20} /></button></div>
        <label className="field-label"><span><Languages size={17} /> {copy.languageLabel}</span><select value={preferences.language} onChange={(event) => onChange({ ...preferences, language: event.target.value as Language })}>{languages.map((language) => <option key={language.value} value={language.value}>{language.label}</option>)}</select></label>
        <label className="field-label"><span><MapPin size={17} /> {copy.regionLabel}</span><select value={preferences.region} onChange={(event) => onChange({ ...preferences, region: event.target.value })}>{regions.map((region) => <option key={region} value={region}>{localize(regionLabels[region], preferences.language).value}</option>)}</select></label>
        <div className="settings-note"><ShieldCheck size={20} /><p>{copy.demoBoundaryNote}</p></div>
        <button className="danger-button" onClick={onReset}><RotateCcw size={17} /> {copy.reset}</button>
      </aside>
    </div>
  );
}

function Onboarding({ preferences, onComplete }: { preferences: Preferences; onComplete: (value: Preferences) => void }) {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState(preferences);
  const [locationMode, setLocationMode] = useState<'current' | 'manual'>('manual');
  const copy = uiCopy[draft.language];

  const finish = () => onComplete({ ...draft, onboarded: true });

  return (
    <div className="onboarding-layer">
      <section className="onboarding-panel" aria-labelledby="onboarding-title">
        <header className="onboarding-header">
          <div className="wordmark">LALA</div>
          <label className="language-select"><Languages size={16} /><span className="sr-only">{copy.languageLabel}</span><select value={draft.language} onChange={(event) => setDraft({ ...draft, language: event.target.value as Language })}>{languages.map((language) => <option key={language.value} value={language.value}>{language.label}</option>)}</select></label>
        </header>
        <div className="progress" aria-label={`Step ${step + 1} of 3`}>{[0, 1, 2].map((item) => <span key={item} className={item <= step ? 'active' : ''} />)}</div>

        {step === 0 && (
          <div className="onboarding-body">
            <span className="step-label">01 / 03</span><h1 id="onboarding-title">{copy.tripTitle}</h1><p>{copy.tripBody}</p>
            <div className="travel-options">
              {[['spontaneous', Compass, copy.spontaneous], ['planned', CalendarDays, copy.planned], ['local', Star, copy.localFocused]].map(([value, Icon, label]) => {
                const SelectedIcon = Icon as typeof Compass;
                return <button key={String(value)} className={draft.travelStyle === value ? 'option-button selected' : 'option-button'} onClick={() => setDraft({ ...draft, travelStyle: String(value) })} aria-pressed={draft.travelStyle === value}><SelectedIcon size={24} /><span>{String(label)}</span>{draft.travelStyle === value && <Check size={17} />}</button>;
              })}
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="onboarding-body">
            <span className="step-label">02 / 03</span><h1 id="onboarding-title">{copy.languageTitle}</h1><p>{copy.languageBody}</p>
            <div className="language-options">{languages.map((language) => <button key={language.value} className={draft.language === language.value ? 'option-button selected' : 'option-button'} onClick={() => setDraft({ ...draft, language: language.value })} aria-pressed={draft.language === language.value}><Languages size={22} /><span>{language.label}</span>{draft.language === language.value && <Check size={17} />}</button>)}</div>
          </div>
        )}

        {step === 2 && (
          <div className="onboarding-body">
            <span className="step-label">03 / 03</span><h1 id="onboarding-title">{copy.locationTitle}</h1><p>{copy.locationBody}</p>
            <div className="location-options"><button className={locationMode === 'current' ? 'option-button selected' : 'option-button'} onClick={() => setLocationMode('current')} aria-pressed={locationMode === 'current'}><LocateFixed size={22} /><span>{copy.currentLocation}</span>{locationMode === 'current' && <Check size={17} />}</button><button className={locationMode === 'manual' ? 'option-button selected' : 'option-button'} onClick={() => setLocationMode('manual')} aria-pressed={locationMode === 'manual'}><MapPin size={22} /><span>{copy.manualRegion}</span>{locationMode === 'manual' && <Check size={17} />}</button></div>
            {locationMode === 'manual' ? <label className="region-select"><span>{copy.currentRegion}</span><select value={draft.region} onChange={(event) => setDraft({ ...draft, region: event.target.value })}>{regions.map((region) => <option key={region} value={region}>{localize(regionLabels[region], draft.language).value}</option>)}</select></label> : <div className="permission-note"><CircleAlert size={18} /><span>{copy.noLocationPermission}</span></div>}
          </div>
        )}

        <footer className="onboarding-footer">
          {step > 0 && <button className="secondary-button" onClick={() => setStep(step - 1)}><ArrowLeft size={17} /> {copy.back}</button>}
          <button className="primary-button grow" onClick={() => step === 2 ? finish() : setStep(step + 1)}>{step === 2 ? copy.start : copy.next} <ArrowRight size={17} /></button>
        </footer>
      </section>
    </div>
  );
}

export default App;
