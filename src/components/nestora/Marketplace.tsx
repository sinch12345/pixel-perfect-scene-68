import { Suspense, lazy, useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import { ClientOnly } from "@tanstack/react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ArrowDownWideNarrow, ArrowRight, Bath, BedDouble, Check, ChevronDown, ChevronLeft, ChevronRight, Heart, House, KeyRound, Layers3, List, LoaderCircle, MapPin, Menu, MoveUpRight, Ruler, Search, ShieldCheck, SlidersHorizontal, Sparkles, Star, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { formatPrice, neighborhoods, properties, propertyTypes, vibes, type Neighborhood, type Property, type PropertyType, type Vibe } from "@/data/properties";
import coastHome from "@/assets/nestora-coast-home.jpg";

const LazyPropertyMap = lazy(() => import("./PropertyMap").then((module) => ({ default: module.PropertyMap })));

type Filters = { neighborhood: string; propertyType: string; maxPrice: number; minBeds: number; minBaths: number; vibes: Vibe[] };
const initialFilters: Filters = { neighborhood: "all", propertyType: "all", maxPrice: 1_250_000, minBeds: 0, minBaths: 0, vibes: [] };
type SortBy = "newest" | "price-asc" | "price-desc" | "largest";

const emailSchema = z.string().trim().email("Enter a valid email address.");
const leadSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name."),
  email: emailSchema,
  phone: z.string().trim().min(7, "Enter a phone number we can reach you on."),
  interest: z.enum(["Buying", "Renting", "Selling"]),
  message: z.string().trim().min(10, "Tell us a little about what you're looking for."),
  consent: z.boolean().refine((checked) => checked, "Please agree to be contacted."),
});
type LeadValues = z.infer<typeof leadSchema>;
const enquirySchema = z.object({ name: z.string().trim().min(2, "Please enter your name."), email: emailSchema });
type EnquiryValues = z.infer<typeof enquirySchema>;

const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

function Reveal({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) {
        node.classList.add("is-visible");
        observer.unobserve(node);
      }
    }, { threshold: 0.08 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return <div ref={ref} className={`reveal ${className}`}>{children}</div>;
}

function BrandMark() {
  return <span className="brand-lockup"><span className="brand-icon" aria-hidden="true"><House size={19} strokeWidth={2.2} /></span><span>Nestora<span className="brand-period">.</span></span></span>;
}

function Header({ savedCount }: { savedCount: number }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navItems = [{ id: "homes", label: "Homes" }, { id: "map", label: "Explore map" }, { id: "why", label: "Why Nestora" }, { id: "reviews", label: "Reviews" }];
  return <header className="site-header">
    <div className="container header-inner">
      <a href="#top" className="brand-link" aria-label="Nestora home"><BrandMark /></a>
      <nav className={`desktop-nav${menuOpen ? " mobile-nav-open" : ""}`} aria-label="Main navigation">
        {navItems.map((item) => <a key={item.id} href={`#${item.id}`} onClick={() => setMenuOpen(false)}>{item.label}</a>)}
        <a className="nav-contact-mobile" href="#contact" onClick={() => setMenuOpen(false)}>Contact</a>
      </nav>
      <div className="header-actions">
        <a href="#homes" className="saved-counter" aria-label={`${savedCount} saved homes`}><Heart size={17} /><span>{savedCount}</span></a>
        <Button className="header-cta" onClick={() => scrollTo("contact")}>Book a viewing <ArrowRight size={15} /></Button>
        <Button variant="ghost" size="icon" className="menu-toggle" aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>{menuOpen ? <X /> : <Menu />}</Button>
      </div>
    </div>
  </header>;
}

