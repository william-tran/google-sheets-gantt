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
window.addEventListener("focus", getDataWithDelay);

// refresh data every minute for TV display use cases
setInterval(getData, 60*1000);

var dataJson = null;

function getDataWithDelay() {
  setTimeout(getData, 1000);
}

function getData() {
  var sheetUrl = new URL(src);
  sheetUrl.searchParams.append("sheet","Output");
  sheetUrl.searchParams.append("range","A1:H");

  var query = new google.visualization.Query(sheetUrl.href);
  query.send(getDataResponse);

}

function getDataResponse(response) {
  var data = response.getDataTable();
  var newDataJson = data.toJSON();
  if (newDataJson !== dataJson) {
    dataJson = newDataJson;
    render(data);
  }
}

function render(data) {
  document.title = data.getValue(0,0);
  var dataView = new google.visualization.DataView(data);
  dataView.setColumns([
    {
      type: "string",
      calc: function(dataTable, row) {
        return dataTable.getValue(row, 0);
      }
    },
    {
      type: "string",
      calc: function(dataTable, row) {
        return dataTable.getValue(row, 1);
      }
    },
    {
      type: "string",
      calc: function(dataTable, row) {
        return dataTable.getValue(row, 2);
      }
    },
    {
      type: "date",
      calc: function(dataTable, row) {
        return dataTable.getValue(row, 3);
      }
    },
    {
      type: "date",
      calc: function(dataTable, row) {
        return dataTable.getValue(row, 4);
      }
    },
    {
      type: "number",
      calc: function(dataTable, row) {
        return dataTable.getValue(row, 5);
      }
    },
    {
      type: "number",
      calc: function(dataTable, row) {
        return dataTable.getValue(row, 6);
      }
    },
    {
      type: "string",
      calc: function(dataTable, row) {
        return dataTable.getValue(row, 7);
      }
    }
  ]);
  console.log(dataView.toJSON());
  var chart = new google.visualization.Gantt(document.getElementById('chart_div'));
  var options = {
      height: 1000,
      width: 1000,
      gantt: {
        defaultStartDateMillis: new Date()
      }
    }
  chart.draw(dataView, options);
}

var sheetTab = null;
function openSpreadSheet() {
  if (!sheetTab || sheetTab.closed) {
    sheetTab = window.open(src);
  } else {
    sheetTab.focus();
  }
}