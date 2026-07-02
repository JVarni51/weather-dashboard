// Weather Dashboard JavaScript
const API_KEY = 'a35cb639a9059ccec17a358be3452f36'; // Your OpenWeatherMap API key

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

    showLoading();

    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
        );

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Invalid API key. Please check your key.');
            } else if (response.status === 404) {
                throw new Error('City not found. Please check the city name.');
            } else {
                throw new Error('Failed to fetch weather data.');
            }
        }

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

    showLoading();

    navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
            const response = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
            );

            if (!response.ok) throw new Error('Unable to fetch weather for your location');

            const data = await response.json();
            displayCurrentWeather(data);
            await getForecast(latitude, longitude);

            currentWeather.classList.remove('hidden');
            forecasts.classList.remove('hidden');
            errorMessage.classList.add('hidden');
        } catch (error) {
            showError(error.message);
        }
    }, () => {
        showError('Unable to get your location. Please allow location access.');
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

        if (!response.ok) throw new Error('Failed to load forecast');

        displayHourlyForecast(data.list);
        displayDailyForecast(data.list);
    } catch (error) {
        console.error('Forecast error:', error);
        // Still show current weather even if forecast fails
    }
}

// Display hourly forecast
function displayHourlyForecast(list) {
    const container = document.getElementById('hourly-forecast');
    container.innerHTML = '';

    list.slice(0, 8).forEach(item => {
        const time = new Date(item.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const temp = Math.round(item.main.temp);
        const icon = item.weather[0].icon;

        const card = document.createElement('div');
        card.className = 'forecast-card';
        card.innerHTML = `
            <div>${time}</div>
            <img src="https://openweathermap.org/img/wn/${icon}.png" alt="weather icon">
            <div><strong>${temp}°C</strong></div>
        `;
        container.appendChild(card);
    });
}

// Display daily forecast
function displayDailyForecast(list) {
    const container = document.getElementById('daily-forecast');
    container.innerHTML = '';

    const dailyData = {};

    list.forEach(item => {
        const dateKey = new Date(item.dt * 1000).toLocaleDateString();
        if (!dailyData[dateKey]) {
            dailyData[dateKey] = item;
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
            <img src="https://openweathermap.org/img/wn/${icon}.png" alt="weather icon">
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

function showLoading() {
    errorMessage.textContent = 'Loading...';
    errorMessage.classList.remove('hidden');
}

// Event Listeners
searchBtn.addEventListener('click', searchWeather);
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchWeather();
});
locationBtn.addEventListener('click', getUserLocation);

// Auto-load a default city for testing
window.onload = () => {
    // Uncomment the next two lines if you want it to load a city automatically
    // cityInput.value = 'San Francisco';
    // searchWeather();
};
