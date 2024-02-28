const credentials = {
    email: "Add your Email",
    api_token: "Add your Token",
    get authorization() {
      return "Basic " + Utilities.base64Encode(this.email + "/token:" + this.api_token)
    },
  }
  
let date = new Date()
let dateYear = Utilities.formatDate(date, "GMT-4", "YYYY");
let dateMonth = Utilities.formatDate(date, "GMT-4", "MMMMMM");
let todaysDate = Utilities.formatDate(date, 'GMT-4', 'MM/dd/YYYY')
let zendeskdate = Utilities.formatDate(date, 'GMT-4', 'YYYY-MM-dd')

function autoFillGoogleDocFromForm(e) {
  let rootID = "18glTu4YX5IcSd1oJAnG0p3fRVqd2CTE7";
  let rootFolder = DriveApp.getFolderById(rootID);
  let folderYear = direc(rootFolder, dateYear, "-p");
  let folderMonth = direc(folderYear, dateMonth, "-p");

  let form = FormApp.getActiveForm();
  let formResponses = form.getResponses();
  let formEntry = formResponses[formResponses.length - 1];
  let itemResponses = formEntry.getItemResponses();

  let templateDoc = ('1CpQ-GbaSk5NI7uSWQ3LhBcrt3IVq6vNjZ-ua_TrZCks')
  let name = 'Risk shift report ' + todaysDate
  let ltFolder = folderMonth
  let templateFile = DriveApp.getFileById(templateDoc)
  let templateCopyID = templateFile.makeCopy(name, ltFolder).getId();
  Logger.log('templateFile is ' + templateFile)
  Logger.log('templateCopyID is ' + templateCopyID)

  form.setCollectEmail(true)
  let submitter = formEntry.getRespondentEmail()
  Logger.log('submitter is ' + submitter)

  let group = GroupsApp.getGroupByEmail('product.department@lotto.com')

  if (!group.hasUser(submitter)) {

    Logger.log('Not a Risk Member')

    const email_scheme = {

      recipient: "angel.o@lotto.com", // product.department@lotto.com",
      // from: "product.department@lotto.com",
      bcc: null,
      cc: null,

      subject: "Risk Shift Report " + Utilities.formatDate(new Date(), "GMT-4", "MM/dd/YYYY"),
      name: "Risk Shift Report",

      body: "<br><br><p><a>'",
      signature: "<br><br>Best Regards,<br>The Lotto.com Product Department",
      attachments: [],

      htmlBody: 'Template'
    }
    email_scheme.body = "<p> Failed CS shift report submitted; margin: 0;' href=" + + ">Risk Shift Report </a></p>"
    sendEmailByConfig(email_scheme);
    return;
  }
  else {
    let ts = todaysDate
    let reporter = submitter
    let q1 = itemResponses[0].getResponse();
    let q2 = itemResponses[1].getResponse();
    let rows = itemResponses[2].getItem().asCheckboxGridItem().getRows();
    let answers = itemResponses[2].getResponse();
    let content = ''
    for (let i = 0; i < rows.length; i++) {
      content = content + ' ' + rows[i].concat(': ' + answers[i]) + "\n";
    }
    Logger.log('answers is ' + answers)

    let q3 = itemResponses[3].getResponse();
    let q4 = itemResponses[5].getItem().asCheckboxItem().getChoices()
    let q4Answers = itemResponses[5].getResponse();
    let dailyclAnswers = '';
    for (let i = 0; i < q4Answers.length; i++) {
      if (q4Answers[i] != null) {
        dailyclAnswers += q4Answers[i] + "\n";
      }
    }

    let copyFile = DocumentApp.openById(templateCopyID)
    let body = copyFile.getBody();
    body.replaceText('{{TS}}', ts);
    body.replaceText('{{Reporter}}', reporter);
    body.replaceText('{{SH}}', q1);
    body.replaceText('{{Notes}}', q2);
    body.replaceText('{{AR}}', content);
    body.replaceText('{{ZC}}', q3);
    body.replaceText('{{IR}}', idsEscalated())
    body.replaceText('{{IH}}', idsHandled())
    body.replaceText('{{IQ}}', idsInq())
    body.replaceText('{{BP}}', dailyclAnswers);

    Logger.log('dailyclAnswers is ' + dailyclAnswers)
    Logger.log('q4Answers is ' + q4Answers)
    Logger.log('q4 is ' + q4)

    copyFile.saveAndClose()

    const email_scheme = {

      recipient: "angel.o@lotto.com", // product.department@lotto.com",
      // from: "product.department@lotto.com",
      bcc: null,
      cc: null,

      subject: "Risk Shift Report " + Utilities.formatDate(new Date(), "GMT-4", "MM/dd/YYYY"),
      name: "Risk Shift Report",

      body: "<br><br><p></p>",
      signature: "<br><br>Best Regards,<br>The Lotto.com Product Department",
      attachments: [copyFile],

      htmlBody: 'Template'
    }
    email_scheme.body = "<p> This email is today's Risk Team Shift Report<br>"
    sendEmailByConfig(email_scheme);
  }
}
function idsInq() {
  
  let result = [];

  const request = {
    url: 'https://lottocom.zendesk.com/api/v2/search.json?query=verification status:new group_id:360016618614',

    options: {
      'method': 'get',
      'headers': {
        'Authorization': credentials.authorization,
      },
      'contentType': 'application/json',
      'muteHttpExceptions': true
    }
  }

  let page_count = 0;

  let response = JSON.parse(UrlFetchApp.fetch(request.url, request.options))

  do {

    if (Array.isArray(response.results)) {
      result = [...result, ...response.results]
    }

    request.url = response.next_page
    page_count++

  } while (request.url !== null && page_count < 10) 

  Logger.log('result.length ' + result.length)
  return result.length
}

