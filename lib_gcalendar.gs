/*
 * Adds all events from the Equinox Calendar to Google Calendar
 */

function addEvents(from_date, to_date, footer) {
  // fetch upcoming user's classes
  var json_data = JSON.parse(calendar(from_date, to_date));

  // for each event
  for (e in json_data.events) {
    var e = json_data.events[e];
    
    // convert strings to date objects
    var start = new Date(e.startDate);
    var end = new Date(e.endDate);
    
    // event timestamp must be in the future
    // this avoids adding an event from earlier in the day
    if (start >= new Date()) {
      var instructor_first_name;
      var instructor_last_name;
      
      // construct the instructor name; there are a few variations
      // trainer: personal training
      // instructor: group fitness
      // substitute: substitute for instructor (group fitness)
      if (e.trainerFirstName === undefined) {
        if (e.instructors[0].substitute == null) {
          // only grabbing the first instructor if there are multiples
          instructor_first_name = e.instructors[0].instructor.firstName;
          instructor_last_name = e.instructors[0].instructor.lastName;
        } else {
          instructor_first_name = e.instructors[0].substitute.firstName;
          instructor_last_name = e.instructors[0].substitute.lastName;        
        }
      } else {
        instructor_first_name = e.trainerFirstName;
        instructor_last_name = e.trainerLastName; 
      }
      
      // construct the event name, location, description fields
      var name = e.name + ' with ' + instructor_first_name + ' ' + instructor_last_name;
      var location = 'Equinox ' + e.facilityName;
      var description = footer;
      
      // prepend name and description fields if applicable
      // if status exist, it's an event with a reservation
      if (e.status !== undefined) {
        
        // if localId exists, equipment (treadmill, bike, etc) has been reserved for the class
        // add it to the description
        if (e.status !== null && 'localId' in e.status) description = e.status['gridItemType'] + ' #' +  e.status['localId'] + description;
      
      // if classInstanceId exist, it's an event that requires a reservation
      } else if (e.classInstanceId !== undefined) {        
        
        // get class details to determine when resservations open
        var d = JSON.parse(classDetails(e.classInstanceId.toFixed(0)));
        
        // if class requires reservation
        if (d.status !== undefined) { 
          if (d.status['isWithinReservationPeriod'] == false) {
            var bt = new Date(d.status['reservationStartDate']).toLocaleString();
            
            // substring hack to remove incorrect timezone, it isn't stored property in equinox
            description = ' Reservations open on ' + bt.substring(0, bt.length - 4) + '.' + description;
          }
          
          // update the event name and description to reflect the class requires a resservation
          if (d.status['hasReservation'] == false) name = '[HOLD] ' + name;
          description = 'This class requires a reservation.' + description;
        }
      }
      
      // add the event to the calendar and log it
      var event = getCalendar().createEvent(name, start, end,{location: location, description: description});
      logIt('Added Event Id: ' + event.getId());
      
      // 1s pause to throttle api calls
      Utilities.sleep(1000);
    }
  }
}

/**
 * Deletes all future events on Google Calendar synced from the Equinox Calendar
 */

function deleteEvents(from_date, to_date, footer) {
  // retrieve all events that includes the footer message
  var events = getCalendar().getEvents(from_date, to_date, {search: footer.replace(/(<([^>]+)>)/ig,'')});
  for (e in events) {
    
    // delete each event and log it
    events[e].deleteEvent();
    logIt('Deleted Event Id: ' + events[e].getId());
    
    // 1s pause to throttle api calls
    Utilities.sleep(1000);
  }
}

/**
 * Returns the user's calendar object
 * ---
 * By default it uses the user's default calendar. If you want to override that 
 * setting create a script property named 'calendar' and set the value to be the 
 * calendar's name.
 */

function getCalendar() {
  const CALENDAR = PropertiesService.getScriptProperties().getProperty('calendar') || null;
  
  if (CALENDAR == null) {
    return CalendarApp.getDefaultCalendar();
  } else {
    return CalendarApp.getCalendarsByName(CALENDAR);
  }
}