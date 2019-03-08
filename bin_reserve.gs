/**
 * Main function that reserves upcoming classes.
 * ---
 * It fetches upcoming classes within the next day from the user's 
 * Equinox calendar and attempts to reserve any eligible classes.
 */

function reserve() {  
  // days in advance the calendar scans
  // exclusive of the end date
  const DAYS_IN_ADVANCE = 2;
   
  // create date ranges
  var from_date = new Date();
  var to_date = new Date();
  to_date.setDate(to_date.getDate() + DAYS_IN_ADVANCE);
  
  // fetch upcoming user's classes
  var results = JSON.parse(calendar(from_date, to_date));
  var upcoming = results.events;
    
  // if there are results
  if (upcoming.length > 0) {
  	for (u in upcoming) {
      var uc = upcoming[u];
      logIt(uc);
      
      // skip results with an existing reservtion
      if (uc.status == undefined) {
        
        // retrieve class details
        var class_id = uc.classInstanceId.toFixed(0);
        var details = JSON.parse(openSlots(class_id));
        
        var isBookableOnline = details.classInstanceDetail.isBookableOnline;
        var isClassFull = details.layout.cycleClassStatus.isClassFull;
        var isClassWithinReservationPeriod = details.layout.cycleClassStatus.isClassWithinReservationPeriod;
        
        var equipment_type = details.layout.gridItemType;
        var club_id = details.layout.facilityId;
        var equipment_id;
        
        // if class is bookable
        if (isBookableOnline == true && isClassFull == false && isClassWithinReservationPeriod == true) {
          if (equipment_type != 0) {
          
            // fetch available bookable equipment for class
            var available_equipment = details.layout.equipments.filter(function (entry) {
              return entry.reserved == false;
            });
            
            // select a random equipment
            var i = Math.floor(Math.random()*available_equipment.length);
            equipment_id = available_equipment[i].reservableEquipmentId.toFixed(0);
          }
          
          // book a class
          book_request = bookClass(class_id, club_id, equipment_id);
          logIt('book request ' + class_id + ' ' + club_id + ' ' + equipment_id);
          logIt(book_request);
        }
      }
    }
  }
}
