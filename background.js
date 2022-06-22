// background.js
const hardcode = ["youtube","google"]
const API_URL = "https://allsides-api.herokuapp.com/data";
var database = [];


//listener event: Updates the database in memory when the extension is first installed.
chrome.runtime.onInstalled.addListener(() => {
  console.log("Alberto's extension project is installed!");
  var options = {"tooltips": true, "stickers":true};
  chrome.storage.local.set({ "options":options });
  fetchAllsidesDatabase();
});

//listener event: Updates the database in memory when a new chrome window is created.
chrome.windows.onCreated.addListener(() => {
  fetchAllsidesDatabase();
});

//interval event: every 2 hours, fetch the database from Allsides API
setInterval(function() { 
  fetchAllsidesDatabase(); 
}, 120 * 60 * 1000);

function saveDatabase(){
  chrome.storage.local.set({ "database" : database }, function(){
    console.log("set database into storage with length of:" + database.length);
  });
}

//fetchDatabase(): Fetches allsides data gatheters on allsides api and assignes it to the database array in memory.
function fetchAllsidesDatabase(){
  //parameters for the GET request
  console.log("getting data base");
  const options = {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json;charset=UTF-8",
      "url": API_URL
    },
  };
  fetch(API_URL, options)
    .then((response) => response.json())
    .then((data) => {
      database = data;
      //iterate through the database and make a new property for each object that is the domain name broken up by the periods. This is to help with search for websites.
      for (let i = 0; i < database.length; i++){
        database[i].urlarray = database[i].url.split(".");
      }
      console.log("data base obtained with array length of " + database.length);
      saveDatabase();
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

//listener event: runs when the bias-tooltip.js content script sends a message requesting bias information for the array of urls.
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    //console.log("recieved array from content script to process")
    console.log(database.length);
    if (request.data)
      var response = request.data;
      for(var i = 0;i < response.length;i++){
        var a_url = response[i].href.split("/")[2];
        var search = findAllsidesSource(a_url);
        if (search.bias){
          response[i].bias = search.bias;  
        }
        else {
          response[i].bias = search;
        }
        
      }
      //console.log(response)
      sendResponse({"data": response});
  }
);

//new search function that parses through the allsides database and matches the arguement url to the array of urls. This helps deal with the weird cases you got.
function findAllsidesSource(url_query){
  
  //assume link is in the form of www.example.com or example.com
  //this if statement takes care if the query is undefined, ends the funcion call back returning nodata
  if(url_query !== undefined) {
    url_query = url_query.split(".");
  }
  else {
    return "no data";
  }
  //this gets the domain "example" if the url is in the form of www.example.com
  if (url_query.length == 3){
    url_query = url_query[1];
  }
  //this gets the domain "example" if the url is in the form of example.com
  else if (url_query.length == 2){
    url_query = url_query[0];
  }
  //any other cases would be newtab or weird websites like www.go.example.com, which are atypical and not common. ends the funcion call back returning nodata
  else {
    return "no data";
  }

  if(database.length == 0){
    chrome.storage.local.get("database", function(obj) {
      database = obj.database
      console.log("retrieved old database");
    });
  }
  //begin querying
  if(!hardcode.includes(url_query) && database !== undefined){ 
    var search = []
    for (let i = 0; i < database.length; i++){
      if(database[i].urlarray.includes(url_query)){
        search.push(database[i]);
      }
    }
    if (search.length > 1){
      return findBest(search);
    }
    else if (search.length == 1){
      return search[0];
    }
    else {
      //else statment provides escape if no search results appear
      return "no data";
    }
  }
  else {
    //else statment provides escape if there is no database or if the query is in the hardcoded nono list
    return "no data";
  }
}

//unit test for testing findAllsidesSource()
function findAllsidesSourceTest(){
  console.log(findAllsidesSource("newtab")); //should be no data
  console.log(findAllsidesSource("www.bbc.com")); //should have result
  console.log(findAllsidesSource("reuters.com")); //should have result
  console.log(findAllsidesSource("www.youtube.com")); //should have no data
  console.log(findAllsidesSource("www.xyznewsdontexist.com")); //should have no data

}

//update the popup with the current information available on the active tab
function updatePopup(){
  console.log(database.length);
  chrome.tabs.query({currentWindow: true, active: true}, function(tabs){
    var tab_url = tabs[0].url;
    var tab_url = tab_url.split("/")[2];
    var search = findAllsidesSource(tab_url);
    chrome.storage.local.set({ 'popup' : search });
    updatePopupIcon(search);

  });
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

//your run of the mill find max function
function findMax(array){
  var a = array[0];
  for (let i = 1; i < array.length; i++) {
    if (array[i] > a){
      a = array[i];
   }
  }
  return a
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
  else {
    chrome.action.setIcon({ "path": "icons/unknown.png"});
  }
}
