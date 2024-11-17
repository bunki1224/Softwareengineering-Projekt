import { Button, Typography } from "@mui/material";
import Activity from "./components/Activity";
import CustomRating from "./components/CustomRating";
import TextField from "@mui/material/TextField";
import ReactDOM from "react-dom/client";
import { useEffect, useState } from "react";

function App() {

  const [activities, setActivities] = useState({ backlog: [], timeline: [] });

  useEffect(() => {
    fetch('/src/data/activities.json')
      .then(response => response.json())
      .then(data => setActivities(data));
  }, []);


  /**
  * @param {string}   category add Item to backlog or timeline div
  * @param {object}   item Item to create an Activity
  */
  function insertActivity(category, item) {
    // Überprüfen, ob die Kategorie existiert
    if (!activities[category]) {
      console.error(`Kategorie "${category}" existiert nicht.`);
      return;
    }

    // Zustand aktualisieren
    setActivities((prevActivities) => ({
      ...prevActivities,
      [category]: [item, ...prevActivities[category]], // Neues Objekt hinzufügen
    }));
  }
  window.insertActivity = insertActivity;
  
  function printActivites(){
    console.log(activities)
  }
  window.printActivites = printActivites;

  function deleteActivity(category, id) {
    // Überprüfen, ob die Kategorie existiert
    if (!activities[category]) {
      console.error(`Kategorie "${category}" existiert nicht.`);
      return;
    }

    // Zustand aktualisieren
    setActivities((prevActivities) => ({
      ...prevActivities,
      [category]: prevActivities[category].filter((activity) => activity.id !== id),
    }));
  }
  window.deleteActivity = deleteActivity;
  return (
    <>
    
      

<div
  id="wrapper"
  style={{
    width: '95vw',
    height: '80vh',
    backgroundColor: '#213243',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
  }}
>
  <div
    style={{
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      width: '100%',
      height: '100%',
    }}
  >
    <div
      id="backlog"
      style={{
        backgroundColor: '#424b64',
        width: '45%',
        height: '80%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'start',
        margin: '1rem',
        borderRadius: '10px',
        overflowY: 'auto', // Ermöglicht vertikales Scrollen
        overflowX: 'hidden', // Verhindert horizontales Scrollen
        padding: '1rem',
      }}
    >
      <h1
        style={{
          fontSize: '2rem',
          fontWeight: 'bold',
          textAlign: 'center',
          marginBottom: '1rem',
        }}
      >
        Backlog
      </h1>
      <TextField
        label="suche Orte / Hotels"
        style={{margin: "10px"}}
        sx={{
          width: '100%',
          backgroundColor: 'white',
          borderRadius: '20px',
          '& .MuiOutlinedInput-root': {
            borderRadius: '20px',
          },
          '& .MuiOutlinedInput-notchedOutline': {
            borderRadius: '20px',
          },
        }}
      ></TextField>
      
      {activities.backlog.map((activity, index) => (
          <Activity
            key={index}
            title={activity.title}
            address={activity.address}
            price={activity.price}
            tags={activity.tags}
            rating={activity.rating}
            image={activity.image}
          />
        ))}


    </div>
    
    <div
      id="timeline"
      style={{
        backgroundColor: '#424b64',
        width: '45%',
        height: '80%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'start',
        margin: '1rem',
        borderRadius: '10px',
        overflowY: 'auto', // Ermöglicht vertikales Scrollen
        overflowX: 'hidden', // Verhindert horizontales Scrollen
        padding: '1rem',
      }}
    >
      <h1
        style={{
          fontSize: '2rem',
          fontWeight: 'bold',
          textAlign: 'center',
          marginBottom: '1rem',
        }}
      >
        Timeline
      </h1>
            
      {/* Weitere Inhalte hier */}
      {activities.timeline.map((activity, index) => (
          <Activity
            key={index}
            title={activity.title}
            address={activity.address}
            price={activity.price}
            tags={activity.tags}
            rating={activity.rating}
            image={activity.image}
          />
        ))}
    </div>
  </div>
</div>
    </>
  )
}

export default App;


