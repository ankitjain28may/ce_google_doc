/**
 * Runs when the add-on is installed.
 * This method is only used by the regular add-on, and is never called by
 * the mobile add-on version.
 */
function onInstall() {
  onOpen();
}

/**
 * Creates a menu entry in the Google Docs UI when the document is opened.
 * This method is only used by the regular add-on, and is never called by
 * the mobile add-on version.
 */
function onOpen() {
  DocumentApp.getUi()
    .createAddonMenu() // Add a new option in the Google Docs Add-ons Menu
    .addItem('Manage Sites', 'showManageSitesSidebar')
    .addItem('Publish', 'showPublishSelectSiteSidebar')
    .addSeparator()
    .addItem('Help', 'showHelpModal')
    .addToUi();  // Run the showSidebar function when someone clicks the menu
}

/**
 * Opens a Manage Sites sidebar in the document containing the add-on's user interface.
 * This method is only used by the regular add-on, and is never called by
 * the mobile add-on version.
 */
function showManageSitesSidebar() {
  var html = HtmlService.createTemplateFromFile('manage_sites')
    .evaluate()
    .setTitle('Publish to Drupal - Manage Sites'); // The title shows in the sidebar
  DocumentApp.getUi().showSidebar(html);
}

/**
 * Opens a Select Site sidebar in the document containing the add-on's user interface.
 * This method is only used by the regular add-on, and is never called by
 * the mobile add-on version.
 */
function showPublishSelectSiteSidebar() {
  var userProperties = PropertiesService.getUserProperties();
  var data = userProperties.getProperties();
  if(Object.keys(data).length == 0) {
    showAlert('Error', 'You have 0 sites. First Add Site to publish your Google Docsdocument on Drupal.');
    showManageSitesSidebar();
  } else {
    var html = HtmlService.createTemplateFromFile('publish_select_site')
      .evaluate()
      .setTitle('Publish to Drupal'); // The title shows in the sidebar
    DocumentApp.getUi().showSidebar(html);
  }
}

/**
 * Opens a Publish Content sidebar in the document containing the add-on's user interface.
 * This method is only used by the regular add-on, and is never called by
 * the mobile add-on version.
 */
function showPublishContentSidebar(url) {
  var userProperties = PropertiesService.getUserProperties();
  var apiKey = userProperties.getProperty(url);
  var response = UrlFetchApp.fetch(url + '/google_docs/test_connection?apiKey=' + apiKey, {muteHttpExceptions: true});
  if(response.getResponseCode() == 200) {
    var parms = JSON.parse(response.getContentText());
    if(parms.msg === 'ok') {
      var t = HtmlService.createTemplateFromFile('publish_content');
      t.data = url;
      DocumentApp.getUi().showSidebar(t.evaluate().setTitle('Publish to Drupal'));
    } else {
      showAlert('Error', 'Unable to connect. Invalid API Key.');
      showManageSitesSidebar();
    }
  } else {
    showAlert('Error', 'Unable to connect to Site URL.');
    showManageSitesSidebar();
  }
}

/**
 * Opens a Update Content sidebar in the document containing the add-on's user interface.
 * This method is only used by the regular add-on, and is never called by
 * the mobile add-on version.
 */
function showUpdateContentSidebar() {
  var documentProperties = PropertiesService.getDocumentProperties();
  var url = documentProperties.getProperty('url');
  var userProperties = PropertiesService.getUserProperties();
  var apiKey = userProperties.getProperty(url);
  var response = UrlFetchApp.fetch(url + '/google_docs/test_connection?apiKey=' + apiKey, {muteHttpExceptions: true});
  if(response.getResponseCode() == 200) {
    var parms = JSON.parse(response.getContentText());
    if(parms.msg === 'ok') {
      var html = HtmlService.createTemplateFromFile('update_content')
        .evaluate()
        .setTitle('Publish to Drupal'); // The title shows in the sidebar
      DocumentApp.getUi().showSidebar(html);
    } else {
      showAlert('Error', 'Unable to connect. Invalid API Key.');
      showManageSitesSidebar();
    }
  } else {
    showAlert('Error', 'Unable to connect to Site URL.');
    showManageSitesSidebar();
  }
}

/**
 * Opens a Help dialogue box in the document containing the add-on's user interface.
 * This method is only used by the regular add-on, and is never called by
 * the mobile add-on version.
 */
