import './App.css';
import { useEffect, useRef, useState } from 'react';

export default function App() {
  const baseUrl = 'https://upleveled-guest-list-api.herokuapp.com';
  // const baseUrl = 'http://localhost:4000';

  // for inputs
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  // for API
  const [guests, setGuests] = useState([]);
  const [refetch, setRefetch] = useState(true);
  const [loading, setLoading] = useState(true);

  // for filters
  const [activeFilter, setActiveFilter] = useState(false);

  // identifier for input fields
  const inputFirstName = useRef(null);
  const inputLastName = useRef(null);

  console.log('Loading is...:', loading);
  console.log('Active filter? ', activeFilter);

  useEffect(() => {
    console.log('Fetching guests...');

    async function getGuests() {
      const response = await fetch(`${baseUrl}/guests`);
      setLoading(false);
      const allGuests = await response.json();
      setGuests(allGuests);
      console.log('fetch succeded!');
    }
    getGuests().catch(() => {
      console.log('fetch failed, retrying in 10 seconds...');
      setTimeout(() => setRefetch(!refetch), 10000);
    });
  }, [refetch]);

  async function createGuest(newGuest) {
    const response = await fetch(`${baseUrl}/guests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        firstName: newGuest[0].trim(),
        lastName: newGuest[1].trim(),
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
    // if (activeFilter) {setGuests(originalGuests)};
    const response = await fetch(`${baseUrl}/guests/${id}`, {
      method: 'DELETE',
    });
    const deletedGuest = await response.json();
    const newGuests = guests.filter((guest) => {
      return guest.id !== deletedGuest.id;
    });
    setGuests(newGuests);
  }

  async function updateAttendance(id, status) {
    // status: boolean
    // if (activeFilter) {setGuests(originalGuests)};
    const response = await fetch(`${baseUrl}/guests/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ attending: status }),
    });
    const updatedGuest = await response.json();
    const newGuests = guests.map((guest) => {
      if (guest.id === updatedGuest.id) {
        return { ...guest, attending: updatedGuest.attending };
      }
      return guest;
    });
    setGuests(newGuests);
  }

  // Filter function via additional requests to enable removals. However, updating attendence while in filter view is not supported atm
  async function filterGuests(attendance) {
    setActiveFilter(true);
    const response = await fetch(`${baseUrl}/guests`);
    setLoading(false);
    const allGuests = await response.json();
    const filteredArray = allGuests.filter((guest) => {
      if (attendance) {
        return guest.attending;
      } else {
        return !guest.attending;
      }
    });
    setGuests(filteredArray);
    console.log('filtered: ', filteredArray);
  }

  /*   function localfilterGuests(attendance) {
    setActiveFilter(true);
    const filteredArray = guests.filter((guest) => {
      if (attendance) {
        return guest.attending;
      } else {
        return !guest.attending;
      }
    });
    // setOriginalGuests(guests)
    setGuests(filteredArray);
    console.log('filtered: ', filteredArray);
  }
 */
  return (
    <div className="App">
      <h1>The coolest party in the world</h1>
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
        <div className="filterButtons">
          <button
            onClick={() => {
              filterGuests(true).catch(() => {});
            }}
          >
            Display only attending
          </button>
          <button
            onClick={() => {
              filterGuests(false).catch(() => {});
            }}
          >
            Display only unattending
          </button>
          <button
            onClick={() => {
              setActiveFilter(false);
              setRefetch(!refetch);
            }}
          >
            Clear filter
          </button>
        </div>
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
