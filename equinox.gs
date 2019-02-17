/**
 * Returns the class's metadata as well as available slots for reserving.
 */

function openSlots(class_id) { 
  var url = '/v2/bookaclass/equipments/' + class_id;
  return apiFetch(url, 'get'); 
}

/**
 * Reserve's the class and equipment, if required.
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
 * Makes an authenticated Equinox API and returns the response
 * ---
 * Accepts API endpoint, method, and form data (optional). Requires a script 
 * property named 'cookie' with the value of the user's EqAuth.v1 equinox.com cookie.
 */

function apiFetch(api, method, form) {
  const COOKIE = PropertiesService.getScriptProperties().getProperty('cookie');
  const API_BASE_URL = 'https://api.equinox.com';
  
  // not all api calls have form data
  // if not passed in, set to empty
  var form = form || '';
  
  // assemble the header
  // spoof user-agent, origin, referer
  var headers = {                                                              
    'Cookie': COOKIE,
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