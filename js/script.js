const serverLink = 'https://webdev-weather-server.glitch.me/'

window.onload = function() {
    loadHere()
    loadFavorites()
    addCityForm = document.forms.add_city
    addCityForm.addEventListener('submit', addCity)
    btnMain = document.querySelector('header .btn_update_main').addEventListener('click', loadHere)
    btnMobile = document.querySelector('header .btn_update_mobile').addEventListener('click', loadHere)
}

async function getWeather(url, method = 'GET'){
    try {
        const response = await fetch(url, { 
            method: method, 
            credentials: 'include',
            secure: true
        })
        let data = await response.json()
        return data
    } catch (error) {
        return { success: false, message: error }
    }
}

function getWeatherByName(cityName){
    requestURL = serverLink + '/weather/city?q=' + encodeURI(cityName)
    return getWeather(requestURL)
}

function getWeatherDefault(){
    requestURL = serverLink + '/weather/default'
    return getWeather(requestURL)
}

function getWeatherByCoords(latitude, longitude){
    requestURL = serverLink + '/weather/coordinates?lat=' + encodeURI(latitude) + '&lon=' + encodeURI(longitude)
    return getWeather(requestURL)
}

function getFavoriteWeatherList() {
    requestURL = serverLink + '/favourites'
    return getWeather(requestURL)
}

function getWeatherByID(cityID){
    requestURL = serverLink +  '/favourites/' + encodeURI(cityID)
    return getWeather(requestURL)
}

function addFavoriteCity(cityName) {
    requestURL = serverLink + '/favourites/' +  encodeURI(cityName)
    return getWeather(requestURL, 'POST')
}

function deleteFavoriteCity(cityID) {
    requestURL = serverLink + '/favourites/' +  encodeURI(cityID)
    return getWeather(requestURL, 'DELETE')
}

function weatherIdToIcon(weatherID){
    if(weatherID == 800)
        return 'sunny'
    if(weatherID == 801)
        return 'light_clouds'
    if(weatherID == 802)
        return 'clouds'
    if(weatherID == 803 || weatherID == 804)
        return 'heavy_clouds'
    if((weatherID >= 300 && weatherID <= 399) || (weatherID >= 520 && weatherID <= 531))
        return 'light_rain'
    if(weatherID >= 500 && weatherID <= 504)
        return 'rain'
    if(weatherID >= 200 && weatherID <= 299)
        return 'thunder'
    if((weatherID >= 600 && weatherID <= 699) || weatherID == 511)
        return 'snow'
    if(weatherID >= 700 && weatherID <= 799)
        return 'mist'
    return 'unknown'
}

function cityInfoItems(weather) {
    let items = []

    params = [
        {name: 'Ветер', value: weather.wind.speed + ' м/с, ' + degreesToDirection(weather.wind.deg)}, 
        {name: 'Облачность', value: weather.clouds.all + '%'},
        {name: 'Давление', value: weather.main.pressure + ' гПа'},
        {name: 'Влажность', value: weather.main.humidity + '%'},
        {name: 'Координаты', value: '[' + weather.coord.lon + ', ' + weather.coord.lat + ']'}]
    
    for (const param of params) {
        let infoItem = document.getElementById('weather_info_item').content.cloneNode(true)
        infoItem.querySelector('span.weather_info_name').innerHTML = param.name
        infoItem.querySelector('span.weather_info_value').innerHTML = param.value
        items.push(infoItem)
    }

    return items
}

function createCityCardFavorite(weather) {
    let card = document.getElementById('favorite_city_card').content.cloneNode(true)

    card.querySelector('li').setAttribute('data-city_id', weather.id)
    card.querySelector('h3').innerHTML = weather.name
    card.querySelector('span.temperature').insertAdjacentHTML('afterbegin', weather.main.temp)
    card.querySelector('div.icon_weather').classList.add('weather_' + weatherIdToIcon(weather.weather[0].id))
    card.querySelector('input').addEventListener('click', deleteCity)
    for (item of cityInfoItems(weather)) {
        card.querySelector('ul.weather_info').append(item)
    }

    return card    
}

function createCityCardHere(weather) {
    
    let card = document.getElementById('here').content.cloneNode(true)

    card.querySelector('div.here_left h2').innerHTML = weather.name
    card.querySelector('div.here_left div.icon_weather').classList.add('weather_' + weatherIdToIcon(weather.weather[0].id))
    card.querySelector('div.here_left span.temperature').insertAdjacentHTML('afterbegin', weather.main.temp)
    for (item of cityInfoItems(weather)) {
        card.querySelector('ul.weather_info').append(item)
    }

    return card
}   

