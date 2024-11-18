import React, { useState } from "react";
import { Autocomplete } from "@react-google-maps/api";

const MapsSearchbar = ({ insertActivity }) => {
  const [autocomplete, setAutocomplete] = useState(null);

  const onLoad = (autoC) => setAutocomplete(autoC);

  const onPlaceChanged = () => {
    if (autocomplete) {
      const place = autocomplete.getPlace();

      // Gesamtes Objekt ausgeben
      console.log("Gesamtes Ort-Objekt:", place);

      // Name, Adresse und Koordinaten extrahieren
      const name = place.name || "Unbekannter Ort";
      const address = place.formatted_address || "Adresse nicht verfügbar";
      const location = place.geometry?.location || "Keine Koordinaten verfügbar";
      
      const rating = place.rating || "Keine Bewertung verfügbar";

      const coordinates = location
        ? {
            lat: location.lat(),
            lng: location.lng(),
          }
        : null;

      console.log("Ausgewählter Ort:", {
        name,
        address,
        coordinates,
        rating,
      });

      // Beispielwerte für die anderen Felder
      const activity = {
        id: new Date().getTime().toString(), // Erzeugt eine eindeutige ID basierend auf Zeit
        title: name,
        address: address,
        price: 0, // Standardwert
        tags: ["Sightseeing"], // Standard-Tag
        rating: Math.round(rating), // Standard-Bewertung
        image: "./bilder/default.jpg", // Beispielbild
      };

      // Aufruf der Methode über die Props
      insertActivity("backlog", activity);
    } else {
      console.log("Autocomplete ist nicht geladen.");
    }
  };

  return (
    <div>
      <Autocomplete onLoad={onLoad} onPlaceChanged={onPlaceChanged}>
        <input
          type="text"
          placeholder="Ort suchen..."
          style={{ 
            width: "100%",
            height: "40px",
            color: "black",
            backgroundColor: "white",
            border: "1px solid #ccc",
            borderRadius: "10px",
          }}
        />
      </Autocomplete>
    </div>
  );
};

export default MapsSearchbar;
