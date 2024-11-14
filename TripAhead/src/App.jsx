import { Button, Typography } from "@mui/material";
import Activity from "./components/Activity";
import CustomRating from "./components/CustomRating";
import TextField from "@mui/material/TextField";


function App() {

  return (
    <>
    
      {/* <Typography variant="h1">
      TripAhead
      </Typography>

      <Button variant="contained">New Activity +</Button>

      <Activity
        title="Tokyo Skytree"
        address="1 Chome-1-2 Oshiage, Sumida City, Tokyo"
        price={20}
        tags={['Sightseeing']}
        rating={5}
        image="./bilder/Skytree.png"
      />

      <Activity
        title="Meiji-Shrine"
        address="1-1 Yoyogikamizonochō, Shibuya City, Tokyo"
        price={0}
        tags={['Free', 'Temple', 'test']}
        rating={4.5}
        image="./bilder/Meiji.jpg"
      /> */}

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
      
      <Activity
        title="Meiji-Shrine"
        address="1-1 Yoyogikamizonochō, Shibuya City, Tokyo"
        price={0}
        tags={['Shrine']}
        rating={4}
        image="./bilder/Meiji.jpg"
      /> 
      <Activity
        title="Asakusa Shrine"
        address="2-chōme-3-1 Asakusa, Taito City, Tokyo"
        price={0}
        tags={['Shrine']}
        rating={3}
        image="./bilder/Asakusa.jpg"
      />


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
      <Activity
        title="Ichiran Ramen"
        address="Shinjuku City, Shinjuku, 3 Chome−34−11, Peace Bldg., B1F"
        price={"10"}
        tags={['Restaurant']}
        rating={4.5}
        image="./bilder/Ichiran.jpg"
      />

      <Activity
        title="Rainbow Bridge"
        address="Minato City, Tokyo 105-0000, Japan"
        price={0}
        tags={['Sightseeing']}
        rating={5}
        image="./bilder/rainbow-bridge.jpg"
      />

      <Activity
        title="Shibuya Crossing"
        address="Shibuya, Präfektur Tokio, Japan"
        price={0}
        tags={['Sightseeing']}
        rating={3}
        image="./bilder/Shibuya-crossing.jpg"
      />

      <Activity
        title="Tokyo Metropolitan Government Building"
        address="2-chōme-8-1 Nishishinjuku, Shinjuku City"
        price={0}
        tags={['Lookout']}
        rating={4}
        image="./bilder/Metropolitan.jpg"
      />
      
      
      {/* Weitere Inhalte hier */}
    </div>
  </div>
</div>
    </>
  )
}

export default App;


