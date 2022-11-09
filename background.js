// background.js
const hardcode = ["youtube","google"]
const commonStuff = ["www","ww1","com","org","www2","blog","outlook","www1","web","ca"]
//use rapid api endpoint to track users
const AS_API_URL = "https://transparent-media-extension-endpoints.p.rapidapi.com/extension/ASdata";
const MBFC_API_URL = "https://transparent-media-extension-endpoints.p.rapidapi.com/extension/MBFCdata";
var ASdatabase = [];
var MBFCdatabase = [];
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

//listener event: Updates the database in memory when a new chrome window is created.
chrome.windows.onCreated.addListener(() => {
  fetchASDatabase();
  fetchMBFCDatabase();
});

//interval event: every 2 hours, fetch the database from Allsides API
setInterval(function() {
  console.log("routine call for data") 
  fetchASDatabase();
  fetchMBFCDatabase(); 
}, 30 * 60 * 1000);

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
      ASdatabase = data;
      //iterate through the database and make a new property for each object that is the domain name broken up by the periods. This is to help with search for websites.
      for (let i = 0; i < ASdatabase.length; i++){
        ASdatabase[i].urlarray = ASdatabase[i].url.split(".");
      }
      chrome.storage.local.set({ "ASdatabase" : ASdatabase }, function(){
        console.log("Storing allsides database into storage with length of:" + ASdatabase.length);
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
    .then((MBFCdata) => {
      MBFCdatabase = MBFCdata;
      //iterate through the database and make a new property for each object that is the domain name broken up by the periods. This is to help with search for websites.
      for (let i = 0; i < MBFCdatabase.length; i++){
        if(MBFCdatabase[i].url){
          var ass = MBFCdatabase[i].url.split("/")
        }
        if (ass[2]){
          ass = ass[2].split(".")
        }
        MBFCdatabase[i].urlarray = ass;
      }
      chrome.storage.local.set({ "MBFCdatabase" : MBFCdatabase }, function(){
        console.log("Storing MBFC database into storage with length of:" + MBFCdatabase.length);
      });
    });
}

//listener event: whenever a tab is updated (e.g. the url changes), parse the url for the domain. If the url is defined and the page is loaded, run the updatePopup function
chrome.tabs.onUpdated.addListener(function(tabid, changeinfo, tab) {
  var url = tab.url;
  if (url !== undefined && changeinfo.status == "complete") {
    updatePopup();
  }
});

//listener event: whenever a tab is changed, the new active tab will have updatePopup executed
chrome.tabs.onActivated.addListener(() => {
  updatePopup();
});

//update the popup with the current information available on the active tab
function updatePopup(){

  chrome.tabs.query({currentWindow: true, active: true}, function(tabs){
    var tab_url = tabs[0].url;
    var tab_url = tab_url.split("/")[2];
    var search = findASSource(tab_url);
    var MBFCsearch = findMBFCSource(tab_url)
    chrome.storage.local.set({ 'popup' : search, 'MBFCpopup':MBFCsearch },() => {
    //  console.log("updated popup with:");console.log(search);console.log(MBFCsearch);
    });
    
    if (MBFCsearch == "no data"){
      updatePopupIcon(search);
    }
    else {
      updatePopupIcon(MBFCsearch);
    }
    
  });
}

//update the popup icon with the bias of the current site you are viewing.
function updatePopupIcon(source){
  if(source == undefined){source = {"bias": "no data"}}
  if(source.bias == "left"){
    chrome.action.setIcon({ "path": "icons/left.png"});
  }
  else if(source.bias == "left-center"){
    chrome.action.setIcon({ "path": "icons/left center.png"});
  }
  else if(source.bias == "center"){
    chrome.action.setIcon({ "path": "icons/center.png"});
  }
  else if(source.bias == "right-center"){
    chrome.action.setIcon({ "path": "icons/right center.png"});
  }
  else if(source.bias == "right"){
    chrome.action.setIcon({ "path": "icons/right.png"});
  }
  else if(source.bias == "allsides"){
    chrome.action.setIcon({ "path": "icons/allsides.png"});
  }
  else if(source.bias == "fake-news"){
    chrome.action.setIcon({ "path": "icons/bad.png"});
  }
  else if(source.bias == "satire"){
    chrome.action.setIcon({ "path": "icons/satire.png"});
  }
  else if(source.bias == "conspiracy"){
    chrome.action.setIcon({ "path": "icons/bad.png"});
  }
  else if(source.bias == "pro-science"){
    chrome.action.setIcon({ "path": "icons/pro science.png"});
  }
  else {
    chrome.action.setIcon({ "path": "icons/unknown.png"});
  }
}

//listener event: runs when the bias-tooltip.js content script sends a message requesting bias information for an array of urls.
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    //console.log("recieved array from content script to process with length: " + request.data.length)
    if (request.data)
      var response = request.data;
      for(var i = 0;i < response.length;i++){
        var a_url = response[i].href.split("/")[2];
        var search = findASSource(a_url);
        var MBFCsearch = findMBFCSource(a_url);
        if (search.bias){
          response[i].bias = search.bias;  
        }
        else {
          response[i].bias = search;
        }
        if (MBFCsearch.bias){
          response[i].MBFCbias = MBFCsearch.bias;
          response[i].MBFCfactual = MBFCsearch.factual;  
        }
        else {
          response[i].MBFCbias = MBFCsearch;
          response[i].MBFCfactual = MBFCsearch; 
        }
      }
      //console.log(response)
      sendResponse({"data": response});
  }
);

