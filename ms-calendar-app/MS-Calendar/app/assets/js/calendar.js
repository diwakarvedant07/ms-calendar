function generateToken() {
    return fetch("http://localhost:3000/generate-token", {
      method: "GET",
      headers: {
        "content-type": "application/json",
        "x-auth-token": "8779bad8-4022-11ee-be56-0242ac120002",
        orgid: "456",
        collegeId: "123",
        userid: "12345",
      },
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        //console.log("this is data : " , data.token);
        sessionToken = data.token;
        return data.token;
      });
  }
  
  const allEvents = [];
  const loadedEvents = [];
  const loadedEventsFromGC = [];
  const fetchedForMonth = [];
  const gCfetchedForMonth = [];
  var calendar;
  var isLoggedIn = false;
  
  


  document.addEventListener("DOMContentLoaded", async function () {

    let sessionToken = await generateToken();
    let selectedValues = []; //selected tags at any time.
    let totalTags = []; // total tags

    //Google Calendar Integration

    // Create a script element for the Google API
    var googleApiScript = document.createElement("script");
    googleApiScript.src = "https://apis.google.com/js/api.js";
    googleApiScript.onload = gapiLoaded; // Call the function when the script is loaded

    // Create a script element for the Google Identity Services
    var gisScript = document.createElement("script");
    gisScript.src = "https://accounts.google.com/gsi/client";
    gisScript.onload = gisLoaded; // Call the function when the script is loaded

    // Append the script elements to the document
    document.head.appendChild(googleApiScript);
    document.head.appendChild(gisScript);

    
     
  const CLIENT_ID = "382924865494-q2841p5ori3g3222hu80ikl1292n5e5r.apps.googleusercontent.com" ;
  const API_KEY = "AIzaSyA5o55AjVrXferONyKyELn1AdNM4jU9QIU" ;
  // Discovery doc URL for APIs used by the quickstart
  const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';

  // Authorization scopes required by the API; multiple scopes can be
  // included, separated by spaces.
  const SCOPES = 'https://www.googleapis.com/auth/calendar.events';

  let tokenClient;
  var gapiInited = false;
  var gisInited = false;

  document.getElementById('authorize_button').style.visibility = 'hidden';
  document.getElementById('signout_button').style.visibility = 'hidden';

  /**
   * Callback after api.js is loaded.
   */
  function gapiLoaded() {
    //console.log("gapi")
    gapi.load('client', initializeGapiClient);
  }

  /**
   * Callback after the API client is loaded. Loads the
   * discovery doc to initialize the API.
   */
  async function initializeGapiClient() {
    //console.log('InitializinGapiCLient');
    await gapi.client.init({
      apiKey: API_KEY,
      discoveryDocs: [DISCOVERY_DOC],
    });
    gapiInited = true;
    maybeEnableButtons();
  }

  /**
   * Callback after Google Identity Services are loaded.
   */
  function gisLoaded() {
    //console.log('gis loaded');
    tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: '', // defined later
    });
    gisInited = true;
    maybeEnableButtons();
  }

  /**
   * Enables user interaction after all libraries are loaded.
   */
  function maybeEnableButtons() {
    //console.log('maybeEnableButtons');
    if (gapiInited && gisInited) {
      document.getElementById('authorize_button').style.visibility = 'visible';
    }
  }

  /**
   *  Sign in the user upon button click.
   */
  function handleAuthClick() {
    //console.log('handleAuthClick');
    tokenClient.callback = async (resp) => {
      if (resp.error !== undefined) {
        //console.log("reached resp thowing error");
        throw (resp);
      }
      document.getElementById('signout_button').style.visibility = 'visible';
      document.getElementById('authorize_button').innerText = 'Refresh';
      isLoggedIn = true;
      // var nextMonthDate = (new Date).setMonth((new Date()).getMonth() + 1)
      // await fetchEventsFromGC(new Date(),nextMonthDate); ///// remove comment
      initCalendar(new Date(),allEvents);
    };

    if (gapi.client.getToken() === null) {
      // Prompt the user to select a Google Account and ask for consent to share their data
      // when establishing a new session.
      //console.log("get token is null")
      tokenClient.requestAccessToken({prompt: 'consent'}); //// remove comment
      //console.log("post request access token")
    } else {
      // Skip display of account chooser and consent dialog for an existing session.
      //console.log("get token not null")
      tokenClient.requestAccessToken({prompt: ''});
    }
  }
  $('#authorize_button').on("click", function() {
    handleAuthClick();
  });

  /**
   *  Sign out the user upon button click.
   */
  function handleSignoutClick() {
    const token = gapi.client.getToken();
    //console.log(token);
    if (token !== null) {
      google.accounts.oauth2.revoke(token.access_token);
      gapi.client.setToken('');
      document.getElementById('content').innerText = '';
      document.getElementById('authorize_button').innerText = 'Authorize';
      document.getElementById('signout_button').style.visibility = 'hidden';
      isLoggedIn = false; 
    }
  }
  $('#signout_button').on("click", function(){
    handleSignoutClick();
  });

  /**
   * Print the summary and start datetime/date of the next ten events in
   * the authorized user's calendar. If no events are found an
   * appropriate message is printed.
   */
  // GC == Google Calendar
  async function fetchEventsFromGC(iDate, fDate){
    //console.log('fetchEventsFromGC');
    // iMonth = (new Date(iDate)).getMonth();
    // fMonth = (new Date(fDate)).getMonth();
    // var start = (new Date((new Date(iDate)).setMonth(iMonth))).setDate(1);
    // var end = (new Date((new Date(fDate)).setMonth(fMonth))).setDate(1);
    // console.log((new Date(start)).toISOString());
    // console.log((new Date(end)).toISOString());
    var response;
    try {
      const request = {
        'calendarId': 'primary',
        'timeMin': (new Date(iDate)).toISOString(),
        'timeMax': (new Date(fDate)).toISOString(),
        'showDeleted': false,
        'singleEvents': true,
        'orderBy': 'startTime',
      };
      response = await gapi.client.calendar.events.list(request);
      //console.log("here 1" , response.result);
    } catch (err) {
      console.log("ERROR : ",err);
      return;
    }

    

    const myEvents = response.result.items;
    //console.log("here 2 : ",myEvents);

    async function processingEvents() {
      await myEvents.forEach(item => {
        var sdate = item.start.dateTime
        var edate = item.end.dateTime
        if (!sdate || !edate) {
          sdate = item.start.date
          edate = item.end.date
        }
        
        
        obj = {
          id: item.id,
          title: item.summary,
          description: item.description,
          start: sdate,
          end: edate,
          tags: ["64f6dbcd20b422782b5860bb"],
          borderColor: item.colorId,
          backgroundColor: item.colorId,
        }
        //console.log(obj);
        allEvents.push(obj);
      })


      function filterUniqueEvents(events) {
        const uniqueEvents = {};
        const result = [];
      
        for (const event of events) {
          if (!uniqueEvents[event.id]) {
            uniqueEvents[event.id] = true;
            result.push(event);
          }
        }
      
        return result;
      }
      const uniqueEvents = filterUniqueEvents(allEvents);
      allEvents.length = 0
      allEvents.push(...uniqueEvents);
    }
    processingEvents();
    
    


    
    //console.log(allEvents);
    if (!myEvents || myEvents.length == 0) {
      //document.getElementById('content').innerText = 'No events found.';
      console.log('No events found');
      return;
    }
    //document.getElementById('content').innerText = output;
    //console.log(output);

    //////////////////////////////////////////// WORK ON RECURRING EVENTS /////////////////////////////////////
    // var requestRecurringEvent = window.gapi.client.calendar.events.get({
    //   'calendarId': 'primary',
    //   'eventId': '2h0j4gp3cqqui2dqa4sj4ualdc_R20230831T130000'
    // });

    // requestRecurringEvent.execute(function(resp) {
    //   console.log('requestRecurringEvent = ' + JSON.stringify(resp));
    //   console.log('requestRecurringEvent.recurrence = ' + resp.recurrence);
    //   recurrence = resp.recurrence;
  
    //   console.log('recurrence (inside execute)= ' + recurrence); //NO ISSUE (YET): recurrence (inside execute) = RRULE:FREQ=WEEKLY;COUNT=10
  
    //   return recurrence;
    // });

  }


    

    const formData = {
      eveName: "",
      eveDes: "",
      sdate: "",
      edate: "",
      eventColor: "",
      tags: [],
    };

    function EventForm(eveName, eveDes, sdate, edate, eventColor) {
      this.eveName = eveName;
      this.eveDes = eveDes;
      this.sdate = sdate;
      this.edate = edate;
      this.eventColor = eventColor;
    }

    function TagForm(tagName, tagColor){
      this.tagName = tagName;
      this.tagColor = tagColor;
    }

    // calendar variables
{
  var Calendar = FullCalendar.Calendar;
  var Draggable = FullCalendar.Draggable;

  var containerEl = document.getElementById("external-events");
  var calendarEl = document.getElementById("calendar");

  // initialize the external events
  // -----------------------------------------------------------------
  // select tehe container'
  // qyeryselectorall .fc-event
  // fioreach
  new Draggable(containerEl, {
    itemSelector: ".custom-drag",
    eventData: function (eventEl) {
      return {
        title: eventEl.innerText,
      };
    },
  });

  // initialize the calendar
  // -----------------------------------------------------------------
  //initCalendar(new Date(),allEvents);
}
  
