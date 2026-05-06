// services/apiStreet/streetService.js
import axios from "axios"

const API_URL = "https://nominatim.openstreetmap.org/search"

export default {

  async searchAddress(query) {
    if (!query || query.length < 3) return []

    const res = await axios.get("https://nominatim.openstreetmap.org/search", {
      params: {
        q: query,
        format: "json",
        addressdetails: 1,
        limit: 5,

        // IMPORTANT
        countrycodes: "fr", // seulement France
        addressdetails: 1,
        extratags: 1,
        namedetails: 1
      },
      headers: {
        "Accept-Language": "fr"
      }
    })

    // FILTRAGE
    return res.data.filter(item =>
      item.type === "house" ||        // numéro + rue
      item.type === "residential" ||  // rue
      item.type === "road"
    )
  }

}
