import { useEffect, useMemo, useState } from "react";
import Nav from "../components/Nav";
import LinkCard from "../components/LinkCard";
import PhotoLightbox from "../components/PhotoLightbox";
import ShowsScheduleToggle from "../components/ShowsScheduleToggle";
import ShowsTable from "../components/ShowsTable";
import { PLACEHOLDER_PHOTOS } from "../constants/placeholders";
import { useFadeIn } from "../hooks/useFadeIn";
import { api } from "../utils/api";
import { filterShowsBySchedule } from "../utils/showDates";

const SECTION_HEADING = "font-display text-center text-4xl text-ember";
const SECTION_PARA = "mx-auto max-w-3xl text-justify leading-relaxed text-pretty";

function Section({ id, children, className = "", compact = false }) {
  const ref = useFadeIn();
  const padding = compact ? "py-4 md:py-5" : "py-6 md:py-8";
  return (
    <section id={id} ref={ref} className={`fade-in-section px-4 ${padding} ${className}`}>
      <div className="mx-auto max-w-6xl">{children}</div>
    </section>
  );
}

export default function LandingPage() {
  const [bio, setBio] = useState("");
  const [motto, setMotto] = useState("");
  const [shows, setShows] = useState([]);
  const [links, setLinks] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [lightboxPhoto, setLightboxPhoto] = useState(null);
  const [showSchedule, setShowSchedule] = useState("upcoming");

  const displayShows = useMemo(
    () => filterShowsBySchedule(shows, showSchedule),
    [shows, showSchedule]
  );

  useEffect(() => {
    Promise.all([api.getBio(), api.getMotto(), api.getShows(), api.getLinks(), api.getPhotos()])
      .then(([bioRes, mottoRes, showsRes, linksRes, photosRes]) => {
        setBio(bioRes.content || "");
        setMotto(mottoRes.content || "");
        setShows(showsRes);
        setLinks(linksRes);
        setPhotos(photosRes);
      })
      .catch((err) => {
        console.error("Failed to load site content from API:", err);
      });
  }, []);

  const galleryPhotos = useMemo(
    () => (photos.length > 0 ? photos : PLACEHOLDER_PHOTOS),
    [photos]
  );
  const usingPlaceholders = photos.length === 0;

  return (
    <div className="min-h-screen">
      <Nav />

      <section
        id="hero"
        className="relative overflow-hidden bg-hero bg-ink px-4 pb-3 pt-20 md:pb-4 md:pt-24"
      >
        <div className="mx-auto max-w-6xl">
          <div className="hero-art hero-stack mx-auto max-w-md sm:max-w-lg md:max-w-xl">
            <img
              src="/img/BYB_Street_Small.png"
              alt="Illustration of Blue Yonder Boys playing acoustic guitars"
              width={884}
              height={511}
              className="hero-photo"
              fetchPriority="high"
            />
            <h1 className="hero-logo-overlay">
              <img
                src="/img/BYB_Name_V2.png"
                alt="Blue Yonder Boys"
                width={1536}
                height={1024}
              />
            </h1>
          </div>
          <p className="mt-3 text-center text-[0.65rem] uppercase tracking-[0.3em] text-ember/90 sm:text-xs sm:tracking-[0.35em]">
            Fort Collins, Colorado · Acoustic Guitar Duo
          </p>
          {motto && (
            <p className="mx-auto mt-2 max-w-lg text-center text-sm leading-relaxed text-smoke/90 md:text-base">
              {motto}
            </p>
          )}
        </div>
      </section>

      <Section id="links" compact className="border-y border-leather/30 bg-bark/60 !py-4 md:!py-5">
        <h2 className={SECTION_HEADING}>Connect</h2>
        <p className={`mt-2 text-sm text-smoke md:text-base ${SECTION_PARA}`}>
          Connect with us online, send a digital tip through Venmo, or send us an email for booking inquiries.
        </p>
        <div className="mt-4 grid grid-cols-4 gap-2">
          {links.map((link) => (
            <LinkCard key={link.id} link={link} />
          ))}
        </div>
      </Section>

      <Section id="about">
        <h2 className={SECTION_HEADING}>About</h2>
        <p className={`${SECTION_PARA} mt-4 text-lg text-stone-200/90`}>{bio || "Loading…"}</p>
      </Section>

      <Section id="shows">
        <h2 className={SECTION_HEADING}>Shows</h2>
        <div className="mt-4 flex justify-center">
          <ShowsScheduleToggle value={showSchedule} onChange={setShowSchedule} />
        </div>
        <ShowsTable shows={displayShows} schedule={showSchedule} size="lg" />
      </Section>

      <Section id="photos" className="bg-midnight/30">
        <h2 className={SECTION_HEADING}>Photos</h2>
        {usingPlaceholders && (
          <p className={`mt-2 text-sm text-smoke/80 ${SECTION_PARA}`}>
            Placeholder gallery — upload real photos anytime in admin.
          </p>
        )}
        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
          {galleryPhotos.map((photo) => (
            <figure
              key={photo.id}
              className={`overflow-hidden rounded-lg border bg-ink ${
                usingPlaceholders ? "border-leather/40" : "border-leather/50"
              }`}
            >
              <button
                type="button"
                onClick={() => setLightboxPhoto(photo)}
                className="group block w-full cursor-zoom-in text-left"
                aria-label={`View ${photo.caption || "band photo"} full screen`}
              >
                <img
                  src={photo.url}
                  alt={photo.caption || "Band photo"}
                  className="aspect-[4/5] w-full object-cover transition duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              </button>
            </figure>
          ))}
        </div>
      </Section>

      <PhotoLightbox photo={lightboxPhoto} onClose={() => setLightboxPhoto(null)} />

      <footer className="border-t border-leather/40 py-8 text-center text-xs uppercase tracking-widest text-smoke/70">
        © {new Date().getFullYear()} Blue Yonder Boys · Fort Collins, CO
      </footer>
    </div>
  );
}