function initCalendar(initialDate ,allEvents) {
    calendar = new Calendar(calendarEl, {
      initialDate: initialDate,
      dateClick: handleDateClick,
      eventClick: handleEventClick,
      headerToolbar: {
        left: "prev,next today",
        center: "title",
        right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek,multiMonthYear",
      },
      editable: true,
      droppable: true, // this allows things to be dropped onto the calendar
      eventDrop: function (info) {
        //console.log(info.delta.days);
        //console.log(info);
        const index = allEvents.findIndex(
          (item) => item.id === info.event._def.publicId
        );
        var targetObject = allEvents[index];
        //console.log(targetObject);
        const dropForm = new EventForm();
        dropForm.eveName = targetObject.title;
        dropForm.eveDes = targetObject.description;
        //changing start date
        var newSDate = new Date(targetObject.start);
        newSDate.setDate(newSDate.getDate() + info.delta.days);
        //console.log(newSDate.toISOString().split('T')[0]);
        dropForm.sdate = convertDatetoUTC(newSDate);
        //changing end date
        var newEDate = new Date(targetObject.end);
        newEDate.setDate(newEDate.getDate() + info.delta.days);
        //console.log(newEDate.toISOString().split('T')[0]);
        dropForm.edate = convertDatetoUTC(newEDate);
        dropForm.eventColor = targetObject.backgroundColor;
        if(info.event._def.extendedProps.tags.includes("64f6dbcd20b422782b5860bb")) {
          //console.log("route 1")
          saveEditsToGC(info.event._def.publicId, dropForm);
          if(info.event._def.extendedProps.tags.length > 1) {
            saveEdits(info.event._def.publicId, dropForm);
          }
        }
        else {
          //console.log("route 2")
          saveEdits(info.event._def.publicId, dropForm);
        }
        
      },
      events: allEvents,
      datesSet: function(info) {
        //console.log(info);
        const initialDate = convertDatetoUTC(info.start);
        const finalDate = convertDatetoUTC(info.end);
        const targetDate = new Date(initialDate + 518400000);
        //console.log(targetDate);
        month = targetDate.getMonth() + 1;
        year = targetDate.getFullYear();
        //console.log(month ,year ); // jan = 1 ; feb = 2 ; .....
        targetObj = {
          month : month,
          year : year,
        }
        if(fetchedForMonth.some(item => item.month === targetObj.month && item.year === targetObj.year)){
          //console.log("already loaded")
        }
        else {
          //console.log("loading" , targetObj.month, targetObj.year)
          fetchedForMonth.push(targetObj);
          fetchEvents(targetDate);
        }
        if(gCfetchedForMonth.some(item => item.month === targetObj.month && item.year === targetObj.year)){
          //console.log("already loaded")
        }
        else {
          //console.log("loading" , targetObj.month, targetObj.year)
          if(isLoggedIn){
          gCfetchedForMonth.push(targetObj);
          fetchGCEvents(targetDate);
        }
        }


        
      },
    });
    calendar.destroy();
    calendar.render();
}

  initCalendar(new Date(), allEvents)



