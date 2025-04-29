import { Button, Typography } from "@mui/material";
import Activity from "./components/Activity";
import CustomRating from "./components/CustomRating";
import ReactDOM from "react-dom/client";
import { useEffect, useState } from "react";
import MapsSearchbar from "./components/MapsSearchbar";
import { LoadScript } from "@react-google-maps/api";

//Test Kommentar für Github-Actions

function App() {

  const googleMapsApiKey = import.meta.env.VITE_Map_Api_Key;
  const initialActivities = JSON.parse(localStorage.getItem('activities')) || { backlog: [], timeline: [] };
  
  const [activities, setActivities] = useState(initialActivities);

  useEffect(() => {
    // Speichern der Aktivitäten im lokalen Speicher, wenn sie sich ändern
    //console.log("activities changed");
    localStorage.setItem('activities', JSON.stringify(activities));
  }, [activities]);


  function insertActivity(item) {
    
    const activitiesbefore = activities;
    const itemToAdd = item;

    //console.log("activities before: ", activitiesbefore);
    //console.log("item to add: ", itemToAdd);

    const newActivities = {
      ...activitiesbefore,
      backlog: [itemToAdd, ...activitiesbefore.backlog],
    };
    
    setActivities(newActivities);

    //console.log("new activities: ", newActivities);

  }
  window.insertActivity = insertActivity;
  
  function printActivites(){
    console.log(activities)
  }
// Test
  function updateJson(){
    useEffect(() => {
      // Wenn sich der Zustand `activities` ändert, speichere ihn im lokalen Speicher
      localStorage.setItem('activities', JSON.stringify(activities));
    }, [activities]);

  }
  window.printActivites = printActivites;
  /**
  * @param {string}   id id of the item you want to delete
  */
  function deleteActivity(id) {

    // Zustand aktualisieren
    setActivities((prevActivities) => ({
      ...prevActivities,
      ["backlog"]: prevActivities["backlog"].filter((activity) => activity.id !== id),
    }));
    setActivities((prevActivities) => ({
      ...prevActivities,
      ["timeline"]: prevActivities["timeline"].filter((activity) => activity.id !== id),
    }));
  }
  window.deleteActivity = deleteActivity;
  
  /**
  * @param {string}   activityId the id of the activity you want to edit
  * @param {string}   updatedActivity the updated activity
  */
  function editActivity(activityId, updatedActivity) {
    setActivities((prevActivities) => ({
      ...prevActivities,
      backlog: prevActivities.backlog.map((activity) =>
        activity.id === activityId ? { ...activity, ...updatedActivity } : activity
      ),
    }));
  }
  window.editActivity = editActivity;

  function clearStorage() {
    localStorage.clear();
    setActivities({ backlog: [], timeline: [] });
  }

  function addDummy(){
    insertActivity({
      id: Math.random().toString(36).substr(2, 9),
      title: "Dummy",
      address: "Dummy",
      price: "Dummy",
      tags: ["Dummy"],
      rating: 5,
      image: "https://source.unsplash.com/random/300x200",
    });
  }
  function printLocalStorage() {
    console.log(localStorage.getItem('activities'));
  }

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
            key={activity.id}
            id={activity.id}
            title={activity.title}
            address={activity.address}
            price={activity.price}
            tags={activity.tags}
            rating={activity.rating}
            image={activity.image}
            onEdit={editActivity}
            onDelete={deleteActivity}
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
            key={activity.id}
            title={activity.title}
            address={activity.address}
            price={activity.price}
            tags={activity.tags}
            rating={activity.rating}
            image={activity.image}
            onEdit={editActivity}
          />
        ))}
    </div>
  </div>
  {/* <Button variant="contained" onClick={printLocalStorage}>print storage</Button>
  <Button variant="contained" onClick={clearStorage}>clear Storage</Button>
  <Button variant="contained" onClick={addDummy}>add dummy</Button> */}

</div>
    </>
  )
}

export default App;


