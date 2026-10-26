import { ROWS, SEATS_PER_ROW } from '../utils.js';

export default function SeatMap({ booked, selected, onToggle, disabled }) {
  const bookedSet = new Set(booked);
  const selectedSet = new Set(selected);

  return (
    <div className="seatmap" role="group" aria-label="Seat map">
      <div className="screen" aria-hidden="true">
        <span>Screen this way</span>
      </div>

      <div className="seat-rows">
        {ROWS.map((row) => (
          <div className="seat-row" key={row}>
            <span className="row-label" aria-hidden="true">{row}</span>
            {Array.from({ length: SEATS_PER_ROW }, (_, i) => {
              const id = `${row}${i + 1}`;
              const isBooked = bookedSet.has(id);
              const isSelected = selectedSet.has(id);
              return (
                <button
                  key={id}
                  type="button"
                  className={`seat ${isBooked ? 'booked' : ''} ${isSelected ? 'selected' : ''} ${i === 4 ? 'gap-after' : ''}`}
                  disabled={isBooked || disabled}
                  aria-pressed={isSelected}
                  aria-label={`Seat ${id}, ${isBooked ? 'taken' : isSelected ? 'selected' : 'available'}`}
                  onClick={() => onToggle(id)}
                >
                  {i + 1}
                </button>
              );
            })}
            <span className="row-label" aria-hidden="true">{row}</span>
          </div>
        ))}
      </div>

      <ul className="legend" aria-label="Legend">
        <li><span className="seat sample" /> Available</li>
        <li><span className="seat sample selected" /> Selected</li>
        <li><span className="seat sample booked" /> Taken</li>
      </ul>
    </div>
  );
}
