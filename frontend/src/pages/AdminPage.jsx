import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import AdminAlert from "../components/AdminAlert";
import ShowTimePicker from "../components/ShowTimePicker";
import ShowsScheduleToggle from "../components/ShowsScheduleToggle";
import ShowsTable from "../components/ShowsTable";
import { api, formatApiError } from "../utils/api";
import { clearAuthToken, isAuthenticated, setAuthToken } from "../utils/auth";
import {
  filterShowsBySchedule,
  formatTimeFromParts,
  parseTimeParts,
  toDateInputValue,
} from "../utils/showDates";

function LoginForm({ onSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const { access_token } = await api.login(username, password);
      setAuthToken(access_token);
      onSuccess();
    } catch (err) {
      setError(err.message || "Login failed");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-4">
      <form onSubmit={submit} className="w-full max-w-md rounded-lg border border-leather bg-bark p-8 shadow-xl">
        <h1 className="font-display text-3xl text-ember">Admin</h1>
        <p className="mt-2 text-sm text-smoke">Sign in to manage site content.</p>
        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
        <label className="mt-6 block text-xs uppercase tracking-widest text-smoke">
          Username
          <input
            className="mt-1 w-full rounded border border-leather bg-ink px-3 py-2 text-stone-100"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
          />
        </label>
        <label className="mt-4 block text-xs uppercase tracking-widest text-smoke">
          Password
          <input
            type="password"
            className="mt-1 w-full rounded border border-leather bg-ink px-3 py-2 text-stone-100"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </label>
        <button
          type="submit"
          className="mt-6 w-full rounded bg-rust px-4 py-2 text-sm uppercase tracking-widest text-stone-50 transition hover:bg-rust/90"
        >
          Sign in
        </button>
      </form>
    </div>
  );
}

const SHOW_TEXT_FIELDS = [
  { key: "venue", label: "Venue" },
  { key: "address", label: "Address" },
];

const emptyShow = { date: "", time: "", venue: "", address: "", is_active: 1 };

