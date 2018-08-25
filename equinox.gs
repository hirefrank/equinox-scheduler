/* Things to edit */

// use developer tools in chome to get the cookie
var COOKIE = 'EqAuth.v1=XXX';

// sign in and go here: https://www.equinox.com/classschedule -- get number from 'clubs' parameter in the url
var CLUB_ID = '130';

// add days and classes; only one class per day
// must be HH:MM AM or PM
var CLASSES = {
  'Tuesday': {
    'name': "Precision Running", 
    'book_time': "05:15 AM", 
    'start_time': "07:15 AM",
    'favorite_equipment': 1,
  },
};

/* Do not edit below */

var DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
var API_BASE_URL = 'https://api.equinox.com';
var TODAY = new Date();

function main() {
  var next_day = (TODAY.getDay() < 6) ? TODAY.getDay() + 1 : 0;
  var class = CLASSES[DAYS[next_day]];
  
  if (class != undefined) {
    var book_time = class.book_time.split(":");
    var bt_temp = book_time[1].split(" ");
    var hours = parseInt(book_time[0]);
    var minutes = parseInt(bt_temp[0]);
    var am_pm = bt_temp[1];
    
    if (am_pm.toUpperCase() == "PM") {
      hours = (hours == 12) ? 12 : 12 + hours;
    } else {
      hours = (hours == 12) ? 0 : hours;
    }
    
    var book_time = new Date(); 
    book_time.setHours(hours, minutes, TODAY.getSeconds(), TODAY.getMilliseconds()); 
    
    // Proceed if the current time is the same as the book time
    if (TODAY.getTime() === book_time.getTime()) {
      log('Current time is the book time. Attempting to reserve your class...', class);
     
      var json_data = JSON.parse(getClasses());
      var strikes = json_data['strikes'].count;
      var upcoming = json_data['classes']; 

      if (strikes < 3) {
        for (c in upcoming) {
          var uc = upcoming[c];
          var match = uc['name'].match(class.name) && uc['displayTime'].match(class.start_time + ' ') ? true : false;
          
          if (match == true && uc['status']['reservableItemsLeft'] > 0) {
            var equipment_id;
            var class_id = uc['classInstanceId'].toFixed(0);
            
            // is this a class where you have to reserve equipment?
            // if empty, class doesnt require you to book equipment (e.g bike, treadmill, etc)
            // if 'spots', you don't
            if (uc['gridItemTypePlural'] != 'spots') {
              // fetch available bookable equipment for class
              var equipment = JSON.parse(openSlots(class_id));       
              var available = equipment.layout.bikes.filter(function (entry) {
                return entry.reserved === false;
              });
              
              var favorite = available.filter(function (entry) {
                return entry.localId == class.favorite_equipment;
              });
        
              if (favorite.length === 1) {
                equipment_id = favorite[0].reservableEquipmentId.toFixed(0);
              } else {
                var i = Math.floor(Math.random()*available.length);
                equipment_id = available[i].localId.toFixed(0);
              }
            }
            book_request = bookClass(class_id, equipment_id);
            log('Attempted to reserve a class!', book_request);

            break;            
          };
        } 
      }
    } else {
      log('Current time is not the book time.', class);
    }
  }
}

function openSlots(class_id){ 
  var url = '/v2/classes/bikes/' + class_id;
  return apiFetch(url, 'get'); 
}

function bookClass(class_id, equipment_id){ 
  var equipment = (equipment_id == undefined) ? '' : '?bikeId=' + equipment_id;
  var url = '/v2/bookaclass/' + class_id + '/book/' + CLUB_ID + equipment;
  
  return apiFetch(url, 'put'); 
}

function getClasses () {
  var startDate = new Date();
  startDate.setDate(startDate.getDate() + 1);
  
  var endDate = new Date(); 
  endDate.setDate(endDate.getDate() + 2);
  
  var form = {                                                                 
    'facilityIds': CLUB_ID,
    'startDate': formatDate(startDate),
    'endDate': formatDate(endDate),
    'isBookingRequired': true,
  };
  
  return apiFetch('/v1/classes/allclasses', 'post', form); 
}

function apiFetch(api, method, form) {
  var form = form || '';
  var headers = {                                                              
    'Cookie': COOKIE,
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.106 Safari/537.36',
    'Origin': 'https://www.equinox.com',
    'Referer': 'https://www.equinox.com/activity'
  };
  
  var parameters = {                                                                                                                
    'headers': headers,                                                        
    'payload': form,                                           
    'method': method,                                                          
    'muteHttpExceptions': true,
  };
  
  var url = API_BASE_URL + api;
  var response = UrlFetchApp.fetch(url, parameters);   
  log('url', url);
  log('url parameters', parameters);
  
  return response;
}

function formatDate(date) {
  var d = new Date(date),
  month = '' + (d.getMonth() + 1),
  day = '' + d.getDate(),
  year = d.getFullYear();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [year, month, day].join('-');
}

function log(message, parameters) {
  Logger.log(message);
  Logger.log(parameters);
  console.log({message: message, initialData: parameters});
}