function showHelpModal() {
  var htmlOutput = HtmlService
    .createHtmlOutputFromFile('help_modal.html')
    .setWidth(475)
    .setHeight(425);
  DocumentApp.getUi().showModalDialog(htmlOutput, 'Help for Publish to Drupal');
}

/**
 * To test connection with Drupal site.
 * @param {string} url The link of Drupal site.
 * @param {string} apiKey The API Key of Google Docs Drupal plugin.
 */
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

/**
 * To delete Drupal site from Document's User's property.
 * @param {string} url The link of Drupal site.
 */
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
  } else {
    showManageSitesSidebar();
  }
}

/**
 * To get permission for DriveApp class so that we can export HTML version of document.
 */
function setScope() {
  DriveApp.getRootFolder();
}

/**
 * To publish/save content on Drupal site.
 * @param {string} summary The summary of content.
 * @param {string} type The type of content (article or page).
 * @param {string} img_store Where user want to store images (gdocs or drupal).
 * @param {integer} status The status of content. 0 mean save and 1 mean publish.
 * @param {string} url The link of Drupal site.
 */
function publishContent(summary, type, user, img_store, status, url) {
  var doc = DocumentApp.getActiveDocument();
  var title = doc.getName();
  var link = 'https://docs.google.com/feeds/download/documents/export/Export?id='+doc.getId()+'&exportFormat=html';
  var param = {
    method : 'get',
    headers : {'Authorization': 'Bearer ' + ScriptApp.getOAuthToken()},
    muteHttpExceptions:true,
  };
  var html = UrlFetchApp.fetch(link,param).getContentText();
  var userProperties = PropertiesService.getUserProperties();
  var apiKey = userProperties.getProperty(url);
  
  var payload = {
    'apiKey': apiKey,
    'type' : type,
    'user' : user,
    'img_store' : img_store,
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
  if(response.getResponseCode() == 200) {
    var parms = JSON.parse(response.getContentText());
    var documentProperties = PropertiesService.getDocumentProperties();
    documentProperties.setProperty('url', url);
    documentProperties.setProperty('nid', parms.nid);
    showAlert('Publish to Drupal', 'Your document has been succesfully saved to Drupal.');
    showPublishSelectSiteSidebar();
  } else {
    showAlert('Error', 'Something went wrong, check your webserver logs.');
    showPublishSelectSiteSidebar();
  }
}

/**
 * To update published/saved content on Drupal site.
 * @param {string} summary The summary of content.
 * @param {string} img_store Where user want to store images (gdocs or drupal).
 */
function updateContent(summary, img_store) {
  var doc = DocumentApp.getActiveDocument();
  var title = doc.getName();
  var link = 'https://docs.google.com/feeds/download/documents/export/Export?id='+doc.getId()+'&exportFormat=html';
  var param = {
    method : 'get',
    headers : {'Authorization': 'Bearer ' + ScriptApp.getOAuthToken()},
    muteHttpExceptions:true,
  };
  var html = UrlFetchApp.fetch(link,param).getContentText();
  var documentProperties = PropertiesService.getDocumentProperties();
  var url = documentProperties.getProperty('url');
  var nid = documentProperties.getProperty('nid');
  var userProperties = PropertiesService.getUserProperties();
  var apiKey = userProperties.getProperty(url);
  
  var payload = {
    'apiKey': apiKey,
    'nid' : nid,
    'title' : title,
    'summary' : summary,
    'img_store' : img_store,
    'body' : html
  };
  var options = {
    'method':'POST',
    'payload':payload,
    'muteHttpExceptions': true
  };
  var response = UrlFetchApp.fetch(url + '/google_docs/update', options);
  if(response.getResponseCode() == 200) {
    showAlert('Publish to Drupal', 'Title, Summary and Body/Content of ' + url + '/node/' + nid + ' has been successfully updated.');
    showPublishSelectSiteSidebar();
  } else {
    showAlert('Error', 'Something went wrong, check your webserver logs.');
    showPublishSelectSiteSidebar();
  }
}

/**
 * To show alert dialogue.
 * @param {string} title The title of alert.
 * @param {string} message The content of alert.
 */
function showAlert(title, message) {
  var ui = DocumentApp.getUi();
  ui.alert(title, message, ui.ButtonSet.OK);
}
