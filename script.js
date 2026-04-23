const API_URL = 'https://api.open-meteo.com/v1/forecast?latitude=34.0522&longitude=-118.2437&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,wind_speed_10m&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timezone=auto';

const weatherCodes = {
    0: { desc: 'Clear Sky', theme: 'sunny', animation: 'sun' },
    1: { desc: 'Mainly Clear', theme: 'sunny', animation: 'sun' },
    2: { desc: 'Partly Cloudy', theme: 'cloudy', animation: 'clouds' },
    3: { desc: 'Overcast', theme: 'cloudy', animation: 'clouds' },
    45: { desc: 'Fog', theme: 'cloudy', animation: 'clouds' },
    48: { desc: 'Depositing Rime Fog', theme: 'cloudy', animation: 'clouds' },
    51: { desc: 'Drizzle', theme: 'rainy', animation: 'rain' },
    53: { desc: 'Moderate Drizzle', theme: 'rainy', animation: 'rain' },
    55: { desc: 'Dense Drizzle', theme: 'rainy', animation: 'rain' },
    61: { desc: 'Slight Rain', theme: 'rainy', animation: 'rain' },
    63: { desc: 'Moderate Rain', theme: 'rainy', animation: 'rain' },
    65: { desc: 'Heavy Rain', theme: 'rainy', animation: 'rain' },
    71: { desc: 'Slight Snow', theme: 'snowy', animation: 'snow' },
    73: { desc: 'Moderate Snow', theme: 'snowy', animation: 'snow' },
    75: { desc: 'Heavy Snow', theme: 'snowy', animation: 'snow' },
    80: { desc: 'Slight Showers', theme: 'rainy', animation: 'rain' },
    81: { desc: 'Moderate Showers', theme: 'rainy', animation: 'rain' },
    82: { desc: 'Violent Showers', theme: 'rainy', animation: 'rain' },
    95: { desc: 'Thunderstorm', theme: 'stormy', animation: 'storm' }
};

let currentWeatherData = null;
let currentUnit = localStorage.getItem('weatherUnit') || 'F';

async function fetchWeather() {
    try {
        const response = await fetch(API_URL, { cache: 'no-store' });
        const data = await response.json();
        currentWeatherData = data.current;
        updateUI();
    } catch (error) {
        console.error('Error fetching weather:', error);
        document.getElementById('description').innerText = 'Failed to load weather data';
    }
}

function convertTemp(temp, toUnit) {
    if (toUnit === 'C') {
        return (temp - 32) * 5 / 9;
    }
    return temp;
}

function updateUI() {
    if (!currentWeatherData) return;

    const current = currentWeatherData;
    const code = current.weather_code;
    const weather = weatherCodes[code] || { desc: 'Unknown', theme: 'sunny', animation: 'sun' };

    const tempValue = currentUnit === 'F' ? current.temperature_2m : convertTemp(current.temperature_2m, 'C');
    const feelsLikeValue = currentUnit === 'F' ? current.apparent_temperature : convertTemp(current.apparent_temperature, 'C');

    // Update basic info
    document.getElementById('temperature').innerText = Math.round(tempValue);
    document.querySelector('.unit').innerText = `°${currentUnit}`;
    document.getElementById('description').innerText = weather.desc;
    document.getElementById('humidity').innerText = `${current.relative_humidity_2m}%`;

    const windValue = currentUnit === 'F' ? `${current.wind_speed_10m} mph` : `${Math.round(current.wind_speed_10m * 1.60934)} km/h`;
    document.getElementById('wind').innerText = windValue;

    document.getElementById('feels-like').innerText = `${Math.round(feelsLikeValue)}°${currentUnit}`;

    // Update Toggle UI
    const toggleF = document.querySelector('.toggle-f');
    const toggleC = document.querySelector('.toggle-c');
    if (currentUnit === 'F') {
        toggleF.classList.add('active');
        toggleC.classList.remove('active');
    } else {
        toggleC.classList.add('active');
        toggleF.classList.remove('active');
    }

    // Update date
    const now = new Date();
    const options = { weekday: 'long', month: 'long', day: 'numeric' };
    document.getElementById('date').innerText = now.toLocaleDateString('en-US', options);

    // Apply theme
    const container = document.querySelector('.weather-container');
    container.className = 'weather-container'; // reset

    if (!current.is_day) {
        container.classList.add('theme-night');
    } else {
        container.classList.add(`theme-${weather.theme}`);
    }

    updateAnimation(weather.animation, current.is_day);
}

// Unit Toggle Event Listener
document.getElementById('unit-toggle').addEventListener('click', () => {
    currentUnit = currentUnit === 'F' ? 'C' : 'F';
    localStorage.setItem('weatherUnit', currentUnit);
    updateUI();
});

function updateAnimation(type, isDay) {
    const layer = document.getElementById('weather-animation');
    layer.innerHTML = '';

    if (!isDay && type !== 'rain' && type !== 'snow' && type !== 'storm') {
        createStars(layer);
    }

    if (type === 'sun' && isDay) {
        const sun = document.createElement('div');
        sun.className = 'sun';
        layer.appendChild(sun);
    } else if (type === 'clouds') {
        createClouds(layer);
    } else if (type === 'rain' || type === 'storm') {
        createRain(layer);
        if (type === 'storm') {
            const flash = document.createElement('div');
            flash.className = 'lightning';
            layer.appendChild(flash);
        }
    } else if (type === 'snow') {
        createSnow(layer);
    }
}

function createStars(container) {
    const starCount = 100;
    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        const size = Math.random() * 3;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.animationDelay = `${Math.random() * 3}s`;
        container.appendChild(star);
    }
}

function createClouds(container) {
    for (let i = 1; i <= 3; i++) {
        const cloud = document.createElement('div');
        cloud.className = `cloud cloud-${(i % 2) + 1}`;
        cloud.style.top = `${10 + (i * 15)}%`;
        cloud.style.animationDuration = `${30 + (i * 10)}s`;
        cloud.style.animationDelay = `${i * -5}s`;
        container.appendChild(cloud);
    }
}

function createRain(container) {
    const dropCount = 100;
    for (let i = 0; i < dropCount; i++) {
        const drop = document.createElement('div');
        drop.className = 'rain-drop';
        drop.style.left = `${Math.random() * 100}%`;
        drop.style.animationDuration = `${0.5 + Math.random() * 0.5}s`;
        drop.style.animationDelay = `${Math.random() * 2}s`;
        container.appendChild(drop);
    }
}

function createSnow(container) {
    const flakeCount = 50;
    for (let i = 0; i < flakeCount; i++) {
        const flake = document.createElement('div');
        flake.className = 'snowflake';
        flake.style.left = `${Math.random() * 100}%`;
        flake.style.width = `${2 + Math.random() * 4}px`;
        flake.style.height = flake.style.width;
        flake.style.animationDuration = `${3 + Math.random() * 5}s`;
        flake.style.animationDelay = `${Math.random() * 5}s`;
        container.appendChild(flake);
    }
}

function updateClock() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', {
        hour12: true,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    document.getElementById('clock').innerText = timeString;
}

// Update clock every second
setInterval(updateClock, 1000);
updateClock();

// Initial fetch
fetchWeather();

// Update every 10 minutes
setInterval(fetchWeather, 10 * 60 * 1000);