function SelectField({ label, value, onValueChange, options, placeholder }: { label: string; value: string; onValueChange: (value: string) => void; options: { label: string; value: string }[]; placeholder: string }) {
  return <div className="field-stack"><Label className="field-label">{label}</Label><Select value={value} onValueChange={onValueChange}><SelectTrigger aria-label={label} className="select-control"><SelectValue placeholder={placeholder} /></SelectTrigger><SelectContent><SelectItem value="all">Any {label.toLowerCase()}</SelectItem>{options.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent></Select></div>;
}

function VibePills({ selected, onChange, compact = false }: { selected: Vibe[]; onChange: (next: Vibe[]) => void; compact?: boolean }) {
  return <div className={`vibe-options${compact ? " vibe-options-compact" : ""}`} role="group" aria-label="Home vibes">
    {vibes.map((vibe) => {
      const active = selected.includes(vibe);
      return <Button key={vibe} type="button" variant={active ? "default" : "outline"} size="sm" aria-pressed={active} onClick={() => onChange(active ? selected.filter((value) => value !== vibe) : [...selected, vibe])} className="vibe-pill">{active && <Check size={13} />}{vibe}</Button>;
    })}
  </div>;
}

function Hero({ filters, setFilters, onVibeQuiz }: { filters: Filters; setFilters: (update: (current: Filters) => Filters) => void; onVibeQuiz: () => void }) {
  const [priceRange, setPriceRange] = useState("any");
  const [bedrooms, setBedrooms] = useState("any");
  const search = () => {
    setFilters((current) => ({ ...current, maxPrice: priceRange === "any" ? 1_250_000 : Number(priceRange), minBeds: bedrooms === "any" ? 0 : Number(bedrooms) }));
    scrollTo("homes");
  };
  return <section className="hero" id="top" style={{ backgroundImage: `linear-gradient(90deg, oklch(0.16 0.035 255 / 80%) 0%, oklch(0.16 0.035 255 / 52%) 50%, oklch(0.16 0.035 255 / 17%) 100%), url(${coastHome})` }}>
    <div className="hero-content container">
      <span className="eyebrow eyebrow-light"><span className="eyebrow-dot" /> A more thoughtful way home</span>
      <h1>Find the home that fits the way you live<span className="hero-dot">.</span></h1>
      <p>Good homes feel like you. Let’s find the one that feels right.</p>
      <div className="hero-actions"><Button size="lg" onClick={() => scrollTo("homes")}>Browse homes <ArrowRight size={17} /></Button><Button size="lg" variant="hero-outline" onClick={onVibeQuiz}><Sparkles size={16} /> Take the vibe quiz</Button></div>
    </div>
    <div className="container search-card-wrap">
      <div className="search-card">
        <div className="search-topline"><div><span className="search-kicker">A good place to begin</span><h2>What feels like home?</h2></div><span className="search-number">01 <span>/ 04</span></span></div>
        <div className="search-fields">
          <SelectField label="Neighborhood" value={filters.neighborhood} onValueChange={(neighborhood) => setFilters((current) => ({ ...current, neighborhood }))} options={neighborhoods.map((value) => ({ label: value, value }))} placeholder="Any neighborhood" />
          <SelectField label="Home type" value={filters.propertyType} onValueChange={(propertyType) => setFilters((current) => ({ ...current, propertyType }))} options={propertyTypes.map((value) => ({ label: value, value }))} placeholder="Any home type" />
          <SelectField label="Max price" value={priceRange} onValueChange={setPriceRange} options={[250000, 400000, 600000, 800000, 1250000].map((value) => ({ label: `Up to ${formatPrice(value)}`, value: String(value) }))} placeholder="Any price" />
          <SelectField label="Bedrooms" value={bedrooms} onValueChange={setBedrooms} options={[1, 2, 3, 4, 5].map((value) => ({ label: `${value}+ bedrooms`, value: String(value) }))} placeholder="Any bedrooms" />
          <Button className="search-submit" onClick={search}><Search size={17} /> Find my home</Button>
        </div>
        <div className="search-vibes"><span className="vibe-label">Find your feeling</span><VibePills selected={filters.vibes} onChange={(next) => setFilters((current) => ({ ...current, vibes: next }))} compact /></div>
      </div>
    </div>
  </section>;
}

function TrustStrip() {
  const stats = [{ number: "2,400+", label: "happy homeowners", caption: "and counting" }, { number: "18", label: "days to find home", caption: "average time" }, { number: "96%", label: "felt understood", caption: "from first hello" }, { number: "4", label: "little corners", caption: "to find your place" }];
  return <section className="trust-strip" aria-label="Nestora at a glance"><div className="container trust-grid">{stats.map((stat) => <Reveal key={stat.label} className="trust-stat"><span className="stat-number">{stat.number}</span><span className="stat-label">{stat.label}</span><span className="stat-caption">{stat.caption}</span></Reveal>)}</div></section>;
}

function FilterControls({ filters, setFilters, clearFilters }: { filters: Filters; setFilters: (update: (current: Filters) => Filters) => void; clearFilters: () => void }) {
  return <div className="filter-controls">
    <div className="filter-heading"><span className="filter-kicker">Make it yours</span><Button variant="link" size="sm" onClick={clearFilters}>Clear all</Button></div>
    <SelectField label="Neighborhood" value={filters.neighborhood} onValueChange={(neighborhood) => setFilters((current) => ({ ...current, neighborhood }))} options={neighborhoods.map((value) => ({ label: value, value }))} placeholder="All neighborhoods" />
    <SelectField label="Home type" value={filters.propertyType} onValueChange={(propertyType) => setFilters((current) => ({ ...current, propertyType }))} options={propertyTypes.map((value) => ({ label: value, value }))} placeholder="All home types" />
    <div className="filter-group"><div className="filter-group-title"><Label htmlFor="max-price-range">Max price</Label><span>{formatPrice(filters.maxPrice)}</span></div><input id="max-price-range" type="range" min="185000" max="1250000" step="25000" value={filters.maxPrice} onChange={(event) => setFilters((current) => ({ ...current, maxPrice: Number(event.target.value) }))} className="price-range" /><div className="range-ends"><span>$185k</span><span>$1.25m</span></div></div>
    <div className="filter-group"><span className="filter-label">Bedrooms</span><div className="stepper-row">{[0, 1, 2, 3, 4].map((beds) => <Button key={beds} size="sm" variant={filters.minBeds === beds ? "default" : "outline"} aria-pressed={filters.minBeds === beds} onClick={() => setFilters((current) => ({ ...current, minBeds: beds }))}>{beds === 0 ? "Any" : `${beds}+`}</Button>)}</div></div>
    <div className="filter-group"><span className="filter-label">Bathrooms</span><div className="stepper-row">{[0, 1, 2, 3].map((baths) => <Button key={baths} size="sm" variant={filters.minBaths === baths ? "default" : "outline"} aria-pressed={filters.minBaths === baths} onClick={() => setFilters((current) => ({ ...current, minBaths: baths }))}>{baths === 0 ? "Any" : `${baths}+`}</Button>)}</div></div>
    <div className="filter-group"><span className="filter-label">Your must-haves</span><VibePills selected={filters.vibes} onChange={(next) => setFilters((current) => ({ ...current, vibes: next }))} /></div>
  </div>;
}

function PropertyCard({ property, saved, onToggleSaved, onQuickView, compact = false }: { property: Property; saved: boolean; onToggleSaved: (id: string) => void; onQuickView: (property: Property) => void; compact?: boolean }) {
  return <article className={`property-card${compact ? " property-card-list" : ""}`}>
    <div className="property-photo-wrap"><img src={property.images[0]} alt={`${property.name}, a ${property.type.toLowerCase()} in ${property.area}`} width="1200" height="900" loading="lazy" className="property-photo" /><span className={`status-badge status-${property.status.toLowerCase().replaceAll(" ", "-")}`}>{property.status}</span><Button variant="heart" size="icon" className={`heart-button${saved ? " is-saved" : ""}`} aria-label={saved ? `Remove ${property.name} from saved homes` : `Save ${property.name}`} aria-pressed={saved} onClick={() => onToggleSaved(property.id)}><Heart fill={saved ? "currentColor" : "none"} /></Button></div>
    <div className="property-content"><div className="property-meta"><span><MapPin size={13} /> {property.area}</span><span>{property.type}</span></div><h3>{property.name}</h3><p className="property-price">{formatPrice(property.price)}</p><div className="property-specs"><span><BedDouble /> {property.beds} beds</span><span><Bath /> {property.baths} baths</span><span><Ruler /> {property.sqft.toLocaleString()} sqft</span></div><div className="property-tags">{property.vibes.map((vibe) => <span key={vibe}>{vibe}</span>)}</div><Button variant="card-link" className="quick-view-link" onClick={() => onQuickView(property)}>Quick view <ArrowRight size={16} /></Button></div>
  </article>;
}

function FilterChips({ filters, setFilters }: { filters: Filters; setFilters: (update: (current: Filters) => Filters) => void }) {
  const chips = [
    ...(filters.neighborhood !== "all" ? [{ label: filters.neighborhood, clear: () => setFilters((current) => ({ ...current, neighborhood: "all" })) }] : []),
    ...(filters.propertyType !== "all" ? [{ label: filters.propertyType, clear: () => setFilters((current) => ({ ...current, propertyType: "all" })) }] : []),
    ...(filters.maxPrice < 1_250_000 ? [{ label: `Under ${formatPrice(filters.maxPrice)}`, clear: () => setFilters((current) => ({ ...current, maxPrice: 1_250_000 })) }] : []),
    ...(filters.minBeds > 0 ? [{ label: `${filters.minBeds}+ beds`, clear: () => setFilters((current) => ({ ...current, minBeds: 0 })) }] : []),
    ...(filters.minBaths > 0 ? [{ label: `${filters.minBaths}+ baths`, clear: () => setFilters((current) => ({ ...current, minBaths: 0 })) }] : []),
    ...filters.vibes.map((vibe) => ({ label: vibe, clear: () => setFilters((current) => ({ ...current, vibes: current.vibes.filter((value) => value !== vibe) })) })),
  ];
  if (chips.length === 0) return null;
  return <div className="active-chips" aria-label="Active filters">{chips.map((chip) => <Button key={chip.label} variant="chip" size="sm" onClick={chip.clear}>{chip.label}<X size={13} /></Button>)}</div>;
}

function EmptyState({ onClear }: { onClear: () => void }) {
  return <div className="empty-state"><div className="empty-icon"><Search size={24} /></div><h3>No homes found this time.</h3><p>Try loosening a filter — your next favorite might be just around the corner.</p><Button variant="outline" onClick={onClear}>Clear filters</Button></div>;
}

function FilterSheet({ filters, setFilters, clearFilters, open, setOpen }: { filters: Filters; setFilters: (update: (current: Filters) => Filters) => void; clearFilters: () => void; open: boolean; setOpen: (open: boolean) => void }) {
  return <Sheet open={open} onOpenChange={setOpen}><SheetContent side="bottom" className="filter-sheet"><SheetHeader><SheetTitle>Find your kind of home</SheetTitle><SheetDescription>Make a few little choices to narrow the search.</SheetDescription></SheetHeader><FilterControls filters={filters} setFilters={setFilters} clearFilters={clearFilters} /><Button className="w-full" onClick={() => { setOpen(false); scrollTo("homes"); }}>Show homes <ArrowRight size={16} /></Button></SheetContent></Sheet>;
}

function Listings({ filters, setFilters, savedIds, onToggleSaved, onQuickView }: { filters: Filters; setFilters: (update: (current: Filters) => Filters) => void; savedIds: string[]; onToggleSaved: (id: string) => void; onQuickView: (property: Property) => void }) {
  const [sortBy, setSortBy] = useState<SortBy>("newest");
  const [listView, setListView] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const visibleHomes = useMemo(() => {
    const results = properties.filter((property) =>
      (filters.neighborhood === "all" || property.area === filters.neighborhood) &&
      (filters.propertyType === "all" || property.type === filters.propertyType) &&
      property.price <= filters.maxPrice && property.beds >= filters.minBeds && property.baths >= filters.minBaths &&
      filters.vibes.every((vibe) => property.vibes.includes(vibe)),
    );
    return [...results].sort((a, b) => sortBy === "price-asc" ? a.price - b.price : sortBy === "price-desc" ? b.price - a.price : sortBy === "largest" ? b.sqft - a.sqft : b.listedOn.localeCompare(a.listedOn));
  }, [filters, sortBy]);
  const clearFilters = () => setFilters(() => initialFilters);
  return <section id="homes" className="section listings-section"><div className="container">
    <Reveal className="section-heading-row"><div><span className="eyebrow">A place to begin</span><h2>Homes with <em>feeling.</em></h2><p className="section-intro">Thoughtful homes in the neighborhoods that make Harborlight special.</p></div><span className="heading-aside"><span className="heading-aside-number">0{visibleHomes.length}</span><span>places to picture<br />your life</span></span></Reveal>
    <div className="listings-layout"><aside className="filter-sidebar" aria-label="Home filters"><FilterControls filters={filters} setFilters={setFilters} clearFilters={clearFilters} /></aside>
      <div className="listing-results"><div className="results-toolbar"><div className="result-count"><span>{visibleHomes.length} homes</span><span className="result-sub">to call yours</span></div><div className="toolbar-actions"><Button variant="outline" className="mobile-filter-button" onClick={() => setFilterOpen(true)}><SlidersHorizontal size={16} /> Filters</Button><div className="sort-control"><ArrowDownWideNarrow size={16} /><Select value={sortBy} onValueChange={(value) => setSortBy(value as SortBy)}><SelectTrigger aria-label="Sort homes" className="sort-select"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="newest">Newest first</SelectItem><SelectItem value="price-asc">Price: low to high</SelectItem><SelectItem value="price-desc">Price: high to low</SelectItem><SelectItem value="largest">Largest first</SelectItem></SelectContent></Select></div><div className="view-switch" role="group" aria-label="Listing layout"><Button variant={listView ? "ghost" : "default"} size="icon" aria-label="Grid view" aria-pressed={!listView} onClick={() => setListView(false)}><Layers3 /></Button><Button variant={listView ? "default" : "ghost"} size="icon" aria-label="List view" aria-pressed={listView} onClick={() => setListView(true)}><List /></Button></div></div></div>
        <FilterChips filters={filters} setFilters={setFilters} />
        {visibleHomes.length ? <div className={`property-grid${listView ? " property-grid-list" : ""}`}>{visibleHomes.map((property) => <Reveal key={property.id}><PropertyCard property={property} saved={savedIds.includes(property.id)} onToggleSaved={onToggleSaved} onQuickView={onQuickView} compact={listView} /></Reveal>)}</div> : <EmptyState onClear={clearFilters} />}
        <div className="results-note"><span className="note-icon"><ShieldCheck size={16} /></span> Every Nestora home is checked by a real local person.</div>
      </div>
    </div></div><FilterSheet filters={filters} setFilters={setFilters} clearFilters={clearFilters} open={filterOpen} setOpen={setFilterOpen} /></section>;
}

function NeighborhoodMap({ listings, onQuickView }: { listings: Property[]; onQuickView: (property: Property) => void }) {
  return <section className="section map-section" id="map"><div className="container"><Reveal className="section-heading-row map-heading"><div><span className="eyebrow">Find your corner</span><h2>Four ways to <em>feel at home.</em></h2><p className="section-intro">A little look around Harborlight — each neighborhood has its own kind of magic.</p></div><div className="map-legend"><span><i className="legend-dot legend-teal" />Homes</span><span><i className="legend-dot legend-amber" />Neighborhood average</span></div></Reveal><Reveal><ClientOnly fallback={<div className="map-loading"><LoaderCircle className="animate-spin" /><span>Opening the neighborhood map…</span></div>}><Suspense fallback={<div className="map-loading"><LoaderCircle className="animate-spin" /><span>Opening the neighborhood map…</span></div>}><LazyPropertyMap listings={listings} onQuickView={onQuickView} /></Suspense></ClientOnly></Reveal><div className="neighborhood-list">{[{ name: "Lakeside", note: "By the water, in your own rhythm", icon: "01" }, { name: "Old Town", note: "A little more life around you", icon: "02" }, { name: "Hillcrest", note: "Room to spread out and breathe", icon: "03" }, { name: "Harbour", note: "Salt air, just around the corner", icon: "04" }].map((area) => <a key={area.name} href="#homes" className="neighborhood-card" onClick={() => setTimeout(() => scrollTo("homes"), 60)}><span className="neighborhood-number">{area.icon}</span><span><strong>{area.name}</strong><small>{area.note}</small></span><MoveUpRight size={17} /></a>)}</div></div></section>;
}

const testimonials = [
  { name: "Emma & Daniel", home: "The Sunroom Villa · Lakeside", quote: "We came in thinking we'd have to compromise. Somehow, we found the one that felt like us from the first step inside.", avatar: "photo-1534528741775-53994a69daeb" },
  { name: "Sophie M.", home: "Corner Loft on Baker Lane · Old Town", quote: "I never felt rushed. My Nestora guide just listened, and then found me somewhere I hadn't even thought to look.", avatar: "photo-1544005313-94ddf0286df2" },
  { name: "Marcus & Leo", home: "Hilltop Garden House · Hillcrest", quote: "The little details made all the difference. We knew we were home before the viewing had even finished.", avatar: "photo-1500648767791-00dcc994a43e" },
];

function Testimonials() {
  const [active, setActive] = useState(0);
  const selected = testimonials[active] ?? testimonials[0]!;
  const move = (delta: number) => setActive((current) => (current + delta + testimonials.length) % testimonials.length);
  return <section className="section testimonials-section" id="reviews"><div className="container testimonial-layout"><Reveal className="testimonial-intro"><span className="eyebrow">A little word of trust</span><h2>Home is more than an <em>address.</em></h2><div className="rating-summary"><span className="rating-stars" aria-label="5 out of 5 stars">{Array.from({ length: 5 }, (_, index) => <Star key={index} fill="currentColor" />)}</span><strong>4.9 / 5</strong><span>from 1,200+ kind words</span></div><div className="as-seen"><span>Good company, good people</span><div><span>HOMES &amp; GARDENS</span><span>coastline</span><span>THE LOCAL EDIT</span></div></div></Reveal><Reveal className="testimonial-quote" aria-live="polite"><span className="quote-mark">“</span><div className="quote-stars">{Array.from({ length: 5 }, (_, index) => <Star key={index} fill="currentColor" />)}</div><blockquote>{selected.quote}</blockquote><div className="reviewer-row"><img src={`https://images.unsplash.com/${selected.avatar}?auto=format&fit=crop&w=120&h=120&q=80`} alt="" width="48" height="48" /><div><strong>{selected.name}</strong><span>{selected.home}</span></div></div><div className="carousel-controls"><span>0{active + 1} <span className="carousel-of">/ 0{testimonials.length}</span></span><div><Button variant="outline" size="icon" aria-label="Previous review" onClick={() => move(-1)}><ChevronLeft /></Button><Button variant="outline" size="icon" aria-label="Next review" onClick={() => move(1)}><ChevronRight /></Button></div></div></Reveal></div></section>;
}

function WhyNestora() {
  const cards = [
    { icon: <Sparkles />, number: "01", title: "Find your feeling", text: "Search for the everyday details you love — sun in the kitchen, space for the dog, a quiet corner to work." },
    { icon: <ShieldCheck />, number: "02", title: "Real homes, really checked", text: "Every home is personally visited and thoughtfully described by someone who knows the neighborhood." },
    { icon: <KeyRound />, number: "03", title: "Move at your own pace", text: "Come see the place. Ask every question. Find your way there without a single hard sell." },
  ];
  return <section className="section why-section" id="why"><div className="container"><Reveal className="section-heading-row"><div><span className="eyebrow">The Nestora difference</span><h2>A little more <em>you.</em></h2><p className="section-intro">Finding home can feel as good as being there.</p></div><span className="why-aside">Made for the way<br />life really feels.</span></Reveal><div className="why-grid">{cards.map((card) => <Reveal key={card.number} className="why-card"><div className="why-card-top"><span className="why-icon">{card.icon}</span><span className="why-number">{card.number}</span></div><h3>{card.title}</h3><p>{card.text}</p><a href="#contact" aria-label={`Ask about ${card.title}`}><ArrowRight size={17} /></a></Reveal>)}</div></div></section>;
}

function FieldError({ children }: { children?: ReactNode }) { return children ? <span className="field-error" role="alert">{children}</span> : null; }

function LeadForm() {
  const [submitted, setSubmitted] = useState(false);
  const [newsletterDone, setNewsletterDone] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting }, setValue, watch, reset } = useForm<LeadValues>({ resolver: zodResolver(leadSchema), defaultValues: { name: "", email: "", phone: "", interest: "Buying", message: "", consent: false } });
  const onSubmit = async (values: LeadValues) => { await new Promise((resolve) => setTimeout(resolve, 650)); void values; setSubmitted(true); reset(); };
  return <section className="section lead-section" id="contact"><div className="container"><div className="lead-layout"><Reveal className="lead-copy"><span className="eyebrow eyebrow-light">Let’s make a good move</span><h2>It starts with a <em>hello.</em></h2><p>Tell us a little about what you have in mind. A real person from our team will be in touch, at your pace.</p><ul>{["A local guide who listens first", "A thoughtful shortlist, made for you", "Viewings that work around your life"].map((benefit) => <li key={benefit}><span><Check size={14} /></span>{benefit}</li>)}</ul><div className="lead-copy-note"><span className="lead-note-icon"><House size={17} /></span><span><strong>Good homes. No pressure.</strong><small>Just a better way to get started.</small></span></div></Reveal><Reveal className="lead-form-wrap">{submitted ? <div className="lead-success" role="status"><span className="success-mark"><Check size={23} /></span><span className="eyebrow">A lovely first step</span><h3>We’ll be in touch soon.</h3><p>Thanks for the hello. Someone from our local team will follow up with you shortly.</p><Button variant="outline" onClick={() => setSubmitted(false)}>Send another note</Button></div> : <form className="lead-form" onSubmit={handleSubmit(onSubmit)} noValidate><div className="form-title-row"><div><span className="form-kicker">Let’s talk</span><h3>Tell us what you’re looking for.</h3></div><span className="form-step">01<span> / 01</span></span></div><div className="form-grid"><div className="form-field"><Label htmlFor="lead-name">Your name</Label><Input id="lead-name" placeholder="Alex Morgan" autoComplete="name" {...register("name")} aria-invalid={Boolean(errors.name)} /><FieldError>{errors.name?.message}</FieldError></div><div className="form-field"><Label htmlFor="lead-email">Email address</Label><Input id="lead-email" type="email" placeholder="alex@example.com" autoComplete="email" {...register("email")} aria-invalid={Boolean(errors.email)} /><FieldError>{errors.email?.message}</FieldError></div><div className="form-field"><Label htmlFor="lead-phone">Phone number</Label><Input id="lead-phone" type="tel" placeholder="(555) 123-4567" autoComplete="tel" {...register("phone")} aria-invalid={Boolean(errors.phone)} /><FieldError>{errors.phone?.message}</FieldError></div><div className="form-field"><Label>I'm interested in</Label><Select value={watch("interest")} onValueChange={(value: "Buying" | "Renting" | "Selling") => setValue("interest", value, { shouldValidate: true })}><SelectTrigger aria-label="I'm interested in" className="select-control"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Buying">Buying a home</SelectItem><SelectItem value="Renting">Renting a home</SelectItem><SelectItem value="Selling">Selling a home</SelectItem></SelectContent></Select></div><div className="form-field form-field-wide"><Label htmlFor="lead-message">Anything we should know?</Label><Textarea id="lead-message" rows={3} placeholder="A neighborhood you love, a little more room, a sunny kitchen…" {...register("message")} aria-invalid={Boolean(errors.message)} /><FieldError>{errors.message?.message}</FieldError></div></div><div className="form-bottom"><div className="consent-wrap"><Checkbox id="lead-consent" checked={watch("consent")} onCheckedChange={(checked) => setValue("consent", checked === true, { shouldValidate: true })} aria-invalid={Boolean(errors.consent)} /><Label htmlFor="lead-consent">It’s okay to get in touch about my home search.</Label><FieldError>{errors.consent?.message}</FieldError></div><Button type="submit" size="lg" disabled={isSubmitting}>{isSubmitting ? <><LoaderCircle className="animate-spin" size={16} /> Sending hello…</> : <>Send a hello <ArrowRight size={16} /></>}</Button></div></form>}</Reveal></div></div></section>;
}

