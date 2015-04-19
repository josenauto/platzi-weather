(function() {

	//API Key 
	var API_WORLDTIME_KEY = "010953aa640ed1eaba9f1654650b2";
	var API_WORLDTIME = "https://api.worldweatheronline.com/free/v2/tz.ashx?format=json&key=" + API_WORLDTIME_KEY + "&q=";
	var API_WEATHER_KEY = "4bb905351ef04ce719547c6951bb90ad";
	var API_WEATHER_URL = "http://api.openweathermap.org/data/2.5/weather?APPID=" + API_WEATHER_KEY + "&";
	var IMG_WEATHER = "http://openweathermap.org/img/w/";

	var today = new Date();
	var timeNow = today.toLocaleTimeString();

	var $body = $("body");
	var $loader = $(".loader");
	var nombreNuevaCiudad = $("[data-input='cityAdd']");
	var buttonAdd = $("[data-button='add']");
	var buttonLoad = $("[data-saved-cities]");


	var cities = [];
	var cityWeather = {};
	cityWeather.zone;
	cityWeather.icon;
	cityWeather.currentTemp;
	cityWeather.tempMax;
	cityWeather.tempmin;
	cityWeather.main;

	$( buttonAdd ).on("click", addNewCity);

	$( nombreNuevaCiudad ).on("keypress", function (event) {
		if (event.which == 13) {
			addNewCity(event);
		};
	});

	$( buttonLoad ).on("click", loadSavedCities);

	if(navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(getCoords, errorFound);
	} else {
		alert("Por favor, actualiza tu navegador");
	}

	function errorFound(error) {
		alert("Un error ocurrió: " + error.code);
		//0: Error desconocido
		//1: Permiso denegado
		//2: Posición no está disponible
		//3: Timeout
	};

	function getCoords(position) {
		var lat = position.coords.latitude;
		var lon = position.coords.longitude;
		console.log("Tú posición es: " + lat + "," + lon);
		$.getJSON(API_WEATHER_URL + "lat=" + lat +"&lon=" + lon, getCurrentWeather);
	};

	function getCurrentWeather(data) {
		cityWeather.zone = data.name;
		cityWeather.icon = IMG_WEATHER + data.weather[0].icon + ".png";
		cityWeather.currentTemp = data.main.temp - 273.15;
		cityWeather.tempMax = data.main.temp_max - 273.15;
		cityWeather.tempMin = data.main_temp_min = 273.15;
		cityWeather.main = data.weather[0].main;

		renderTemplate(cityWeather);
	};

	function activateTemplate(id) {
		var t = document.querySelector(id);
		return document.importNode(t.content, true);
	};

	function renderTemplate(cityWeather, localtime) {

		if (localtime) {
			timeToShow = localtime.split(" ")[1];
		} else {
			timeToShow = timeNow;
		}

		var clone = activateTemplate("#template--city");

		clone.querySelector("[data-time]").innerHTML = timeToShow;
		clone.querySelector("[data-city]").innerHTML = cityWeather.zone;
		clone.querySelector("[data-icon]").src = cityWeather.icon;
		clone.querySelector("[data-temp='max']").innerHTML = cityWeather.tempMax.toFixed(1);
		clone.querySelector("[data-temp='min']").innerHTML = cityWeather.tempMin.toFixed(1);
		clone.querySelector("[data-temp='current']").innerHTML = cityWeather.currentTemp.toFixed(1);

		$( $loader ).hide();
		$( $body ).append(clone);
	}

	function addNewCity (event) {
		event.preventDefault();
		$.getJSON(API_WEATHER_URL + "q=" + $( nombreNuevaCiudad ).val(), getWeatherNewCity);
	}

	function getWeatherNewCity (data) {

		$.getJSON(API_WORLDTIME + $( nombreNuevaCiudad ).val() , function function_name (response) {

			$( nombreNuevaCiudad ).val("");

			cityWeather = {};
			cityWeather.zone = data.name;
			cityWeather.icon = IMG_WEATHER + data.weather[0].icon + ".png";
			cityWeather.currentTemp = data.main.temp - 273.15;
			cityWeather.tempMax = data.main.temp_max - 273.15;
			cityWeather.tempMin = data.main.temp_min - 273.15;

			console.log(response);

		renderTemplate(cityWeather, response.data.time_zone[0].localtime);

		cities.push(cityWeather);
		localStorage.setItem("cities", JSON.stringify(cities));
			
		});
	}

	function loadSavedCities (event) {
		event.preventDefault();

		function renderCities (cities) {
			cities.forEach(function (city) {
				renderTemplate(city);
			})
		}

		var cities = JSON.parse( localStorage.getItem("cities") );
		renderCities(cities);
	}

})();