async function fetchEvents(fetchDate) {
      
      //console.log("Fetching events... has token : " , sessionToken);
      //document.cookie = `sessionToken=${encodeURIComponent(sessionToken)};`;
      //console.log(document.cookie);
      //console.log(new Date(initialDate), new Date(finalDate));
      //console.log("fetch got the intial date : " , new Date(initialDate));
      
    async function loadEvent(iDate, fDate){
      //console.log("Fetching events from " + new Date(iDate) + " to " + new Date(fDate));
      try {
        const mydata = await fetch("http://localhost:3000/ms-calendar", {
          method: "GET",
          headers: {
            "content-type": "application/json",
            "x-access-token": sessionToken,
            "initial-date" : iDate,
            "final-date" : fDate,
          },
        });
        moredata = mydata.json();
        //console.log(moredata);
        var promise = moredata.then(function (result) {
          //console.log(result);
          const newArray = result.map((item) => {
            return {
              id: item._id,
              title: item.eveName,
              description: item.eveDes,
              start: new Date(item.sdate),
              end: new Date(item.edate),
              backgroundColor: item.eventColor,
              borderColor: item.eventColor,
              tags: item.tags,
            };
          });
          //console.log("these are the new events in fetch",newArray);
          allEvents.push(...newArray);
          //return newArray;
          //console.log(allEvents);
        });
      } catch (e) {
        console.log(e);
      }
      try {
        const mydata = await fetch("http://localhost:3000/academic-events", {
          method: "GET",
          headers: {
            "content-type": "application/json",
            "x-access-token": sessionToken,
            "initial-date" : iDate,
            "final-date" : fDate,

          },
        });
        moredata = mydata.json();
        //console.log(moredata);
        var promise = moredata.then(function (result) {
          //console.log(result);
          const newArray = result.map((item) => {
            return {
              id: item._id,
              title: item.eveName,
              description: item.eveDes,
              start: new Date(item.sdate),
              end: new Date(item.edate),
              backgroundColor: item.eventColor,
              borderColor: item.eventColor,
              tags: item.tags,
            };
          });
          allEvents.push(...newArray);
          //return newArray;
          //console.log(allEvents);
          
        });
      } catch (e) {
        console.log(e);
      }
      
    }
    

    async function checkAndLoadEvents(targetDate){
      month = (new Date(targetDate)).getMonth() + 1;
      year = (new Date(targetDate)).getFullYear();
          //console.log(month ,year ); // jan = 1 ; feb = 2 ; .....
    targetObj = {
            month : month,
            year : year,
          }

    if(loadedEvents.some(item => item.month === targetObj.month && item.year === targetObj.year)){
      //console.log(targetObj.month, targetObj.year , "already loaded")
    }
    else {
      //console.log("loading" , targetObj.month, targetObj.year)
      loadedEvents.push(targetObj)
      iDate = (new Date(targetDate)).setDate(1);
      fDate = ((new Date(iDate)).setMonth(new Date(iDate).getMonth() + 1));
      await loadEvent(iDate,fDate);
    }

    }
    date = fetchDate;
    var currentMonth = date.getMonth();
    var prevMonthYear = date.getFullYear();
    var nextMonthYear = date.getFullYear();
    var prevMonth = currentMonth - 1;
    var nextMonth = currentMonth + 1;
    if (prevMonth == -1) {
      prevMonth = 11;
      prevMonthYear--;
    }
    if (nextMonth == 12) {
      nextMonth = 0;
      nextMonthYear++;
    }
    //console.log(date)
    const prevMonthDate = new Date((new Date(date.setMonth(prevMonth))).setFullYear(prevMonthYear));
    const nextMonthDate = new Date((new Date(date.setMonth(nextMonth))).setFullYear(nextMonthYear));
    //console.log(nextMonthDate , prevMonthDate);
    await checkAndLoadEvents(new Date(date.setMonth(currentMonth)))
    await checkAndLoadEvents(prevMonthDate)
    await checkAndLoadEvents(nextMonthDate)
      //console.log("from fetch events about to initcalendar on : ",new Date(initialDate))
      //console.log("this is allEvents at the end of this fetch : ", allEvents  );
      //console.log(calendar.view.type);
      var view = calendar.view.type;
      initCalendar(fetchDate, allEvents);
      calendar.changeView(view);
      

}