function Footer() {
  const [subscribed, setSubscribed] = useState(false);
  const [newsletterError, setNewsletterError] = useState("");
  const submitNewsletter = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); const form = event.currentTarget; const input = form.elements.namedItem("newsletter-email"); if (!(input instanceof HTMLInputElement) || !emailSchema.safeParse(input.value).success) { setNewsletterError("Enter a valid email address."); return; } setNewsletterError(""); setSubscribed(true); form.reset(); };
  return <footer className="site-footer"><div className="container footer-main"><div className="footer-brand"><a href="#top" className="brand-link"><BrandMark /></a><p>A more thoughtful way to find the place that feels like you.</p><div className="footer-social"><a href="https://www.instagram.com/" aria-label="Nestora on Instagram" target="_blank" rel="noreferrer">ig</a><a href="https://www.pinterest.com/" aria-label="Nestora on Pinterest" target="_blank" rel="noreferrer">p</a><a href="https://www.facebook.com/" aria-label="Nestora on Facebook" target="_blank" rel="noreferrer">f</a></div></div><div className="footer-links"><div><span className="footer-heading">Find a home</span><a href="#homes">All homes</a><a href="#map">Neighborhoods</a><a href="#homes">Saved homes</a></div><div><span className="footer-heading">Get to know us</span><a href="#why">Why Nestora</a><a href="#reviews">Kind words</a><a href="#contact">Say hello</a></div></div><div className="footer-newsletter"><span className="footer-heading">A little note from home</span><p>Good homes and neighborhood stories, now and then.</p>{subscribed ? <div className="newsletter-success"><Check size={16} /> You’re on the list. See you in your inbox.</div> : <form className="newsletter-form" onSubmit={submitNewsletter}><Label htmlFor="newsletter-email" className="sr-only">Email address</Label><Input id="newsletter-email" name="newsletter-email" type="email" placeholder="Your email address" aria-describedby={newsletterError ? "newsletter-error" : undefined} /><Button type="submit" variant="newsletter" size="icon" aria-label="Subscribe to newsletter"><ArrowRight /></Button></form>}{newsletterError && <span className="field-error" id="newsletter-error" role="alert">{newsletterError}</span>}</div></div><div className="container footer-bottom"><span>© 2026 Nestora. Finding home, thoughtfully.</span><span>For the places you'll become.</span></div></footer>;
}

