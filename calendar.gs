/**
 * Main function syncs Equinox and Google Calendars.
 * ---
 * By default it syncs the calendars 45 days in advance. If you want to override 
 * that setting create a script property named 'days_in_advance' and set the value 
 * to be the number of days.
 */

function calendarSync() {
  // if no property override, use the default: 45 days
  const DAYS_IN_ADVANCE = PropertiesService.getScriptProperties().getProperty('days_in_advance') || 45;
  
  // create a footer to append to all events
  // this makes it easier to search and find all the events created
  var script_url = 'https://script.google.com/macros/d/' + ScriptApp.getScriptId() + '/edit';
  var footer = '\n\n---\n<a href="' + script_url + '">Equinox Scheduler</a>';
  
  // create date ranges
  var from_date = new Date();
  var to_date = new Date();
  to_date.setDate(to_date.getDate() + DAYS_IN_ADVANCE);
  
  // pass the parameters and run the delete events function
  deleteEvents(from_date, to_date, footer);
  
  // 5s pause to prevent the functions running synchronously 
  Utilities.sleep(5000);
  
  // pass the parameters and run the add events function
  addEvents(from_date, to_date, footer);
}