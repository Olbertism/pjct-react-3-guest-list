import './App.css';
import { useEffect, useRef, useState } from 'react';

// TODOs
// handle loading issue when the app starts, but the server is unavailable - i think I did with the refetch and settimeout

export default function App() {
  const baseUrl = 'http://localhost:4000';

  // for inputs
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  // for API
  const [guests, setGuests] = useState([]);
  const [refetch, setRefetch] = useState(true);
  const [loading, setLoading] = useState(true);

  // identifier for input fields
  const inputFirstName = useRef(null);
  const inputLastName = useRef(null);

  useEffect(() => {
    console.log('starting fetch guests useEffect...');

    async function getGuests() {
      const response = await fetch(`${baseUrl}/guests`);
      setLoading(false);
      const allGuests = await response.json();
      setGuests(allGuests);
      console.log('fetch succeded!');

    }
    getGuests().catch(() => {
      console.log('fetch failed, retrying in 5 seconds');
      setTimeout(() => setRefetch(!refetch), 5000);
    });
  }, [refetch]);

  async function createGuest(newGuest) {
    const response = await fetch(`${baseUrl}/guests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        firstName: newGuest[0],
        lastName: newGuest[1],
      }),
    });
    const createdGuest = await response.json();
    const newGuests = [...guests, createdGuest];
    console.log(newGuests);
    setGuests(newGuests);

    inputFirstName.current.value = '';
    setFirstName('');
    inputLastName.current.value = '';
    setLastName('');
  }

  async function deleteGuest(id) {
    // const response =
    await fetch(`${baseUrl}/guests/${id}`, {
      method: 'DELETE',
    });
    // const deletedGuest = await response.json();
    setRefetch(!refetch);
  }

  async function updateAttendance(id, status) {
    // status: boolean
    // const response =
    await fetch(`${baseUrl}/guests/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ attending: status }),
    });
    // const updatedGuest = await response.json();
    setRefetch(!refetch);
  }

  return (
    <div className="App">
      <h1>The coolest Party in the world</h1>
      <h3>Who is going to be there?</h3>
      <div className="inputArea">
        <label>
          First name
          <input
            disabled={loading ? true : false}
            ref={inputFirstName}
            onChange={(event) => {
              setFirstName(event.currentTarget.value);
            }}
          />
        </label>
        <label>
          Last name
          <input
            disabled={loading ? true : false}
            ref={inputLastName}
            onChange={(event) => {
              setLastName(event.currentTarget.value);
            }}
            onKeyDown={(event) => {
              if (
                event.key === 'Enter' &&
                firstName !== '' &&
                lastName !== ''
              ) {
                createGuest([firstName, lastName]).catch(
                  'something went wrong while creating a guest',
                );
              }
            }}
          />
        </label>
      </div>
      <div className="enterHint">Hit enter!</div>
      <div className="API">
        <h3>The coolest people of the world</h3>
        {loading ? (
          <h2>Loading...</h2>
        ) : (
          <div>
            {guests.map((guest) => {
              return (
                <div className="guestCard" data-test-id="guest" key={guest.id}>
                  <span className="name">{`${guest.firstName} ${guest.lastName}`}</span>
                  <div>
                    <label>
                      is attending?
                      <input
                        checked={guest.attending}
                        type="checkbox"
                        aria-label="attending"
                        onChange={(event) => {
                          console.log(event.currentTarget);
                          updateAttendance(
                            guest.id,
                            event.currentTarget.checked,
                          ).catch(() => {});
                        }}
                      />
                    </label>
                    <button
                      aria-label="Remove"
                      onClick={() => {
                        deleteGuest(guest.id).catch(() => {});
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
