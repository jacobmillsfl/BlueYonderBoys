import {
  formatShowDate,
  formatShowTime,
  googleMapsSearchUrl,
  showAddress,
} from "../utils/showDates";

const mapLinkClass =
  "font-medium text-ember underline decoration-ember/40 underline-offset-2 transition hover:text-horizon";

export default function ShowsTable({
  shows,
  schedule,
  size = "default",
  emptyUpcoming = "No upcoming shows — check back soon.",
  emptyPast = "No past shows to display.",
  onEdit,
  onDelete,
}) {
  const emptyMessage = schedule === "past" ? emptyPast : emptyUpcoming;
  const admin = Boolean(onEdit || onDelete);
  const large = size === "lg";
  const tableText = large ? "text-base md:text-lg" : "text-sm";
  const headText = large ? "text-sm md:text-base" : "text-xs";
  const cellPad = large ? "px-5 py-4 md:px-6 md:py-5" : "px-4 py-3";
  const emptyText = large ? "text-base md:text-lg" : "text-sm";

  if (shows.length === 0) {
    return (
      <p
        className={`mx-auto mt-4 max-w-3xl text-pretty text-justify leading-relaxed text-smoke ${emptyText}`}
      >
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="mt-4 overflow-x-auto rounded-lg border border-leather/50">
      <table
        className={`w-full border-collapse text-left leading-relaxed ${tableText} ${
          large ? "min-w-[540px]" : "min-w-[480px]"
        }`}
      >
        <thead>
          <tr
            className={`border-b border-leather/50 bg-midnight/60 uppercase tracking-widest text-ember ${headText}`}
          >
            <th className={`${cellPad} font-medium`}>Date</th>
            <th className={`${cellPad} font-medium`}>Time</th>
            <th className={`${cellPad} font-medium`}>Venue</th>
            <th className={`${cellPad} font-medium`}>Address</th>
            {admin && <th className={`${cellPad} text-right font-medium`}>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {shows.map((show, index) => {
            const address = showAddress(show);
            return (
              <tr
                key={show.id}
                className={`border-b border-leather/30 ${
                  index % 2 === 0 ? "bg-bark/40" : "bg-ink/30"
                }`}
              >
                <td className={`whitespace-nowrap text-stone-200 ${cellPad}`}>
                  {formatShowDate(show.date)}
                </td>
                <td className={`whitespace-nowrap text-stone-200 ${cellPad}`}>
                  {formatShowTime(show.time)}
                </td>
                <td className={`text-stone-200 ${cellPad}`}>{show.venue}</td>
                <td className={`text-stone-200 ${cellPad}`}>
                  {address ? (
                    <a
                      href={googleMapsSearchUrl(show)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={mapLinkClass}
                    >
                      {address}
                    </a>
                  ) : (
                    "—"
                  )}
                </td>
                {admin && (
                  <td className={`text-right ${cellPad}`}>
                    <span className="inline-flex gap-3">
                      {onEdit && (
                        <button
                          type="button"
                          onClick={() => onEdit(show)}
                          className="text-xs uppercase tracking-widest text-ember hover:text-horizon"
                        >
                          Edit
                        </button>
                      )}
                      {onDelete && (
                        <button
                          type="button"
                          onClick={() => onDelete(show.id)}
                          className="text-xs uppercase tracking-widest text-red-400 hover:text-red-300"
                        >
                          Delete
                        </button>
                      )}
                    </span>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
