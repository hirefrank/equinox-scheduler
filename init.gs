/*

fix calendar sync bug
add trigger for scheduler
writuep readme, use below, grab cookie.
add cache, verify
prefill, seed calendar
?? favorite equipment
enable logging, stackdriver

(retire old scripts, triggers)

*/


/***********************************************************************************
 * EQUINOX GOOGLE CALENDAR SYNC
 * ---
 * Author: Frank Harris (frank@hirefrank.com)
 * Initial Date: Aug 26, 2018
 * MIT License
 *
 * This script syncs the user's Equinox Calendar with their Google Calendar on 
 * an ongoing basis. It supports (at least) personal training sessions and 
 * group fitness classes.
 *
 * property name                  value
 * -------------                  -----
 * cookie                         the user's EqAuth.v1 equinox.com cookie
 * hours_frequency (optional)     triggers the sync every n hours (4)
 * days_in_advance (optional)     the # of days in the future to sync (45)
 * calendar (optional)            the name of the calendar (user's default)
 *
 * Instructions:
 * 1. Create a new Google App Script (https://script.google.com/home/my) project 
 *    with the contents of this script.
 * 2. Create cookie property and any other desired properties from above. 
 *    (File > Project properties > Script properties)
 * 3. Run the setup function. (Run > Run function > setup)
 * 
 * More info:
 * https://github.com/hirefrank/equinox-google-calendar-sync/blob/master/README.md
 ***********************************************************************************/

/**
 * Sets up the time-based trigger and runs the initial sync.
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
    const HOURS_FREQUENCY = PropertiesService.getScriptProperties().getProperty('hours_frequency') || 4;
    
    // create calendar sync trigger
    ScriptApp.newTrigger("calendarSync").timeBased().everyHours(HOURS_FREQUENCY).create();
    
    // run the initial sync
    calendarSync();
    
    // create scheduler trigger
    
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