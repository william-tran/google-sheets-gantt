var src = new URLSearchParams(window.location.search).get('src');
while (!src) {
  src = prompt("Enter the url of the Google Spreadheet containing the Gantt input","");
  if (src) {
    window.location.search="?src=" + src;
  }
}
google.charts.load('current', {'packages':['gantt']});
google.charts.setOnLoadCallback(getData);

// delay by 1 second when switching back to give the sheet a chance to
// finish transforming the input
window.addEventListener("focus", getData);

// refresh data every minute for TV display use cases
setInterval(getData, 60*1000);

var dataJson = null;
var lastRender = null;

// true if more than an hour has passed sice last render
function forceReRender() {
  return !lastRender || new Date().getTime() - lastRender.getTime() > 60*60*1000;
}

function getData() {
  var sheetUrl = new URL(src);
  var query = new google.visualization.Query(sheetUrl.href);
  query.send(getDataResponse);
}


function getDataResponse(response) {
  var data = response.getDataTable();
  var newDataJson = data.toJSON();
  if (newDataJson !== dataJson || forceReRender()) {
    dataJson = newDataJson;
    render(data);
  }
}

function render(data) {
  var title = data.getColumnLabel(0);
  document.title = title;
  lastRender = new Date();
  var minTimestamp = lastRender.getTime();
  for (var row = 0; row < data.getNumberOfRows(); row++) {
    var startDate = data.getValue(row, 2);
    if (startDate) {
        minTimestamp = Math.min(minTimestamp, startDate.getTime());
    }
  }

  var dataView = new google.visualization.DataView(data);

  dataView.setColumns([
    {
      label: "Task ID",
      type: "string",
      calc: function(dataTable, row) {
        return dataTable.getValue(row, 0);
      }
    },
    {
      label: "Task Name",
      type: "string",
      calc: function(dataTable, row) {
        return dataTable.getValue(row, 0);
      }
    },
    {
      label: "Resource",
      type: "string",
      calc: function(dataTable, row) {
        return dataTable.getValue(row, 1);
      }
    },
    {
      label: "Start Date",
      type: "date",
      calc: function(dataTable, row) {
        return dataTable.getValue(row, 2);
      }
    },
    {
      label: "End Date",
      type: "date",
      calc: function(dataTable, row) {
        return dataTable.getValue(row, 3);
      }
    },
    {
      label: "Duration",
      type: "number",
      calc: function(dataTable, row) {
        var days = dataTable.getValue(row, 4);
        var hours = dataTable.getValue(row, 5);
        var duration = 0;
        if (days) {
          duration += days * 24 * 60 * 60 * 1000;
        }
        if (hours) {
          duration += hours * 60 * 60 * 1000;
        }
        if (duration) {
          return duration;
        }
      }
    },
    {
      label: "Percent Complete",
      type: "number",
      calc: function(dataTable, row) {
        return dataTable.getValue(row, 6);
      }
    },
    {
      label: "Dependencies",
      type: "string",
      calc: function(dataTable, row) {
        var deps = "";
        for (var col = 7; col < dataTable.getNumberOfColumns(); col++) {
          var dep = dataTable.getValue(row, col)
          if (dep) {
            deps += dep + ",";
          }
        }
        return deps;
      }
    }
  ]);

  var dataWithTitle = dataView.toDataTable();
  dataWithTitle.addRow(["title",title,null,new Date(minTimestamp),new Date(minTimestamp),0,100,null]);

  var chart = new google.visualization.Gantt(document.getElementById('chart_div'));
  var options = {
      height: 1000,
      width: 1000,
      gantt: {
        defaultStartDateMillis: new Date()
      }
    }
  chart.draw(dataWithTitle, options);
}

var sheetTab = null;
function openSpreadSheet() {
  if (!sheetTab || sheetTab.closed) {
    sheetTab = window.open(src);
  } else {
    sheetTab.focus();
  }
}