function VibeQuiz({ open, setOpen, selected, onChange }: { open: boolean; setOpen: (open: boolean) => void; selected: Vibe[]; onChange: (values: Vibe[]) => void }) {
  return <Dialog open={open} onOpenChange={setOpen}><DialogContent className="quiz-dialog"><DialogHeader><span className="eyebrow">A little daydream</span><DialogTitle>What does home feel like?</DialogTitle><DialogDescription>Pick what matters most. You can change your mind any time.</DialogDescription></DialogHeader><div className="quiz-vibes">{vibes.map((vibe) => { const checked = selected.includes(vibe); return <Button key={vibe} variant={checked ? "default" : "outline"} aria-pressed={checked} onClick={() => onChange(checked ? selected.filter((value) => value !== vibe) : [...selected, vibe])}><span className="quiz-check">{checked && <Check size={14} />}</span>{vibe}</Button>; })}</div><Button className="w-full" onClick={() => { setOpen(false); scrollTo("homes"); }}>Show me homes like that <ArrowRight size={16} /></Button></DialogContent></Dialog>;
}

function QuickView({ property, onClose, onToggleSaved, saved }: { property: Property | null; onClose: () => void; onToggleSaved: (id: string) => void; saved: boolean }) {
  const [imageIndex, setImageIndex] = useState(0);
  const [downPct, setDownPct] = useState(20);
  const [rate, setRate] = useState(6.5);
  const [years, setYears] = useState(30);
  const [submitted, setSubmitted] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<EnquiryValues>({ resolver: zodResolver(enquirySchema), defaultValues: { name: "", email: "" } });
  useEffect(() => { setImageIndex(0); setDownPct(20); setSubmitted(false); reset(); }, [property, reset]);
  if (!property) return null;
  const monthlyRate = rate / 100 / 12;
  const paymentCount = years * 12;
  const loan = property.price * (1 - downPct / 100);
  const monthly = monthlyRate === 0 ? loan / paymentCount : loan * monthlyRate * (1 + monthlyRate) ** paymentCount / ((1 + monthlyRate) ** paymentCount - 1);
  const activeImage = property.images[imageIndex] ?? property.images[0];
  const sendEnquiry = async (_values: EnquiryValues) => { await new Promise((resolve) => setTimeout(resolve, 500)); setSubmitted(true); reset(); };
  return <Dialog open={property !== null} onOpenChange={(open) => { if (!open) onClose(); }}><DialogContent className="quick-dialog"><DialogHeader className="quick-dialog-header"><DialogTitle>{property.name}</DialogTitle><DialogDescription>{property.area} · {property.type} · Listed {new Date(`${property.listedOn}T12:00:00`).toLocaleDateString("en-US", { month: "long", day: "numeric" })}</DialogDescription></DialogHeader><div className="quick-layout"><div className="quick-detail"><div className="gallery-main"><img src={activeImage} alt={`${property.name} interior and exterior`} width="1200" height="900" /><Button variant="heart" size="icon" className={`heart-button${saved ? " is-saved" : ""}`} aria-label={saved ? "Remove from saved homes" : "Save this home"} aria-pressed={saved} onClick={() => onToggleSaved(property.id)}><Heart fill={saved ? "currentColor" : "none"} /></Button></div><div className="gallery-thumbs" aria-label="Property photographs">{property.images.map((image, index) => <Button key={image} variant="gallery-thumb" aria-label={`Show photograph ${index + 1}`} aria-pressed={imageIndex === index} onClick={() => setImageIndex(index)}><img src={image} alt="" width="160" height="100" /></Button>)}</div><div className="quick-price-row"><div><span className="property-price">{formatPrice(property.price)}</span><div className="property-meta"><span><MapPin size={13} /> {property.area}</span></div></div><Button variant="outline" onClick={() => { onClose(); scrollTo("contact"); }}>Book a viewing <ArrowRight size={15} /></Button></div><div className="property-specs quick-specs"><span><BedDouble /> {property.beds} bedrooms</span><span><Bath /> {property.baths} baths</span><span><Ruler /> {property.sqft.toLocaleString()} sqft</span></div><p className="quick-description">{property.description}</p><div className="property-tags">{property.vibes.map((vibe) => <span key={vibe}>{vibe}</span>)}</div><div className="calculator"><div className="calculator-heading"><div><span className="form-kicker">Make the numbers feel real</span><h3>A monthly estimate</h3></div><span className="calc-payment">{formatPrice(Math.round(monthly))}<small>/mo</small></span></div><div className="calc-fields"><label>Down payment <span>{downPct}%</span><input type="range" min="5" max="50" step="5" value={downPct} onChange={(event) => setDownPct(Number(event.target.value))} /></label><label>Interest rate <span>{rate.toFixed(2)}%</span><input type="range" min="2" max="10" step="0.125" value={rate} onChange={(event) => setRate(Number(event.target.value))} /></label><label>Loan term <span>{years} years</span><input type="range" min="10" max="30" step="5" value={years} onChange={(event) => setYears(Number(event.target.value))} /></label></div><p>Estimate only; taxes, insurance and fees are not included.</p></div></div><aside className="quick-enquiry"><span className="form-kicker">This one caught your eye?</span><h3>Come see how it feels.</h3><p>Leave a little note and a local Nestora guide will be in touch.</p>{submitted ? <div className="enquiry-success" role="status"><span className="success-mark"><Check size={20} /></span><strong>Lovely. We’ll be in touch.</strong><span>Thanks for asking about {property.name}.</span></div> : <form onSubmit={handleSubmit(sendEnquiry)} noValidate><div className="form-field"><Label htmlFor="quick-name">Your name</Label><Input id="quick-name" placeholder="Alex Morgan" autoComplete="name" {...register("name")} aria-invalid={Boolean(errors.name)} /><FieldError>{errors.name?.message}</FieldError></div><div className="form-field"><Label htmlFor="quick-email">Email address</Label><Input id="quick-email" type="email" placeholder="alex@example.com" autoComplete="email" {...register("email")} aria-invalid={Boolean(errors.email)} /><FieldError>{errors.email?.message}</FieldError></div><Button type="submit" className="w-full" disabled={isSubmitting}>{isSubmitting ? <><LoaderCircle className="animate-spin" size={16} /> Sending…</> : <>Ask about this home <ArrowRight size={15} /></>}</Button><span className="privacy-note"><ShieldCheck size={14} /> Your details stay with our local team.</span></form>}</aside></div></DialogContent></Dialog>;
}

