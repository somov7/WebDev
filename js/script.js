let favoriteCities;
const defaulCity = 498817;
let positionHere;

let apiKey = 'd859b3f2d19d0f2d84d5f8fe9631c20a';
let apiLink = 'https://api.openweathermap.org/data/2.5/weather?units=metric&lang=ru&';

window.onload = function() {
    loadHere();
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

function weatherIdToIcon(weatherID){
    if(weatherID == 800)
        return 'sunny';
    if(weatherID == 801)
        return 'light_clouds';
    if(weatherID == 802)
        return 'clouds';
    if(weatherID == 803 || weatherID == 804)
        return 'heavy_clouds';
    if((weatherID >= 300 && weatherID <= 399) || (weatherID >= 520 && weatherID <= 531))
        return 'light_rain';
    if(weatherID >= 500 && weatherID <= 504)
        return 'rain';
    if(weatherID >= 200 && weatherID <= 299)
        return 'thunder';
    if((weatherID >= 600 && weatherID <= 699) || weatherID == 511)
        return 'snow';
    if(weatherID >= 700 && weatherID <= 799)
        return 'mist';
    return 'unknown';
}

function cityInfoItems(weather) {
    let items = []

    params = [
        {name: 'Ветер', value: weather.wind.speed + ' м/с, ' + degreesToDirection(weather.wind.deg)}, 
        {name: 'Облачность', value: weather.clouds.all + '%'},
        {name: 'Давление', value: weather.main.pressure + ' гПа'},
        {name: 'Влажность', value: weather.main.humidity + '%'},
        {name: 'Координаты', value: '[' + weather.coord.lon + ', ' + weather.coord.lat + ']'}];
    
    for (const param of params) {
        let infoItem = document.getElementById('weather_info_item').content.cloneNode(true);
        infoItem.querySelector('span.weather_info_name').innerHTML = param.name;
        infoItem.querySelector('span.weather_info_value').innerHTML = param.value;
        items.push(infoItem);
    }

    return items;
}

function createCityCardFavorite(weather) {
    let card = document.getElementById('favorite_city_card').content.cloneNode(true);

    card.querySelector('li').setAttribute('data-city_id', weather.id);
    card.querySelector('h3').innerHTML = weather.name;
    card.querySelector('span.temperature').insertAdjacentHTML('afterbegin', weather.main.temp);
    card.querySelector('div.icon_weather').classList.add('weather_' + weatherIdToIcon(weather.weather[0].id));
    for (item of cityInfoItems(weather)) {
        card.querySelector('ul.weather_info').append(item);
    }

    return card;    
}

function createCityCardHere(weather) {
    
    let oldCard = document.querySelector('main div.here');
    if(oldCard != null) {
        oldCard.remove();
    }
    let card = document.getElementById('here').content.cloneNode(true);

    card.querySelector('div.here_left h2').innerHTML = weather.name;
    card.querySelector('div.here_left div.icon_weather').classList.add('weather_' + weatherIdToIcon(weather.weather[0].id));
    card.querySelector('div.here_left span.temperature').insertAdjacentHTML('afterbegin', weather.main.temp);
    for (item of cityInfoItems(weather)) {
        card.querySelector('ul.weather_info').append(item);
    }

    return card;
}   

async function addCity() {
    cityName = document.querySelector('div.add_city input[type=input]').value;
    if (cityName == ''){
        return;
    }

    let loader = document.getElementById('loader_favorite').content.cloneNode(true);
    document.querySelector('ul.favorite').append(loader);
    
    weather = await getWeatherByName(cityName);
    if (weather.cod >= 300) {
        document.querySelector('ul.favorite').removeChild(document.querySelector('ul.favorite li.loader'));
        alert('Не удалось загрузить информацию');
        return;
    }
    else if (favoriteCities.includes(weather.id)) {
        document.querySelector('ul.favorite').removeChild(document.querySelector('ul.favorite li.loader'));
        alert('Город уже в списке');
        return;
    }
    favoriteCities.push(weather.id);
    localStorage.setItem('favoriteList', JSON.stringify(favoriteCities));
    
    document.querySelector('ul.favorite').replaceChild(createCityCardFavorite(weather), document.querySelector('ul.favorite li.loader'));
}

function deleteCity(element) {
    let cityCard = element.parentNode.parentNode;
    let cityID = cityCard.getAttribute('data-city_id');
    for (let i = 0; i < favoriteCities.length; i++) {
        if (favoriteCities[i] == cityID) {
            favoriteCities.splice(i, 1);
            break;
        }
    }
    cityCard.remove();
    localStorage.setItem('favoriteList', JSON.stringify(favoriteCities));
}

async function loadFavorites() {
    if (localStorage.getItem('favoriteList') == null) {
        favoriteCities = [];
        return;
    }
    favoriteCities = JSON.parse(localStorage.getItem('favoriteList'));
    for(let i = 0; i < favoriteCities.length; i++){
        let loader = document.getElementById('loader_favorite').content.cloneNode(true);
        document.querySelector('ul.favorite').append(loader);
    }
    for (let cityID of favoriteCities) {
        weather = await getWeatherByID(cityID);
        if(weather.cod >= 300){
            document.querySelector('ul.favorite').removeChild(document.querySelector('ul.favorite li.loader'));
            alert('Не удалось загрузить информацию');
        }
        else {
            document.querySelector('ul.favorite').replaceChild(createCityCardFavorite(weather), document.querySelector('ul.favorite li.loader'));
        }
    }
}

async function loadHereByCoords(position) {
    weather = await getWeatherByCoords(position.coords.latitude, position.coords.longitude);
    if(weather.cod >= 300){
        alert('Не удалось загрузить информацию');
    } 
    else {
        document.querySelector('main').prepend(createCityCardHere(weather));
        document.querySelector('div.loader').remove();  
    }
}


async function loadHereDefault(error) {
    weather = await getWeatherByID(defaulCity);
    if(weather.cod >= 300){
        alert('Не удалось загрузить информацию');
    } 
    else {
        document.querySelector('main').prepend(createCityCardHere(weather));
        document.querySelector('div.loader').remove();
    }
}

async function loadHere() {
    let divHere = document.querySelector('div.here');
    if (divHere != null)
        divHere.remove();
    let loader = document.getElementById('loader_here').content.cloneNode(true);
    document.querySelector('main').prepend(loader);
    if (!navigator.geolocation) {
        loadHereDefault();
    }
    else {
        navigator.geolocation.getCurrentPosition(loadHereByCoords, loadHereDefault);
    }
}

function degreesToDirection(degrees) {
    const dirRange = 22.5; // "ширина" одного направления
    const fullCircle = 360;
    const directions = [
        "северный", "северо-северо-восточный", "северо-восточный", "восточно-северо-восточный",
        "восточный", "восточно-юго-восточный", "юго-восточный", "юго-юго-восточный", 
        "южный", "юго-юго-западный", "юго-западный", "западно-юго-западный",
        "западный", "западно-северо-западный", "северо-западный", "северо-северо-западный"];
    if(degrees < 0 || degrees > fullCircle) 
        return null;
    for (let dir = 0, i = 0; dir < fullCircle; dir += dirRange, i++) {
        diff = degrees - dir;
        if ((diff >= -0.5 * dirRange && diff < 0.5 * dirRange) || 
            (diff - fullCircle >= -0.5 * dirRange && diff - fullCircle < 0.5 * dirRange)) {
                return directions[i];
            }
    }
}