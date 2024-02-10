// Global Variables
const apiKey = '75d1b0e8f45a5b8907dd772ac1d040f2';
const searchForm = document.querySelector('form');
const cardContainer = document.getElementById('cardContainer');
let historyArr = JSON.parse(localStorage.getItem('savedSearches'));
const modalEl = document.getElementById('errorModal');
const myModal = new bootstrap.Modal(modalEl);


function renderSearchHistory() {
    const searchHistoryContainer = document.getElementById('searchHistory');
    searchHistoryContainer.innerHTML = '';

    if (historyArr) {
        for (i = historyArr.length - 1; i >= 0; i--) {
            const {
                city,
                state,
                country,
                lon,
                lat
            } = historyArr[i];

            const historyBtn = `
            <button type="button" class = "btn btn-secondary btn-md my-1 historyBtns w-100" id = "historyBtn${i}" data-lon = '${lon}' data-lat = '${lat}'
            data-name = '${city}' data-state = '${state}' data-country = '${country}'>
                ${city}, ${state}, ${country}
            </button>
        `
            searchHistoryContainer.insertAdjacentHTML('beforeend', historyBtn);

            //add eventlistener to the History Buttons
            document.getElementById(`historyBtn${i}`).addEventListener('click', fetchCityDetails);
        }
    }
}

function saveSearch(city) {
    // create local storage object and save to local storage
    const historyObj = {
        city: city.name,
        state: city.state,
        country: city.country,
        lon: city.lon,
        lat: city.lat,
    }

    if (historyArr) { 
        const isPresent = historyArr.some(obj => 
        { 
        return obj.city === historyObj.city && obj.state === historyObj.state && obj.country === historyObj.country && obj.lon === historyObj.lon && obj.lat === historyObj.lat; });
        if(isPresent){ 
        const index = historyArr.findIndex(obj => obj.city === historyObj.city && obj.state === historyObj.state && obj.country === historyObj.country && obj.lon === historyObj.lon && obj.lat === historyObj.lat); 
        if (index !== -1) { 
        historyArr.splice(index, 1); } 
        } 
    historyArr.push(historyObj); 
    if (historyArr.length > 5) { historyArr.shift(); } } 
    else { historyArr = [historyObj]; }

    localStorage.setItem("savedSearches", JSON.stringify(historyArr));
    renderSearchHistory();
}

function displayWeatherDetails(cityDetails, current, forecast) {
    // reset cardContainer
    cardContainer.innerHTML = '';

    // reset search input box
    const cityInput = document.getElementById('cityInput');
    cityInput.value = "";

    // get current date using day.js
    const today = dayjs();

    // construct current weather card
    const currentWeatherHTML = `
        <div class = "card w-100 mb-2">
            <div class = "card-header bg-info">
                <h3>${cityDetails.name}, ${cityDetails.state}, ${cityDetails.country} (${today.format("MM/DD/YYYY")})</h3>
                <img src='https://openweathermap.org/img/wn/${current.weather[0].icon}@2x.png' alt='weather img icon' class="ms-2">
            </div> 
            <div class = "card-body">
                <p>Temp: ${current.main.temp}°</p>
                <p>Wind: ${current.wind.speed} mph</p>
                <p>Humidity: ${current.main.humidity}%</p>
            </div>
        </div>
        <h4>5-Day Forecast:</h4>`
    // insert current weather card HTML
    cardContainer.insertAdjacentHTML('afterbegin', currentWeatherHTML);

    // destructure forecast weather data, create and insert cards
    for (let i = 0; i < forecast.list.length; i++) {
        // destructure
        const forecastWeather = {
            city: forecast.city.name,
            temp: forecast.list[i].main.temp,
            humidity: forecast.list[i].main.humidity,
            wind: forecast.list[i].wind.speed,
            date: forecast.list[i].dt_txt,
            icon: forecast.list[i].weather[0].icon
        }

        const slicedDate = forecastWeather.date.slice(0, 10);
        const forecastDate = dayjs(slicedDate);

        const slicedTime = forecastWeather.date.slice(11);

        if (slicedTime == '12:00:00') {
            const forecastHTML = `
                <div class="col">
                  <div class = "card forecastCards my-1">
                    <div class = "card-header bg-info">
                      <h5>${forecastDate.format("MM/DD/YYYY")}</h5>
                      <img src='https://openweathermap.org/img/wn/${forecastWeather.icon}.png' alt='weather img icon' class="ms-2">
                    </div>
                    <div class = "card-body">
                      <p>Temp: ${forecastWeather.temp}°</p>
                      <p>Wind: ${forecastWeather.wind} mph</p>
                      <p>Humidity: ${forecastWeather.humidity}%</p>
                    </div>
                  </div>
                </div>`

            cardContainer.insertAdjacentHTML('beforeend', forecastHTML);
        }
    }
}

