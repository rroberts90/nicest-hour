let autocomplete
  
  function initAutocomplete (){
        autocomplete = new google.maps.places.Autocomplete(
                document.getElementById('autocomplete'),
                {
                        types: ['locality', 'postal_code'],
                        componentRestrictions: {country: 'US'},
                        fields: ['geometry', 'adr_address']

                }
        )

        autocomplete.addListener('place_changed',onPlaceChanged)
  }

  function onPlaceChanged(){
        var place = autocomplete.getPlace()
        if(!place.geometry){
                // no prediction
                document.getElementById('autocomplete').placeholder = 'Search City or Zip Code'
                console.log('not found')
        }else {
                //document.getElementById('results').innerHTML = place.adr_address

                console.log(place.geometry.location.lat())
                console.log(place.geometry.location.lng())

                getHourlyURL(place.geometry.location.lat(), place.geometry.location.lng())

        }
  }