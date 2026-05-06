// Service pour afficher une carte

import L from "leaflet"

const TILE_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"

export default {

  createTileLayer() {
    return L.tileLayer(TILE_URL, {
      attribution: '&copy; OpenStreetMap contributors'
    })
  },

  createMarker(lat, lng, text = "") {
    return L.marker([lat, lng]).bindPopup(text)
  }

}