async function fetchGCEvents(fetchDate) {
      
  //console.log("Fetching events... has token : " , sessionToken);
  //document.cookie = `sessionToken=${encodeURIComponent(sessionToken)};`;
  //console.log(document.cookie);
  //console.log(new Date(initialDate), new Date(finalDate));
  //console.log("fetch got the intial date : " , new Date(initialDate));


async function loadGCEvent(iDate, fDate) {
  try {
    if (isLoggedIn) {
    //console.log("from loadGCEvent : ", new Date(iDate), new Date(fDate))
    await fetchEventsFromGC(iDate, fDate)
    }
  } catch (e) {
    console.log(e);
  }
}


async function checkAndLoadGCEvents(targetDate){
  month = (new Date(targetDate)).getMonth() + 1;
  year = (new Date(targetDate)).getFullYear();
      //console.log(month ,year ); // jan = 1 ; feb = 2 ; .....
targetObj = {
        month : month,
        year : year,
      }

if(loadedEventsFromGC.some(item => item.month === targetObj.month && item.year === targetObj.year)){
  //console.log(targetObj.month, targetObj.year , "already loaded")
}
else {
  //console.log("loading" , targetObj.month, targetObj.year)
  if(isLoggedIn) {
    loadedEventsFromGC.push(targetObj);
    iDate = (new Date(targetDate)).setDate(1);
    fDate = ((new Date(iDate)).setMonth(new Date(iDate).getMonth() + 1));
    await loadGCEvent(iDate,fDate);
  }
}


}
date = fetchDate;
var currentMonth = date.getMonth();
var prevMonthYear = date.getFullYear();
var nextMonthYear = date.getFullYear();
var prevMonth = currentMonth - 1;
var nextMonth = currentMonth + 1;
if (prevMonth == -1) {
  prevMonth = 11;
  prevMonthYear--;
}
if (nextMonth == 12) {
  nextMonth = 0;
  nextMonthYear++;
}
//console.log(date)
const prevMonthDate = new Date((new Date(date.setMonth(prevMonth))).setFullYear(prevMonthYear));
const nextMonthDate = new Date((new Date(date.setMonth(nextMonth))).setFullYear(nextMonthYear));
//console.log(nextMonthDate , prevMonthDate);
await checkAndLoadGCEvents(new Date(date.setMonth(currentMonth)))
await checkAndLoadGCEvents(prevMonthDate)
await checkAndLoadGCEvents(nextMonthDate)
  //console.log("from fetch events about to initcalendar on : ",new Date(initialDate))
  //console.log("this is allEvents at the end of this fetch : ", allEvents  );
  //console.log(calendar.view.type);
  var view = calendar.view.type;
  initCalendar(fetchDate, allEvents);
  calendar.changeView(view);

}

///////////////////////////////////////////////////STARTING THE APP HERE//////////////////////////////////
//fetchEvents(new Date());
//////////////////////////////////////////////////////////////////////////////////////////////////////////
    


//small calendar
{
      $('#calendar_dropdown').on('change-day',function (e, date, events) {
      //console.log(date);
      //console.log(calendar.view.type);
      //console.log(e)

      initCalendar(date,allEvents)
      calendar.changeView('timeGridWeek')
    })
}

function removeEventFromAllEvents(id) {
      const index = allEvents.findIndex((item) => item.id === id);
      allEvents.splice(index, 1);
}
  
function closeEditModal() {
      $("#deleteEvent").unbind();
      $("#saveEdits").unbind();
      $("#editingModal").modal("hide");
}

function closeEditTagModal() {
      //console.log("reached here")
      $("#tagEditingModal").modal("hide");
      //console.log("reached here 2")
      $("#deleteTag").unbind();
      $("#saveTagEdits").unbind();
      
}

function convertDatetoUTC(date) {
      utcDate = Date.UTC(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate(),
        date.getUTCHours(),
        date.getUTCMinutes(),
        date.getUTCSeconds()
      );
      //console.log(utcDate)
      return utcDate;
}

function filterByTag(filterTags) {
      //console.log(filterTags);
      const myTags = [];
      filterTags.forEach(item => {
        myTags.push(item._id);
      })

      function hasAnyMatchingTag(event, tagsToMatch) {
        //console.log(event);
        //console.log(tagsToMatch);
        //console.log(event.tags.some(tag => tag == "64ef2024e2edca0abd251ee3"));
        
        //console.log(event.tags.some(tag => tagsToMatch.includes(tag)));
        return event.tags.some(tag => tagsToMatch.includes(tag));
      }
      
      
      const filteredEvents = allEvents.filter(event => hasAnyMatchingTag(event, myTags));
      
      //console.log(filteredEvents);
      initCalendar(new Date(),filteredEvents);
}
  
function handleDateClick(info) {
      // clearing tags from the from
      selectedValues = [];
      $('#new-event-tags').val(null).trigger('change');
      $("#exampleModal").modal("show");
      $("#sdate").val(info.date);
      $("#edate").val(info.date);
}
    
function handleEventClick(info) {
      //console.log(allEvents);
      //console.log(totalTags);
      const eventId = info.event._def.publicId;
      const index = allEvents.findIndex((item) => item.id === eventId);
      var targetObject = allEvents[index];
      //console.log(targetObject);
      selectedValues = targetObject.tags;
      //console.log(selectedValues);
      $('#edit-event-tags').val(selectedValues).trigger('change');
      $("#editingModal").modal("show");
      //how to show current event data
      $("#editName").val(targetObject.title);
      $("#editDes").val(targetObject.description);
      formData.eventColor = targetObject.eventColor;
      $("#editsdate").val(targetObject.start);
      $("#editedate").val(targetObject.end);
  
      $("#deleteEvent").on("click", function () {
        const foundObject = allEvents.find(item => item.id === eventId);
        deleteEvent(eventId);

        //$("#editingModal").modal("hide");
        closeEditModal();
        initCalendar(new Date(foundObject.start),allEvents);
      });
      $("#saveEdits").on("click", function () {
        const saveData = newForm();
        
        if(info.event._def.extendedProps.tags.includes("64f6dbcd20b422782b5860bb")) {
          console.log("event from google calandar")
          saveEditsToGC(eventId, saveData);
        }
        else {
          //console.log("event from my calandar")
          saveEdits(eventId, saveData);
        }
        //removeEventFromAllEvents(eventId)
        //$("#editingModal").modal("hide");
        closeEditModal();
      });
}
document.querySelectorAll("#modalClose").forEach((el) =>
      el.addEventListener("click", function () {
        closeEditModal();
        //$("#editingModal").modal("hide");
        //$("#saveEdits").unbind();
        //$("#deleteEvent").unbind();
      })
);
$("#savechanges").on("click", function () {
      storeData(makeForm());
});