export function Marketplace() {
  const [filters, updateFilters] = useState<Filters>(initialFilters);
  const setFilters = (update: (current: Filters) => Filters) => updateFilters(update);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [quickProperty, setQuickProperty] = useState<Property | null>(null);
  const [quizOpen, setQuizOpen] = useState(false);
  const [mobileCtaVisible, setMobileCtaVisible] = useState(false);
  const visibleProperties = useMemo(() => properties.filter((property) => (filters.neighborhood === "all" || property.area === filters.neighborhood) && (filters.propertyType === "all" || property.type === filters.propertyType) && property.price <= filters.maxPrice && property.beds >= filters.minBeds && property.baths >= filters.minBaths && filters.vibes.every((vibe) => property.vibes.includes(vibe))), [filters]);
  useEffect(() => {
    const onScroll = () => setMobileCtaVisible(window.scrollY > 620);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const toggleSaved = (id: string) => setSavedIds((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id]);
  return <>
    <Header savedCount={savedIds.length} />
    <main><Hero filters={filters} setFilters={setFilters} onVibeQuiz={() => setQuizOpen(true)} /><TrustStrip /><Listings filters={filters} setFilters={setFilters} savedIds={savedIds} onToggleSaved={toggleSaved} onQuickView={setQuickProperty} /><NeighborhoodMap listings={visibleProperties} onQuickView={setQuickProperty} /><Testimonials /><WhyNestora /><LeadForm /></main>
    <Footer />
    {mobileCtaVisible && <div className="mobile-sticky-cta"><Button onClick={() => scrollTo("contact")}>Book a viewing <ArrowRight size={16} /></Button></div>}
    <QuickView property={quickProperty} onClose={() => setQuickProperty(null)} onToggleSaved={toggleSaved} saved={quickProperty ? savedIds.includes(quickProperty.id) : false} />
    <VibeQuiz open={quizOpen} setOpen={setQuizOpen} selected={filters.vibes} onChange={(selected) => setFilters((current) => ({ ...current, vibes: selected }))} />
  </>;
}