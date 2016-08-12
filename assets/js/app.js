window.appVersion = '0.0.1';
window.appCommit = '3ff3ac5';

(function(context, $){
  'use strict';
  var defaultConfig = {
    startTime: "20:00:00",
    endTime: "12:00:00",
    notificationsEnabled: false
  }

  var config;
  var $currentTimeExact;
  var $startTime;
  var $startTimeExact;
  var $endTime;
  var $endTimeExact;
  var $meals;

  function getNext(now, time) {
    var timeArr = time.split(":");
    var goalHours = parseInt(timeArr[0], 10);
    var goalMinutes = parseInt(timeArr[1], 10);
    var nowHour = now.hours();
    var nowMinues = now.minutes();

    if (nowHour > goalHours || (nowHour === goalHours && nowMinues >= goalMinutes)) {
      return now.add(1, 'days').hours(goalHours).minutes(goalMinutes);
    }
    return now.hours(goalHours).minutes(goalMinutes);
  }

  function initTimers(now) {
    var endTime = getNext(now.clone(), config.endTime);
    var startTime = getNext(now.clone(), config.startTime);

    $currentTimeExact.html(now.format('LLL'));
    $startTime.html(now.to(startTime));
    $startTimeExact.html(startTime.calendar());
    $endTime.html(now.to(endTime));
    $endTimeExact.html(endTime.calendar());
  }

  function setupMoment() {
    moment.updateLocale('en', {
        longDateFormat : {
            LT: "HH:mm",
            LTS: "HH:mm:ss",
            L: "MM/DD/YYYY",
            l: "M/D/YYYY",
            LL: "MMMM Do YYYY",
            ll: "MMM D YYYY",
            LLL: "MMMM Do YYYY LT",
            lll: "MMM D YYYY LT",
            LLLL: "dddd, MMMM Do YYYY LT",
            llll: "ddd, MMM D YYYY LT"
        }
    });
  }

  function enableNotifications() {
    if (context.Notification.permission !== 'granted') {
      context.Notification.requestPermission().then(function(result) {
        if (result === 'denied') {
          return;
        }
        if (result === 'default') {
          return;
        }
      });
    }
    config.notificationsEnabled = true;
  }

  function disableNotifications() {
    config.notificationsEnabled = false;
  }

  function cacheElements() {
    $currentTimeExact = $('#currentTimeExact');
    $startTime = $('#startTime');
    $startTimeExact = $('#startTimeExact');
    $endTime = $('#endTime');
    $endTimeExact = $('#endTimeExact');
    $meals = $('#meals');
  }

  function loadConfig() {
    config = JSON.parse(context.localStorage.getItem('config')) || defaultConfig;
  }

  function setupSettings() {
    $('#version').text(context.appVersion + '(' + window.appCommit +')');
    $('#notifications').prop('checked', config.notificationsEnabled);
    $('#startTimeSetting').val(config.startTime)
    $('#endTimeSetting').val(config.endTime)
    $('#notifications').change(function(){
      if (this.checked) {
        enableNotifications();
      }
      disableNotifications();
    });
    $('#save').click(function() {
      config.notificationsEnabled = $('#notifications').prop('checked');
      config.startTime = $('#startTimeSetting').val();
      config.endTime = $('#endTimeSetting').val();
      context.localStorage.setItem('config', JSON.stringify(config));
      initTimers(moment());
    })
  }

  function setupFoodLog() {
    var db = new Dexie("ifast");
    db.version(1).stores({ meal: '_id' })
    db.open().then(function() {
      refreshMeals(db);
    });
    $('#meal').click(function(event) {
      event.preventDefault();
      var date = new Date();
      db.meal.put({ date: date, _id: date.getTime() })
      .then(function() {
        refreshMeals(db)
      });
    });
  }

  function refreshMeals(db) {
    return db.meal.reverse().limit(30).toArray()
      .then(renderAllMeals);
  }

  function renderAllMeals(meals) {
    $meals.empty();
    meals.forEach(function(meal) {
      var mom = moment(meal.date)
      $meals.append($('<tr><td>' + mom.format() + '</td><td>' + mom.fromNow() + '</td></tr>'))
    });
  }

  function init(context) {
    loadConfig();
    cacheElements();
    setupMoment();
    setupSettings();
    initTimers(moment());
    setInterval(function(){
      initTimers(moment());
    }, 10000);
    setupFoodLog();
  }

  $(context.document).ready(function() {
    init(context);
  })

})(window, jQuery);
