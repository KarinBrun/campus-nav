import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { API_URL } from '../config';
import './Map.scss';

function Map() {
  const iframeRef = useRef(null);
  const [searchParams] = useSearchParams();
  const [rooms, setRooms] = useState([]);
  const [startingBuilding, setStartingBuilding] = useState('');
  const [startingRoomId, setStartingRoomId] = useState('');
  const [accessibleRoute, setAccessibleRoute] = useState(
    searchParams.get('accessible') === 'true'
  );

  const location = searchParams.get('location');
  const directions = searchParams.get('directions');
  const departure = searchParams.get('departure');
  const accessible = searchParams.get('accessible') === 'true';

  useEffect(() => {
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
        console.error('Unable to load rooms:', error);
      }
    };

    if (directions && !departure) {
      loadRooms();
    }
  }, [directions, departure]);

  const buildings = [
    ...new Set(rooms.map((room) => room.building)),
  ].sort();

  const filteredRooms = rooms.filter(
    (room) => room.building === startingBuilding
  );

  const baseRoom = filteredRooms.find(
    (room) => room.roomNumber === 'BASE'
  );

  const isBuildingOnly = Boolean(baseRoom);

  const handleStartDirections = () => {
    const selectedRoom = isBuildingOnly
      ? baseRoom
      : rooms.find((room) => room._id === startingRoomId);

    if (!selectedRoom?.mappedInLocationId) {
      return;
    }

    const params = new URLSearchParams();

    params.set('directions', directions);
    params.set('departure', selectedRoom.mappedInLocationId);

    if (accessibleRoute) {
      params.set('accessible', 'true');
    }

    window.location.href = `/map?${params.toString()}`;
  };

  useEffect(() => {
    if (!location && !directions) {
      return;
    }

    const handleMessage = (event) => {
      if (event.origin !== 'https://app.mappedin.com') {
        return;
      }

      if (event.data?.type === 'app-loaded') {
        if (directions) {
          const payload = {
            state: '/directions',
            location: directions,
          };

          if (departure) {
            payload.departure = departure;
          }

          iframeRef.current?.contentWindow?.postMessage(
            {
              type: 'set-state',
              payload,
            },
            'https://app.mappedin.com'
          );
        } else if (location) {
          iframeRef.current?.contentWindow?.postMessage(
            {
              type: 'set-state',
              payload: {
                state: '/',
                location: location,
              },
            },
            'https://app.mappedin.com'
          );
        }
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [location, directions, departure, accessible]);

  return (
    <main className="map-page">
      <div className="map-header">
        <div>
          <h2>Campus Map</h2>
          <p>
            Explore campus buildings, classrooms, events, and study groups.
          </p>
        </div>

        {directions && departure && (
          <button
            type="button"
            className="change-start-button"
            onClick={() => {
              const params = new URLSearchParams();

              params.set('directions', directions);

              window.location.href = `/map?${params.toString()}`;
            }}
          >
            Change Starting Location
          </button>
        )}
      </div>

      {directions && !departure && (
        <div className="starting-location">
          <h3 className="starting-location-heading"><MapPin size={22} aria-hidden="true" /> Choose Your Starting Location</h3>

          <p>
            Select the building and room you are currently in.
          </p>

          <div className="starting-location-fields">
            <label>
              Building
              <select
                value={startingBuilding}
                onChange={(e) => {
                  setStartingBuilding(e.target.value);
                  setStartingRoomId('');
                }}
              >
                <option value="">Select a building</option>

                {buildings.map((building) => (
                  <option key={building} value={building}>
                    {building}
                  </option>
                ))}
              </select>
            </label>

            {startingBuilding && !isBuildingOnly && (
              <label>
                Room
                <select
                  value={startingRoomId}
                  onChange={(e) => setStartingRoomId(e.target.value)}
                >
                  <option value="">Select a room</option>

                    {[...filteredRooms]
                      .sort((a, b) =>
                        a.roomNumber.localeCompare(
                          b.roomNumber,
                          undefined,
                          { numeric: true }
                        )
                      )
                      .map((room) => (
                        <option key={room._id} value={room._id}>
                          {room.roomNumber}
                          {room.roomName ? ` — ${room.roomName}` : ''}
                        </option>
                    ))}
                </select>
              </label>
            )}
          </div>
          <label className="accessible-route-option">
            <input
              type="checkbox"
              checked={accessibleRoute}
              onChange={(e) => setAccessibleRoute(e.target.checked)}
            />
            Use accessible route
          </label>
          <button
            type="button"
            className="start-directions-button"
            disabled={
              !startingBuilding ||
              (!isBuildingOnly && !startingRoomId)
            }
            onClick={handleStartDirections}
          >
            Start Directions
          </button>
        </div>
      )}

      {(!directions || departure) && (
        <div className="map-container">
          <iframe
            ref={iframeRef}
            src={
              directions && departure
                ? `https://app.mappedin.com/map/6aaaa8c8f10622000be36c07/directions?embedded=true&location=${encodeURIComponent(
                    directions
                  )}&departure=${encodeURIComponent(
                    departure
                  )}${accessible ? '&accessible=true' : ''}`
                : `https://app.mappedin.com/map/6aaaa8c8f10622000be36c07?embedded=true`
            }
            title="Campus Nav Map"
            allow="clipboard-write; web-share"
            scrolling="no"
          ></iframe>
        </div>
      )}
    </main>
  );
}

export default Map;