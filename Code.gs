/* What should the add-on do after it is installed */
function onInstall() {
  onOpen();
}

/* What should the add-on do when a document is opened */
function onOpen() {
  DocumentApp.getUi()
    .createAddonMenu() // Add a new option in the Google Docs Add-ons Menu
    .addItem("Manage Sites", "showManageSitesSidebar")
    .addItem("Publish", "showPublishSelectSiteSidebar")
    .addSeparator()
    .addItem("Help", "showHelpModal")
    .addToUi();  // Run the showSidebar function when someone clicks the menu
}

function showManageSitesSidebar() {
  var html = HtmlService.createTemplateFromFile("manage_sites")
    .evaluate()
    .setTitle("Publish to Drupal - Manage Sites"); // The title shows in the sidebar
  DocumentApp.getUi().showSidebar(html);
}

function showPublishSelectSiteSidebar() {
  var userProperties = PropertiesService.getUserProperties();
  var data = userProperties.getProperties();
  if(Object.keys(data).length == 0) {
    showAlert('Error', 'You have 0 sites. First Add Site to publish your Google Docsdocument on Drupal.');
    showManageSitesSidebar();
  } else {
    var html = HtmlService.createTemplateFromFile("publish_select_site")
      .evaluate()
      .setTitle("Publish to Drupal"); // The title shows in the sidebar
    DocumentApp.getUi().showSidebar(html);
  }
}

function showPublishContentSidebar(url) {
  var userProperties = PropertiesService.getUserProperties();
  var apiKey = userProperties.getProperty(url);
  var response = UrlFetchApp.fetch(url + '/google_docs/test_connection?apiKey=' + apiKey, {muteHttpExceptions: true});
  if(response.getResponseCode() == 200) {
    var parms = JSON.parse(response.getContentText());
    if(parms.msg === 'ok') {
      var t = HtmlService.createTemplateFromFile('publish_content');
      t.data = url;
      console.log(t.evaluate());
      DocumentApp.getUi().showSidebar(t.evaluate().setTitle("Publish to Drupal"));
    } else {
      showAlert('Error', 'Unable to connect. Invalid API Key.');
      showManageSitesSidebar();
    }
  } else {
    showAlert('Error', 'Unable to connect to Site URL.');
    showManageSitesSidebar();
  }
}

function showHelpModal() {
  var htmlOutput = HtmlService
    .createHtmlOutputFromFile('help_modal.html')
    .setWidth(475);
  DocumentApp.getUi().showModalDialog(htmlOutput, 'Help for Publish to Drupal');
}

function testConnection(url, apiKey) { 
  var response = UrlFetchApp.fetch(url + '/google_docs/test_connection?apiKey=' + apiKey, {muteHttpExceptions: true});
  if(response.getResponseCode() == 200) {
    var parms = JSON.parse(response.getContentText());
    if(parms.msg === 'ok') {
      var userProperties = PropertiesService.getUserProperties();
      userProperties.setProperty(url, apiKey);
      showAlert('Add Site', 'Site added successfully');
      showManageSitesSidebar();
    } else {
      showAlert('Error', 'Incorrect API Key.');
    }
  } else {
    showAlert('Error', 'Incorrect Site URL.');
  }
}

function deleteSite(url) {
  var ui = DocumentApp.getUi();
  var result = ui.alert(
    'Please confirm',
    'Are you sure you want to delete '+ url +' ?',
    ui.ButtonSet.YES_NO);

  // Process the user's response.
  if (result == ui.Button.YES) {
  var userProperties = PropertiesService.getUserProperties();
  userProperties.deleteProperty(url);
    showAlert('Manage Sites', 'Site deleted successfully');
    showManageSitesSidebar();
  }
}

function publishContent(summary, type, user, status, url) {
  var doc = DocumentApp.getActiveDocument();
  var title = doc.getName();
  var link = "https://docs.google.com/feeds/download/documents/export/Export?id="+doc.getId()+"&exportFormat=html";
  var param = {
    method : "get",
    headers : {"Authorization": "Bearer " + ScriptApp.getOAuthToken()},
    muteHttpExceptions:true,
  };
  var html = UrlFetchApp.fetch(link,param).getContentText();
  var userProperties = PropertiesService.getUserProperties();
  var apiKey = userProperties.getProperty(url);
  
  var payload = {
    'apiKey': apiKey,
    'type' : type,
    'user' : user,
    'status' : status,
    'title' : title,
    'summary' : summary,
    'body' : html
  };
  var options = {
    'method':'POST',
    'payload':payload,
    'muteHttpExceptions': true
  };
  var response = UrlFetchApp.fetch(url + '/google_docs/publish', options);
  var parms = JSON.parse(response.getContentText());
  console.log(parms);
  var documentProperties = PropertiesService.getDocumentProperties();
  documentProperties.setProperty('url', url);
  documentProperties.setProperty('nid', parms.nid);
  showAlert('Publish to Drupal', 'Your document has been succesfully saved to Drupal.');
  showPublishSelectSiteSidebar();
}

function showAlert(title, message) {
  var ui = DocumentApp.getUi();
  ui.alert(title, message, ui.ButtonSet.OK);
}
