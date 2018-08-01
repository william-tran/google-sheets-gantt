function onEdit(e) {
  var inTask = 0;
  var inStart = 1;
  var inEnd = 2;
  var inDays = 3;
  var inHours = 4;
  var inPercent = 5;
  var inDeps = 6;

  var outTaskID = 0;
  var outTaskName = 1;
  var outStartDate = 2;
  var outEndDate = 3;
  var outDuration = 4;
  var outPercent = 5;
  var outDeps = 6;

  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var inputSheet = spreadsheet.getSheetByName("Input");
  var outputSheet = spreadsheet.getSheetByName("Output");

  var input = inputSheet.getSheetValues(1, 1, inputSheet.getLastRow(), inputSheet.getLastColumn());

  var transformRow = function(row) {
    var out = [null,null,null,null,null,null,null];

    if (row[inTask]) {
      out[outTaskID] = row[inTask];
      out[outTaskName] = row[inTask];
      out[outStartDate] = row[inStart];
      out[outEndDate] = row[inEnd];
      var days = row[inDays];
      var hours = row[inHours];

      var duration = 0;
      if (days) {
        duration += days * 24 * 60 * 60 * 1000;
      }
      if (hours) {
        duration += hours * 60 * 60 * 1000;
      }
      if (duration > 0) {
        out[outDuration] = duration;
      }
      out[outPercent] = row[inPercent];

      var deps = "";
      for (var col = inDeps; col < row.length; col++) {
        if (row[col]) {
          deps += row[col] + ",";
        }
      }
      out[outDeps] = deps;
    }
    return out;
  };

  var minTimestamp = new Date().getTime();
  var output = [];
  for (var row = 1; row < input.length; row++) {
    var out = transformRow(input[row]);
    output.push(out);
    if (out[outStartDate]) {
      minTimestamp = Math.min(minTimestamp, out[outStartDate].getTime());
    }
  }
  var minDate = new Date(minTimestamp);

  output.push(["placeholder",spreadsheet.getName(),minDate,minDate,0,100,null]);
  outputSheet.clear();
  outputSheet.getRange(1, 1, output.length, 7).setValues(output);

}

