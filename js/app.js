// Weather Dashboard JavaScript
const API_KEY = 'YOUR_OPENWEATHERMAP_API_KEY'; // <-- Replace with your actual API key

const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const locationBtn = document.getElementById('location-btn');
const currentWeather = document.getElementById('current-weather');
const forecasts = document.getElementById('forecasts');
const errorMessage = document.getElementById('error-message');

// Search by city
async function searchWeather() {
    const city = cityInput.value.trim();
    if (!city) return;

    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
        );

        if (!response.ok) throw new Error('City not found');

        const data = await response.json();
        displayCurrentWeather(data);
        await getForecast(data.coord.lat, data.coord.lon);

        currentWeather.classList.remove('hidden');
        forecasts.classList.remove('hidden');
        errorMessage.classList.add('hidden');
    } catch (error) {
        showError(error.message);
    }
}

// Get weather by geolocation
async function getUserLocation() {
    if (!navigator.geolocation) {
        showError('Geolocation is not supported by your browser');
        return;
    }

    navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
            const response = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
            );
            const data = await response.json();
            displayCurrentWeather(data);
            await getForecast(latitude, longitude);

            currentWeather.classList.remove('hidden');
            forecasts.classList.remove('hidden');
        } catch (error) {
            showError('Unable to fetch weather for your location');
        }
    }, () => {
        showError('Unable to get your location');
    });
}

// Display current weather
function displayCurrentWeather(data) {
    document.getElementById('city-name').textContent = `${data.name}, ${data.sys.country}`;
    document.getElementById('weather-description').textContent = data.weather[0].description;
    document.getElementById('temperature').textContent = Math.round(data.main.temp);
    document.getElementById('feels-like').textContent = `${Math.round(data.main.feels_like)}°C`;
    document.getElementById('humidity').textContent = `${data.main.humidity}%`;
    document.getElementById('wind').textContent = `${data.wind.speed} m/s`;
}

// Get forecast data
async function getForecast(lat, lon) {
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
        );
        const data = await response.json();

        displayHourlyForecast(data.list);
        displayDailyForecast(data.list);
    } catch (error) {
        console.error('Forecast error:', error);
    }
}

// Display hourly forecast
function displayHourlyForecast(list) {
    const container = document.getElementById('hourly-forecast');
    container.innerHTML = '';

    // Show next 8 entries (~24 hours)
    list.slice(0, 8).forEach(item => {
        const time = new Date(item.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const temp = Math.round(item.main.temp);
        const icon = item.weather[0].icon;

        const card = document.createElement('div');
        card.className = 'forecast-card';
        card.innerHTML = `
            <div>${time}</div>
            <img src="https://openweathermap.org/img/wn/${icon}.png" alt="">
            <div><strong>${temp}°C</strong></div>
        `;
        container.appendChild(card);
    });
}

// Display daily forecast (simplified)
function displayDailyForecast(list) {
    const container = document.getElementById('daily-forecast');
    container.innerHTML = '';

    const dailyData = {};

    list.forEach(item => {
        const date = new Date(item.dt * 1000).toLocaleDateString();
        if (!dailyData[date]) {
            dailyData[date] = item;
        }
    });

    Object.values(dailyData).slice(0, 7).forEach(item => {
        const date = new Date(item.dt * 1000).toLocaleDateString([], { weekday: 'short' });
        const temp = Math.round(item.main.temp);
        const icon = item.weather[0].icon;

        const card = document.createElement('div');
        card.className = 'forecast-card';
        card.innerHTML = `
            <div>${date}</div>
            <img src="https://openweathermap.org/img/wn/${icon}.png" alt="">
            <div><strong>${temp}°C</strong></div>
        `;
        container.appendChild(card);
    });
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
    currentWeather.classList.add('hidden');
    forecasts.classList.add('hidden');
}

// Event Listeners
searchBtn.addEventListener('click', searchWeather);
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchWeather();
});
locationBtn.addEventListener('click', getUserLocation);

// Optional: Load default city on start
window.onload = () => {
    // You can uncomment the line below to load a default city
    // cityInput.value = 'San Francisco';
    // searchWeather();
};
