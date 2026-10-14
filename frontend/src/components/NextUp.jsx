import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  Calendar,
  CalendarDays,
  Clock3,
  MapPin,
} from 'lucide-react';

function NextUp() {
  const [classes, setClasses] = useState([]);
  const [scheduleItems, setScheduleItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(() => new Date());
  const navigate = useNavigate();

  useEffect(() => {
    const loadSchedule = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        const [classesResponse, itemsResponse] = await Promise.all([
          fetch('http://localhost:5000/api/schedules', { headers }),
          fetch('http://localhost:5000/api/schedule-items', { headers }),
        ]);

        if (!classesResponse.ok || !itemsResponse.ok) {
          throw new Error('Unable to load schedule.');
        }

        const classesData = await classesResponse.json();
        const itemsData = await itemsResponse.json();

        setClasses(classesData.classes || []);
        setScheduleItems(Array.isArray(itemsData) ? itemsData : []);
      } catch (error) {
        console.error('Error loading next schedule item:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSchedule();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const dayNames = [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday',
    'Thursday', 'Friday', 'Saturday',
  ];

  const dayAbbreviations = {
    Sun: 'Sunday',
    Mon: 'Monday',
    Tue: 'Tuesday',
    Wed: 'Wednesday',
    Thu: 'Thursday',
    Fri: 'Friday',
    Sat: 'Saturday',
  };

  const allItems = [
    ...classes.map((item) => ({ ...item, scheduleType: 'class' })),
    ...scheduleItems.map((item) => ({ ...item, scheduleType: 'personal' })),
  ];

  const occurrences = [];

  allItems.forEach((item) => {
    if (!item.startTime || !item.endTime) return;

    (item.days || []).forEach((day) => {
      const fullDay = dayAbbreviations[day] || day;
      const dayIndex = dayNames.indexOf(fullDay);
      if (dayIndex === -1) return;

      const [startHour, startMinute] = item.startTime.split(':').map(Number);
      const [endHour, endMinute] = item.endTime.split(':').map(Number);
      const daysAhead = (dayIndex - now.getDay() + 7) % 7;

      // Include this week's occurrence and the following week's occurrence.
      for (const weekOffset of [0, 7]) {
        const start = new Date(now);
        start.setHours(startHour, startMinute, 0, 0);
        start.setDate(start.getDate() + daysAhead + weekOffset);

        const end = new Date(start);
        end.setHours(endHour, endMinute, 0, 0);

        if (end <= start) {
          end.setDate(end.getDate() + 1);
        }

        if (end > now) {
          occurrences.push({ item, start, end, day: fullDay });
        }
      }
    });
  });

  occurrences.sort((a, b) => a.start - b.start);

  // The earliest-started item takes priority while it is in progress.
  const currentItem = occurrences.find(
    (occurrence) => occurrence.start <= now && occurrence.end > now
  );

  const nextItem = currentItem || occurrences.find(
    (occurrence) => occurrence.start > now
  ) || null;

  const formatTime = (time) => {
    if (!time) return '';
    const [hour, minute] = time.split(':').map(Number);
    const date = new Date();
    date.setHours(hour, minute, 0, 0);

    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const handleNavigate = () => {
    const locationId = nextItem?.item.room?.mappedInLocationId;
    if (locationId) {
      navigate(`/map?directions=${encodeURIComponent(locationId)}`);
    }
  };

  return (
    <section className="next-up-card">
      <h3 className="next-up-heading">
        <CalendarDays size={15} />
        Next Up
      </h3>

      {loading ? (
        <p>Loading schedule...</p>
      ) : nextItem ? (
        <>
          <div className="next-up-title">
            <div className="next-up-item-icon">
              {nextItem.item.scheduleType === 'class' ? (
                <BookOpen size={16} />
              ) : (
                <Calendar size={16} />
              )}
            </div>

            <div className="next-up-item-text" style={{ minWidth: 0 }}>
              <h4 style={{ fontWeight: 700, margin: 0 }}>
                {nextItem.item.scheduleType === 'class'
                  ? nextItem.item.courseName
                  : nextItem.item.title}
              </h4>
              {nextItem.item.scheduleType === 'class' && (
                <span
                  className="next-up-course-code"
                  style={{ display: 'block', fontSize: '0.82em', fontWeight: 500, color: 'var(--text-secondary)', marginTop: '2px' }}
                >
                  {nextItem.item.courseCode}
                </span>
              )}
            </div>
          </div>

          <p className="next-up-detail">
            <Clock3 size={13} />
            <span>
              {nextItem.day}, {formatTime(nextItem.item.startTime)}
              {' - '}
              {formatTime(nextItem.item.endTime)}
            </span>
          </p>

          {nextItem.item.room && (
            <p className="next-up-detail">
              <MapPin size={13} />
              <span>
                {nextItem.item.room.building}-{nextItem.item.room.roomNumber}
              </span>
            </p>
          )}

          {nextItem.item.room?.mappedInLocationId && (
            <button type="button" onClick={handleNavigate}>
              Navigate To
              <ArrowRight size={15} />
            </button>
          )}
        </>
      ) : (
        <p>No upcoming schedule items.</p>
      )}

      <Link to="/schedule">View All</Link>
    </section>
  );
}

export default NextUp;
