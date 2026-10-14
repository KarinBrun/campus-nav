import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import NextUp from '../components/NextUp';
import { API_URL } from '../config';
import plazaImage from '../assets/Plaza.jpg';
import {
  CalendarDays,
  BookOpen,
  Users,
  Calendar,
  MapPin,
  ChevronRight,
  ArrowRight,
  Clock3,
} from 'lucide-react';
import './Home.scss';

function Home() {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  const [todayClasses, setTodayClasses] = useState([]);
  const [todayPersonalItems, setTodayPersonalItems] = useState([]);
  const [classMessage, setClassMessage] = useState(
    "Loading today's classes..."
  );
  const [upcomingPins, setUpcomingPins] = useState([]);
  const [eventMessage, setEventMessage] = useState(
    'Loading upcoming events...'
  );

  useEffect(() => {
    const loadTodayClasses = async () => {
      try {
        const token = localStorage.getItem('token');

        const response = await fetch(`${API_URL}/api/schedules`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          setClassMessage(
            data.message || "Unable to load today's classes."
          );
          return;
        }

        const daysOfWeek = [
          'Sun',
          'Mon',
          'Tue',
          'Wed',
          'Thu',
          'Fri',
          'Sat',
        ];

        const today = daysOfWeek[new Date().getDay()];

      const fullDayNames = {
        Sun: 'Sunday',
        Mon: 'Monday',
        Tue: 'Tuesday',
        Wed: 'Wednesday',
        Thu: 'Thursday',
        Fri: 'Friday',
        Sat: 'Saturday',
      };

      const todayFullName = fullDayNames[today];

      const classesForToday = (data.classes || [])
        .filter((classItem) =>
          (classItem.days || []).some(
            (day) => day === today || day === todayFullName
          )
        )
        .sort((a, b) =>
          a.startTime.localeCompare(b.startTime)
        );

        setTodayClasses(classesForToday);

        if (classesForToday.length === 0) {
          setClassMessage('No classes scheduled today.');
        } else {
          setClassMessage('');
        }
      } catch (error) {
        console.error(error);
        setClassMessage('Unable to connect to the server.');
      }
    };

    loadTodayClasses();
  }, []);

  useEffect(() => {
    const loadPersonalItems = async () => {
      try {
        const token = localStorage.getItem('token');

        const response = await fetch(
          `${API_URL}/api/schedule-items`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          console.error('Unable to load personal schedule items.');
          return;
        }

        const data = await response.json();

        const today = new Date().toLocaleDateString('en-US', {
          weekday: 'long',
        });

        const itemsForToday = data
          .filter((item) => item.days?.includes(today))
          .sort((a, b) => a.startTime.localeCompare(b.startTime));

        setTodayPersonalItems(itemsForToday);
      } catch (error) {
        console.error('Error loading personal schedule items:', error);
      }
    };

    loadPersonalItems();
  }, []);

  useEffect(() => {
    const loadUpcomingPins = async () => {
      try {
        const token = localStorage.getItem('token');

        const response = await fetch(
          `${API_URL}/api/pins`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          setEventMessage(
            data.message || 'Unable to load upcoming events.'
          );
          return;
        }

        const now = new Date();

        const nextPins = (Array.isArray(data) ? data : [])
          .filter((pin) => {
            const occurrence = pin.currentOccurrence;

            return (
              occurrence?.startTime &&
              new Date(occurrence.endTime || occurrence.startTime) > now
            );
          })
          .sort(
            (a, b) =>
              new Date(a.currentOccurrence.startTime) -
              new Date(b.currentOccurrence.startTime)
          )
          .slice(0, 3);

        setUpcomingPins(nextPins);

        if (nextPins.length === 0) {
          setEventMessage('No upcoming events or study groups.');
        } else {
          setEventMessage('');
        }
      } catch (error) {
        console.error(error);
        setEventMessage('Unable to connect to the server.');
      }
    };

    loadUpcomingPins();
  }, []);

  const todaySchedule = [
    ...todayClasses.map((item) => ({
      ...item,
      scheduleType: 'class',
    })),
    ...todayPersonalItems.map((item) => ({
      ...item,
      scheduleType: 'personal',
    })),
  ].sort((a, b) => a.startTime.localeCompare(b.startTime));

  const [currentTime, setCurrentTime] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const timeToMinutes = (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const currentMinutes =
    currentTime.getHours() * 60 + currentTime.getMinutes();

  const currentItem = todaySchedule.find(
    (item) =>
      timeToMinutes(item.startTime) <= currentMinutes &&
      timeToMinutes(item.endTime) > currentMinutes
  );

  const nextItem =
    currentItem ||
    todaySchedule.find(
      (item) => timeToMinutes(item.startTime) > currentMinutes
    );

  const highlightedItemId = nextItem
    ? `${nextItem.scheduleType}-${nextItem._id}`
    : null;

  const formatTime = (time) => {
    if (!time) return '';

    const [hour, minute] = time.split(':');
    const date = new Date();

    date.setHours(Number(hour));
    date.setMinutes(Number(minute));

    return date.toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const formatEventTime = (dateTime) => {
    if (!dateTime) return '';

    return new Date(dateTime).toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const firstName = storedUser.firstName || 'Viking';

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <main className="home">
      <section
        className="welcome-section"
        style={{ backgroundImage: `url(${plazaImage})` }}
      >
        <div className="welcome-content">
          <h2>Welcome back, {firstName}!</h2>
          <p>{currentDate}</p>
        </div>
      </section>

      <div className="mobile-next-up">
        <NextUp />
      </div>

      <section className="home-info">
        <div className="info-card today-schedule-card">
          <div className="today-schedule-header">
            <h3>
              <CalendarDays size={18} />
              Today's Schedule
            </h3>

            <span>
              {currentTime.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>

          <div className="today-schedule-list">
            {todaySchedule.length === 0 ? (
              <p className="today-schedule-empty">
                {classMessage || 'No items scheduled today.'}
              </p>
            ) : (
              todaySchedule.map((item) => {
                const itemId = `${item.scheduleType}-${item._id}`;
                const isHighlighted = highlightedItemId === itemId;

                const Icon =
                  item.scheduleType === 'class'
                    ? BookOpen
                    : item.title?.toLowerCase().includes('study')
                      ? Users
                      : Calendar;

                return (
                  <div
                    className={`today-schedule-row ${
                      isHighlighted ? 'highlighted' : ''
                    }`}
                    key={itemId}
                  >
                    <div className="today-schedule-time">
                      <strong>{formatTime(item.startTime)}</strong>
                      <span>{formatTime(item.endTime)}</span>
                    </div>

                    <div className="today-schedule-icon">
                      <Icon size={18} />
                    </div>

                    <div className="today-schedule-details">
                      <strong className="today-schedule-title">
                        {item.scheduleType === 'class'
                          ? item.courseName
                          : item.title}
                      </strong>

                      {item.scheduleType === 'class' && (
                        <span className="today-schedule-course-code">
                          {item.courseCode}
                        </span>
                      )}

                      {item.room && (
                        <span className="today-schedule-location">
                          <MapPin size={13} />
                          {item.room.building}-{item.room.roomNumber}
                        </span>
                      )}
                    </div>

                    {item.room?.mappedInLocationId && (
                      <Link
                        to={`/map?directions=${encodeURIComponent(
                          item.room.mappedInLocationId
                        )}`}
                        className="today-schedule-directions"
                        aria-label={`Get directions to ${
                          item.scheduleType === 'class'
                            ? item.courseCode
                            : item.title
                        }`}
                      >
                        <ChevronRight size={18} />
                      </Link>
                    )}
                  </div>
                );
              })
            )}
          </div>

          <Link to="/schedule" className="today-schedule-footer">
            View Full Schedule
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="info-card upcoming-events-card">
          <div className="upcoming-events-header">
            <h3>
              <CalendarDays size={18} />
              Upcoming Events
            </h3>
          </div>

          <div className="upcoming-events-list">
            {upcomingPins.length === 0 ? (
              <p className="upcoming-events-empty">
                {eventMessage || 'No upcoming events or study groups.'}
              </p>
            ) : (
              upcomingPins.map((pin) => {
                const isStudyGroup = pin.type === 'study-group';

                return (
                  <div className="upcoming-event-row" key={pin._id}>
                    <div className="upcoming-event-date">
                      <span className="event-month">
                        {new Date(pin.currentOccurrence.startTime)
                          .toLocaleDateString('en-US', { month: 'short' })
                          .toUpperCase()}
                      </span>

                      <strong className="event-day">
                        {new Date(pin.currentOccurrence.startTime)
                          .toLocaleDateString('en-US', { day: 'numeric' })}
                      </strong>

                      <span className="event-weekday">
                        {new Date(pin.currentOccurrence.startTime)
                          .toLocaleDateString('en-US', { weekday: 'short' })
                          .toUpperCase()}
                      </span>
                    </div>

                    <div className="upcoming-event-details">
                      <strong>{pin.title}</strong>

                      <span className="upcoming-event-type">
                        {isStudyGroup ? 'Study Group' : 'Event'}
                      </span>

                      {pin.currentOccurrence && (
                        <span className="upcoming-event-meta">
                          <Clock3 size={13} />
                          {formatEventTime(pin.currentOccurrence.startTime)}
                          {pin.currentOccurrence.endTime &&
                            ` - ${formatEventTime(pin.currentOccurrence.endTime)}`}
                        </span>
                      )}

                      {pin.building && pin.room && (
                        <span className="upcoming-event-meta">
                          <MapPin size={13} />
                          {pin.building}-{pin.room}
                        </span>
                      )}
                    </div>
                    {pin.mappedInLocationId && (
                      <Link
                        to={`/map?directions=${encodeURIComponent(pin.mappedInLocationId)}`}
                        className="upcoming-event-directions"
                        aria-label={`Get directions to ${pin.title}`}
                        title="Get directions"
                      >
                        <ChevronRight size={18} />
                      </Link>
                    )}
                  </div>
                );
              })
            )}
          </div>

          <Link to="/events" className="upcoming-events-footer">
            View All Events
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </main>
  );
}

export default Home;