function handleTagClick(info) {
      //console.log(info.target.parentNode);
      const tagId = info.target.parentNode.childNodes[0].getAttribute("value");
      //console.log(allEvents);
      //console.log(totalTags);
      //console.log(totalTags)
      const index = totalTags.findIndex((item) => item._id === tagId);
      var targetObject = totalTags[index];
      
      tagName = targetObject.tagName;
      //console.log(selectedValues);
      $("#tagEditingModal").modal("show");
      //how to show current event data
      $("#editTagName").val(targetObject.tagName);
      formData.eventColor = targetObject.eventColor;
  
      $("#deleteTag").on("click", function () {
        deleteTag(tagId, info.target);
        totalTags.splice(index, 1);
        //$("#editingModal").modal("hide");
        closeEditTagModal();
      });
      $("#saveTagEdits").on("click", function () {
        const saveTagData = newTagForm();
        saveTagEdits(tagId, saveTagData);
        //removeEventFromAllEvents(eventId)
        //$("#editingModal").modal("hide");
        closeEditModal();
      });
}

document.querySelectorAll("#tagModalClose").forEach((el) =>
      el.addEventListener("click", function () {
        closeEditTagModal();
        //$("#editingModal").modal("hide");
        //$("#saveEdits").unbind();
        //$("#deleteEvent").unbind();
      })
);
$("#saveTag").on("click", function () {
      storeTagData();
});
  
$('input[name="datetime"]').daterangepicker({
      singleDatePicker: true,
      showDropdowns: true,
      timePicker: true,
      startDate: moment().startOf("hour"),
      endDate: moment().startOf("hour"),
      locale: {
        format: "YYYY-MM-DD",
      },
      orientation: "auto",
      //drops: "up",
});
  
//event listener for date submission
{
      $("#sdate").on("apply.daterangepicker", function (ev, picker) {
        const sdate = picker.startDate;
        date = new Date(sdate);
        formData.sdate = convertDatetoUTC(date);
      });
      $("#edate").on("apply.daterangepicker", function (ev, picker) {
        const edate = picker.startDate;
        date = new Date(edate);
        formData.edate = convertDatetoUTC(date);
      });
      $("#editsdate").on("apply.daterangepicker", function (ev, picker) {
        const sdate = picker.startDate;
        date = new Date(sdate);
        formData.sdate = convertDatetoUTC(date);
      });
      $("#editedate").on("apply.daterangepicker", function (ev, picker) {
        const edate = picker.startDate.add(1, "days");
        date = new Date(edate);
        formData.edate = convertDatetoUTC(date);
      });
}

//select2 for new-events
{
      $("#new-event-tags").select2({
        placeholder: "Select an option",
        allowClear: true,
        dropdownParent: $("#exampleModal"),
      });

      $('#new-event-tags').on('select2:select', function (e) {
      const selectedOption = e.params.data;
      const value = selectedOption.id;
      const text = selectedOption.text;
        
      selectedValues.push(`${value}`);
        
      //console.log('Selected values:', selectedValues);
    });

    $('#new-event-tags').on('select2:unselect', function (e) { 
     const deselectedOption = e.params.data;
     const value = deselectedOption.id;  
     //console.log(value)  ;
  
     const indexToRemove = selectedValues.findIndex(item => item === `${value}`);
     //console.log(indexToRemove);
    if (indexToRemove !== -1) {
      selectedValues.splice(indexToRemove, 1);
    }
  
    //console.log('Selected values:', selectedValues);
  });
}
//select2 for edit-events
{
      $("#edit-event-tags").select2({
        placeholder: "Select an option",
        allowClear: true,
        dropdownParent: $("#editingModal"),
      });

      $('#edit-event-tags').on('select2:select', function (e) {
      const selectedOption = e.params.data;
      const value = selectedOption.id;
      const text = selectedOption.text;
        
      selectedValues.push(`${value}`);
        
      //console.log('Selected values:', selectedValues);
    });

    $('#edit-event-tags').on('select2:unselect', function (e) { 
     const deselectedOption = e.params.data;
     const value = deselectedOption.id;  
     //console.log(value)  ;
  
     const indexToRemove = selectedValues.findIndex(item => item === `${value}`);
     //console.log(indexToRemove);
    if (indexToRemove !== -1) {
      selectedValues.splice(indexToRemove, 1);
    }
  
    //console.log('Selected values:', selectedValues);
  });
}
//make form from modal
function makeForm() {
      formData.eveName = document.getElementById("eveName").value;
      formData.eveDes = document.getElementById("eveDes").value;
      formData.tags = selectedValues;
      //console.log(formData);

      return formData;
}

