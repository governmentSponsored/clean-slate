/*
  Add menu items and attach functions to them
*/
function onOpen() {
  SpreadsheetApp.getUi()
                .createMenu('Save To Website')
                .addItem('Save All Rows', 'postData')
                .addSeparator()
                .addItem('Save Selected Rows', 'postData')
                .addToUi();
}

/*
  Get app id, REST api key, and class from the Script's properties.
  Return them as an object
*/
function getKeys() {
  var properties = PropertiesService.getScriptProperties().getProperties(),
      obj = { appId: properties.appId, restApi: properties.restApi, class: properties.class };
  
  return obj;
}

/*
  Get all the data from the database
  Return it as JSON object
*/
function queryAllData() {
  var properties = getKeys(),
      url = 'https://api.parse.com/1/classes/' + properties.class,
      options = {
        "method" : "get",
        "headers" : {
          "X-Parse-Application-Id": properties.appId,
          "X-Parse-REST-API-Key": properties.restApi,
        }
      },  
      data = UrlFetchApp.fetch(url, options),
      cleanData = JSON.parse(data).results;
      
  return cleanData;
}

/*
  Get all the data from the spreadsheet
  Return it as an array
*/
function getSpreadsheetData() {
  var id = '1uesHRk5y43MdGxIZf8_zXkHKEO35oaablSqWP8LKux4',
      sheet = SpreadsheetApp.openById(id).getSheets()[0],
      lastCol = sheet.getLastColumn(),
      lastRow = sheet.getLastRow() -1,
      data = sheet.getRange(2, 1, lastRow, lastCol).getValues();
  
  return data;
}

/*
  Get all the spreadsheet data as an object
  Post it to database
  Return as object
*/
function postData() {
	var properties = getKeys(),
    url = 'https://api.parse.com/1/batch',
    path = '/1/classes/' + properties.class,
    postArray = getSpreadsheetData(),
    i=0,
    len=postArray.length,
    payload = '{"requests" :[',
    current,
    options,
    cleanData;
    
    for(i;i<len;i++) {
      current = postArray[i];
      payload += '{"method": "POST",' +
                  '"path": "' + path + '",' +
                  '"body": {' + 
                            '"commentNumber": "' + current[0] + '",' +
                            '"comment": "' + current[1] + '",' +
                            '"eligibilityType": "' + current[2] + '",' +
                            '"eligibilityTypeObj": {' +
                              '"eligibilityText": "' + current[3] + '",' +
                              '"icon": "' + current[4] + '",' +
                              '"level": "' + current[5] + '",' +
                              '"helperText": "' + current[6] + '"' +
                            '}' +
                          '}' + 
                  '}';
      if(i!=len-1) {
        payload += ',';
      } else {
        payload += ']}'
      }
    }
	
    options = {
	    "method" : "post",
	    "headers" : {
	      "X-Parse-Application-Id": properties.appId,
	      "X-Parse-REST-API-Key": properties.restApi,
	      "Content-Type": "application/json"
	    },
	    "contentType" : "application/json",
	    "muteHttpExceptions" : true,
        "payload" : payload
	  }
      
    cleanData = UrlFetchApp.fetch(url, options)
                           .getContentText()
                           .parse(json);
	  
	  return cleanData;
}
