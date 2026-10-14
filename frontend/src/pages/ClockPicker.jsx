import { useState } from 'react';
import './ClockPicker.scss';

function ClockPicker({ value, onChange, label }) {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState('hours');
  const [selectedHour, setSelectedHour] = useState(12);
  const [selectedMinute, setSelectedMinute] = useState(0);
  const [period, setPeriod] = useState('AM');

  const formatDisplayTime = (time) => {
    if (!time) {
      return 'Select time';
    }

    const [hour, minute] = time.split(':').map(Number);
    const displayPeriod = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;

    return `${displayHour}:${String(minute).padStart(
      2,
      '0'
    )} ${displayPeriod}`;
  };

  const handleOpen = () => {
    if (value) {
      const [hour, minute] = value.split(':').map(Number);

      setSelectedHour(hour % 12 || 12);
      setSelectedMinute(minute);
      setPeriod(hour >= 12 ? 'PM' : 'AM');
    } else {
      setSelectedHour(12);
      setSelectedMinute(0);
      setPeriod('AM');
    }

    setView('hours');
    setIsOpen(true);
  };

  const handleHourSelect = (hour) => {
    setSelectedHour(hour);
    setView('minutes');
  };

  const handleMinuteSelect = (minute) => {
    setSelectedMinute(minute);
  };

  const handleConfirm = () => {
    let hour = selectedHour;

    if (period === 'AM' && hour === 12) {
      hour = 0;
    }

    if (period === 'PM' && hour !== 12) {
      hour += 12;
    }

    const formattedTime = `${String(hour).padStart(
      2,
      '0'
    )}:${String(selectedMinute).padStart(2, '0')}`;

    onChange(formattedTime);
    setIsOpen(false);
  };

  const clockNumbers =
    view === 'hours'
      ? Array.from({ length: 12 }, (_, index) =>
          index === 0 ? 12 : index
        )
      : Array.from({ length: 12 }, (_, index) => index * 5);

  return (
    <div className="clock-picker">
      <label className="clock-picker-label">
        {label}
      </label>

      <button
        type="button"
        className="clock-picker-button"
        onClick={handleOpen}
      >
        <span>{formatDisplayTime(value)}</span>
        <span className="clock-picker-icon">◷</span>
      </button>

      {isOpen && (
        <div className="clock-picker-popup">
          <div className="clock-time-display">
            <button
              type="button"
              className={view === 'hours' ? 'active' : ''}
              onClick={() => setView('hours')}
            >
              {selectedHour}
            </button>

            <span>:</span>

            <button
              type="button"
              className={view === 'minutes' ? 'active' : ''}
              onClick={() => setView('minutes')}
            >
              {String(selectedMinute).padStart(2, '0')}
            </button>

            <div className="clock-period">
              <button
                type="button"
                className={period === 'AM' ? 'active' : ''}
                onClick={() => setPeriod('AM')}
              >
                AM
              </button>

              <button
                type="button"
                className={period === 'PM' ? 'active' : ''}
                onClick={() => setPeriod('PM')}
              >
                PM
              </button>
            </div>
          </div>

<div className="analog-clock">
  <div
    className="clock-hand clock-hour-hand"
    style={{
      transform: `translateX(-50%) rotate(${
        (selectedHour % 12) * 30 + selectedMinute * 0.5
      }deg)`,
    }}
  />

            <div
              className="clock-hand clock-minute-hand"
              style={{
                transform: `translateX(-50%) rotate(${
                  selectedMinute * 6
                }deg)`,
              }}
            />

            <div className="clock-center" />

            {clockNumbers.map((number, index) => {
              const angle = index * 30;
              const radians =
                ((angle - 90) * Math.PI) / 180;

              const radius = 105;

              const x =
                125 + radius * Math.cos(radians);
              const y =
                125 + radius * Math.sin(radians);

              const isSelected =
                view === 'hours'
                  ? selectedHour === number
                  : selectedMinute === number;

              return (
                <button
                  type="button"
                  key={number}
                  className={`clock-number ${
                    isSelected ? 'selected' : ''
                  }`}
                  style={{
                    left: `${x}px`,
                    top: `${y}px`,
                  }}
                  onClick={() =>
                    view === 'hours'
                      ? handleHourSelect(number)
                      : handleMinuteSelect(number)
                  }
                >
                  {view === 'minutes'
                    ? String(number).padStart(2, '0')
                    : number}
                </button>
              );
            })}
          </div>

          <div className="clock-actions">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleConfirm}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ClockPicker;