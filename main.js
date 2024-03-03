const apiKey = "91e8263a441b2b9406da931c329bb579";
const lat = "36.652065";
const lon = "-94.441528";
const cityName = "anderson";
const weatherUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`;

const url = `https://wft-geo-db.p.rapidapi.com/v1/geo/adminDivisions?namePrefix=${cityName}&limit=2`;
const options = {
  method: "GET",
  headers: {
    "X-RapidAPI-Key": "d5318ed8aemsh6a3812e5aaa6a77p1c254cjsndf580e672805",
    "X-RapidAPI-Host": "wft-geo-db.p.rapidapi.com",
  },
};

fetch(url, options)
  .then(function (result) {
    return result.json();
  })
  .then(function (data) {
    console.log(data);
  });

// try {
//   const response = fetch(url, options);
//   const result = response.text();
//   console.log(result);
// } catch (error) {
//   console.error(error);
// }

function kelvinToCelsius(kelvinTemperature) {
  // Constants for temperature conversion
  const kelvinToCelsiusOffset = 273.15;

  // Convert Kelvin to Celcius
  const celsiusTemperature = kelvinTemperature - kelvinToCelsiusOffset;
  return celsiusTemperature;
}

function kelvinToFahrenheit(kelvinTemperature) {
  // Constants for temperature conversion
  const kelvinToCelsiusOffset = 273.15;
  const celsiusToFahrenheitFactor = 1.8;
  const celsiusToFahrenheitOffset = 32;

  // Convert Kelvin to Fahrenheit
  const celsiusTemperature = kelvinTemperature - kelvinToCelsiusOffset;
  const fahrenheitTemperature =
    celsiusTemperature * celsiusToFahrenheitFactor + celsiusToFahrenheitOffset;

  return fahrenheitTemperature;
}

async function getWeather() {
  fetch(weatherUrl)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      // Handle the JSON temp datas for every 3 hours in 5 days
      console.log(data);
      console.log(data.city.name);
      for (const temps of data.list) {
        console.log(
          kelvinToFahrenheit(temps.main.temp) + " Date: " + temps.dt_txt
        );
      }
    })

    .catch(function (err) {
      console.log(err);
    });
}
