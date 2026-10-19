import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ClockPicker from './ClockPicker';
import DatePicker from './DatePicker';
import { API_URL } from '../config';
import { CalendarDays, Clock3, MapPin, Repeat2, UserRound, Plus, Pencil, Trash2, Navigation, Map, UsersRound } from 'lucide-react';
import './Events.scss';

function Events() {
  const [pins, setPins] = useState([]);
  const [message, setMessage] = useState(
    'Loading events and study groups...'
  );
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();
  const [showCreatePin, setShowCreatePin] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [pinForm, setPinForm] = useState({
    type: 'event',
    title: '',
    description: '',
    building: '',
    roomId: '',
    startTime: '',
    endTime: '',
    recurring: false,
    recurrenceEnd: '',
    visibility: 'public',
    sharedWith: [],
  });
  const [userSearch, setUserSearch] = useState('');
  const [userSearchResults, setUserSearchResults] = useState([]);
  const [userSearchMessage, setUserSearchMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pinsPerPage = 6;
  const [createMessage, setCreateMessage] = useState('');
  const [createMessageType, setCreateMessageType] = useState('');
  const [view, setView] = useState('upcoming');
  const [editingPin, setEditingPin] = useState(null);
  const [pinValidation, setPinValidation] = useState(false);

  const loadPins = async () => {
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
        setMessage(data.message || 'Unable to load events.');
        return;
      }

      setPins(data);

      if (data.length === 0) {
        setMessage('No upcoming events or study groups.');
      } else {
        setMessage('');
      }
    } catch (error) {
      console.error(error);
      setMessage('Unable to connect to the server.');
    }
  };

  const loadMyPins = async () => {
    try {
      const token = localStorage.getItem('token');

      const response = await fetch(
        `${API_URL}/api/pins/mine`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || 'Unable to load your pins.');
        return;
      }

      setPins(data);

      if (data.length === 0) {
        setMessage('You have not created any pins yet.');
      } else {
        setMessage('');
      }
    } catch (error) {
      console.error(error);
      setMessage('Unable to connect to the server.');
    }
  };

  useEffect(() => {
    loadPins();
  }, []);

  const filteredPins = pins.filter((pin) => {
    if (filter === 'all') {
      return true;
    }

    return pin.type === filter;
  });

  const totalPages = Math.ceil(
    filteredPins.length / pinsPerPage
  );

  const startIndex = (currentPage - 1) * pinsPerPage;

  const paginatedPins = filteredPins.slice(
    startIndex,
    startIndex + pinsPerPage
  );

  const formatDate = (dateTime) => {
  if (!dateTime) return '';

  return new Date(dateTime).toLocaleDateString([], {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
};

  const formatTime = (dateTime) => {
    if (!dateTime) return '';

    return new Date(dateTime).toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

const handleViewOnMap = (pin) => {
  if (!pin.mappedInLocationId) {
    alert('This location does not have a map location.');
    return;
  }

  navigate(
    `/map?location=${encodeURIComponent(pin.mappedInLocationId)}`
  );
};

  const handleGetDirections = (pin) => {
    if (!pin.mappedInLocationId) {
      alert('This location does not have a map location.');
      return;
    }

    navigate(
      `/map?directions=${encodeURIComponent(
        pin.mappedInLocationId
      )}`
    );
  };

  const handleOpenCreatePin = async () => {
    setEditingPin(null);
    setCreateMessage('');
    setCreateMessageType('');
    setPinValidation(false);

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
        alert(data.message || 'Unable to load rooms.');
        return;
      }

      setRooms(data);
      setShowCreatePin(true);
    } catch (error) {
      console.error(error);
      alert('Unable to connect to the server.');
    }
  };

  const handleUserSearch = async () => {
    setUserSearchMessage('');
    setUserSearchResults([]);

    if (!userSearch.trim()) {
      setUserSearchMessage('Enter a name or email to search.');
      return;
    }

    try {
      const token = localStorage.getItem('token');

      const response = await fetch(
        `${API_URL}/api/users/search?q=${encodeURIComponent(
          userSearch.trim()
        )}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setUserSearchMessage(
          data.message || 'Unable to search for users.'
        );
        return;
      }

      setUserSearchResults(data);

      if (data.length === 0) {
        setUserSearchMessage('No users found.');
      }
    } catch (error) {
      console.error(error);
      setUserSearchMessage('Unable to connect to the server.');
    }
  };

  const handleAddSharedUser = (user) => {
    const alreadyAdded = pinForm.sharedWith.some(
      (sharedUser) => sharedUser._id === user._id
    );

    if (alreadyAdded) {
      return;
    }

    setPinForm({
      ...pinForm,
      sharedWith: [...pinForm.sharedWith, user],
    });

    setUserSearch('');
    setUserSearchResults([]);
    setUserSearchMessage('');
  };

  const handleRemoveSharedUser = (userId) => {
    setPinForm({
      ...pinForm,
      sharedWith: pinForm.sharedWith.filter(
        (user) => user._id !== userId
      ),
    });
  };

  const buildings = [
    ...new Set(rooms.map((room) => room.building)),
  ].sort();

  const filteredRooms = rooms
    .filter((room) => room.building === pinForm.building)
    .sort((a, b) =>
      a.roomNumber.localeCompare(b.roomNumber, undefined, {
        numeric: true,
        sensitivity: 'base',
      })
    );

  const resetPinForm = () => {
    setPinForm({
      type: 'event',
      title: '',
      description: '',
      building: '',
      roomId: '',
      startTime: '',
      endTime: '',
      recurring: false,
      recurrenceEnd: '',
      visibility: 'public',
      sharedWith: [],
    });

    setUserSearch('');
    setUserSearchResults([]);
    setUserSearchMessage('');
  };

  const handleCancelCreatePin = () => {
    resetPinForm();
    setEditingPin(null);
    setCreateMessage('');
    setCreateMessageType('');
    setPinValidation(false);
    setShowCreatePin(false);
  };

  useEffect(() => {
    if (!showCreatePin) return;

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        handleCancelCreatePin();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [showCreatePin]);

  const getDatePart = (dateTime) => {
    if (!dateTime) return '';

    return dateTime.split('T')[0];
  };

  const getTimePart = (dateTime) => {
    if (!dateTime) return '';

    return dateTime.split('T')[1] || '';
  };

  const updateDateTime = (field, date, time) => {
    setPinForm({
      ...pinForm,
      [field]:
        date && time
          ? `${date}T${time}`
          : date
            ? `${date}T`
            : time
              ? `T${time}`
              : '',
    });
  };

  const handleCreatePin = async () => {
    setCreateMessage('');
    setCreateMessageType('');

    setPinValidation(true);

    if (
      !pinForm.title.trim() ||
      !pinForm.building ||
      !pinForm.roomId ||
      !getDatePart(pinForm.startTime) ||
      !getTimePart(pinForm.startTime) ||
      !getDatePart(pinForm.endTime) ||
      !getTimePart(pinForm.endTime)
    ) {
      setCreateMessage('Please complete all required fields.');
      setCreateMessageType('error');
      return;
    }

    if (pinForm.recurring && !pinForm.recurrenceEnd) {
      setCreateMessage(
        'Please select an end date for the weekly recurrence.'
      );
      setCreateMessageType('error');
      return;
    }

    const selectedRoom = rooms.find(
      (room) => room._id === pinForm.roomId
    );

    if (!selectedRoom) {
      setCreateMessage('Please select a valid room.');
      setCreateMessageType('error');
      return;
    }

    try {
      const token = localStorage.getItem('token');

      const requestBody = {
        type: pinForm.type,
        title: pinForm.title,
        description: pinForm.description,
        visibility: pinForm.visibility,
        sharedWith:
          pinForm.visibility === 'private'
            ? pinForm.sharedWith.map((user) => user._id)
            : [],
        building: selectedRoom.building,
        room: selectedRoom.roomNumber,
        mappedInLocationId: selectedRoom.mappedInLocationId,
        startTime: pinForm.startTime,
        endTime: pinForm.endTime,
        recurring: pinForm.recurring,
        recurrence: pinForm.recurring ? 'weekly' : null,
        recurrenceEnd: pinForm.recurring
          ? pinForm.recurrenceEnd
          : null,
      };

      const response = await fetch(
        `${API_URL}/api/pins`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(requestBody),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setCreateMessage(
          data.message || 'Unable to create pin.'
        );
        setCreateMessageType('error');
        return;
      }

      resetPinForm();
      setShowCreatePin(false);

      await loadPins();

      setCurrentPage(1);

      setCreateMessage(
        'Event or study group created successfully!'
      );
      setCreateMessageType('success');
    } catch (error) {
      console.error(error);

      setCreateMessage('Unable to connect to the server.');
      setCreateMessageType('error');
    }
  };

  const handleShowMyPins = async () => {
    setView('mine');
    setFilter('all');
    setCurrentPage(1);
    setMessage('Loading your pins...');

    await loadMyPins();
  };

  const handleShowUpcoming = async () => {
    setView('upcoming');
    setFilter('all');
    setCurrentPage(1);
    setMessage('Loading events and study groups...');

    await loadPins();
  };

  const handleDeletePin = async (pin) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${pin.title}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      const token = localStorage.getItem('token');

      const response = await fetch(
        `${API_URL}/api/pins/${pin._id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || 'Unable to delete pin.');
        return;
      }

      await loadMyPins();

      setCurrentPage(1);
    } catch (error) {
      console.error(error);
      alert('Unable to connect to the server.');
    }
  };

  const formatDateTimeInput = (dateTime) => {
    if (!dateTime) return '';

    const date = new Date(dateTime);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const handleEditPin = async (pin) => {
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

      const roomData = await response.json();

      if (!response.ok) {
        alert(roomData.message || 'Unable to load rooms.');
        return;
      }

      setRooms(roomData);

      const matchingRoom = roomData.find(
        (room) =>
          room.building === pin.building &&
          room.roomNumber === pin.room
      );

      setEditingPin(pin);

      setPinForm({
        type: pin.type,
        title: pin.title,
        description: pin.description || '',
        building: pin.building,
        roomId: matchingRoom?._id || '',
        startTime: formatDateTimeInput(pin.startTime),
        endTime: formatDateTimeInput(pin.endTime),
        recurring: pin.recurring || false,
        recurrenceEnd: pin.recurrenceEnd
          ? formatDateTimeInput(pin.recurrenceEnd).split('T')[0]
          : '',
        visibility: pin.visibility || 'public',
        sharedWith: pin.sharedWith || [],
      });

      setCreateMessage('');
      setCreateMessageType('');
      setPinValidation(false);
      setShowCreatePin(true);
    } catch (error) {
      console.error(error);
      alert('Unable to connect to the server.');
    }
  };

  const handleUpdatePin = async () => {
    setCreateMessage('');
    setCreateMessageType('');

    setPinValidation(true);

    if (
      !pinForm.title.trim() ||
      !pinForm.building ||
      !pinForm.roomId ||
      !getDatePart(pinForm.startTime) ||
      !getTimePart(pinForm.startTime) ||
      !getDatePart(pinForm.endTime) ||
      !getTimePart(pinForm.endTime)
    ) {
      setCreateMessage('Please complete all required fields.');
      setCreateMessageType('error');
      return;
    }

    if (pinForm.recurring && !pinForm.recurrenceEnd) {
      setCreateMessage(
        'Please select an end date for the weekly recurrence.'
      );
      setCreateMessageType('error');
      return;
    }

    const selectedRoom = rooms.find(
      (room) => room._id === pinForm.roomId
    );

    if (!selectedRoom) {
      setCreateMessage('Please select a valid room.');
      setCreateMessageType('error');
      return;
    }

    try {
      const token = localStorage.getItem('token');

      const requestBody = {
        type: pinForm.type,
        title: pinForm.title,
        description: pinForm.description,
        visibility: pinForm.visibility,
        sharedWith:
          pinForm.visibility === 'private'
            ? pinForm.sharedWith.map((user) => user._id)
            : [],
        building: selectedRoom.building,
        room: selectedRoom.roomNumber,
        mappedInLocationId: selectedRoom.mappedInLocationId,
        startTime: pinForm.startTime,
        endTime: pinForm.endTime,
        recurring: pinForm.recurring,
        recurrence: pinForm.recurring ? 'weekly' : null,
        recurrenceEnd: pinForm.recurring
          ? pinForm.recurrenceEnd
          : null,
      };

      const response = await fetch(
        `${API_URL}/api/pins/${editingPin._id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(requestBody),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setCreateMessage(
          data.message || 'Unable to update pin.'
        );
        setCreateMessageType('error');
        return;
      }

      resetPinForm();
      setEditingPin(null);
      setShowCreatePin(false);

      await loadMyPins();

      setCurrentPage(1);

      setCreateMessage(
        'Event or study group updated successfully!'
      );
      setCreateMessageType('success');
    } catch (error) {
      console.error(error);

      setCreateMessage('Unable to connect to the server.');
      setCreateMessageType('error');
    }
  };

  return (
    <main className="events-page">
      <div className="events-header">
        <h2>
          {view === 'upcoming'
            ? 'Events & Study Groups'
            : 'My Pins'}
        </h2>
        <p>
          {view === 'upcoming'
            ? 'Find upcoming events and study groups around campus.'
            : 'View and manage the events and study groups you created.'}
        </p>
        <div className="events-header-actions">
          <button
            type="button"
            className="create-pin-button"
            onClick={handleOpenCreatePin}
          >
            <Plus size={18} aria-hidden="true" /> Create Event or Study Group
          </button>

          {view === 'upcoming' ? (
            <button
              type="button"
              className="my-pins-button"
              onClick={handleShowMyPins}
            >
              My Pins
            </button>
          ) : (
            <button
              type="button"
              className="my-pins-button"
              onClick={handleShowUpcoming}
            >
              Back to Upcoming
            </button>
          )}
        </div>
      </div>

      {view === 'upcoming' && (
        <div className="event-filters">
            <button
              type="button"
              className={filter === 'all' ? 'active' : ''}
              onClick={() => {
                setFilter('all');
                setCurrentPage(1);
              }}
            >
              All
            </button>

            <button
              type="button"
              className={filter === 'event' ? 'active' : ''}
              onClick={() => {
                setFilter('event');
                setCurrentPage(1);
              }}
            >
              Events
            </button>

            <button
              type="button"
              className={filter === 'study-group' ? 'active' : ''}
              onClick={() => {
                setFilter('study-group');
                setCurrentPage(1);
              }}
            >
              Study Groups
            </button>
        </div>
      )}

      {message && (
        <p className="no-pins-message">{message}</p>
      )}

      {createMessage && createMessageType === 'success' && (
        <p className="create-message success">
          {createMessage}
        </p>
      )}

      <div className="pin-list">
        {paginatedPins.map((pin) => (
          <article className={`pin-card ${pin.type === 'study-group' ? 'pin-card--study' : 'pin-card--event'}`} key={pin._id}>
            <div className="pin-card-top">
              <span className="pin-card-icon" aria-hidden="true">
                {pin.type === 'study-group' ? <UsersRound size={22} /> : <CalendarDays size={22} />}
              </span>
              <div className="pin-card-content">
                <div className="pin-card-title-row">
                  <h3>{pin.title}</h3>
                  <span className="pin-type">{pin.type === 'study-group' ? 'Study Group' : 'Event'}</span>
                </div>
                {pin.description && <p className="pin-description">{pin.description}</p>}
              </div>
            </div>
            <div className="pin-details">
              <span className="pin-detail"><CalendarDays size={17} aria-hidden="true" /> {formatDate(pin.currentOccurrence?.startTime || pin.startTime)}</span>
              <span className="pin-detail"><Clock3 size={17} aria-hidden="true" /> {formatTime(pin.currentOccurrence?.startTime || pin.startTime)} – {formatTime(pin.currentOccurrence?.endTime || pin.endTime)}</span>
              <span className="pin-detail"><MapPin size={17} aria-hidden="true" /> {pin.building}{pin.room && `-${pin.room}`}</span>
              {pin.recurring && <span className="pin-detail"><Repeat2 size={17} aria-hidden="true" /> Weekly{pin.recurrenceEnd && <> until {formatDate(pin.recurrenceEnd)}</>}</span>}
              {pin.creator && <span className="pin-detail"><UserRound size={17} aria-hidden="true" /> {pin.creator.firstName} {pin.creator.lastName}</span>}
            </div>
            <div className="pin-actions">
              <button type="button" className="view-map-button" onClick={() => handleViewOnMap(pin)}><Map size={17} aria-hidden="true" /> View on Map</button>
              <button type="button" className="pin-directions-button" onClick={() => handleGetDirections(pin)}><Navigation size={17} aria-hidden="true" /> Get Directions</button>
              {view === 'mine' && <button type="button" className="edit-pin-button" onClick={() => handleEditPin(pin)}><Pencil size={16} aria-hidden="true" /> Edit</button>}
              {view === 'mine' && <button type="button" className="delete-pin-button" onClick={() => handleDeletePin(pin)}><Trash2 size={16} aria-hidden="true" /> Delete</button>}
            </div>
          </article>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() =>
              setCurrentPage((page) => page - 1)
            }
          >
            Previous
          </button>

          <span>
            Page {currentPage} of {totalPages}
          </span>

          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() =>
              setCurrentPage((page) => page + 1)
            }
          >
            Next
          </button>
        </div>
      )}

      {showCreatePin && (
        <div className="pin-modal-overlay">
          <div className="pin-modal">
            <div className="pin-modal-header">
              <h3><CalendarDays size={23} aria-hidden="true" />
                {editingPin
                  ? 'Edit Event or Study Group'
                  : 'Create Event or Study Group'}
              </h3>
              <button
                type="button"
                className="pin-modal-close"
                onClick={handleCancelCreatePin}
                aria-label="Close event form"
              >
                &times;
              </button>
            </div>

            <label>
              Type
              <select
                value={pinForm.type}
                onChange={(e) =>
                  setPinForm({
                    ...pinForm,
                    type: e.target.value,
                  })
                }
              >
                <option value="event">Event</option>
                <option value="study-group">Study Group</option>
              </select>
            </label>

            <label>
              Title
              <input
                type="text"
                className={
                  pinValidation && !pinForm.title.trim()
                    ? 'pin-field-error'
                    : ''
                }
                value={pinForm.title}
                onChange={(e) =>
                  setPinForm({
                    ...pinForm,
                    title: e.target.value,
                  })
                }
              />
            </label>

            <label>
              Description
              <textarea
                value={pinForm.description}
                onChange={(e) =>
                  setPinForm({
                    ...pinForm,
                    description: e.target.value,
                  })
                }
              />
            </label>

            <label>
              Visibility
              <select
                value={pinForm.visibility}
                onChange={(e) =>
                  setPinForm({
                    ...pinForm,
                    visibility: e.target.value,
                    sharedWith:
                      e.target.value === 'public'
                        ? []
                        : pinForm.sharedWith,
                  })
                }
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
            </label>

            {pinForm.visibility === 'private' && (
              <div className="private-sharing">
                <label>
                  Share With
                  <div className="user-search-row">
                    <input
                      type="text"
                      placeholder="Search by name or email"
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleUserSearch();
                        }
                      }}
                    />

                    <button
                      type="button"
                      onClick={handleUserSearch}
                    >
                      Search
                    </button>
                  </div>
                </label>

                {userSearchMessage && (
                  <p>{userSearchMessage}</p>
                )}

                {userSearchResults.length > 0 && (
                  <div className="user-search-results">
                    {userSearchResults.map((user) => (
                      <div
                        className="user-search-result"
                        key={user._id}
                      >
                        <span>
                          {user.firstName} {user.lastName}
                          {' — '}
                          {user.email}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleAddSharedUser(user)}
                        >
                          Add
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {pinForm.sharedWith.length > 0 && (
                  <div className="shared-users">
                    <p>
                      <strong>People with access:</strong>
                    </p>

                    {pinForm.sharedWith.map((user) => (
                      <div
                        className="shared-user"
                        key={user._id}
                      >
                        <span>
                          {user.firstName} {user.lastName}
                          {' — '}
                          {user.email}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            handleRemoveSharedUser(user._id)
                          }
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <label>
              Building
              <select
                className={
                  pinValidation && !pinForm.building
                    ? 'pin-field-error'
                    : ''
                }
                value={pinForm.building}
                onChange={(e) =>
                  setPinForm({
                    ...pinForm,
                    building: e.target.value,
                    roomId: '',
                  })
                }
              >
                <option value="">Select a building</option>

                {buildings.map((building) => (
                  <option key={building} value={building}>
                    {building}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Room
              <select
                className={
                  pinValidation && !pinForm.roomId
                    ? 'pin-field-error'
                    : ''
                }
                value={pinForm.roomId}
                disabled={!pinForm.building}
                onChange={(e) =>
                  setPinForm({
                    ...pinForm,
                    roomId: e.target.value,
                  })
                }
              >
                <option value="">
                  {pinForm.building
                    ? 'Select a room'
                    : 'Select a building first'}
                </option>

                {filteredRooms.map((room) => (
                  <option key={room._id} value={room._id}>
                    {room.roomNumber}
                    {room.roomName ? ` — ${room.roomName}` : ''}
                  </option>
                ))}
              </select>
            </label>

            <div className="event-date-time-fields">
              <div
                className={
                  pinValidation && !getDatePart(pinForm.startTime)
                    ? 'pin-date-error'
                    : ''
                }
              >
                <DatePicker
                  label="Start Date"
                  value={getDatePart(pinForm.startTime)}
                  onChange={(date) =>
                    updateDateTime('startTime', date, getTimePart(pinForm.startTime))
                  }
                />
              </div>

              <div
                className={
                  pinValidation && !getTimePart(pinForm.startTime)
                    ? 'pin-clock-error'
                    : ''
                }
              >
                <ClockPicker
                  label="Start Time"
                  value={getTimePart(pinForm.startTime)}
                  onChange={(time) =>
                    updateDateTime('startTime', getDatePart(pinForm.startTime), time)
                  }
                />
              </div>
            </div>

            <div className="event-date-time-fields">
              <div
                className={
                  pinValidation && !getDatePart(pinForm.endTime)
                    ? 'pin-date-error'
                    : ''
                }
              >
                <DatePicker
                  label="End Date"
                  value={getDatePart(pinForm.endTime)}
                  onChange={(date) =>
                    updateDateTime('endTime', date, getTimePart(pinForm.endTime))
                  }
                />
              </div>

              <div
                className={
                  pinValidation && !getTimePart(pinForm.endTime)
                    ? 'pin-clock-error'
                    : ''
                }
              >
                <ClockPicker
                  label="End Time"
                  value={getTimePart(pinForm.endTime)}
                  onChange={(time) =>
                    updateDateTime('endTime', getDatePart(pinForm.endTime), time)
                  }
                />
              </div>
            </div>

            <label className="recurring-checkbox">
              <input
                type="checkbox"
                checked={pinForm.recurring}
                onChange={(e) =>
                  setPinForm({
                    ...pinForm,
                    recurring: e.target.checked,
                  })
                }
              />
              Repeat weekly
            </label>

            {pinForm.recurring && (
              <div
                className={
                  pinValidation && !pinForm.recurrenceEnd
                    ? 'pin-date-error'
                    : ''
                }
              >
                <DatePicker
                  label="Repeat Until"
                  value={pinForm.recurrenceEnd}
                  onChange={(date) =>
                    setPinForm({
                      ...pinForm,
                      recurrenceEnd: date,
                    })
                  }
                />
              </div>
            )}

            {createMessage && createMessageType === 'error' && (
              <p className="create-message error">
                {createMessage}
              </p>
            )}

            <div className="pin-modal-actions">
              <button
                type="button"
                className="cancel-pin-button"
                onClick={handleCancelCreatePin}
              >
                Cancel
              </button>

              <button
                type="button"
                className="submit-pin-button"
                onClick={
                  editingPin
                    ? handleUpdatePin
                    : handleCreatePin
                }
              >
                {editingPin ? 'Save Changes' : 'Create Pin'}
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}

export default Events;