// Event CRUD functions
async function storeData(myFormData) {
      
      $("#exampleModal").modal("hide");
      if(isLoggedIn){
        myFormData.tags.push("64f6dbcd20b422782b5860bb");
      }
      //console.log(JSON.stringify(formData));
      //sending to mongo db
      await fetch("http://localhost:3000/ms-calendar", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-access-token": sessionToken,
        },
        body: JSON.stringify(myFormData),
      })
        .then((response) => response.json())
        .then((data) => {
          //console.log("Todo added:", data);
          allEvents.push({
            id: data._id,
            title: data.eveName,
            description: data.eveDes,
            start: new Date(data.sdate),
            end: new Date(data.edate),
            backgroundColor: data.eventColor,
            borderColor: data.eventColor,
            tags: data.tags,
          });
          // You can update tformDatad
        })
        .catch((error) => {
          console.error("Error adding todo:", error);
        });
        var length = allEvents.length
        length--;

        if(isLoggedIn) {
          const thisEvent = {
            'summary': formData.eveName,
            'description': formData.eveDes,
            'id': allEvents[length].id,
            'start': {
              'dateTime': (new Date(formData.sdate)).toISOString(),
            },
            'end': {
              'dateTime': (new Date(formData.edate)).toISOString(),
            },
          };
          //console.log("sedning this event to GC",thisEvent)
          // Make the event creation request
          await gapi.client.calendar.events.insert({
            'calendarId': 'primary',
            'resource': thisEvent,
          }).then(function (response) {
            console.log('Event created successfully:');
            //var obj = {};
            // obj.id = response.result.id;
            // obj.title = response.result.summary;
            // obj.start = response.result.start.dateTime;
            // obj.end = response.result.end.dateTime;
            // obj.description = response.result.description;
            // obj.borderColor = response.result.colorId;
            // obj.backgroundColor = response.result.colorId;
            // allEvents.push(obj);
          }).catch(function (error) {
            console.error('Error creating event:', error);
          });
          // formData.tags.push("64f6dbcd20b422782b5860bb");
        }
      //done
      initCalendar(new Date(formData.sdate),allEvents);
      //pushing in allEvents
      //console.log(allEvents);
      //initCalendar(new Date(),allEvents);
}
async function deleteEvent(eventId) {
      //console.log("deleting event : " + eventId);
      $("#editingModal").modal("hide");
      index = allEvents.findIndex(item => item.id === eventId);
      var start = allEvents[index].start;
      if(allEvents[index].tags.includes("64f6dbcd20b422782b5860bb")){
        try {
          if(allEvents[index].tags.length > 1) {
          //console.log("length > 1",allEvents[index].tags.length)
          await fetch(
            "http://localhost:3000/ms-calendar/" + eventId,
            {
              method: "DELETE",
              headers: {
                "content-type": "application/json",
                "x-access-token": sessionToken,
              },
            }
          );
        }
      } catch (e) {
        console.log(e);
      }
        console.log("deleting a GC event");
        gapi.client.calendar.events.delete({
          'calendarId': 'primary',
          'eventId': eventId,
        }).then(function () {
          console.log('Event deleted successfully.');
        }).catch(function (error) {
          console.error('Error deleting event:', error);
        });
      }
      else {
        const response = await fetch(
          "http://localhost:3000/ms-calendar/" + eventId,
          {
            method: "DELETE",
            headers: {
              "content-type": "application/json",
              "x-access-token": sessionToken,
            },
          }
        );
      }
      //console.log("about to splice")
      allEvents.splice(index, 1);
      initCalendar(start, allEvents);
      
      
}
function newForm() {
      //console.log("Welcome to newForm . lets ge this done!");
      const newFormData = new EventForm();
      newFormData.eveName = document.getElementById("editName").value;
      newFormData.eveDes = document.getElementById("editDes").value;
      //console.log(document.getElementById("editsdate").value);
      //console.log(document.getElementById("editedate").value);
      newFormData.sdate = convertDatetoUTC(
        new Date(document.getElementById("editsdate").value)
      );
      newFormData.edate = convertDatetoUTC(
        new Date(document.getElementById("editedate").value)
      );
      newFormData.eventColor = formData.eventColor;
      newFormData.tags = selectedValues;

      //console.log("new form : ",newFormData);
      return newFormData;
}
function saveEdits(eventId, saveData) {
      //console.log("saving edited event : " + eventId);
      
      //console.log(JSON.stringify(saveData));
      $("#exampleModal").modal("hide");
      //sending to backend
      fetch("http://localhost:3000/ms-calendar/" + eventId, {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
          "x-access-token": sessionToken,
        },
        body: JSON.stringify(saveData),
      })
        .then((response) => response.json())
        .then((data) => {
          //console.log("Todo added:", data);
          // calling the just saved data
          removeEventFromAllEvents(data._id);
          allEvents.push({
            id: data._id,
            title: data.eveName,
            description: data.eveDes,
            start: new Date(data.sdate),
            end: new Date(data.edate),
            backgroundColor: data.eventColor,
            borderColor: data.eventColor,
            tags: data.tags
          });
          //console.log("allEvents after patching and after replacing in allevents : " , allEvents)
          initCalendar(new Date(data.sdate),allEvents);
  
          // You can update tformDatad
        })
        .catch((error) => {
          console.error("Error adding todo:", error);
        });
      //done
  
      //pushing in allEvents
      //console.log(allEvents);
      //initCalendar(new Date(),allEvents);
}
async function saveEditsToGC(eventId, saveData) {
  console.log("saving edited event : " + eventId);
  console.log("save data:, " + saveData);
  var eventToEdit;
  //console.log(JSON.stringify(saveData));
  $("#exampleModal").modal("hide");
  //getting the event from GC 
  await gapi.client.calendar.events.get({
    'calendarId': 'primary',
    'eventId': eventId,
  }).then(function (response) {
    //console.log('Event retrieved successfully:', response.result);
    eventToEdit = response.result
  }).catch(function (error) {
    console.error('Error retrieving event:', error);
  });
    //console.log(new Date(saveData.sdate).toISOString, new Date(saveData.edate).toISOString);
        var sdate = eventToEdit.start.dateTime
        var edate = eventToEdit.end.dateTime
        if (!sdate || !edate) {
          //console.log("undefined sdate or edate")
          //sdate = eventToEdit.start.date
          //edate = eventToEdit.end.date
          //console.log(sdate, edate)
          //console.log(new Date(saveData.sdate).toISOString(),new Date(saveData.sdate).toISOString())
          eventToEdit.summary = saveData.eveName;
          eventToEdit.description = saveData.eveDes;
          eventToEdit.start.dateTime = null;
          eventToEdit.end.dateTime = null;
          eventToEdit.start.date = (new Date(saveData.sdate).toISOString()).split('T')[0];
          eventToEdit.end.date = new Date(saveData.edate).toISOString().split('T')[0];
          //console.log('Event to edit', eventToEdit);

          await  gapi.client.calendar.events.update({
            'calendarId': 'primary',
            'eventId': eventId,
            'resource': eventToEdit,
          }).then(function (response) {
            console.log('Event updated successfully:');
            index = allEvents.findIndex(item => item.id === eventId);
          allEvents[index].title = response.result.summary;
          allEvents[index].start = response.result.start.date;
          allEvents[index].end = response.result.end.date;
          allEvents[index].description = response.result.description;
          allEvents[index].borderColor = response.result.colorId;
          allEvents[index].backgroundColor = response.result.colorId;
          }).catch(function (error) {
            console.error('Error updating event:', error);
          });

        }
        else {
          eventToEdit.summary = saveData.eveName;
          eventToEdit.description = saveData.eveDes;
          
          eventToEdit.start.date = null;
          eventToEdit.end.date = null;
          eventToEdit.start.dateTime = new Date(saveData.sdate).toISOString()
          eventToEdit.end.dateTime = new Date(saveData.edate).toISOString()
          console.log('Event to edit', eventToEdit);

        await  gapi.client.calendar.events.update({
            'calendarId': 'primary',
            'eventId': eventId,
            'resource': eventToEdit,
          }).then(function (response) {
            console.log('Event updated successfully:');
            index = allEvents.findIndex(item => item.id === eventId);
          allEvents[index].title = response.result.summary;
          allEvents[index].start = response.result.start.dateTime;
          allEvents[index].end = response.result.end.dateTime;
          allEvents[index].description = response.result.description;
          }).catch(function (error) {
            console.error('Error updating event:', error);
          });
        }
    

    

    initCalendar(new Date(allEvents[index].start), allEvents);

  

  //done

  //pushing in allEvents
  //console.log(allEvents);
  //initCalendar(new Date(),allEvents);
}


