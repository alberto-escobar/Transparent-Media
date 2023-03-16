//Import external scripts used for managing databases and ratings history.
try { importScripts("libraries/DatabaseHelper.js"); } catch (e) { console.log(e); }
try { importScripts("libraries/Metrics.js"); } catch (e) { console.log(e); }

//API endpoint urls.
const AS_API_URL = "https://transparent-media-extension-endpoints.p.rapidapi.com/extension/ASdata";
const MBFC_API_URL = "https://transparent-media-extension-endpoints.p.rapidapi.com/extension/MBFCdata";

//Conversion map used to convert values in databases fetched from API to labels appropriate for front end use.
const conversionMap = {
  "left":"Left",
  "left-center":"Lean Left",
  "center":"Center",
  "right-center":"Lean Right",
  "right":"Right",
  "satire":"Satire",
  "pro-science":"Pro-Science",
  "fake-news":"Fake News",
  "conspiracy":"Conspiracy",
  "allsides":"All Sides",
  "very high":"Very High",
  "high":"High",
  "mostly":"Moderate",
  "mixed":"Mixed",
  "low":"Low",
  "VeryLow":"Very Low"
}

//Filepath map for finding icon filepath for respective media bias rating.
const iconMap = {
  "Left":"icons/left.png",
  "Lean Left":"icons/left center.png",
  "Center":"icons/center.png",
  "Lean Right":"icons/right center.png",
  "Right":"icons/right.png",
  "All Sides":"icons/allsides.png",
  "Fake News":"icons/bad.png",
  "Satire":"icons/satire.png",
  "Conspiracy":"icons/bad.png",
  "Pro-Science":"icons/pro science.png",
} 

//Listener event: On extension install, create options object, save to local storage and fetch databases from API.
chrome.runtime.onInstalled.addListener(() => {
  console.log("Transparent Media is installed!");
  let options = {"tooltips": true, "stickers":true, "ASData":true, "MBFCData":true, "a":true, "b":true};
  chrome.storage.local.set({ "options":options });
  fetchASDatabase();
  fetchMBFCDatabase();
});

//Listener event: When new chrome window created, fetch databases from API.
chrome.windows.onCreated.addListener(() => {
  fetchASDatabase();
  fetchMBFCDatabase();
});

//Listener event: When a tab is updated, update popup with search results from databases.
chrome.tabs.onUpdated.addListener(function(tabid, changeinfo, tab) {
  if (tab.url !== undefined && changeinfo.status == "complete") {
    updatePopup();
  }
});

//Listener event: When a tab is focused, update popup with search results from databases.
chrome.tabs.onActivated.addListener(() => {
  updatePopup();
});

//Fetches allsides.com data from political bias database API and saves it to local storage.
function fetchASDatabase(){
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
      for (let i = 0; i < data.length; i++){
        data[i].bias = conversionMap[data[i].bias]
      }
      chrome.storage.local.set({ "ASdatabase" : data });
    });
}

//Fetches mediabiasfactcheck.com data from political bias database API and saves it to local strorage.
function fetchMBFCDatabase(){
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
      for (let i = 0; i < data.length; i++){
        data[i].bias = conversionMap[data[i].bias]
        data[i].factual = conversionMap[data[i].factual]
      }
      chrome.storage.local.set({ "MBFCdatabase" : data });
    });
}

//Update the popup with the current information available on the focused tab. Add ratings from focused tab to history logs if they have not been added yet today.
async function updatePopup(){
    let options = await chrome.storage.local.get("options")
    options = options.options

    let obj = await chrome.storage.local.get("ASdatabase")
    let ASDatabaseHelper = new DatabaseHelper(obj.ASdatabase);

    obj = await chrome.storage.local.get("MBFCdatabase");
    let MBFCDatabaseHelper = new DatabaseHelper(obj.MBFCdatabase);
    
    currentTab = await chrome.tabs.query({currentWindow: true, active: true});
    currentTabUrl = currentTab[0]?.url
    let ASsearch
    let MBFCsearch

    if(options.ASData){
      ASsearch = ASDatabaseHelper.search(currentTabUrl)
    }
    if(options.MBFCData){
      MBFCsearch = MBFCDatabaseHelper.search(currentTabUrl)
    }

    let metric = new Metrics(options)
    await metric.addLog(currentTabUrl,ASsearch,MBFCsearch)

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

    await chrome.storage.local.set({ 'ASPopupData':ASsearch, 'MBFCPopupData':MBFCsearch});
}


//Update the popup icon with the bias of focused tab.
function updatePopupIcon(source){
  if(source){
    chrome.action.setIcon({ "path": iconMap?.[source.bias]});
  }
  else{
    chrome.action.setIcon({ "path": "icons/unknown.png"});
  }
}