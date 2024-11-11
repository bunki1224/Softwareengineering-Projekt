import Activity from "./components/Activity";
import CustomRating from "./components/CustomRating";


function App() {

  return (
	<>
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
  tags={['Free', 'Temple']}
  rating={4.5}
  image="./bilder/Meiji.jpg"
/>



  </>
)
}

export default App;