async function fetchCityDetails(ev) {
    // get specific lat & lon for chosen city
    const cityDetails = {
        lat: this.dataset.lat,
        lon: this.dataset.lon,
        name: this.dataset.name,
        state: this.dataset.state,
        country: this.dataset.country,
    }

    // api call for current weather data
    const currentWeatherURL = `https://api.openweathermap.org/data/2.5/weather?lat=${cityDetails.lat}&lon=${cityDetails.lon}&appid=${apiKey}&units=imperial`;
    const currentResponse = await fetch(currentWeatherURL);
    const currentDetails = await currentResponse.json();

    // api call for 5-day forecast data
    const fiveDayURL = 'https://api.openweathermap.org/data/2.5/forecast?lat=' + cityDetails.lat + '&lon=' + cityDetails.lon + '&appid=' + apiKey + '&units=imperial';
    const fiveDayResponse = await fetch(fiveDayURL);
    const forecastDetails = await fiveDayResponse.json();

    console.log(cityDetails);

    saveSearch(cityDetails);
    displayWeatherDetails(cityDetails, currentDetails, forecastDetails);
}

function selectedhCity(response) {
    // reset container from previous searches
    cardContainer.innerHTML = '';

    cardContainer.insertAdjacentHTML('afterbegin', '<h3 id="selectCityHeader">Select city:</h3>');

    for (let i = 0; i < response.length; i++) {
        // destructure response object
        const {
            name,
            state,
            country,
            lon,
            lat
        } = response[i];

        const cityBtn = `
            <button type="button" class = "btn btn-info btn-lg m-1 cityBtns" id = "cityBtn${i}" data-lon = '${lon}' data-lat = '${lat}'
            data-name = '${name}' data-state = '${state}' data-country = '${country}'>
                ${name}, ${state}, ${country}
            </button>
        `

        // cardContainer.removeAttribute('hidden');
        cardContainer.insertAdjacentHTML('beforeend', cityBtn);

        //add eventlistener to the cityCard
        document.getElementById(`cityBtn${i}`).addEventListener('click', fetchCityDetails);
    }
}

async function getCityResponse(city) {
    const coordinatesQuery = 'https://api.openweathermap.org/geo/1.0/direct?q=' + city + '&limit=5&appid=' + apiKey;

    try {
        const response = await fetch(coordinatesQuery);
        const resultsData = await response.json();
        if (resultsData.length > 1) {
            selectedhCity(resultsData);
        } else if (resultsData.length === 0) {
            myModal.show();
        } else {
            // destructure specific city object
            const {
                lon,
                lat
            } = resultsData[0];

            // api call for current weather data
            const currentWeatherURL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`;
            const currentResponse = await fetch(currentWeatherURL);
            const currentDetails = await currentResponse.json();

            // api call for 5-day forecast data
            const fiveDayURL = 'https://api.openweathermap.org/data/2.5/forecast?lat=' + lat + '&lon=' + lon + '&appid=' + apiKey + '&units=imperial';
            const fiveDayResponse = await fetch(fiveDayURL);
            const forecastDetails = await fiveDayResponse.json();

            saveSearch(resultsData[0]);

            // call function to Display weather details
            displayWeatherDetails(resultsData[0], currentDetails, forecastDetails);
        }
    } catch (error) {
        myModal.show();
    }
}

//Search Form Submit Handler Function
function handleSearchSubmit(event) {
    event.preventDefault();

    const cityInput = document.getElementById('cityInput');

    city = cityInput.value;

    if (!city) {
        window.alert("Please enter a valid city ");
        return;
    }

    getCityResponse(city);
}

renderSearchHistory();
searchForm.addEventListener('submit', handleSearchSubmit);