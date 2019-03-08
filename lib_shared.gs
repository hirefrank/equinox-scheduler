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
  // if no property override, use the defaults
  const CALENDAR_HOURS_FREQUENCY = PropertiesService.getScriptProperties().getProperty('calendar_hours_frequency') || 4;
  const RESERVE_MINUTES_FREQUENCY = PropertiesService.getScriptProperties().getProperty('reserve_minutes_frequency') || 5;
  const PREFILL_DAYS_FREQUENCY = PropertiesService.getScriptProperties().getProperty('prefill_days_frequency') || 14;
  
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
    .everyDays(PREFILL_DAYS_FREQUENCY)
    .create();
  
  // run the initial prefill
  prefill();
  
  // run the initial calendar sync
  calendarSync();
}

/**
 * Logs locally and in Stackdriver for debugging
 */

function logIt(msg) {
  Logger.log(msg);
  console.log(msg); // Stackdriver
}