async function addCity(event) {
    event.preventDefault()
    input = event.target.input
    cityName = input.value
    if (cityName == ''){
        return
    }
    
    input.value = ''
    let loader = document.getElementById('loader_favorite').content.cloneNode(true)
    document.querySelector('ul.favorite').append(loader)
    
    try {
        weatherRequest = await addFavoriteCity(cityName)
        if (!weatherRequest.success) {
            document.querySelector('ul.favorite').removeChild(document.querySelector('ul.favorite li.loader'))
            alert('Не удалось загрузить информацию')
            return            
        }
        if (weatherRequest.duplicate) {
            document.querySelector('ul.favorite').removeChild(document.querySelector('ul.favorite li.loader'))
            alert('Город уже в списке')
            return
        }
        let weather = weatherRequest.weather
        document.querySelector('ul.favorite').replaceChild(createCityCardFavorite(weather), document.querySelector('ul.favorite li.loader'))
    }   
    catch (err) {
        document.querySelector('ul.favorite').removeChild(document.querySelector('ul.favorite li.loader'))
        alert('Не удалось загрузить информацию')
        return
    }    
}

async function deleteCity(event) {
    let cityCard = event.target.parentNode.parentNode
    let cityID = cityCard.getAttribute('data-city_id')
    try {
        response = await deleteFavoriteCity(cityID)
        if(response.success) {
            cityCard.remove()
        }
        else {
            alert('Не удалось удалить город')
        }
    }
    catch (error){
        console.log(error)
    }
}

async function loadFavorites() {
    try{
        weatherResponse = await getFavoriteWeatherList()
        if(!weatherResponse.success) {
            console.log(weatherResponse.message)
            alert('Не удалось получить список избранных городов')
            return
        }
        let favoriteCities = weatherResponse.cities 
        for(let i = 0; i < favoriteCities.length; i++){
            let loader = document.getElementById('loader_favorite').content.cloneNode(true)
            document.querySelector('ul.favorite').append(loader)
        }
        for (let cityID of favoriteCities) {
            try {
                weatherRequest = await getWeatherByID(cityID)
                if(!weatherRequest.success){
                    document.querySelector('ul.favorite').removeChild(document.querySelector('ul.favorite li.loader'))
                    alert('Не удалось загрузить информацию')
                }
                else {
                    weather = weatherRequest.weather
                    document.querySelector('ul.favorite').replaceChild(createCityCardFavorite(weather), document.querySelector('ul.favorite li.loader'))
                }
            }
            catch (err) {
                document.querySelector('ul.favorite').removeChild(document.querySelector('ul.favorite li.loader'))
                alert('Не удалось загрузить информацию')
            }
        }
    }
    catch(error) {
        console.log(error)
        alert('Не удалось получить список избранных городов')
    }
}

async function loadHereByCoords(position) {
    errorDiv = document.getElementById('error_here').content.cloneNode(true)
    errorDiv.querySelector('input').addEventListener('click', loadHere)
    try {
        weatherRequest = await getWeatherByCoords(position.coords.latitude, position.coords.longitude)
        if(!weatherRequest.success){
            document.querySelector('.here').replaceChild(errorDiv, document.querySelector('.here .loader'))
            alert('Не удалось загрузить информацию')
        } 
        else {
            weather = weatherRequest.weather
            document.querySelector('.here').replaceChild(createCityCardHere(weather), document.querySelector('.here .loader'))
        }
    }
    catch (err) {
        document.querySelector('.here').replaceChild(errorDiv, document.querySelector('.here .loader'))
        alert('Не удалость загрузить информацию')
    }
}


async function loadHereDefault(error) {
    errorDiv = document.getElementById('error_here').content.cloneNode(true)
    errorDiv.querySelector('input').addEventListener('click', loadHere)
    try {
        weatherRequest = await getWeatherDefault()
        if(!weatherRequest.success){
            document.querySelector('.here').replaceChild(errorDiv, document.querySelector('.here .loader'))
            alert('Не удалось загрузить информацию')
        } 
        else {
            weather = weatherRequest.weather
            document.querySelector('.here').replaceChild(createCityCardHere(weather), document.querySelector('.here .loader'))
        }
    }
    catch (err) {
        document.querySelector('.here').replaceChild(errorDiv, document.querySelector('.here .loader'))
        alert('Не удалость загрузить информацию')
    }
}

async function loadHere() {
    let divHere = document.querySelector('div.here')
    let loader = document.getElementById('loader_here').content.cloneNode(true)
    document.querySelector('.here').innerHTML = ""
    document.querySelector('.here').append(loader)
    if (!navigator.geolocation) {
        loadHereDefault()
    }
    else {
        navigator.geolocation.getCurrentPosition(loadHereByCoords, loadHereDefault)
    }
}

function degreesToDirection(degrees) {
    const dirRange = 22.5 // "ширина" одного направления
    const fullCircle = 360
    const directions = [
        "северный", "северо-северо-восточный", "северо-восточный", "восточно-северо-восточный",
        "восточный", "восточно-юго-восточный", "юго-восточный", "юго-юго-восточный", 
        "южный", "юго-юго-западный", "юго-западный", "западно-юго-западный",
        "западный", "западно-северо-западный", "северо-западный", "северо-северо-западный"]
    if(degrees < 0 || degrees > fullCircle) {
        return null
    }
    for (let dir = 0, i = 0; dir < fullCircle; dir += dirRange, i++) {
        diff = degrees - dir
        if ((diff >= -0.5 * dirRange && diff < 0.5 * dirRange) || 
            (diff - fullCircle >= -0.5 * dirRange && diff - fullCircle < 0.5 * dirRange)) {
                return directions[i]
            }
    }
}