// api endpoint 1 example:  https://api.weather.gov/points/47.6062,-122.3321
const weatherUrl = 'https://api.weather.gov/points/'

//copied from Stackoverflow. 
Date.prototype.addHours = function(h) {
        this.setTime(this.getTime() + (h*60*60*1000));
        return this;
      }

/**
 * 
 * @param {Date} time 
 * @param {Date} time2 optional
 */
function getHourBrackets(time, time2) {
        return `${time.toLocaleString('en-US',
                { hour: 'numeric', hour12: true })} - ${time2.toLocaleString('en-US',
                        { hour: 'numeric', hour12: true })}`


}

async function getHourlyURL(lat, lng) {
        const url = `${weatherUrl}${lat},${lng}`

        //       fetch(url)
        //       .then((response) => response.json())
        //       .then( (data) => getHourlyData(data.forecastHourly))

        const response = await fetch(url)
        const data = await response.json()

        return getHourlyData(data.properties.forecastHourly)
}

async function getHourlyData(url) {

        const response = await fetch(url)
        const data = await response.json()

        // could use optional chaining
        try {
        const hours = data.properties.periods.map(period => {
                const hourData = {
                        time: new Date(period.startTime),

                        isDaytime: period.isDaytime,
                        temperature: period.temperature,
                        windSpeed: period.windSpeed,
                        forecast: period.shortForecast

                }
                const time2 = new Date(period.startTime)
                time2.addHours(1)
                hourData.time2 = time2 //getHourBrackets(hourData.time, time2)
                return hourData;
        })
        //collectShortForecasts(hours)
        insertResults(rankHours(combineHours(hours)))
} catch( e) {
        insertErrorMessage('Weather.gov api limit reached. Try again in a minute', data)
}

}

function insertErrorMessage(message, data) {
        const results = document.getElementById('results')
        results.innerHTML = message
}

function insertResults(hours) {
        console.log(hours)

        const results = document.getElementById('results')
        results.innerHTML = ""
        hours.forEach((hour, i) => {
                const result = document.createElement('li')
                const time = document.createElement('div')
                const forecast = document.createElement('div')
                const icon = document.createElement('span')
                
                //const temp = document.createElement('span')

                results.appendChild(result)
                result.appendChild(time)
                result.appendChild(icon)

                result.appendChild(forecast)


                //result.appendChild(temp)
                icon.className = "material-symbols-outlined"
                icon.innerHTML = getIcon(hour.forecast)
                console.log(icon.innerHTML)

                time.textContent = `${i + 1}. ${getHourBrackets(hour.time, hour.time2)}`
                forecast.innerHTML = `${hour.forecast} `
                //temp.innerHTML = `${hour.temperature}&#176`

        })

}
function collectShortForecasts(hours) {
        const forecasts = localStorage.getItem('forecasts')
        const saved = forecasts ? JSON.parse(forecasts) : []

        hours.forEach(hour => {
                if (!saved.includes(hour.forecast)) {
                        saved.push(hour.forecast)
                }
        })
        console.log(saved)
        localStorage.setItem('forecasts', JSON.stringify(saved))
}

// api only gives textual  percipitation predictions
// going to rank based on personal preference
// sunny / clear at top, followed by
// escalating precipitation followed by harsh  weather
//
function rankForecast(forecast) {
        const rankings = {
                "Mostly Partly": 2,
                "Cloudy": 5,
                "Isolated Few": 10,
                "Slight Widely Scattered": 11,
                "Chance Scattered": 12,
                "Likely Numerous": 13,
                "LightRain": 14,
                "Rain Hail Snow": 15,
                "Sunny Clear": 1,

        }
        const formattedForecast = forecast.replace("Light Rain", "Rain")

        for (let ranking of Object.entries(rankings)) {

                const matches = ranking[0].split(' ')
                for (let match of matches) {
                        if (forecast.includes(match)) {
                                return ranking[1]
                        }
                }


        }
        return 100 // if the forecast 
        //isn't included just put it at the bottom.
        // it's probably bad
}

