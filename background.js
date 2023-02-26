//importing external script
try { importScripts("libraries/DatabaseHelper.js"); } catch (e) { console.log(e); }


//use rapid api endpoint to track users
const AS_API_URL = "https://transparent-media-extension-endpoints.p.rapidapi.com/extension/ASdata";
const MBFC_API_URL = "https://transparent-media-extension-endpoints.p.rapidapi.com/extension/MBFCdata";
var option

//listener event: anytime options changes in storage, update it here.
chrome.storage.onChanged.addListener(function(changes, namespace) {
  if ("options" in changes) {
    options = changes.options.newValue;
  }
});

//listener event: Updates the database in memory when the extension is first installed.
chrome.runtime.onInstalled.addListener(() => {
  console.log("News Bias Reporter extension is installed!");
  options = {"tooltips": true, "stickers":true, "ASData":true, "MBFCData":true};
  chrome.storage.local.set({ "options":options });
  fetchASDatabase();
  fetchMBFCDatabase();
});

//listener event: Updates the database in memory when a new chrome window is created or chrome is started up.
chrome.windows.onCreated.addListener(() => {
  fetchASDatabase();
  fetchMBFCDatabase();
});

//listener event: whenever a tab is updated (e.g. the url changes), parse the url for the domain. If the url is defined and the page is loaded, run the updatePopup function
chrome.tabs.onUpdated.addListener(function(tabid, changeinfo, tab) {
  if (tab.url !== undefined && changeinfo.status == "complete") {
    updatePopup();
  }
});

//listener event: whenever a tab is changed, the new active tab will have updatePopup executed
chrome.tabs.onActivated.addListener(() => {
  updatePopup();
});

//fetchDatabase(): Fetches allsides data gatheters on allsides api and assignes it to the database array in memory.
function fetchASDatabase(){
  //parameters for the GET request
  const options = {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json;charset=UTF-8",
      "url": AS_API_URL,
      'X-RapidAPI-Key': 'c68506b6c4msh761b24c39cc0233p10207cjsnd103f347dfc4',
      'X-RapidAPI-Host': 'transparent-media-extension-endpoints.p.rapidapi.com'
    },
  };
  fetch(AS_API_URL, options)
    .then((response) => response.json())
    .then((data) => {
      //ASdatabase = data;
      //iterate through the database and make a new property for each object that is the domain name broken up by the periods. This is to help with search for websites.
      //for (let i = 0; i < ASdatabase.length; i++){
      //  ASdatabase[i].urlarray = ASdatabase[i].url.split(".");
      //}
      chrome.storage.local.set({ "ASdatabase" : data }, function(){
        console.log("Storing allsides database into storage with length of:" + data.length);
      });
    });
}

//fetchDatabase(): Fetches allsides data gatheters on allsides api and assignes it to the database array in memory.
function fetchMBFCDatabase(){
  //parameters for the GET request
  const options = {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json;charset=UTF-8",
      "url": MBFC_API_URL,
      'X-RapidAPI-Key': 'c68506b6c4msh761b24c39cc0233p10207cjsnd103f347dfc4',
      'X-RapidAPI-Host': 'transparent-media-extension-endpoints.p.rapidapi.com'
    },
  };
  fetch(MBFC_API_URL, options)
    .then((response) => response.json())
    .then((data) => {
      //MBFCdatabase = MBFCdata;
      //iterate through the database and make a new property for each object that is the domain name broken up by the periods. This is to help with search for websites.
      //for (let i = 0; i < MBFCdatabase.length; i++){
      //  if(MBFCdatabase[i].url){
      //    var ass = MBFCdatabase[i].url.split("/")
      //  }
      //  if (ass[2]){
      //    ass = ass[2].split(".")
      //  }
      //  MBFCdatabase[i].urlarray = ass;
      //}
      chrome.storage.local.set({ "MBFCdatabase" : data }, function(){
        console.log("Storing MBFC database into storage with length of:" + data.length);
      });
    });
}
//update the popup with the current information available on the active tab
async function updatePopup(){
    let ASDatabaseHelper = new DatabaseHelper();
    let obj = await chrome.storage.local.get("ASdatabase")
    ASDatabaseHelper.database = obj.ASdatabase;

    let MBFCDatabaseHelper = new DatabaseHelper();
    obj = await chrome.storage.local.get("MBFCdatabase");
    MBFCDatabaseHelper.database = obj.MBFCdatabase;
    
    currentTab = await chrome.tabs.query({currentWindow: true, active: true});
    currentTabUrl = currentTab[0].url

    let ASsearch = ASDatabaseHelper.search(currentTabUrl)
    let MBFCsearch = MBFCDatabaseHelper.search(currentTabUrl)

    if(!MBFCsearch){
      updatePopupIcon(ASsearch);  
    }
    else{
      updatePopupIcon(MBFCsearch);
    }

    if(ASsearch  === undefined){
      ASsearch = "no data"
    }
    if(MBFCsearch  === undefined){
      MBFCsearch = "no data"
    }

    await chrome.storage.local.set({ 'ASPopupData':ASsearch, 'MBFCPopupData':MBFCsearch},() => {
      console.log("updated popup with:");console.log(ASsearch);console.log(MBFCsearch);
    });
}
//javascript object that is a hash map of different political bias and thier respective icons
const iconMap = {
  "left":"icons/left.png",
  "left-center":"icons/left center.png",
  "center":"icons/center.png",
  "right-center":"icons/right center.png",
  "right":"icons/right.png",
  "allsides":"icons/allsides.png",
  "fake-news":"icons/bad.png",
  "satire":"icons/satire.png",
  "conspiracy":"icons/bad.png",
  "pro-science":"icons/pro science.png",
} 

//update the popup icon with the bias of the current site you are viewing.
function updatePopupIcon(source){
  if(source){
    chrome.action.setIcon({ "path": iconMap?.[source.bias]});
  }
  else{
    chrome.action.setIcon({ "path": "icons/unknown.png"});
  }
}