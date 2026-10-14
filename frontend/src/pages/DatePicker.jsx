import { useEffect, useRef, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import './DatePicker.scss';

const toDate = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return null;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
    ? date : null;
};

const toValue = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

const sameDay = (a, b) => a && b && toValue(a) === toValue(b);

function DatePicker({ label, value, onChange }) {
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(() => {
    const selected = toDate(value);
    return new Date((selected || new Date()).getFullYear(), (selected || new Date()).getMonth(), 1);
  });
  const rootRef = useRef(null);
  const selected = toDate(value);
  const today = new Date();

  useEffect(() => {
    if (!open) return;
    const dismiss = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', dismiss);
    return () => document.removeEventListener('pointerdown', dismiss);
  }, [open]);

  const toggle = () => {
    if (!open) {
      const initial = toDate(value) || new Date();
      setMonth(new Date(initial.getFullYear(), initial.getMonth(), 1));
    }
    setOpen(!open);
  };

  const firstWeekday = month.getDay();
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const days = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];

  return (
    <div className="custom-date-picker" ref={rootRef} onKeyDown={(event) => {
      if (event.key === 'Escape' && open) {
        event.stopPropagation();
        setOpen(false);
      }
    }}>
      <span className="custom-date-picker-label">{label}</span>
      <button
        type="button"
        className="custom-date-picker-trigger"
        onClick={toggle}
        aria-label={`${label}: ${selected ? selected.toLocaleDateString() : 'Select date'}`}
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <span className={selected ? '' : 'custom-date-placeholder'}>
          {selected ? selected.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }) : 'mm/dd/yyyy'}
        </span>
        <CalendarDays size={19} aria-hidden="true" />
      </button>
      {open && (
        <div className="custom-date-calendar" role="dialog" aria-label={`${label} calendar`}>
          <div className="custom-date-calendar-header">
            <strong>{month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</strong>
            <div className="custom-date-calendar-navigation">
              <button type="button" aria-label="Previous month" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}><ChevronLeft size={19} /></button>
              <button type="button" aria-label="Next month" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}><ChevronRight size={19} /></button>
            </div>
          </div>
          <div className="custom-date-calendar-grid">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => <span key={day} className="custom-date-weekday">{day}</span>)}
            {days.map((day, index) => {
              if (!day) return <span key={`empty-${index}`} />;
              const date = new Date(month.getFullYear(), month.getMonth(), day);
              return (
                <button
                  type="button"
                  key={day}
                  className={[
                    'custom-date-day',
                    sameDay(date, today) ? 'is-today' : '',
                    sameDay(date, selected) ? 'is-selected' : '',
                  ].filter(Boolean).join(' ')}
                  aria-label={date.toLocaleDateString('en-US', { dateStyle: 'full' })}
                  aria-pressed={!!sameDay(date, selected)}
                  onClick={() => { onChange(toValue(date)); setOpen(false); }}
                >{day}</button>
              );
            })}
          </div>
          <div className="custom-date-calendar-footer">
            <button type="button" onClick={() => { onChange(''); setOpen(false); }}>Clear</button>
            <button type="button" onClick={() => { onChange(toValue(today)); setOpen(false); }}>Today</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DatePicker;