//find AS profile based on a url
function findASSource(url_query){
  if(typeof options !== "undefined" && options !== null){
    if(!options.ASData){
      return "no data"
    }
  }
  if(ASdatabase.length == 0){
    chrome.storage.local.get("ASdatabase", function(obj) {
      ASdatabase = obj.ASdatabase
    });
  }
  else {
    //do nothing
  }
  var output = lookupInDatabase(url_query,ASdatabase);
  if (Array.isArray(output)){
    return findBest(output)
  }
  else {
    return output
  }
}

//finds the best source on an array of sources based on highest agreement numbers.
function findBest(array){
  var temp = [];
  for (let i = 0; i < array.length; i++) {
    temp.push(parseInt(array[i].agreement));
  }
  const max = findMax(temp);
  var best = array.find(obj => obj.agreement == max);
  return best;
}

//basic find max function
function findMax(array){
  var a = array[0];
  for (let i = 1; i < array.length; i++) {
    if (array[i] > a){
      a = array[i];
   }
  }
  return a
}

//find MBFC profile based on a url
function findMBFCSource(url_query){
  if(typeof options !== "undefined" && options !== null){
    if(!options.MBFCData){
      return "no data"
    }
  }

  if(MBFCdatabase.length == 0){
    chrome.storage.local.get("MBFCdatabase", function(obj) {
      MBFCdatabase = obj.MBFCdatabase
    });
  }
  else {
    //do nothing
  }
  var output = lookupInDatabase(url_query,MBFCdatabase);
  if (Array.isArray(output)){
    return findBestMBFC(output)
  }
  else {
    return output
  }
}

//function picks best MBFC profile in an array of profiles based on credibility rating
function findBestMBFC(array){
  var temp = [];
  temp = temp.concat(array.filter(profile => profile.credibility == "high credibility"))
  temp = temp.concat(array.filter(profile => profile.credibility== "medium credibility"))
  temp = temp.concat(array.filter(profile => profile.credibility== "low credibility"))
  temp = temp.concat(array.filter(profile => profile.credibility== "no credibility rating available"))
  return temp[0]
}

//function find an AS or MBFC profile in the given data base based on a url. if none found return "no data"
//database must be either the allsides or MBFC database that has objects with a parameter called urlArray.
function lookupInDatabase(url,database) {
  if(url !== undefined) {
    url = url.split(".");
    url = url.filter(word => commonStuff.indexOf(word) == -1)
    for (let i = 0; i < url.length; i++) {
      if (hardcode.includes(url[i])){
        return "no data"; //returned if url is in hardcode array
      }
    }
  }
  else {
    return "no data"; //returned if url is undefined
  }
  if(database !== (undefined||[])){
    
    var search = database
    for (let i = 0; i < url.length; i++) {
      var temp = [];
      for (let j = 0; j < search.length; j++) {
        var temptemp = search[j].urlarray.filter(word => commonStuff.indexOf(word) == -1)
        if(search[j].urlarray.includes(url[i]) && (temptemp.length === url.length)){
          temp.push(search[j]);
        }
        else {
          //do nothing
        } 
      }
      search = temp;
      if (search.length == 1){
        return search[0] //returned if search has only yielded one result
      }
      else if(search.length == 0){
        return "no data" //returned if search has yielded no result
      }
      else {
        //do nothing
      }
    }
    return search; //returned if search has many results and is an array
  }
  else {
    return "no data" //returned if databases are empty
  }
}