function rankHours(hours) {
        // prune list to only today

        // sort by tempature 

        // sort by forecast
        const currentDay = hours[0].time.getDate()

        const rankedHours = hours.filter(hour => hour.time.getDate() === currentDay)
                .sort((hour1, hour2) => hour2.temperature - hour1.temperature)
                .sort((hour1, hour2) => {

                        const rank1 = rankForecast(hour1.forecast)
                        const rank2 = rankForecast(hour2.forecast)

                        hour1.forecastRank = rank1
                        hour2.forecastRank = rank2

                        if (rank1 < rank2) {
                                return -1
                        } else if (rank2 < rank1) {
                                return 1
                        } else {
                                return 0
                        }
                }).sort((hour1,hour2)=> {
        // special case for rain showers / light rain
                        if(hour1.forecast.includes("Light Rain") || hour2.forecast.includes("Light Rain") || hour1.forecast.includes("Showers") || hour2.forecast.includes("Showers")) {
                        if(hour1.forecast.replace('Light','').trim() === hour2.forecast || hour1.forecast.replace('Showers','').trim() === hour2.forecast){
                                return -1
                        }
                        else if(hour2.forecast.replace('Light','').trim() === hour1.forecast || hour2.forecast.replace('Showers','').trim() === hour1.forecast){
                                return 1
                        }else{
                                return 0
                        }
                        }else{
                                return 0
                        }
                })




        return rankedHours
}

/**
 * if multiple hours have similiar forecasts put them together
 * Will lose the second hour's data on tempature / windspeed, etc but 
 * doesn't matter. Just Focus on Forecast for now.
 * @param {Array} hours 
 */
function combineHours(hours) {
        // const combinedHours = sortedHours.reduce((r, c, i) => {
        //         return c.forecast === l[i - 1].forecast &&
        //                 c.time.getHours() === l[i - 1].getHours() + 1
        //                 ? [...r, c] : [...r]
        // }, [])
        const combinedHours = [hours[0]]
        for(let i = 1; i< hours.length; i++) {
                const currentHour = hours[i]
                const prevHour = combinedHours[combinedHours.length-1]


                if(currentHour.forecast === prevHour.forecast) { //} && currentHour.isDaytime === prevHour.isDaytime) {

                        prevHour.time2 = currentHour.time2

                        // don't add currentHour
                }else{
                        combinedHours.push(currentHour)
                }
        }
        return combinedHours

}


/** Period object for reference
 *          "number": 1,
                "name": "",
                "startTime": "2022-10-21T10:00:00-07:00",
                "endTime": "2022-10-21T11:00:00-07:00",
                "isDaytime": true,
                "temperature": 49,
                "temperatureUnit": "F",
                "temperatureTrend": null,
                "windSpeed": "5 mph",
                "windDirection": "S",
                "icon": "https://api.weather.gov/icons/land/day/rain,70?size=small",
                "shortForecast": "Light Rain Likely",
                "detailedForecast": 
 */

/**
 Weather Terms 

 "Light Rain Likely"
"Rain"
"Light Rain"
"Chance Light Rain"
"Chance Rain Showers"
"Rain Showers Likely"
"Slight Chance Rain Showers"
"Partly Cloudy"
"Mostly Cloudy"
"Partly Sunny"
 "Mostly Sunny"
 "Slight Chance Showers And Thunderstorms"
 "Chance Showers And Thunderstorms"
 "Mostly Clear"
"Sunny"
"Clear"
 "Cloudy"
 "Rain Showers"
 "Showers And Thunderstorms Likely"
 "Patchy Drizzle"
 "Patchy Fog"
 "Slight Chance Light Rain"
 "Scattered Rain Showers"
 "Rain And Snow Showers"
 "Snow Showers"
 "Chance Snow Showers"
 "Scattered Snow Showers"
 "Isolated Snow Showers"
 "Chance Rain And Snow Showers"
 "Chance Rain And Snow"
 "Slight Chance Rain And Snow"
 "Slight Chance Light Snow"
 "Rain And Snow Likely"
 "Light Snow Likely"
 "Chance Light Snow"
"Slight Chance Rain And Snow Showers" 
 
 */

/**
 *         .sort((hour1, hour2)=> {
                if(hour1.isDaytime && !hour2.isDaytime){
                        return 1
                }
                else if (hour2.isDaytime && !hour1.isDaytime){
                        return -1
                }
                else {
                        return 0
                }
                
        })
 */