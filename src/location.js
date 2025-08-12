const axios = require('axios');

const NOMINATIM_BASE_URL = "https://nominatim.openstreetmap.org/";
const USER_AGENT = "GeminiWALocator/1.0 (your_email@example.com)"; // Replace with your actual email or app name

async function geocode(query) {
    try {
        const response = await axios.get(`${NOMINATIM_BASE_URL}search`, {
            params: {
                q: query,
                format: 'json',
                limit: 1,
                'accept-language': 'pt-BR'
            },
            headers: {
                'User-Agent': USER_AGENT
            }
        });

        if (response.data && response.data.length > 0) {
            const result = response.data[0];
            return {
                display_name: result.display_name,
                lat: result.lat,
                lon: result.lon,
                type: result.type,
                class: result.class,
                address: result.address,
            };
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error during geocoding:', error.message);
        return null;
    }
}

async function reverseGeocode(latitude, longitude) {
    try {
        const response = await axios.get(`${NOMINATIM_BASE_URL}reverse`, {
            params: {
                lat: latitude,
                lon: longitude,
                format: 'json',
                'accept-language': 'pt-BR'
            },
            headers: {
                'User-Agent': USER_AGENT
            }
        });

        if (response.data) {
            return {
                display_name: response.data.display_name,
                address: response.data.address,
                lat: response.data.lat,
                lon: response.data.lon,
            };
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error during reverse geocoding:', error.message);
        return null;
    }
}

module.exports = { geocode, reverseGeocode };