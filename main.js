const cityInput = document.getElementById("dropdown-input");
let debounceTimer;
const cityList = document.getElementById("city-options");

// Function to debounce keypress events
function debounceKeyPress(callback, delay) {
  let timer;
  return function () {
    const context = this;
    const args = arguments;
    clearTimeout(timer);
    timer = setTimeout(() => {
      callback.apply(context, args);
    }, delay);
  };
}

cityInput.addEventListener(
  "keyup",
  debounceKeyPress(function (event) {
    const userInput = event.target.value;
    const currKey = event.key;

    if (
      userInput.length >= 5 &&
      currKey !== "ArrowDown" &&
      currKey !== "ArrowUp"
    ) {
      cityList.innerHTML = "";
      getOptions(userInput).then(() => {
        const firstChild = cityList.firstChild;

        if (firstChild !== null) {
          firstChild.classList.add("focused", "bg-info");
          firstChild.focus();
        } else {
          console.error("cityList does not have any child elements.");
        }
      });
    }
  }, 1000)
);

cityInput.addEventListener("keydown", (event) => {
  const currKey = event.key;

  if (currKey === "ArrowUp") {
    handleArrowKey("up");
  } else if (currKey === "ArrowDown") {
    handleArrowKey("down");
  }
});

async function getOptions(cityName) {
  const url = `https://wft-geo-db.p.rapidapi.com/v1/geo/adminDivisions?namePrefix=${cityName}&limit=10`;
  const options = {
    method: "GET",
    headers: {
      "X-RapidAPI-Key": "d5318ed8aemsh6a3812e5aaa6a77p1c254cjsndf580e672805",
      "X-RapidAPI-Host": "wft-geo-db.p.rapidapi.com",
    },
  };

  return fetch(url, options)
    .then(function (result) {
      return result.json();
    })
    .then(function (data) {
      for (city of data.data) {
        const selectionData = document.createElement("li");
        selectionData.innerText = `${city.name}, ${city.regionCode}, ${city.countryCode}`;

        selectionData.addEventListener("click", () => {
          getWeather(city.latitude, city.longitude);
        });

        // Attach keydown event listener for keyboard navigation
        selectionData.addEventListener("keydown", function (event) {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            getWeather(city.latitude, city.longitude);
          }
        });

        // Handle focus on arrow key navigation
        selectionData.addEventListener("focus", function () {
          selectionData.classList.add("focused", "bg-info");
        });

        selectionData.addEventListener("blur", function () {
          selectionData.classList.remove("focused", "bg-info");
        });

        cityList.appendChild(selectionData);
      }

      console.log(data);
    });
}
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

async function getWeather(lat, lon) {
  const apiKey = "91e8263a441b2b9406da931c329bb579";
  const weatherUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`;
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

function handleArrowKey(direction) {
  const focusedCity = cityList.querySelector(".focused");

  if (focusedCity) {
    focusedCity.classList.remove("focused", "bg-info");

    // Determine the new focused city based on the direction
    const newFocusedCity =
      direction === "up"
        ? focusedCity.previousElementSibling
        : focusedCity.nextElementSibling;

    if (newFocusedCity) {
      newFocusedCity.classList.add("focused", "bg-info");
      newFocusedCity.focus();
    }
  } else {
    // If no city is currently focused, focus the first one
    const firstCity = cityList.firstChild;

    if (firstCity) {
      firstCity.classList.add("focused", "bg-info");
      firstCity.focus();
    }
  }
}
