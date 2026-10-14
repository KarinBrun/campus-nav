import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ClockPicker from './ClockPicker';
import { API_URL } from '../config';
import { CalendarDays, BookOpen, CalendarCheck, Clock3, MapPin, Search, Navigation, Trash2, Pencil } from 'lucide-react';
import './Schedule.scss';

function Schedule() {
  const [classes, setClasses] = useState([]);
  const [message, setMessage] = useState('Loading schedule...');
  const [showAddClass, setShowAddClass] = useState(false);
  

  const getToday = () => {
    const today = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
    });

    const weekdays = [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
    ];

    return weekdays.includes(today) ? today : 'Monday';
  };

  const [selectedDay, setSelectedDay] = useState(getToday);
  const [availableClasses, setAvailableClasses] = useState([]);
  const [classSearch, setClassSearch] = useState('');
  const [addMessage, setAddMessage] = useState('');
  const [addMessageType, setAddMessageType] = useState('');
  const [scheduleItems, setScheduleItems] = useState([]);
  const [showAddScheduleItem, setShowAddScheduleItem] = useState(false);
  const [scheduleItemForm, setScheduleItemForm] = useState({
    title: '',
    description: '',
    days: [],
    startTime: '',
    endTime: '',
    room: '',
  });
const [rooms, setRooms] = useState([]);
const [selectedBuilding, setSelectedBuilding] = useState('');
const [editingScheduleItem, setEditingScheduleItem] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (!showAddClass && !showAddScheduleItem) return;

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setShowAddClass(false);
        setShowAddScheduleItem(false);
        setEditingScheduleItem(null);
      }
    };

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [showAddClass, showAddScheduleItem]);

  useEffect(() => {
    const loadSchedule = async () => {
      try {
        const token = localStorage.getItem('token');

        const response = await fetch(
          `${API_URL}/api/schedules`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          setMessage(data.message || 'Unable to load schedule.');
          return;
        }

        setClasses(
          (data.classes || []).map((classItem) => ({
            ...classItem,
            days: (classItem.days || []).map((day) => ({
              Mon: 'Monday',
              Tue: 'Tuesday',
              Wed: 'Wednesday',
              Thu: 'Thursday',
              Fri: 'Friday',
              Sat: 'Saturday',
              Sun: 'Sunday',
            }[day] || day)),
          }))
        );
        setMessage('');

      } catch (error) {
        console.error(error);
        setMessage('Unable to connect to the server.');
      }
    };

    const loadScheduleItems = async () => {
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

        const data = await response.json();

        if (!response.ok) {
          console.error(
            data.message || 'Unable to load schedule items.'
          );
          return;
        }

        setScheduleItems(data);
      } catch (error) {
        console.error(
          'Error loading schedule items:',
          error
        );
      }
    };

    const loadRooms = async () => {
      try {
        const token = localStorage.getItem('token');

        const response = await fetch(
          `${API_URL}/api/rooms`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          console.error(
            data.message || 'Unable to load rooms.'
          );
          return;
        }

        setRooms(data);
      } catch (error) {
        console.error('Error loading rooms:', error);
      }
    };

    loadSchedule();
    loadScheduleItems();
    loadRooms();
  }, []);

  const handleAddScheduleItem = async () => {
    if (
      !scheduleItemForm.title.trim() ||
      scheduleItemForm.days.length === 0 ||
      !scheduleItemForm.startTime ||
      !scheduleItemForm.endTime
    ) {
      alert(
        'Please enter a title, select at least one day, and enter the start and end times.'
      );
      return;
    }

    if (
      scheduleItemForm.endTime <=
      scheduleItemForm.startTime
    ) {
      alert('End time must be after start time.');
      return;
    }

    try {
      const token = localStorage.getItem('token');

      const response = await fetch(
        `${API_URL}/api/schedule-items`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(scheduleItemForm),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.message ||
            'Unable to add schedule item.'
        );
        return;
      }

      setScheduleItems([
        ...scheduleItems,
        data,
      ]);

      setScheduleItemForm({
        title: '',
        description: '',
        days: [],
        startTime: '',
        endTime: '',
        room: '',
      });

      setSelectedBuilding('');

      setShowAddScheduleItem(false);
    } catch (error) {
      console.error(error);
      alert('Unable to connect to the server.');
    }
  };

  const handleUpdateScheduleItem = async () => {
    if (
      !scheduleItemForm.title.trim() ||
      scheduleItemForm.days.length === 0 ||
      !scheduleItemForm.startTime ||
      !scheduleItemForm.endTime
    ) {
      alert(
        'Please enter a title, select at least one day, and enter the start and end times.'
      );
      return;
    }

    if (
      scheduleItemForm.endTime <=
      scheduleItemForm.startTime
    ) {
      alert('End time must be after start time.');
      return;
    }

    try {
      const token = localStorage.getItem('token');

      const response = await fetch(
        `${API_URL}/api/schedule-items/${editingScheduleItem._id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(scheduleItemForm),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.message ||
            'Unable to update schedule item.'
        );
        return;
      }

      setScheduleItems(
        scheduleItems.map((item) =>
          item._id === data._id ? data : item
        )
      );

      setScheduleItemForm({
        title: '',
        description: '',
        days: [],
        startTime: '',
        endTime: '',
        room: '',
      });

      setSelectedBuilding('');
      setEditingScheduleItem(null);
      setShowAddScheduleItem(false);
    } catch (error) {
      console.error(error);
      alert('Unable to connect to the server.');
    }
  };

  const handleOpenAddClass = async () => {
    setAddMessage('');

    try {
      const token = localStorage.getItem('token');

      const response = await fetch(
        `${API_URL}/api/classes`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setAddMessage(data.message || 'Unable to load classes.');
        setShowAddClass(true);
        return;
      }

      setAvailableClasses(data);
      setShowAddClass(true);
    } catch (error) {
      console.error(error);
      setAddMessage('Unable to connect to the server.');
      setShowAddClass(true);
    }
  };

  const handleAddClass = async (classId) => {
    setAddMessage('');
    setAddMessageType('');

    try {
      const token = localStorage.getItem('token');

      const response = await fetch(
        `${API_URL}/api/schedules/classes/${classId}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setAddMessage(data.message || 'Unable to add class.');
        setAddMessageType('error');
        return;
      }

      setClasses(data.schedule.classes);
      setMessage('');

      setAddMessage('✓ Class added to your schedule!');
      setAddMessageType('success');
    } catch (error) {
      console.error(error);

      setAddMessage('Unable to connect to the server.');
      setAddMessageType('error');
    }
  };

  const handleRemoveClass = async (classItem) => {
    const confirmed = window.confirm(
      `Are you sure you want to remove ${classItem.courseCode} from your schedule?`
    );

    if (!confirmed) {
      return;
    }

    try {
      const token = localStorage.getItem('token');

      const response = await fetch(
        `${API_URL}/api/schedules/classes/${classItem._id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || 'Unable to remove class.');
        return;
      }

      setClasses(data.schedule.classes);

    } catch (error) {
      console.error(error);
      alert('Unable to connect to the server.');
    }
  };

  const handleEditScheduleItem = (item) => {
    setEditingScheduleItem(item);

    setScheduleItemForm({
      title: item.title || '',
      description: item.description || '',
      days: item.days || [],
      startTime: item.startTime || '',
      endTime: item.endTime || '',
      room: item.room?._id || '',
    });

    setSelectedBuilding(
      item.room?.building || ''
    );

    setShowAddScheduleItem(true);
  };

  const handleOpenAddScheduleItem = () => {
    setEditingScheduleItem(null);

    setScheduleItemForm({
      title: '',
      description: '',
      days: [],
      startTime: '',
      endTime: '',
      room: '',
    });

    setSelectedBuilding('');
    setShowAddScheduleItem(true);
  };

  const handleDeleteScheduleItem = async (item) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${item.title} from your schedule?`
    );

    if (!confirmed) {
      return;
    }

    try {
      const token = localStorage.getItem('token');

      const response = await fetch(
        `${API_URL}/api/schedule-items/${item._id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.message ||
            'Unable to delete schedule item.'
        );
        return;
      }

      setScheduleItems(
        scheduleItems.filter(
          (scheduleItem) =>
            scheduleItem._id !== item._id
        )
      );
    } catch (error) {
      console.error(error);
      alert('Unable to connect to the server.');
    }
  };

  const handleGetDirections = (classItem) => {
    if (!classItem.room?.mappedInLocationId) {
      alert('This classroom does not have a map location.');
      return;
    }

    navigate(
      `/map?directions=${encodeURIComponent(
        classItem.room.mappedInLocationId
      )}`
    );
  };

  const daysOfWeek = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
  ];

  const scheduleByDay = daysOfWeek.map((day) => {
    const dayClasses = classes
      .filter((classItem) => classItem.days.includes(day))
      .map((classItem) => ({
        ...classItem,
        scheduleType: 'class',
      }));

    const dayPersonalItems = scheduleItems
      .filter((item) => item.days.includes(day))
      .map((item) => ({
        ...item,
        scheduleType: 'personal',
      }));

    const items = [
      ...dayClasses,
      ...dayPersonalItems,
    ].sort((a, b) =>
      a.startTime.localeCompare(b.startTime)
    );

    return {
      day,
      items,
    };
  });

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

  const getNextItem = () => {
    const now = new Date();

    const dayIndexes = {
      Sunday: 0,
      Monday: 1,
      Tuesday: 2,
      Wednesday: 3,
      Thursday: 4,
      Friday: 5,
      Saturday: 6,
    };

    const upcomingItems = [];

    const allItems = [
      ...classes.map((classItem) => ({
        ...classItem,
        scheduleType: 'class',
      })),

      ...scheduleItems.map((item) => ({
        ...item,
        scheduleType: 'personal',
      })),
    ];

    allItems.forEach((item) => {
      item.days.forEach((day) => {
        if (!daysOfWeek.includes(day)) {
          return;
        }

        const [hour, minute] = item.startTime
          .split(':')
          .map(Number);

        const itemDate = new Date(now);

        let daysAhead =
          dayIndexes[day] - now.getDay();

        if (daysAhead < 0) {
          daysAhead += 7;
        }

        itemDate.setDate(
          now.getDate() + daysAhead
        );

        itemDate.setHours(
          hour,
          minute,
          0,
          0
        );

        if (itemDate <= now) {
          itemDate.setDate(
            itemDate.getDate() + 7
          );
        }

        upcomingItems.push({
          item,
          day,
          date: itemDate,
        });
      });
    });

    upcomingItems.sort(
      (a, b) => a.date - b.date
    );

    return upcomingItems[0] || null;
  };

  const nextItem = getNextItem();

  const [currentTime, setCurrentTime] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const selectedDayItems = scheduleByDay.find(
    (dayGroup) => dayGroup.day === selectedDay
  )?.items || [];
  const todayName = currentTime.toLocaleDateString('en-US', { weekday: 'long' });
  const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
  const toMinutes = (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };
  const highlightedScheduleItem = selectedDay === todayName
    ? selectedDayItems.find((item) =>
        toMinutes(item.startTime) <= currentMinutes &&
        toMinutes(item.endTime) > currentMinutes
      ) || selectedDayItems.find((item) => toMinutes(item.startTime) > currentMinutes)
    : null;


  return (
    <main className="schedule-page">
      <div className="schedule-container">

        <div className="schedule-header">
          <div>
            <h2>My Schedule</h2>

            <p>
              View your classes and quickly navigate to your classrooms.
            </p>
          </div>

          <div className="schedule-header-actions">
            <button
              type="button"
              className="add-class-button"
              onClick={handleOpenAddClass}
            >
              Add Class
            </button>

            <button
              type="button"
              className="add-class-button"
              onClick={handleOpenAddScheduleItem}
            >
              Add Schedule Item
            </button>
          </div>
        </div>

        <section className="schedule-section">
          <h3 className="weekly-schedule-title"><CalendarDays size={20} aria-hidden="true" /> Weekly Schedule</h3>

          {message && (
            <div className="empty-schedule">
              <p>{message}</p>
            </div>
          )}

          <div className="schedule-day-tabs">
            {daysOfWeek.map((day) => (
              <button
                type="button"
                key={day}
                className={
                  selectedDay === day
                    ? 'schedule-day-tab active'
                    : 'schedule-day-tab'
                }
                onClick={() => setSelectedDay(day)}
              >
                <span className="day-full">{day}</span>
                <span className="day-short">
                  {day.slice(0, 3)}
                </span>
              </button>
            ))}
          </div>

          {nextItem && (
            <div className="next-class-card">
              <div className="next-class-info">
                <p className="next-class-label">
                  Next Up
                  {nextItem.day !== getToday() && (
                    <span> • {nextItem.day}</span>
                  )}
                </p>

                {nextItem.item.scheduleType === 'class' ? (
                  <>
                    <h4>{nextItem.item.courseName}</h4>
                    <p className="next-class-code">{nextItem.item.courseCode}</p>
                  </>
                ) : (
                  <h4>{nextItem.item.title}</h4>
                )}

                <p>
                  {formatTime(nextItem.item.startTime)}

                  {nextItem.item.room && (
                    <>
                      {' • '}
                      {nextItem.item.room.building}-
                      {nextItem.item.room.roomNumber}
                    </>
                  )}
                </p>
              </div>

              {nextItem.item.room && (
                <button
                  type="button"
                  className="next-class-directions-button"
                  onClick={() =>
                    handleGetDirections(nextItem.item)
                  }
                >
                  <Navigation size={17} aria-hidden="true" /> Get Directions
                </button>
              )}
            </div>
          )}

          <div className="selected-day-schedule">
            <h3 className="schedule-day-heading">
              {selectedDay}
            </h3>

            {scheduleByDay.find(
              (dayGroup) => dayGroup.day === selectedDay
            )?.items.length === 0 ? (
              <div className="empty-day">
                <p>
                  No items scheduled for {selectedDay}.
                </p>
              </div>
            ) : (
              <div className="class-list">
                {scheduleByDay
                  .find(
                    (dayGroup) =>
                      dayGroup.day === selectedDay
                  )
                  ?.items.map((item) => (
                    <div
                      className={`class-card ${
                        item.scheduleType === 'personal'
                          ? 'personal-schedule-card'
                          : ''
                      } ${highlightedScheduleItem &&
                        highlightedScheduleItem._id === item._id &&
                        highlightedScheduleItem.scheduleType === item.scheduleType
                          ? 'schedule-highlighted'
                          : ''}`}
                      key={`${selectedDay}-${item.scheduleType}-${item._id}`}
                    >
                      <div className="schedule-row-time">
                        <strong>{formatTime(item.startTime)}</strong>
                        <span>{formatTime(item.endTime)}</span>
                      </div>
                      <div className="schedule-item-icon" aria-hidden="true">
                        {item.scheduleType === 'personal' ? <CalendarCheck size={19} /> : <BookOpen size={19} />}
                      </div>
                      <div className="class-info">
                        {highlightedScheduleItem && highlightedScheduleItem._id === item._id && highlightedScheduleItem.scheduleType === item.scheduleType && (
                          <span className="schedule-current-label">{toMinutes(item.startTime) <= currentMinutes ? 'In progress' : 'Up next today'}</span>
                        )}
                        {item.scheduleType === 'class' ? (
                          <>
                            <h4>{item.courseName}</h4>
                            <p className="schedule-course-code">{item.courseCode}</p>

                            <p>
                              <span className="schedule-instructor">Instructor: {item.instructor}</span>
                            </p>
                          </>
                        ) : (
                          <>
                            <h4>{item.title}</h4>

                            {item.description && (
                              <p className="class-name">
                                {item.description}
                              </p>
                            )}
                          </>
                        )}

                        {item.room && (
                          <p>
                            <strong>Room:</strong>{' '}
                            {item.room.building}-
                            {item.room.roomNumber}
                          </p>
                        )}
                      </div>

                      <div className="schedule-class-actions">
                        {item.room && (
                          <button
                            type="button"
                            className="schedule-directions-button"
                            onClick={() =>
                              handleGetDirections(item)
                            }
                          >
                            <Navigation size={17} aria-hidden="true" /> Get Directions
                          </button>
                        )}

                        {item.scheduleType === 'class' && (
                          <button
                            type="button"
                            className="remove-class-button"
                            onClick={() =>
                              handleRemoveClass(item)
                            }
                          >
                            <Trash2 size={16} aria-hidden="true" /> Remove
                          </button>
                        )}

                        {item.scheduleType === 'personal' && (
                          <>
                            <button
                              type="button"
                              className="schedule-edit-button"
                              onClick={() => handleEditScheduleItem(item)}
                            >
                              <Pencil size={16} aria-hidden="true" /> Edit
                            </button>

                            <button
                              type="button"
                              className="remove-class-button"
                              onClick={() =>
                                handleDeleteScheduleItem(item)
                              }
                            >
                              <Trash2 size={16} aria-hidden="true" /> Delete
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </section>

        {showAddScheduleItem && (
          <div className="modal-overlay">
            <div className="add-class-modal">
              <div className="modal-header">
                <h3>
                  {editingScheduleItem
                    ? 'Edit Schedule Item'
                    : 'Add Schedule Item'}
                </h3>

                <button
                  type="button"
                  className="close-modal-button"
                  onClick={() => {
                    setShowAddScheduleItem(false);
                    setEditingScheduleItem(null);
                    setSelectedBuilding('');

                    setScheduleItemForm({
                      title: '',
                      description: '',
                      days: [],
                      startTime: '',
                      endTime: '',
                      room: '',
                    });
                  }}
                >
                  ×
                </button>
              </div>

              <div className="schedule-item-form">
                <label>
                  Title
                  <input
                    type="text"
                    value={scheduleItemForm.title}
                    onChange={(e) =>
                      setScheduleItemForm({
                        ...scheduleItemForm,
                        title: e.target.value,
                      })
                    }
                    placeholder="Example: Volleyball Practice"
                  />
                </label>

                <label>
                  Description
                  <textarea
                    value={scheduleItemForm.description}
                    onChange={(e) =>
                      setScheduleItemForm({
                        ...scheduleItemForm,
                        description: e.target.value,
                      })
                    }
                    placeholder="Optional description"
                  />
                </label>

                <label>
                  Building
                  <select
                    value={selectedBuilding}
                    onChange={(e) => {
                      setSelectedBuilding(e.target.value);

                      setScheduleItemForm({
                        ...scheduleItemForm,
                        room: '',
                      });
                    }}
                  >
                    <option value="">No location</option>

                    {[...new Set(rooms.map((room) => room.building))]
                      .sort()
                      .map((building) => (
                        <option
                          key={building}
                          value={building}
                        >
                          {building}
                        </option>
                      ))}
                  </select>
                </label>

                {selectedBuilding && (
                  <label>
                    Room
                    <select
                      value={scheduleItemForm.room}
                      onChange={(e) =>
                        setScheduleItemForm({
                          ...scheduleItemForm,
                          room: e.target.value,
                        })
                      }
                    >
                      <option value="">Select a room</option>

                      {rooms
                        .filter(
                          (room) =>
                            room.building === selectedBuilding &&
                            room.roomNumber !== 'BASE'
                        )
                        .sort((a, b) =>
                          a.roomNumber.localeCompare(
                            b.roomNumber,
                            undefined,
                            { numeric: true }
                          )
                        )
                        .map((room) => (
                          <option
                            key={room._id}
                            value={room._id}
                          >
                            {room.roomNumber}
                            {room.roomName
                              ? ` - ${room.roomName}`
                              : ''}
                          </option>
                        ))}
                    </select>
                  </label>
                )}

                <div className="schedule-item-days">
                  <p>Days</p>

                  {daysOfWeek.map((day) => (
                    <label key={day}>
                      <input
                        type="checkbox"
                        checked={scheduleItemForm.days.includes(day)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setScheduleItemForm({
                              ...scheduleItemForm,
                              days: [
                                ...scheduleItemForm.days,
                                day,
                              ],
                            });
                          } else {
                            setScheduleItemForm({
                              ...scheduleItemForm,
                              days:
                                scheduleItemForm.days.filter(
                                  (selectedDay) =>
                                    selectedDay !== day
                                ),
                            });
                          }
                        }}
                      />

                      {day}
                    </label>
                  ))}
                </div>

                <ClockPicker
                  label="Start Time"
                  value={scheduleItemForm.startTime}
                  onChange={(time) =>
                    setScheduleItemForm({
                      ...scheduleItemForm,
                      startTime: time,
                    })
                  }
                />

                <ClockPicker
                  label="End Time"
                  value={scheduleItemForm.endTime}
                  onChange={(time) =>
                    setScheduleItemForm({
                      ...scheduleItemForm,
                      endTime: time,
                    })
                  }
                />

                <button
                  type="button"
                  className="add-class-button"
                  onClick={
                    editingScheduleItem
                      ? handleUpdateScheduleItem
                      : handleAddScheduleItem
                  }
                >
                  {editingScheduleItem
                    ? 'Save Changes'
                    : 'Add to Schedule'}
                </button>
              </div>
            </div>
          </div>
        )}

        {showAddClass && (
          <div className="modal-overlay">
            <div className="add-class-modal add-class-list-modal">
              <div className="modal-header">
                <h3>Add a Class</h3>

                <button
                  type="button"
                  className="close-modal-button"
                  aria-label="Close Add Class"
                  onClick={() =>
                    setShowAddClass(false)
                  }
                >
                  ×
                </button>
              </div>

              <div className="add-class-modal-content">
              <div className="class-search-field">
                <Search size={19} aria-hidden="true" />
                <input
                  type="text"
                  className="class-search-input"
                  placeholder="Search classes..."
                  aria-label="Search classes"
                  value={classSearch}
                  onChange={(e) => setClassSearch(e.target.value)}
                />
              </div>

              {addMessage && (
                <div
                  className={`add-class-message ${addMessageType}`}
                >
                  {addMessage}
                </div>
              )}

              <div className="available-class-list">
                {availableClasses
                  .filter((classItem) => {
                    const searchValue =
                      classSearch.toLowerCase();

                    return (
                      classItem.courseCode
                        ?.toLowerCase()
                        .includes(searchValue) ||
                      classItem.courseName
                        ?.toLowerCase()
                        .includes(searchValue) ||
                      classItem.instructor
                        ?.toLowerCase()
                        .includes(searchValue)
                    );
                  })
                  .map((classItem) => (
                    <div
                      className="available-class"
                      key={classItem._id}
                    >
                      <div>
                        <strong>
                          {classItem.courseCode}
                        </strong>

                        <p>
                          {classItem.courseName}
                        </p>

                        <p className="available-class-schedule">
                          <strong>Days:</strong>{' '}
                          {classItem.days?.length ? classItem.days.join(', ') : 'Not specified'}
                        </p>
                        <p className="available-class-schedule">
                          <strong>Time:</strong>{' '}
                          {formatTime(classItem.startTime)} - {formatTime(classItem.endTime)}
                        </p>

                        {classItem.room && (
                          <p>
                            {classItem.room.building}-
                            {classItem.room.roomNumber}
                          </p>
                        )}
                      </div>

                      {classes.some(
                        (scheduledClass) =>
                          scheduledClass._id ===
                          classItem._id
                      ) ? (
                        <button
                          type="button"
                          className="class-added-button"
                          disabled
                        >
                          Added ✓
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            handleAddClass(
                              classItem._id
                            )
                          }
                        >
                          Add
                        </button>
                      )}
                    </div>
                  ))}
              </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default Schedule;