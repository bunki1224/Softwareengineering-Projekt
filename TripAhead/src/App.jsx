import { Button, Typography } from "@mui/material";
import Activity from "./components/Activity";
import CustomRating from "./components/CustomRating";
import ReactDOM from "react-dom/client";
import { useEffect, useState } from "react";
import MapsSearchbar from "./components/mapsSearchbar";
import { LoadScript } from "@react-google-maps/api";


function App() {

  const googleMapsApiKey = import.meta.env.VITE_Map_Api_Key;
  const initialActivities = JSON.parse(localStorage.getItem('activities')) || { backlog: [], timeline: [] };
  
  const [activities, setActivities] = useState(initialActivities);

  useEffect(() => {
    // Speichern der Aktivitäten im lokalen Speicher, wenn sie sich ändern
    localStorage.setItem('activities', JSON.stringify(activities));
  }, [activities]);

  console.log(localStorage.getItem('activities'));

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

  function updateJson(){
    useEffect(() => {
      // Wenn sich der Zustand `activities` ändert, speichere ihn im lokalen Speicher
      localStorage.setItem('activities', JSON.stringify(activities));
    }, [activities]);

  }
  window.printActivites = printActivites;
  /**
  * @param {string}   category add Item to backlog or timeline div
  * @param {string}   id id of the item you want to delete
  */
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
  
  /**
  * @param {string}   activityId the id of the activity you want to edit
  * @param {string}   updatedActivity the updated activity
  */
  function editActivity(activityId, updatedActivity) {
    setActivities((prevActivities) => {
      // Finde den Index der Aktivität mit der entsprechenden ID im "backlog"
      const updatedBacklog = prevActivities.backlog.map((activity) => 
        activity.id === activityId ? { ...activity, ...updatedActivity } : activity
      );
  
      // Aktualisiere den Zustand
      const updatedActivities = {
        ...prevActivities,
        backlog: updatedBacklog,
      };
  
      // Speichere die Änderungen im localStorage
      localStorage.setItem('activities', JSON.stringify(updatedActivities));
  
      return updatedActivities;
    });
  }
  window.editActivity = editActivity;
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
      <LoadScript googleMapsApiKey={googleMapsApiKey} libraries={["places"]}>
      <div style={{ margin: "10px" , width:"100%"}}>
        <MapsSearchbar insertActivity={insertActivity} />
      </div>
      </LoadScript>


      

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
  <Button variant="contained" onClick={updateJson}>save changes</Button>
</div>
    </>
  )
}

export default App;


