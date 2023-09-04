function sortByDate(events) {
    var sortedEvents = [];
    var date = new Date();
    var dateFrame = 25;
    var now_utc = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(),
                date.getUTCDate()-25, date.getUTCHours(),
                date.getUTCMinutes(), date.getUTCSeconds());
    var tommorow_utc = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(),
    date.getUTCDate()+dateFrame, date.getUTCHours(),
    date.getUTCMinutes(), date.getUTCSeconds());
    events.sort(obj => obj.date);
    events.forEach(function(obj){
        if(obj.sdate >= now_utc && obj.sdate <= tommorow_utc){
            //console.log(obj);
            sortedEvents.push(obj);
        }
        
    })
    return sortedEvents;
}

module.exports = sortByDate;