// Tag CRUD functions
function storeTagData() {
      //const tagName = prompt("Enter tag name : ");

      tagName = $("#tagName").val()
      $("#exampleTagModal").modal("hide")
      tagRoute = "http://localhost:3000/tags/"
  
      fetch(tagRoute, {
        method: "POST",
        headers: {
            "content-type": "application/json",
            "x-access-token": sessionToken,
        },
        body: JSON.stringify({
          tagName: tagName,
          tagColor: formData.eventColor
        }),
    })
    .then((response) => response.json())
    .then((data) => {          
        
        //console.log("Todo added:", data);
        //calling the just saved data
        createTagElement(data);
        totalTags.push({
          _id: data._id,
          tagName: data.tagName,
          tagColor: data.tagColor,
        });
    })
    .catch((error) => {
        console.error("Error adding event", error);
    });
}
async function deleteTag(tagId, el) {
      //console.log("deleting event : " + eventId);
      $("#tagEditingModal").modal("hide");
      el.parentNode.remove();
      const response = await fetch(
        "http://localhost:3000/tags/" + tagId,
        {
          method: "DELETE",
          headers: {
            "content-type": "application/json",
            "x-access-token": sessionToken,
          },
        }
      );
}
function newTagForm() {
      //console.log("Welcome to newForm . lets ge this done!");
      const newTagFormData = new TagForm();
      newTagFormData.tagName = document.getElementById("editTagName").value;
      
      newTagFormData.tagColor = formData.eventColor;
      

      //console.log("new form : ",newFormData);
      return newTagFormData;
}
function saveTagEdits(tagId, saveTagData) {
      //console.log("saving edited event : " + eventId);
      
      //console.log(JSON.stringify(saveData));
      $("#tagEditingModal").modal("hide");
      //sending to backend
      fetch("http://localhost:3000/tags/" + tagId, {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
          "x-access-token": sessionToken,
        },
        body: JSON.stringify(saveTagData),
      })
        .then((response) => response.json())
        .then((data) => {
          //console.log("Todo added:", data);
          // calling the just saved data
          index = totalTags.findIndex(item => item.id === data._id);
          totalTags.pop(index)
          totalTags.push({
            _id: data._id,
            tagName: data.tagName,
            tagColor: data.tagColor,
          });
          document.getElementById(`tagBox ${data._id}`).childNodes[1].innerHTML = data.tagName;
          //console.log("allEvents after patching and after replacing in allevents : " , allEvents)
  
          // You can update tformDatad
        })
        .catch((error) => {
          console.error("Error adding todo:", error);
        });
      //done
  
      //pushing in allEvents
      //console.log(allEvents);
      //initCalendar(new Date(),allEvents);
}

// color event listeners

{
    // for main modal form
    document.querySelectorAll("#eventColorButtonRed").forEach((el) => {
      el.addEventListener("click", function () {
        formData.eventColor = "#F3565D";
        console.log(formData.eventColor);
      });
    });

    document.querySelectorAll("#eventColorButtonGreen").forEach((el) => {
      el.addEventListener("click", function () {
        formData.eventColor = "#1bbc9b";
        console.log(formData.eventColor);
      });
    });

    document.querySelectorAll("#eventColorButtonBlue").forEach((el) => {
      el.addEventListener("click", function () {
        formData.eventColor = "#9b59b6";
        console.log(formData.eventColor);
      });
    });

    document.querySelectorAll("#eventColorButtonYellow").forEach((el) => {
      el.addEventListener("click", function () {
        formData.eventColor = "#fe9701";
        console.log(formData.eventColor);
      });
    });
}

