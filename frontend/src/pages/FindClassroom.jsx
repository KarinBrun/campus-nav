import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import './FindClassroom.scss';

function FindClassroom() {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [message, setMessage] = useState(
    'Enter a classroom above to begin searching.'
  );

  const navigate = useNavigate();

  const handleViewOnMap = (room) => {
    if (!room.mappedInLocationId) {
      setMessage('This room does not have a map location.');
      return;
    }

    navigate(
      `/map?location=${encodeURIComponent(room.mappedInLocationId)}`
    );
  };

  const handleGetDirections = (room) => {
    if (!room.mappedInLocationId) {
      alert('This classroom does not have a map location.');
      return;
    }

    navigate(
      `/map?directions=${encodeURIComponent(
        room.mappedInLocationId
      )}`
    );
  };

  const handleSearch = async () => {
    if (!search.trim()) {
      setResults([]);
      setMessage('Please enter a classroom.');
      return;
    }

    try {
      const token = localStorage.getItem('token');

      const response = await fetch(
        'http://localhost:5000/api/rooms',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setResults([]);
        setMessage(data.message || 'Unable to load rooms.');
        return;
      }

      const searchValue = search
        .toLowerCase()
        .trim()
        .replace(/[\s-]+/g, '');

      const filteredRooms = data.filter((room) => {
        const building =
          room.building?.toLowerCase() || '';

        const roomNumber =
          room.roomNumber?.toLowerCase() || '';

        const roomName =
          room.roomName?.toLowerCase() || '';

        const mappedInLocationId = (
          room.mappedInLocationId?.toLowerCase() || ''
          ).replace(/[\s-]+/g, '');

        const fullRoom = `${building}${roomNumber}`
          .replace(/[\s-]+/g, '');

        return (
          building.includes(searchValue) ||
          roomNumber.includes(searchValue) ||
          roomName.includes(searchValue) ||
          fullRoom.includes(searchValue) ||
          mappedInLocationId.includes(searchValue)
        );
      });

      setResults(filteredRooms);

      if (filteredRooms.length === 0) {
        setMessage('No classrooms found.');
      } else {
        setMessage('');
      }
    } catch (error) {
      console.error(error);
      setResults([]);
      setMessage('Unable to connect to the server.');
    }
  };

  return (
    <main className="find-classroom-page">
      <div className="find-classroom-container">
        <h2>Find a Classroom</h2>

        <p>
          Search for a classroom to find its location on campus.
        </p>

        <div className="classroom-search">
          <input
            type="text"
            placeholder="Enter a room, such as Krumm-6"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
          />

          <button
            type="button"
            onClick={handleSearch}
          >
            <Search size={17} aria-hidden="true" />
            Search
          </button>
        </div>

        <div className="search-results">
          <h3><Search size={20} aria-hidden="true" /> Search Results</h3>

          {message && <p>{message}</p>}

          {results.map((room) => (
            <div
              className="room-result"
              key={room._id}
            >
              <div>
                <strong>
                  {room.roomNumber === 'BASE'
                    ? room.building
                    : `${room.building}-${room.roomNumber}`}
                </strong>

                {room.roomName && (
                  <p>{room.roomName}</p>
                )}
              </div>

              <div className="room-actions">
                <button
                  type="button"
                  className="view-map-button"
                  onClick={() => handleViewOnMap(room)}
                >
                  View on Map
                </button>

                <button
                  type="button"
                  className="directions-button"
                  onClick={() => handleGetDirections(room)}
                >
                  Get Directions
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

export default FindClassroom;