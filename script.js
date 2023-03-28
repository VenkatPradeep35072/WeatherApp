const wrapper = document.querySelector(".wrapper"),
inputPart = document.querySelector(".input-part"),
infoTxt = inputPart.querySelector(".info-txt"),
inputField = inputPart.querySelector("input"),
locationBtn = inputPart.querySelector("button"),
weatherPart = wrapper.querySelector(".weather-part"),
wIcon = weatherPart.querySelector("img"),
arrowBack = wrapper.querySelector("header i"),
weatherCards = document.querySelectorAll(".weather-card");
;

let api;


inputField.addEventListener("keyup", e =>{
    if(e.key == "Enter" && inputField.value != ""){
        requestApi(inputField.value);
    }
});

locationBtn.addEventListener("click", () =>{
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(onSuccess, onError);
    }else{
        alert("Your browser not support geolocation api");
    }
});

function requestApi(city){
    api = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=481badf42517fdd548ef29ab3a393872
    `;
    fetchData();
}

function onSuccess(position){
    const {latitude, longitude} = position.coords;
    api = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&exclude=current,hourly,minutely,alerts&appid=481badf42517fdd548ef29ab3a393872
    `;
    fetchData();
}

function onError(error){
    infoTxt.innerText = error.message;
    infoTxt.classList.add("error");
}

function fetchData(){
    infoTxt.innerText = "Getting weather details...";
    infoTxt.classList.add("pending");
    fetch(api).then(res => res.json()).then(result => weatherDetails(result)).catch(() =>{
        infoTxt.innerText = "Something went wrong";
        infoTxt.classList.replace("pending", "error");
    });
}

function weatherDetails(info){
    if(info.cod == "404"){
        infoTxt.classList.replace("pending", "error");
        infoTxt.innerText = `${inputField.value} isn't a valid city name`;
    }else{
        const city = info.name;
        const country = info.sys.country;
        const {description, id} = info.weather[0];
        const {temp, feels_like, humidity} = info.main;

        if(id == 800){
            wIcon.src = "icons/clear.svg";
        }else if(id >= 200 && id <= 232){
            wIcon.src = "icons/storm.svg";  
        }else if(id >= 600 && id <= 622){
            wIcon.src = "icons/snow.svg";
        }else if(id >= 701 && id <= 781){
            wIcon.src = "icons/haze.svg";
        }else if(id >= 801 && id <= 804){
            wIcon.src = "icons/cloud.svg";
        }else if((id >= 500 && id <= 531) || (id >= 300 && id <= 321)){
            wIcon.src = "icons/rain.svg";
        }
        
        weatherPart.querySelector(".temp .numb").innerText = Math.floor(temp);
        weatherPart.querySelector(".weather").innerText = description;
        weatherPart.querySelector(".location span").innerText = `${city}, ${country}`;
        weatherPart.querySelector(".temp .numb-2").innerText = Math.floor(feels_like);
        weatherPart.querySelector(".humidity span").innerText = `${humidity}%`;
        infoTxt.classList.remove("pending", "error");
        infoTxt.innerText = "";
        inputField.value = "";
        wrapper.classList.add("active");
        getWeatherForNext7days(city);

    }
}
function getWeatherForNext7days(city) {
    const ENDPOINT = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=481badf42517fdd548ef29ab3a393872&units=metric&cnt=7`;
  
    console.log(ENDPOINT);
    
    fetch(ENDPOINT)
      .then((response) => response.json())
      .then((data) => {
        const forecasts = data.list;
        // Use the entire forecast data for all 7 days
  
        forecasts.forEach((forecast, index) => {
          const weatherCard = weatherCards[index];
          const date = new Date(forecast.dt * 1000);
          const options = { weekday: "long", day: "numeric" };
          const dayOfWeek = date.toLocaleDateString("en-US", options);

          weatherCard.querySelector(".description").textContent =
            forecast.weather[0].description;
          weatherCard.querySelector(
            ".temp"
          ).textContent = `${forecast.main.temp.toFixed(0)}°C`;

        });
      })
      .catch((error) => console.log(error));
  }

arrowBack.addEventListener("click", ()=>{
    wrapper.classList.remove("active");
});


var modal = document.getElementById("myModal");

var btn = document.getElementsByTagName("button")[0];

var span = document.getElementsByClassName("close")[0];
function openModal() {
  modal.style.display = "block";
}

function closeModal() {
  modal.style.display = "none";
}

window.onclick = function (event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
};

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    const cookieValue = parts.pop().split(";").shift();
    return cookieValue.split(",");
  }
}

const cookieValue = getCookie("access_token");
document.getElementById("UserName").textContent = cookieValue[0];
document.getElementById("UserEmail").textContent = cookieValue[1];
document.getElementById("Usercity1").textContent = cookieValue[2];
document.getElementById("Usercity2").textContent = cookieValue[3];
document.getElementById("Usercity3").textContent = cookieValue[4];



