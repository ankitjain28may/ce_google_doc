# Publish to Drupal

This Google Docs Add-On allow Drupal site administrator to publish/save Google Docs document as content on Drupal.

### Pre Requirements
-   Drupal 8 site
-   Google Account

## Quick Installation

1. Goto https://docs.google.com/document/d/1fvvySs-eXZf3KxBonJDNUcRBP8aro6ZKTZUrda5DQz4/edit?usp=sharing
2. From main menu select File > Make a copy. If "Make a copy" is disabled then first Sign-In from top right button.

## Full Installation

1. Goto https://script.google.com
2. Select "New Project"
3. By default there is `Code.gs` file opened. Copy the codes of `Code.gs` file of this repository and paste it there.
4. From main menu select File > New > HTML File. Name them according to file name in this repository and also paste the code from this repository.
5. To run this Add-On in Google docs document, from main menu select Run > Test as Add-On, select the document and click on "Save" button.

## How to Use

1. You need to install Collaborative Editors module in Drupal.
2. In Drupal enable "Collaborative Editors Google Docs" module.
3. Open your Google Docs document where you has installed this Add-On. From main menu select Add-On > Publish to Drupal > Manage Sites.
4. A sidebar will get open on right side. Enter your Drupal site URL and API Key. You can get your API Key from http://DRUPAL_SITE/admin/config/collaborative-editors/google-docs Then select "Add Site" button. A success will alert. 
5. From main menu select Add-On > Publish to Drupal > Publish.
6. A sidebar will get open on right side. Select the site on which you want to publish/save this document and press "Continue" button.
7. Various options will get disabled in sidebar. Configure them accordingly and press "Save to Drupal" button.

## How to Debug

1. Goto https://script.google.com
2. Select your project
3. On right side there will be sidebar with title "PROJECT DETAILS". On top-right of this side bar select three dote button.
4. Menu will get displayed. Select "Exceptions" to see the log of each function.

## Contribution

1. Folk this repository.
2. Create new branch in your folked repository.
3. Add commit to that branch.
4. Raise a Pull Request.

NOTE: Do remember to update doc-comments if necessary.
