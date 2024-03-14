const cityInput = document.getElementById("dropdown-input");
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
window.addEventListener("load", () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      getCity(position.coords.latitude, position.coords.longitude);
      getWeather(position.coords.latitude, position.coords.longitude);
    });
  } else {
    console.error("Geolocation is not supported by this browser.");
  }
});
cityInput.addEventListener(
  "keyup",
  debounceKeyPress(function (event) {
    const userInput = event.target.value;
    const currKey = event.key;

    if (currKey === "Backspace" && userInput.length === 0) {
      cityList.innerHTML = "";
    }
    if (
      userInput.length >= 5 &&
      currKey !== "ArrowDown" &&
      currKey !== "ArrowUp" &&
      currKey !== "Enter"
    ) {
      cityList.innerHTML = "";
      getOptions(userInput).then(() => {
        const firstChild = cityList.firstChild;

        if (firstChild !== null) {
          firstChild.classList.add("focused", "custom-purple-bg");
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
  const focusedCity = cityList.querySelector(".focused");
  const title = document.getElementById("city-name");
  switch (currKey) {
    case "ArrowUp":
      handleArrowKey("up");
      break;
    case "ArrowDown":
      handleArrowKey("down");
      break;
    case "Enter":
      if (focusedCity) {
        const latitude = focusedCity.dataset.latitude;
        const longitude = focusedCity.dataset.longitude;
        title.innerText = focusedCity.innerText;
        if (latitude && longitude) {
          getWeather(latitude, longitude);
        }
        cityInput.value = "";
        cityList.innerHTML = "";
      }
      break;
    default:
    // Do nothing
  }
});
async function getCity(lat, lon) {
  const url = `https://wft-geo-db.p.rapidapi.com/v1/geo/adminDivisions?location=${lat}${lon}`;
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
      const title = document.getElementById("city-name");
      title.innerText =
        data.data[0].name +
        ", " +
        data.data[0].regionCode +
        ", " +
        data.data[0].countryCode;
    });
}

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
      for (const city of data.data) {
        const selectionData = document.createElement("li");
        selectionData.innerText = `${city.name}, ${city.regionCode}, ${city.countryCode}`;
        selectionData.dataset.latitude = city.latitude;
        selectionData.dataset.longitude = city.longitude;
        selectionData.classList.add(
          "option-list",
          "ps-4",
          "mt-2",
          "mx-2",
          "py-2",
          "fs-4"
        );

        selectionData.addEventListener("click", () => {
          const title = document.getElementById("city-name");
          title.innerText = selectionData.innerText;
          getWeather(city.latitude, city.longitude);
          cityInput.value = "";
          cityList.innerHTML = "";
        });
        cityList.appendChild(selectionData);
      }

      console.log(data);
    });
}

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

  // Ensure exactly two decimal places
  const formattedTemperature = fahrenheitTemperature.toFixed(2);

  // Parse as float to remove trailing zeroes if any
  return formattedTemperature;
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
      const daysMap = new Map();

      for (const temps of data.list) {
        const formattedDate = dayjs(temps.dt_txt, "MM-YYYY-DDDD");

        if (daysMap.has(formattedDate.day())) {
          daysMap.get(formattedDate.day()).push(temps);
        } else {
          daysMap.set(formattedDate.day(), [temps]);
        }
      }

      return { daysMap };
    })
    .then(function (data) {
      console.log(data);
      const navContainer = document.getElementById("weekly-weather");
      navContainer.innerHTML = ""; // Ensures nav bar is empty each time fetch is called
      const days = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];
      let isFirstIteration = true;
      data.daysMap.forEach((value, key) => {
        const navLinkContainer = document.createElement("li");
        navLinkContainer.classList.add("nav-item");

        const navLink = document.createElement("a");
        navLink.classList.add("nav-link");
        if (navContainer.childElementCount === 0) {
          navLink.classList.add("active");
        }
        navLink.innerText = days[key];
        navLink.href = "#";

        // clear wheather data
        const weatherContainer = document.getElementById("weather-contents");
        weatherContainer.innerHTML = "";

        navLinkContainer.addEventListener("click", () => {
          const weatherContainer = document.getElementById("weather-contents");
          weatherContainer.innerHTML = "";
          // populate data
          for (let i = 0; i < value.length; i++) {
            // table row
            const row = document.createElement("tr");
            // Time Data
            const timeContainer = document.createElement("td");
            const date = dayjs(value[i].dt_txt, "YYYY-MM-DD HH:mm:ss"); // Assuming value[i].dt_txt is in "YYYY-MM-DD HH:mm:ss" format
            const formattedTime = date.format("hh:mm A"); // Format the time to "hh:mm A" (e.g., "08:00 PM")
            timeContainer.innerText = formattedTime;

            // temp data
            const tempContainer = document.createElement("td");
            tempContainer.innerText = kelvinToFahrenheit(value[i].main.temp);
            tempContainer.classList.add("text-light", "temps", "fahrenheit");

            // const timeContainer
            row.appendChild(timeContainer);
            row.appendChild(tempContainer);
            weatherContainer.appendChild(row);
            console.log(value[i]);
          }
        });

        navLinkContainer.appendChild(navLink);
        navContainer.appendChild(navLinkContainer);
      });
    })

    .catch(function (err) {
      console.log(err);
    });
}

function handleArrowKey(direction) {
  const focusedCity = cityList.querySelector(".focused");

  if (focusedCity) {
    focusedCity.classList.remove("focused", "custom-purple-bg");

    // Determine the new focused city based on the direction
    const newFocusedCity =
      direction === "up"
        ? focusedCity.previousElementSibling
        : focusedCity.nextElementSibling;

    if (newFocusedCity) {
      newFocusedCity.classList.add("focused", "custom-purple-bg");
      newFocusedCity.focus();
    }
  } else {
    // If no city is currently focused, focus the first one
    const firstCity = cityList.firstChild;

    if (firstCity) {
      firstCity.classList.add("focused", "custom-purple-bg");
      firstCity.focus();
    }
  }
}
