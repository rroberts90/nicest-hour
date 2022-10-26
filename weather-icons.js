// note: partly cloudy / partly sunny are special cases that need 'day' or 'night inserted afterwards before getting proper icon name
const icons = {
        'Partly Cloudy Day' : 'partly_cloudy_day',
        'Partly Cloudy Night' : 'partly_cloudy_night',
        'Partly Sunny Day' : 'partly_cloudy_day',
        'Partly Sunny Night' : 'partly_cloudy_night',
        'Mostly Cloudy Day' : 'partly_cloudy_day',
        'Mostly Cloudy Night' : 'partly_cloudy_night',
        'Mostly Sunny Day' : 'partly_cloudy_day',
        'Mostly Sunny Night' : 'partly_cloudy_night',
        'Rain' : 'rainy',
        'Sunny' : 'sunny',
        'Clear': 'clear_night',
        'Cloudy': 'cloudy'

}

function getIcon(forecast, isDaytime){
        const day = isDaytime ? 'Night' : 'Day'

        if(icons[forecast]) {
                return icons[forecast]
        }
        else if(icons[`${forecast} ${day}`]){
                return icons[`${forecast} ${day}`]
        }
        else{
                if(forecast.includes('Rain')){
                        return 'rainy'
                }
        
                if(forecast.includes('Snow')){
                        return 'weather_snowy'
                }
        }
        return ''       
}