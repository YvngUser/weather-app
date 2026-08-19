// City configurations with coordinates
const cities = {
    Lagos: {
        latitude: 6.5244,
        longitude: 3.3792
    },
    Jos: {
        latitude: 9.9241,
        longitude: 8.8844
    }
};

// Weather code to condition mapping
function getWeatherCondition(code) {
    if (code === 0) return { label: 'Clear sky', emoji: '☀️', type: 'sunny' };
    if (code >= 1 && code <= 3) return { label: 'Partly cloudy', emoji: '⛅', type: 'cloudy' };
    if (code >= 45 && code <= 48) return { label: 'Foggy', emoji: '🌫️', type: 'foggy' };
    if (code >= 51 && code <= 67) return { label: 'Rainy', emoji: '🌧️', type: 'rainy' };
    if (code >= 71 && code <= 77) return { label: 'Snowy', emoji: '❄️', type: 'snowy' };
    if (code >= 80 && code <= 82) return { label: 'Showers', emoji: '🌦️', type: 'rainy' };
    if (code >= 95) return { label: 'Thunderstorm', emoji: '⛈️', type: 'stormy' };
    return { label: 'Unknown', emoji: '🌐', type: 'cloudy' };
}

// Format time to readable string
function formatTime(isoTime) {
    const date = new Date(isoTime);
    const options = { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return date.toLocaleDateString('en-US', options);
}

// Fetch weather data from Open-Meteo API
async function fetchWeather() {
    const loadingEl = document.getElementById('loading');
    const errorEl = document.getElementById('error-message');
    const containerEl = document.getElementById('weather-container');
    const refreshBtn = document.getElementById('refresh-btn');

    try {
        // Show loading state
        loadingEl.style.display = 'block';
        errorEl.innerHTML = '';
        refreshBtn.disabled = true;

        // Fetch data for both cities
        const weatherData = {};

        for (const [city, coords] of Object.entries(cities)) {
            const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.latitude}&longitude=${coords.longitude}&current_weather=true`;
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`Failed to fetch weather for ${city}`);
            }

            const data = await response.json();
            weatherData[city] = data.current_weather;
        }

        // Save to localStorage
        localStorage.setItem('weatherData', JSON.stringify(weatherData));

        // Display weather
        displayWeather(weatherData);

    } catch (error) {
        errorEl.innerHTML = `<div class="error">❌ ${error.message}. Please try again.</div>`;
        console.error('Weather fetch error:', error);
    } finally {
        loadingEl.style.display = 'none';
        refreshBtn.disabled = false;
    }
}

// Display weather data on page
function displayWeather(weatherData) {
    const containerEl = document.getElementById('weather-container');
    containerEl.innerHTML = '';

    let primaryWeatherType = 'cloudy';

    for (const [city, current] of Object.entries(weatherData)) {
        const condition = getWeatherCondition(current.weathercode);
        if (city === 'Lagos') primaryWeatherType = condition.type;

        const card = document.createElement('div');
        card.className = `weather-card ${condition.type}`;
        card.innerHTML = `
            <div class="city-name">
                <span class="weather-emoji">${condition.emoji}</span>
                ${city}
            </div>
            <div class="weather-description">${condition.label}</div>
            <div class="weather-info">
                <div class="info-item">
                    <span class="info-label">Temperature</span>
                    <span class="info-value">${current.temperature}°C</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Wind Speed</span>
                    <span class="info-value">${current.windspeed} km/h</span>
                </div>
                <div class="last-updated">Last updated: ${formatTime(current.time)}</div>
            </div>
        `;
        containerEl.appendChild(card);
    }

    // Change page background based on primary city weather
    changeBackgroundByWeather(primaryWeatherType);
}

// Change page background based on weather type
function changeBackgroundByWeather(weatherType) {
    const body = document.body;

    switch (weatherType) {
        case 'rainy':
            body.style.background = 'linear-gradient(135deg, #667eea 0%, #4c63d2 100%)';
            break;
        case 'sunny':
            body.style.background = 'linear-gradient(135deg, #ffd89b 0%, #19547b 100%)';
            break;
        case 'cloudy':
            body.style.background = 'linear-gradient(135deg, #a8a8a8 0%, #5a5a5a 100%)';
            break;
        case 'snowy':
            body.style.background = 'linear-gradient(135deg, #e0e7ff 0%, #a8c5ff 100%)';
            break;
        case 'foggy':
            body.style.background = 'linear-gradient(135deg, #bdc3c7 0%, #2c3e50 100%)';
            break;
        case 'stormy':
            body.style.background = 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)';
            break;
        default:
            body.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    }
}

// Load saved weather from localStorage
function loadSavedWeather() {
    const saved = localStorage.getItem('weatherData');
    if (saved) {
        try {
            const weatherData = JSON.parse(saved);
            displayWeather(weatherData);
        } catch (error) {
            console.error('Error parsing saved weather data:', error);
        }
    }
}

// Event listener for refresh button
document.getElementById('refresh-btn').addEventListener('click', fetchWeather);

// Initialize: Load saved data first, then fetch fresh data
window.addEventListener('DOMContentLoaded', () => {
    loadSavedWeather();
    fetchWeather();
});