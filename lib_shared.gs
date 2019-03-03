/**
 * Sets up the time-based trigger and runs the initial calendar sync.
 * ---
 * By default it runs every 4 hours. If you want to override that setting
 * create a script property named 'hours_frequency' and set the value to be n to 
 * trigger every n hours.
 *
 * This should only be run once. Running it more frequently will create multiple
 * triggers. To see the project's triggers: Edit > Current project's triggers
 */

function setup() {
  if (checkCookie() == true) {
    // if no property override, use the default: every 4 hours
    const CALENDAR_HOURS_FREQUENCY = PropertiesService.getScriptProperties().getProperty('calendar_hours_frequency') || 4;
    const RESERVE_MINUTES_FREQUENCY = PropertiesService.getScriptProperties().getProperty('reserve_minutes_frequency') || 5;
    const PREFILL_MINUTES_FREQUENCY = PropertiesService.getScriptProperties().getProperty('prefill_minutes_frequency') || 14;
    
    // create calendar sync trigger
    ScriptApp.newTrigger("calendarSync")
      .timeBased()
      .everyHours(CALENDAR_HOURS_FREQUENCY)
      .create();
    
    // create reserve trigger
    ScriptApp.newTrigger("reserve")
      .timeBased()
      .everyMinutes(RESERVE_MINUTES_FREQUENCY)
      .create();
    
    // create prefill trigger
    ScriptApp.newTrigger("prefill")
      .timeBased()
      .everyDays(PREFILL_MINUTES_FREQUENCY)
      .create();
    
    // run the initial prefill
    prefill();
    
    // run the initial calendar sync
    calendarSync();
  }
}

/**
 * Checks to make sure the cookie script property has been set properly
 */

function checkCookie() {
  var c = false;
  // verifies the property exist
  if (PropertiesService.getScriptProperties().getProperty('cookie') == null) {
    console.log('Cookie script property does not exist.');
  } else {
    var c = PropertiesService.getScriptProperties().getProperty('cookie'); 
    var s = 'EqAuth.v1=';
    // verifies the property contain 'EqAuth.v1='
    // todo: should check to make sure it begins with this string
    if (c.match(s)) {
      c = true;
    } else {
      // prepends the s string to the property
      PropertiesService.getScriptProperties().setProperty('cookie', s + c);
      c = true;
    }
  }
  return c;
}

/**
 * Logs locally and in Stackdriver for debugging
 */

function logIt(msg) {
  Logger.log(msg);
  console.log(msg); // Stackdriver
}