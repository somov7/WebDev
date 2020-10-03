let favoriteCities;
const defaulCity = 498817;
let positionHere;

let apiKey = 'd859b3f2d19d0f2d84d5f8fe9631c20a';
let apiLink = 'https://api.openweathermap.org/data/2.5/weather?units=metric&lang=ru&';

window.onload = function() {
    loadLocal();
    loadFavorites();
}

async function getWeather(url){
    const response = await fetch(url);
    const data = await response.json();
    return data;
}

function getWeatherByName(cityName){
    requestURL = apiLink + 'q=' + encodeURI(cityName) + '&appid=' + apiKey;
    return getWeather(requestURL);
}

function getWeatherByID(cityID){
    requestURL = apiLink + 'id=' + encodeURI(cityID) + '&appid=' + apiKey;
    return getWeather(requestURL);
}

function getWeatherByCoords(latitude, longitude){
    requestURL = apiLink + 'lat=' + encodeURI(latitude) + '&lon=' + encodeURI(longitude) + '&appid=' + apiKey;
    return getWeather(requestURL);
}

function createCityInfo(weather) {
    let cardInfo = document.createElement('ul');
    cardInfo.setAttribute('class', 'weather_info');

    params = [
        {name: 'Ветер', value: weather.wind.speed + ' м/с'}, 
        {name: 'Облачность', value: weather.clouds.all + '%'},
        {name: 'Давление', value: weather.main.pressure + ' гПа'},
        {name: 'Влажность', value: weather.main.humidity + '%'},
        {name: 'Координаты', value: '[' + weather.coord.lon + ', ' + weather.coord.lat + ']'}];
    
    for(const param of params) {
        let infoItem = document.createElement('li');
        
        let infoName = document.createElement('span');
        infoName.setAttribute('class', 'weather_info_name');
        infoName.innerHTML = param.name;
        infoItem.append(infoName);

        let infoValue = document.createElement('span');
        infoValue.setAttribute('class', 'weather_info_value');
        infoValue.innerHTML = param.value;
        infoItem.append(infoValue);

        cardInfo.append(infoItem);
    }

    return cardInfo;
}

function createCityCardFavorite(weather) {
    let card = document.createElement('li');

    let cardHeader = document.createElement('div');
    cardHeader.setAttribute('class', 'fav_city_header');

    let cardCityName = document.createElement('h3');
    cardCityName.innerHTML = weather.name;
    cardHeader.append(cardCityName);

    let cardTemperature = document.createElement('span');
    cardTemperature.setAttribute('class', 'temperature');
    cardTemperature.innerHTML = weather.main.temp + '°C';
    cardHeader.append(cardTemperature);

    let cardIcon = document.createElement('div');
    cardIcon.setAttribute('class', 'icon_weather');
    cardHeader.append(cardIcon);

    let cardDeleteButton = document.createElement('input');
    cardDeleteButton.setAttribute('type', 'button');
    cardDeleteButton.setAttribute('class', 'btn btn_delete');
    cardDeleteButton.setAttribute('value', '×');
    cardDeleteButton.setAttribute('onclick', 'deleteCity(this);');
    cardHeader.append(cardDeleteButton);

    card.append(cardHeader);

    let cardInfo = createCityInfo(weather);
    card.append(cardInfo);

    document.getElementsByClassName('favorite')[0].append(card);
}

function createCityCardHere(weather) {

    document.getElementsByClassName('here')[0].innerHTML = '';
    
    let cardLeft = document.createElement('div');
    cardLeft.setAttribute('class', 'here_left');

    let cardHeader = document.createElement('h2');
    cardHeader.innerHTML = weather.name;
    cardLeft.append(cardHeader);

    let mainInfo = document.createElement('div');

    let cardIcon = document.createElement('div');
    cardIcon.setAttribute('class', 'icon_weather icon_weather_here');
    mainInfo.append(cardIcon);

    let cardTemperature = document.createElement('div');
    cardTemperature.setAttribute('class', 'temperature temperature_here');
    cardTemperature.innerHTML = weather.main.temp + '°C';
    mainInfo.append(cardTemperature);

    cardLeft.append(mainInfo);

    let cardRight = createCityInfo(weather);

    document.getElementsByClassName('here')[0].append(cardLeft);
    document.getElementsByClassName('here')[0].append(cardRight);

}   

async function addCity() {
    cityName = document.querySelector('div.add_city input[type=input]').value;
    if (cityName == ''){
        return;
    }
    weather = await getWeatherByName(cityName);
    if (weather.cod < 200 || weather.cod >= 300) {
        alert('Город не найден');
        return;
    }
    else if (favoriteCities.includes(weather.id)) {
        alert('Город уже в списке');
        return;
    }
    favoriteCities.push(weather.id);
    localStorage.setItem('favoriteList', JSON.stringify(favoriteCities));
    createCityCardFavorite(weather);
}

function deleteCity(element) {
    cityName = element.parentNode.getElementsByTagName('h3')[0].innerHTML;
    let index = favoriteCities.indexOf(cityName);
    favoriteCities.splice(index, 1);
    localStorage.setItem('favoriteList', JSON.stringify(favoriteCities));
    cityCard = element.parentNode.parentNode;
    cityCard.parentNode.removeChild(cityCard);
}

async function loadFavorites() {
    if (localStorage.getItem('favoriteList') == null) {
        favoriteCities = [];
        return;
    }
    favoriteCities = JSON.parse(localStorage.getItem('favoriteList'));
    for (let cityID of favoriteCities) {
        weather = await getWeatherByID(cityID);
        createCityCardFavorite(weather);
    }
    return;
}

async function loadLocal() {
    navigator.geolocation.getCurrentPosition(
        async (position) => {
            weather = await getWeatherByCoords(position.coords.latitude, position.coords.longitude);
            createCityCardHere(weather);
        }, 
        async (error) => {
            weather = await getWeatherByID(defaulCity);
            createCityCardHere(weather);
        });
}