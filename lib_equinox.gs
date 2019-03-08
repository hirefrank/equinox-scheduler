/**
 * Returns the club's classes for a given date range
 */

function getClasses(from_date, to_date, club_id) {
  var url = '/v1/classes/allclasses';
  var form = {                                                                 
    'facilityIds': club_id,
    'startDate': formatDate(from_date),
    'endDate': formatDate(to_date),
    'isBookingRequired': false,
  };
  
  return apiFetch(url, 'post', form); 
}

/**
 * Returns the class's metadata
 */

function classDetails(class_id){ 
  var url = '/v3/classes/' + class_id;
  return apiFetch(url, 'get'); 
}

/**
 * Returns the class's metadata as well as available slots for reserving.
 */

function openSlots(class_id) { 
  var url = '/v2/bookaclass/equipments/' + class_id;
  return apiFetch(url, 'get'); 
}

/**
 * Reserves the class and equipment, if required.
 */

function bookClass(class_id, club_id, equipment_id){ 
  var equipment = (equipment_id == undefined) ? '' : '?bikeId=' + equipment_id;
  var url = '/v2/bookaclass/' + class_id + '/book/' + club_id + equipment;
  
  return apiFetch(url, 'put'); 
}

/**
 * Returns the user's equinox calendar.
 */

function calendar(from_date, to_date) { 
  var url = '/v3/me/calendar/?fromDate=' + formatDate(from_date) + '&toDate=' + formatDate(to_date);
  return apiFetch(url, 'get'); 
}

/**
 * Checks to see if class is on the user's equinox calendar.
 */

function isOnCalendar(class_id, user_calendar) { 
  for (c in user_calendar) {
    if (user_calendar[c].classInstanceId.toFixed(0) == class_id) {
      return true;
    }
  }
  return false; 
}

/**
 * Adds class to the user's equinox calendar.
 */

function addToCalendar(class_id) { 
  var url = '/v3/me/calendar/' + class_id;
  return apiFetch(url, 'post'); 
}

/**
 * Return the user's authentication cookie
 */

function getAuthCookie() {
  var form = {                                                                 
    'username': PropertiesService.getScriptProperties().getProperty('email'),
    'password': PropertiesService.getScriptProperties().getProperty('password'),
    'persistLogin': true
  };
  
  var headers = {                                                              
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.106 Safari/537.36',
    'Origin': 'https://www.equinox.com',
    'Referer': 'https://www.equinox.com/login'
  };  
  
  // assembles the options
  // sets the headers, method
  var options = {                                                                                                                
    'headers': headers,
    'payload': form,
    'method': 'post', 
    'muteHttpExceptions': true,
  };
  
  var response = UrlFetchApp.fetch('https://api.equinox.com/v1/authentication/login', options);
  return response.getAllHeaders()['Set-Cookie'][0].split(';')[0];
}

/**
 * Makes an authenticated Equinox API and returns the response
 * ---
 * Accepts API endpoint, method, and form data (optional). Requires script 
 * properties named 'email' and 'password' for authentication.
 */

function apiFetch(api, method, form) {
  const API_BASE_URL = 'https://api.equinox.com';
  
  // not all api calls have form data
  // if not passed in, set to empty
  var form = form || '';
  
  // assemble the header
  // spoof user-agent, origin, referer
  var headers = {                                                              
    'Cookie': getAuthCookie(),
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.106 Safari/537.36',
    'Origin': 'https://www.equinox.com',
    'Referer': 'https://www.equinox.com/activity'
  };
  
  // assembles the options
  // sets the headers, form data, method
  var parameters = {                                                                                                                
    'headers': headers,                                                        
    'payload': form,                                           
    'method': method,                                                          
    'muteHttpExceptions': true,
  };
  
  // constructs the url, makes the api call, returns the response
  var url = API_BASE_URL + api;
  var response = UrlFetchApp.fetch(url, parameters);   
  
  return response;
  
  // add caching
  // https://stackoverflow.com/questions/25511883/how-can-i-cache-an-object-in-google-apps-scripts
  // https://developers.google.com/apps-script/reference/cache/
}

/**
 * Returns the date in an Equinox friendly format, e.g. YYYY-MM-DD
 */

function formatDate(date) {
  var d = new Date(date),
  month = '' + (d.getMonth() + 1),
  day = '' + d.getDate(),
  year = d.getFullYear();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [year, month, day].join('-');
}