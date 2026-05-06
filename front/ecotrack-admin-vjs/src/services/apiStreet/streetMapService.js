// Service pour la conversion adresse à lat et long, et inversement

const NOMINATIM_BASE_URL = "https://nominatim.openstreetmap.org"

const headers = {
  "User-Agent": "EcoTrack-App" // important sinon blocage API
}

export default {

  /**
   * Géocodage : adresse → lat/lon
   */
  async geocode(address) {
    if (!address) return null

    try {
      const url = `${NOMINATIM_BASE_URL}/search?format=json&limit=1&q=${encodeURIComponent(address)}`

      const res = await fetch(url, { headers })
      const data = await res.json()

      if (!data || data.length === 0) return null

      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon),
        displayName: data[0].display_name
      }

    } catch (err) {
      console.error("StreetMap geocode error:", err)
      return null
    }
  },

  /**
   * Reverse geocoding : lat/lon → adresse
   */
  async reverseGeocode(lat, lon) {
    if (!lat || !lon) return null

    try {
      const url = `${NOMINATIM_BASE_URL}/reverse?format=json&lat=${lat}&lon=${lon}`

      const res = await fetch(url, { headers })
      const data = await res.json()

      return data?.display_name || null

    } catch (err) {
      console.error("StreetMap reverse error:", err)
      return null
    }
  }

}