//Notification Setup  
{   
     var notifyBox = new NotifyBox({
     socketServer : "http://localhost:4000",
     socketEventName : ['events'],
     JwtToken : {"token" : sessionToken}
   });
   notifyBox.render();
   //notifyBox.start();
}
//Ai things
{
  const generateButton = document.getElementById("generateButton");
  const inputText = document.getElementById("inputText");
  const outputResult = document.getElementById("outputResult");
  const processingIcon = document.getElementById("processingIcon");
  const packetDiv = document.getElementById("packet");
  const saveDataToServer = document.getElementById("sendFinalData");

  document.getElementById("sendFinalData").style.display = "none";

  let resultToSend = [];

  saveDataToServer.addEventListener('click', () => {

      const apiRoute = "http://localhost:3000/academic-events/"

      
      resultToSend.forEach(obj => {
        
          /*
           * TODO: //fetch statement here
          */
         
         obj.tags = ["64ef1f7ae2edca0abd251ed9"];      // setting tag as academic
         //console.log(JSON.stringify(obj));
          fetch(apiRoute, {
              method: "POST",
              headers: {
                  "content-type": "application/json",
                  "x-access-token": sessionToken,
              },
              body: JSON.stringify(obj),
          })
          .then((response) => response.json())
          .then((data) => {          
              
              //console.log("Todo added:", data);
              //calling the just saved data
              allEvents.push({
                          id: data._id,
                          title: data.eveName,
                          description: data.eveDes,
                          start: new Date(data.sdate),
                          end: new Date(data.edate),
                          backgroundColor: data.eventColor,
                          borderColor: data.eventColor,
                      });
                      initCalendar(new Date(),allEvents);
          })
          .catch((error) => {
              console.error("Error adding event", error);
          });
      })
      //console.log(allEvents);
      initCalendar(new Date(),allEvents);
  
      
      iziToast.success({
        title: 'Data Saved Successfully',
        position: 'bottomRight'
      });

    })

  generateButton.addEventListener("click", async () => {
      processingIcon.style.display = "inline-block"; // Show processing icon
      outputResult.innerHTML = ""; // Clear previous output

      const apiUrl = "https://api.mastersofterp.in/OBECALS/generate"; // Replace with your API URL
      const packet = JSON.stringify({ message: inputText.value });
      // packetDiv.innerText = packet;
      //console.log(packet);
      try {
          const response = await fetch(apiUrl, {
              method: "POST",
              headers: {
                  "Content-Type": "application/json",
              },
              body: packet,
          });
          if (response.ok) {
              const result = await response.json();

              const finalData = JSON.parse(result.reply);
              resultToSend = [];
              

              finalData.forEach((obj) => {
                  const li = document.createElement("li");
                  li.innerHTML = `
                      <h4 class="">${obj.date}</h4>
                      <div class="">${obj.desc}</div>
                      <div class="">${obj.role}</div>
                      <hr>
                  `;
                  outputResult.appendChild(li);
                  resultToSend.push(convertToObject(obj))
              });

              //console.log(resultToSend);                           


          } else {
              outputResult.textContent =
                  "Error generating response.";
          }
      } catch (error) {
          outputResult.textContent = "An error occurred.";
          console.error("Error:", error);
      } finally {
          processingIcon.style.display = "none"; // Hide processing icon
      }
      document.getElementById("sendFinalData").style.display = "initial";
  });

  function convertToObject(inputObj) {
      const { date, desc, role } = inputObj;

      // Convert date to UTC format
      const [year, month, day] = date.split("-");
      // Format date for start and end times
      const startDate = new Date(date + "T00:00:00.000Z");
      const endDate = new Date(date + "T00:00:00.000Z");

      const outputObj = {
          eveName: desc,
          eveDes: "",
          sdate: convertDatetoUTC(startDate), // Convert to UTC format
          edate: convertDatetoUTC(endDate),     // Convert to UTC format
          eventColor: "",  // Fill in the event color
          collegeId: 123,   // Fill in the college ID
          orgId: 456,       // Fill in the organization ID
          userId: 12345,      // Fill in the user ID
          hasSeen: false,
          tags: []         
      };

      return outputObj;
  }

  function convertDatetoUTC(date) {
      utcDate = Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      date.getUTCHours(),
      date.getUTCMinutes(),
      date.getUTCSeconds()
      );
      //console.log(utcDate)
      return utcDate;
  }
}

//add-tag and other tag operations // Initializing Tags
{
    //creates elements and adds event listeners
    function createTagElement(data) {
    const tagHolder = document.getElementById("tag-holder");
    let tag = document.createElement("li");
    tag.innerHTML = `<li id="tagBox ${data._id}"><input value="${data._id}" type="checkbox" id="checkbox ${data._id}" class="me-1" checked/><h7 id="h7 ${data._id}">${data.tagName}</h7></li>`;
    tagHolder.appendChild(tag);
    
    let checkbox = document.getElementById(`checkbox ${data._id}`);
      checkbox.addEventListener( "change", () => {
         if ( checkbox.checked ) {
            totalTags.push(data);
            filterByTag(totalTags);
            //console.log(allEvents);
         } 
         else {
            const index = totalTags.findIndex(item => item._id === data._id);
            //console.log(allEvents[dateForInit])
            //console.log(totalTags.length);
            //console.log(totalTags);
            totalTags.splice(index, 1);
            if(totalTags.length == 0) {
              console.log("empty")
              initCalendar(new Date(),allEvents);
              
            }
            else {
              filterByTag(totalTags);
            }
            
         }
      });
    
    if(data._id == "64ef1f6ce2edca0abd251ed7" || data._id == "64ef1f7ae2edca0abd251ed9" || data._id == "64f6dbcd20b422782b5860bb" ){
      //nothing
    }
    else {
      let tagBox = document.getElementById(`h7 ${data._id}`);
    //console.log(tagBox);
      tagBox.addEventListener("click", function(info) {
        handleTagClick(info);
      })
    }
    
  }
    //create element at the form modal
    // <option value = "1234"> name </option>
    function createTagSelection(data) {
      var optGroup = document.getElementById("new-tag-selector");
      var tag = document.createElement("option");
      tag.innerHTML = `${data.tagName}`
      tag.setAttribute("value", `${data._id}`)
      optGroup.appendChild(tag);
      
    }


    function createEditTagSelection(data) {
      var optGroup = document.getElementById("edit-tag-selector");
      var tag = document.createElement("option");
      tag.innerHTML = `${data.tagName}`
      tag.setAttribute("value", `${data._id}`)
      optGroup.appendChild(tag);
      
    }

  //fetch tag data and create elements
  {
    try {
        const mydata = await fetch("http://localhost:3000/tags", {
          method: "GET",
          headers: {
            "content-type": "application/json",
            "x-access-token": sessionToken,
          },
        });
        moredata = mydata.json();
        //console.log(moredata);
        var promise = moredata.then(function (result) {
          //console.log(result);
          const newArray = result.map((item) => {
            createTagElement(item)
            createTagSelection(item)
            createEditTagSelection(item)
            totalTags.push(item);
          });
          
        });
      } catch (e) {
        console.log(e);
      }
  }

  document.getElementById("add-tag").addEventListener("click", function(){
  $("#exampleTagModal").modal("show");
  //storeTagData();

  })
}

});