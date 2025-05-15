import { Button, Typography } from "@mui/material";
import Activity from "./components/Activity";
import CustomRating from "./components/CustomRating";
import ReactDOM from "react-dom/client";
import { useEffect, useState } from "react";
import MapsSearchbar from "./components/MapsSearchbar";
import { LoadScript } from "@react-google-maps/api";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import AddActivityModal from "./components/AddActivityModal";
import TimelineView from "./components/TimelineView";

//Test Kommentar für Github-Actions

function App() {

  const googleMapsApiKey = import.meta.env.VITE_Map_Api_Key;
  const initialActivities = JSON.parse(localStorage.getItem('activities')) || { backlog: [], timeline: [] };
  const initialDayTitles = JSON.parse(localStorage.getItem('dayTitles')) || {};
  
  const [activities, setActivities] = useState(initialActivities);
  const [currentDay, setCurrentDay] = useState(0);
  const [maxDays, setMaxDays] = useState(7); // Start with 7 days
  const [dayTitles, setDayTitles] = useState(initialDayTitles);

  useEffect(() => {
    // Speichern der Aktivitäten im lokalen Speicher, wenn sie sich ändern
    //console.log("activities changed");
    localStorage.setItem('activities', JSON.stringify(activities));
  }, [activities]);

  useEffect(() => {
    localStorage.setItem('dayTitles', JSON.stringify(dayTitles));
  }, [dayTitles]);

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

  const onDragEnd = (result) => {
    const { source, destination } = result;

    if (!destination) return;

    // Handle dropping into timeline days
    if (destination.droppableId.startsWith('timeline-')) {
      const dayIndex = parseInt(destination.droppableId.split('-')[1]);
      
      // If coming from backlog
      if (source.droppableId === 'backlog') {
        const activity = activities.backlog[source.index];
        const updatedActivity = {
          ...activity,
          day: dayIndex
        };

        // Remove from backlog
        const newBacklog = activities.backlog.filter((_, index) => index !== source.index);
        
        // Add to timeline
        const newTimeline = [...activities.timeline, updatedActivity];

        setActivities({
          ...activities,
          backlog: newBacklog,
          timeline: newTimeline
        });
      } 
      // If moving between days in timeline
      else if (source.droppableId.startsWith('timeline-')) {
        const sourceDay = parseInt(source.droppableId.split('-')[1]);
        const dayActivities = activities.timeline.filter(a => a.day === sourceDay);
        const activity = dayActivities[source.index];
        
        // Update the day of the activity
        const updatedActivity = {
          ...activity,
          day: dayIndex
        };

        // Remove from old day and add to new day
        const newTimeline = activities.timeline.map(a => 
          a.id === activity.id ? updatedActivity : a
        );

        setActivities({
          ...activities,
          timeline: newTimeline
        });
      }
      return;
    }

    // Handle dropping back to backlog
    if (destination.droppableId === 'backlog') {
      if (source.droppableId.startsWith('timeline-')) {
        const sourceDay = parseInt(source.droppableId.split('-')[1]);
        const dayActivities = activities.timeline.filter(a => a.day === sourceDay);
        const activity = dayActivities[source.index];
        
        // Remove day property and add to backlog
        const { day, ...activityWithoutDay } = activity;
        const newBacklog = [...activities.backlog, activityWithoutDay];
        
        // Remove from timeline
        const newTimeline = activities.timeline.filter(a => a.id !== activity.id);

        setActivities({
          ...activities,
          backlog: newBacklog,
          timeline: newTimeline
        });
      }
      return;
    }

    // Handle reordering within backlog
    if (source.droppableId === 'backlog' && destination.droppableId === 'backlog') {
      const newBacklog = Array.from(activities.backlog);
      const [removed] = newBacklog.splice(source.index, 1);
      newBacklog.splice(destination.index, 0, removed);

      setActivities({
        ...activities,
        backlog: newBacklog
      });
    }
  };

  const handleAddDay = () => {
    if (maxDays < 14) {
      setMaxDays(prev => prev + 1);
      setCurrentDay(maxDays);
    }
  };

  const handleRemoveDay = (dayToRemove) => {
    // Move all activities from the removed day back to backlog
    const activitiesToMove = activities.timeline.filter(a => a.day === dayToRemove);
    const activitiesToKeep = activities.timeline.filter(a => a.day !== dayToRemove);
    
    // Remove day property from activities being moved back to backlog
    const activitiesForBacklog = activitiesToMove.map(({ day, ...activity }) => activity);
    
    // Update activities state
    setActivities({
      ...activities,
      backlog: [...activities.backlog, ...activitiesForBacklog],
      timeline: activitiesToKeep.map(activity => ({
        ...activity,
        // Adjust day numbers for activities after the removed day
        day: activity.day > dayToRemove ? activity.day - 1 : activity.day
      }))
    });

    // Remove the day title and adjust remaining titles
    const newDayTitles = { ...dayTitles };
    delete newDayTitles[dayToRemove];
    
    // Shift remaining titles down
    Object.keys(newDayTitles).forEach(day => {
      const dayNum = parseInt(day);
      if (dayNum > dayToRemove) {
        newDayTitles[dayNum - 1] = newDayTitles[dayNum];
        delete newDayTitles[dayNum];
      }
    });
    
    setDayTitles(newDayTitles);
    setMaxDays(prev => prev - 1);
  };

  const handleUpdateDayTitle = (day, title) => {
    setDayTitles(prev => ({
      ...prev,
      [day]: title
    }));
  };

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
  <DragDropContext onDragEnd={onDragEnd}>
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        width: '100%',
        height: '100%',
      }}
    >
      <Droppable droppableId="backlog">
        {(provided) => (
          <div
            id="backlog"
            ref={provided.innerRef}
            {...provided.droppableProps}
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
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              width: '100%',
              marginBottom: '1rem'
            }}>
              <LoadScript googleMapsApiKey={googleMapsApiKey} libraries={["places"]}>
                <div style={{ flex: 1, marginRight: '10px' }}>
                  <MapsSearchbar insertActivity={insertActivity} />
                </div>
              </LoadScript>
              <AddActivityModal onAdd={insertActivity} />
            </div>


            

            {activities.backlog.map((activity, index) => (
              <Draggable key={activity.id} draggableId={activity.id} index={index}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={{
                      width: '100%',
                      ...provided.draggableProps.style
                    }}
                  >
                    <Activity
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
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}


          </div>
        )}
      </Droppable>
      
      <div
        style={{
          width: '45%',
          height: '80%',
          margin: '1rem',
        }}
      >
        <TimelineView
          activities={activities.timeline}
          onDelete={deleteActivity}
          onEdit={editActivity}
          currentDay={currentDay}
          onDayChange={setCurrentDay}
          maxDays={maxDays}
          onAddDay={handleAddDay}
          onRemoveDay={handleRemoveDay}
          dayTitles={dayTitles}
          onUpdateDayTitle={handleUpdateDayTitle}
        />
      </div>
    </div>
  </DragDropContext>
  {/* <Button variant="contained" onClick={printLocalStorage}>print storage</Button>
  <Button variant="contained" onClick={clearStorage}>clear Storage</Button>
  <Button variant="contained" onClick={addDummy}>add dummy</Button> */}

</div>
    </>
  )
}

export default App;


