# Equinox Scheduler

[Equinox](https://equinox.com) offers a lot of great classes but many of them require you to reserve a slot in advance of attendance. Reservations open 26 hours before class time -- for early morning classes this means waking up far too early. This project:

- Reserves classes on your behalf as soon as they open
- Automatically syncs your Equinox Calendar with your Google Calendar
- Adds classes to your Equinox Calendar in advance (so you don't have to do it manually)

## Getting Started

1. Create a new [Google App Script](https://script.google.com/home/my) project with the contents of all the `.gs` files in this repo.
1. Create `cookie` property and any other desired properties, see below. (File > Project properties > Script properties)
1. Run the setup function to configure the script's time based triggers. (Run > Run function > setup)
1. (Optional) Enable Stackdriver Logging. (View > Stackdriver Logging)

## Script Properties

Property name | Value
------------ | -------------
cookie | **Required**. The user's EqAuth.v1= equinox.com cookie; used for authentication
days_in_advance | The number of days in advance to scan the Equinox Calendar (default: 45)
calendar | The Google Calendar Id used for adding events (default: User's default Google Calendar)
calendar_hours_frequency | Frequency in hours to sync the Equinox and Google Calendars (default: 4)
reserve_minutes_frequency | Frequency in minutes to scan the calendar for classes to reserve (default: 5)
prefill_days_frequency | Frequency in days to add regular classes to the Equinox Calendar (default: 14)

## How It Works

1. Save a class to your Equinox Calendar from the app or website.
1. All classes on your Equinox Calendar are synced to your Google Calendar.
1. If a class requires a reservation, the program will book it for you when the reservation window opens. (You'll receive an email from Equinox once your class is booked.)

## Regular Classes

If you attend the same classes weekly and don't want to manually add the classes each time, define your regular classes in `bin_prefill.gs`.

```
var REGULAR_CLASSES = {
  '130':  // club id
    {'Precision Run': [ // class name
      {'day': "Tuesday",'start_time': "07:15 AM"},
      {'day': "Thursday",'start_time': "07:15 AM"},
      {'day': "Sunday",'start_time': "09:30 AM"}
    ]},
};
```
## Authentication Cookie

For the progam to work on your behalf, you need to find your EqAuth.v1= equinox.com cookie.

1. In Chrome, go to https://www.equinox.com/account and sign-in.
1. Open View > Developer > Developer Tools and then select the "Application" tab.
1. Open the "Cookies" dropdown under Storage and find the http://www.equinox.com cookie.
1. Locate the EqAuth.v1 name and copy the value.
1. When adding the `cookie` Script property you must enter the value in this format `EqAuth.v1=XXXX;`

## Club Id

Each Equinox location has a club id. If you want to add regular classess in advance, you'll need to determine the club's id for each class.

1. Go to https://www.equinox.com/classschedule
1. If you are a member of only one club, you should see `?club=XXX` appear in the URL. `XXX` is the club id.
1. If you don't or if you have access to all locations, select only the location for the specific class you are interested in the Location dropdown to filter your classes.
1. You should now see `?club=XXX` appear in the URL. `XXX` is the club id.