function idsEscalated() {

  let result = [];

  const request = {
    url: 'https://lottocom.zendesk.com/api/v2/search.json?query= updated:' + zendeskdate + ' status:open tags: documents_attached',
    options: {
      'method': 'get',
      'headers': {
        'Authorization': credentials.authorization,
      },
      'contentType': 'application/json',
      'muteHttpExceptions': true
    }
  }
  let page_count = 0;

  let response = JSON.parse(UrlFetchApp.fetch(request.url, request.options))
  do {

    if (Array.isArray(response.results)) {
      result = [...result, ...response.results]
    }

    request.url = response.next_page
    page_count++
    Logger.log(request.url)
  } while (request.url !== null && page_count < 10)

  Logger.log('result.length is '+ result.length)
  return result.length
}

function idsHandled() {

  let result = [];

  const request = {
    url: 'https://lottocom.zendesk.com/api/v2/search.json?query=type:ticket created:' + todaysDate + ' Identity Verification Review status:solved',
    options: {
      'method': 'get',
      'headers': {
        'Authorization': credentials.authorization,
      },
      'contentType': 'application/json',
      'muteHttpExceptions': true
    }
  }

  let page_count = 0;

  let response = JSON.parse(UrlFetchApp.fetch(request.url, request.options))

  do {

    if (Array.isArray(response.results)) {
      result = [...result, ...response.results]
    }


    request.url = response.next_page
    page_count++

  } while (request.url !== null && page_count < 10)

  Logger.log('result.length is '+ result.length)
  Logger.log('page_count is '+ page_count)
  return result.length
}

function sendEmailByConfig(config) {

  GmailApp.sendEmail(
    config.recipient,
    config.subject,
    null,
    {
      attachments: config.attachments,
      bcc: config.bcc,
      cc: config.cc,
      from: config.from,
      replyto: config.from,
      name: config.name,
      htmlBody: HtmlService.createHtmlOutputFromFile("Template").getContent().replace("{{Content}}", config.body + config.signature),
    }
  );
  Logger.log("Email was Sent")
}

function direc(parentfolder, folderName, option) {
  Logger.log('Launching direc');

  let parentFolderContents = parentfolder.getFoldersByName(folderName);

  if (parentFolderContents.hasNext() == true) {
    Logger.log('Folder contains an folder(s) named "' + folderName + '"');

    return parentFolderContents.next();

  } else {
    Logger.log('Folder does not contain any folder(s) named "' + folderName + '"');

    if (option == "-p") {
      Logger.log('[-p] Option enabled, Creating missing folder');

      parentfolder.createFolder(folderName);
      Logger.log('Folder "' + folderName + '" has been created');

      return parentfolder.getFoldersByName(folderName).next();
    }

    Logger.log('Exiting mkdir with false value with no actions');
  }
}