function AdminDashboard() {
  const [tab, setTab] = useState("bio");
  const [bio, setBio] = useState("");
  const [motto, setMotto] = useState("");
  const [shows, setShows] = useState([]);
  const [links, setLinks] = useState([]);
  const [linkDrafts, setLinkDrafts] = useState({});
  const [photos, setPhotos] = useState([]);
  const [alert, setAlert] = useState(null);
  const [uploading, setUploading] = useState(false);
  const successTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);

  const [showForm, setShowForm] = useState(emptyShow);
  const [timeSlot, setTimeSlot] = useState("7:00");
  const [timePeriod, setTimePeriod] = useState("PM");
  const [showSchedule, setShowSchedule] = useState("upcoming");
  const [editingShowId, setEditingShowId] = useState(null);

  const displayShows = useMemo(
    () => filterShowsBySchedule(shows, showSchedule),
    [shows, showSchedule]
  );

  const refresh = () =>
    Promise.all([api.getBio(), api.getMotto(), api.getShows(), api.getLinks(), api.getPhotos()]).then(
      ([b, m, s, l, p]) => {
        setBio(b.content);
        setMotto(m.content);
        setShows(s);
        setLinks(l);
        setLinkDrafts(Object.fromEntries(l.map((link) => [link.id, link.url])));
        setPhotos(p);
      }
    );

  useEffect(() => {
    refresh().catch((err) => showError(err, "Could not load admin content."));
  }, []);

  useEffect(
    () => () => {
      if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current);
    },
    []
  );

  const dismissAlert = () => {
    setAlert(null);
    if (successTimeoutRef.current) {
      clearTimeout(successTimeoutRef.current);
      successTimeoutRef.current = null;
    }
  };

  const showError = (err, fallback = "Something went wrong. Please try again.") => {
    if (successTimeoutRef.current) {
      clearTimeout(successTimeoutRef.current);
      successTimeoutRef.current = null;
    }
    setAlert({ type: "error", message: formatApiError(err) || fallback });
  };

  const showSuccess = (text) => {
    setAlert({ type: "success", message: text });
    if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current);
    successTimeoutRef.current = setTimeout(() => {
      setAlert(null);
      successTimeoutRef.current = null;
    }, 4000);
  };

  const saveBio = async () => {
    try {
      await Promise.all([api.updateBio(bio), api.updateMotto(motto)]);
      showSuccess("Bio and band motto saved.");
    } catch (err) {
      showError(err, "Could not save bio or motto.");
    }
  };

  const resetShowForm = () => {
    setShowForm(emptyShow);
    setTimeSlot("7:00");
    setTimePeriod("PM");
    setEditingShowId(null);
  };

  const saveShow = async (e) => {
    e.preventDefault();
    const payload = {
      ...showForm,
      time: formatTimeFromParts(timeSlot, timePeriod),
    };
    try {
      if (editingShowId) {
        await api.updateShow(editingShowId, payload);
      } else {
        await api.createShow(payload);
      }
      resetShowForm();
      await refresh();
      showSuccess("Show saved.");
    } catch (err) {
      showError(err, "Could not save show.");
    }
  };

  const editShow = (show) => {
    setEditingShowId(show.id);
    const { slot, period } = parseTimeParts(show.time);
    setTimeSlot(slot);
    setTimePeriod(period);
    setShowForm({
      date: toDateInputValue(show.date),
      time: show.time || "",
      venue: show.venue,
      address: show.address || show.location || "",
      is_active: show.is_active,
    });
  };

  const removeShow = async (id) => {
    try {
      await api.deleteShow(id);
      await refresh();
      showSuccess("Show deleted.");
    } catch (err) {
      showError(err, "Could not delete show.");
    }
  };

  const saveAllLinks = async () => {
    try {
      await api.updateLinksBatch(
        links.map((link) => ({ id: link.id, url: linkDrafts[link.id] ?? link.url }))
      );
      await refresh();
      showSuccess("All links saved.");
    } catch (err) {
      showError(err, "Could not save links.");
    }
  };

  const onUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await api.uploadPhoto(file);
      await refresh();
      showSuccess("Photo uploaded.");
    } catch (err) {
      showError(err, "Photo upload failed.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const removePhoto = async (id) => {
    if (!window.confirm("Delete this photo?")) return;
    try {
      await api.deletePhoto(id);
      await refresh();
      showSuccess("Photo deleted.");
    } catch (err) {
      showError(err, "Could not delete photo.");
    }
  };

  const tabs = [
    { id: "bio", label: "Bio" },
    { id: "photos", label: "Photos" },
    { id: "shows", label: "Shows" },
    { id: "links", label: "Links" },
  ];

  return (
    <div className="min-h-screen bg-ink px-4 py-10">
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="font-display text-3xl text-ember">Admin Dashboard</h1>
          <div className="flex flex-wrap items-center gap-4">
            <Link
              to="/"
              className="text-xs uppercase tracking-widest text-smoke transition hover:text-ember"
            >
              View site
            </Link>
            <button
              type="button"
              onClick={() => {
                clearAuthToken();
                window.location.reload();
              }}
              className="text-xs uppercase tracking-widest text-smoke hover:text-ember"
            >
              Log out
            </button>
          </div>
        </div>
        <AdminAlert type={alert?.type} message={alert?.message} onDismiss={dismissAlert} />

        <div className="mt-8 flex flex-wrap gap-2">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`rounded px-4 py-2 text-xs uppercase tracking-widest ${
                tab === t.id ? "bg-rust text-stone-50" : "border border-leather text-smoke"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="mt-8 rounded-lg border border-leather bg-bark p-6">
          {tab === "bio" && (
            <>
              <label className="block text-xs uppercase tracking-widest text-ember">Band motto</label>
              <input
                type="text"
                className="mt-2 w-full rounded border border-leather bg-ink p-3 text-stone-100"
                value={motto}
                onChange={(e) => setMotto(e.target.value)}
                placeholder="Short tagline shown under the hero image"
              />
              <label className="mt-6 block text-xs uppercase tracking-widest text-ember">Bio</label>
              <textarea
                className="mt-2 min-h-[200px] w-full rounded border border-leather bg-ink p-3 text-stone-100"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
              <button
                type="button"
                onClick={saveBio}
                className="mt-4 rounded bg-rust px-4 py-2 text-xs uppercase tracking-widest text-stone-50"
              >
                Save bio &amp; motto
              </button>
            </>
          )}

          {tab === "photos" && (
            <>
              <p className="text-sm text-smoke">Upload band photos (JPG, PNG, GIF, or WebP).</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                className="sr-only"
                onChange={onUpload}
              />
              <button
                type="button"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
                className="mt-4 rounded-lg border border-ember/50 bg-rust px-5 py-2.5 text-sm font-medium uppercase tracking-widest text-stone-50 transition hover:bg-rust/90 disabled:opacity-50"
              >
                {uploading ? "Uploading…" : "+ Upload photo"}
              </button>

              <h3 className="mt-8 text-xs uppercase tracking-widest text-ember">
                Current photos ({photos.length})
              </h3>
              {photos.length === 0 ? (
                <p className="mt-3 text-sm text-smoke">No photos yet.</p>
              ) : (
                <ul className="mt-4 space-y-4">
                  {photos.map((p) => (
                    <li
                      key={p.id}
                      className="flex flex-col gap-3 rounded-lg border border-leather/50 bg-ink/50 p-3 sm:flex-row sm:items-center"
                    >
                      <img
                        src={p.url}
                        alt={p.caption || "Uploaded photo"}
                        className="h-24 w-32 shrink-0 rounded object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-stone-200">Photo #{p.id}</p>
                        {p.caption && <p className="mt-1 text-xs text-smoke">{p.caption}</p>}
                      </div>
                      <button
                        type="button"
                        onClick={() => removePhoto(p.id)}
                        className="shrink-0 rounded border border-red-400/50 px-3 py-1.5 text-xs uppercase tracking-widest text-red-400 hover:bg-red-400/10"
                      >
                        Delete
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}

          {tab === "shows" && (
            <>
              <form onSubmit={saveShow} className="grid gap-3 sm:grid-cols-2">
                <label className="text-xs uppercase tracking-widest text-smoke">
                  Date
                  <input
                    type="date"
                    className="mt-1 w-full rounded border border-leather bg-ink px-3 py-2 text-stone-100 [color-scheme:dark]"
                    value={toDateInputValue(showForm.date)}
                    onChange={(e) => setShowForm({ ...showForm, date: e.target.value })}
                    required
                  />
                </label>
                <ShowTimePicker
                  slot={timeSlot}
                  period={timePeriod}
                  onSlotChange={setTimeSlot}
                  onPeriodChange={setTimePeriod}
                />
                {SHOW_TEXT_FIELDS.map(({ key, label }) => (
                  <label key={key} className="text-xs uppercase tracking-widest text-smoke">
                    {label}
                    <input
                      className="mt-1 w-full rounded border border-leather bg-ink px-3 py-2 text-stone-100"
                      value={showForm[key]}
                      onChange={(e) => setShowForm({ ...showForm, [key]: e.target.value })}
                      required={key === "venue" || key === "address"}
                    />
                  </label>
                ))}
                <div className="flex gap-3 sm:col-span-2">
                  <button
                    type="submit"
                    className="rounded bg-rust px-4 py-2 text-xs uppercase tracking-widest text-stone-50"
                  >
                    {editingShowId ? "Update show" : "Add show"}
                  </button>
                  {editingShowId && (
                    <button
                      type="button"
                      className="text-xs uppercase tracking-widest text-smoke"
                      onClick={resetShowForm}
                    >
                      Cancel edit
                    </button>
                  )}
                </div>
              </form>
              <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
                <h3 className="text-xs uppercase tracking-widest text-ember">Scheduled shows</h3>
                <ShowsScheduleToggle value={showSchedule} onChange={setShowSchedule} />
              </div>
              <ShowsTable
                shows={displayShows}
                schedule={showSchedule}
                onEdit={editShow}
                onDelete={removeShow}
              />
            </>
          )}

          {tab === "links" && (
            <>
              <ul className="space-y-4">
                {links.map((link) => (
                  <li key={link.id}>
                    <label className="text-xs uppercase tracking-widest text-ember">{link.label}</label>
                    <input
                      className="mt-1 w-full rounded border border-leather bg-ink px-3 py-2 text-stone-100"
                      value={linkDrafts[link.id] ?? link.url}
                      onChange={(e) =>
                        setLinkDrafts((prev) => ({ ...prev, [link.id]: e.target.value }))
                      }
                    />
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={saveAllLinks}
                className="mt-6 rounded bg-rust px-5 py-2 text-xs uppercase tracking-widest text-stone-50"
              >
                Save all links
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(isAuthenticated());

  if (!authed) {
    return <LoginForm onSuccess={() => setAuthed(true)} />;
  }

  return <AdminDashboard />;
}
