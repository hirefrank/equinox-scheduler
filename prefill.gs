/**
 * Regular classes (OPTIONAL)
 * ---
 * Define classes you regularly attend to automatically add them
 * to your Equinox scheduler.
 */

var REGULAR_CLASSES = {
  '130':  // club id
    {'Precision Run': [ // class name
      {'day': "Tuesday",'start_time': "07:15 AM"},
      {'day': "Thursday",'start_time': "07:15 AM"},
      {'day': "Sunday",'start_time': "09:30 AM"}
    ]},
};
  
/**
 * Main function that adds regular classes to the Equinox calendar.
 */

function prefill() {
  // if no property override, use the default: 45 days
  const DAYS_IN_ADVANCE = PropertiesService.getScriptProperties().getProperty('days_in_advance') || 45;
  const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  // create date ranges
  var from_date = new Date();
  var to_date = new Date();
  to_date.setDate(to_date.getDate() + DAYS_IN_ADVANCE);

  var user_calendar = JSON.parse(calendar(from_date, to_date)).events;

  for (var club in REGULAR_CLASSES){
    // return the equinox classes at the given club
    var equinox_classes = JSON.parse(getClasses(from_date, to_date, club)).classes;
    
    if (equinox_classes.length > 0) {
      for (e in equinox_classes) {
        var ec = equinox_classes[e];
        var class_name = ec.name;
        var class_id = ec.classInstanceId.toFixed(0);
        var start_date = new Date(ec.startDate);
        var dow = DAYS[new Date(ec.startDate).getDay().toFixed(0)];
        var start_time = formatAMPM(new Date(ec.startDate));
       
        if (isPrefillClass(club, class_name, dow, start_time) == true) {
          
          // check to see if already on calendar
          // if not, add
          if (!isOnCalendar(class_id, user_calendar)) {
            add_request = addToCalendar(class_id);
            logIt('add to calendar ' + class_id + ': ' + class_name);
            logIt(add_request);
          }
        }
      }
    }
  }
}

/**
 * Checks to see if the class name is a regular class.
 */

function isPrefillClass(club, class_name, dow, start_time) {
  if (REGULAR_CLASSES.hasOwnProperty(club)) {
    // returns class for the club
    var class = REGULAR_CLASSES[club];    
    for (var name in class) {
      
      // if names match, continue
      if (class_name.toLowerCase().match(name.toLowerCase())) {

        // returns instances of the class
        if (class.hasOwnProperty(name)) {
          var instances = class[name];
          for (var i in instances) { 
            var st = instances[i].start_time;
            var day = instances[i].day; 
            
            // day, time match continue
            if (day.toLowerCase() == dow.toLowerCase() && st.toLowerCase() == start_time.toLowerCase()) {
                return true;  
            }
          }
        }
      }
    }
  }
  return false;
}

/**
 * Returns the time in 12 hr clock format.
 */

function formatAMPM(date) {
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? 'pm' : 'am';
  
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  hours = ('0'+hours).slice(-2); // padding HH
  minutes = ('0'+minutes).slice(-2); // padding MM
  
  var strTime = hours + ':' + minutes + ' ' + ampm;
  return strTime;
}
