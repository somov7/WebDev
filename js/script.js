let favoriteCities;

function recieveWeatherData(cityName) {
    return {
        name: cityName,
        temperature: 13,
        wind: 'wind',
        clouds: 'clouds',
        pressure: 'pressure',
        humidity: 'humidity',
        coords: 'coordinates'
    };
}

function createCityCard(city) {
    let card = document.createElement('li');

    let cardHeader = document.createElement('div');
    cardHeader.setAttribute('class', 'fav_city_header');

    let cardCityName = document.createElement('h3');
    cardCityName.innerHTML = city.name;
    cardHeader.append(cardCityName);

    let cardTemperature = document.createElement('span');
    cardTemperature.setAttribute('class', 'temperature');
    cardTemperature.innerHTML = city.temperature + '°C';
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

    let cardInfo = document.createElement('ul');
    cardInfo.setAttribute('class', 'weather_info');

    let weatherData = {wind: 'Ветер', clouds: 'Облачность', pressure: 'Давление', humidity: 'Влажность', coords: 'Координаты'};
    
    for(const [key, value] of Object.entries(weatherData)) {
        let infoItem = document.createElement('li');
        
        let infoName = document.createElement('span');
        infoName.setAttribute('class', 'weather_info_name');
        infoName.innerHTML = value;
        infoItem.append(infoName);

        let infoValue = document.createElement('span');
        infoValue.setAttribute('class', 'weather_info_value');
        infoValue.innerHTML = city[key];
        infoItem.append(infoValue);

        cardInfo.append(infoItem);
    }
    card.append(cardInfo);

    document.getElementsByClassName('favorite')[0].append(card);
}

function addCity() {
    cityName = document.querySelector('div.add_city input[type=input]').value;
    if(cityName == ''){
        return;
    }
    if(favoriteCities.includes(cityName)) {
        alert('Город уже есть в списке');
        return;
    }
    favoriteCities.push(cityName);
    localStorage.setItem('favoriteList', JSON.stringify(favoriteCities));
    createCityCard(recieveWeatherData(cityName));
}

function deleteCity(element) {
    cityName = element.parentNode.getElementsByTagName('h3')[0].innerHTML;
    let index = favoriteCities.indexOf(cityName);
    if(index >= 0) {
        favoriteCities.splice(index, 1);
        localStorage.setItem('favoriteList', JSON.stringify(favoriteCities));
    }
    else {
        alert('Такого города не существует');
    }
    cityCard = element.parentNode.parentNode;
    cityCard.parentNode.removeChild(cityCard);
}

function loadFavorites() {
    if (localStorage.getItem('favoriteList') == null) {
        favoriteCities = [];
        return;
    }
    favoriteCities = JSON.parse(localStorage.getItem('favoriteList'));
    console.log(favoriteCities);
    for (let cityName of favoriteCities) {
        console.log(cityName);
        createCityCard(recieveWeatherData(cityName));
    }
    return;
}

