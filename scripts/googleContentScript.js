//fetch options from storage so that content script knows weather to put stickers, tooltips, or boths.
var options;
chrome.storage.local.get("options", function(obj) {
  options = obj.options;
});

const stickerStyle = {
  "Left":"background-color:#2c64a4;",
  "Lean Left":"background-color:#9cccec;",
  "Center":"background-color:#9464a4;",
  "All Sides":"background-color:#9464a4;",
  "Lean Right":"background-color:#cc9c9c;",
  "Right":"background-color:#cc2424;",
  "Satire":"background-color:#d3db39;",
  "Pro-Science":"background-color:#1a9830;",
  "Fake News":"background-color:#000000;",
  "Conspiracy":"background-color:#000000;",
  "Very High":"background-color:#1a9830;",
  "High":"background-color:#1a9830;",
  "Moderate":"background-color:#88a81e;",
  "Mixed":"background-color:#E36C0A;",
  "Low":"background-color:#FF0000;",
  "Very Low":"background-color:#FF0000;"
}

runContentScript();

async function runContentScript(){ 
  let options = await chrome.storage.local.get("options")
  options = options.options

  //create database helpers
  let ASDatabaseHelper = new DatabaseHelper();
  let obj = await chrome.storage.local.get("ASdatabase")
  ASDatabaseHelper.database = obj.ASdatabase;

  let MBFCDatabaseHelper = new DatabaseHelper();
  obj = await chrome.storage.local.get("MBFCdatabase");
  MBFCDatabaseHelper.database = obj.MBFCdatabase;

  //check if page is google page
  if(!(location.href.split(".")[1] == "google")){
    return;
  }

  //get all elements and hrefs in page
  let aElements = document.getElementsByTagName('a');
  let hrefList = [];
  for(var i = 0;i < aElements.length;i++){
    let obj = {"href":aElements[i].href};
    hrefList.push(obj);
  }

  //this line is used to remove duplicated hrefs in the array.
  hrefList = [...new Set(hrefList.map(a => JSON.stringify(a)))].map(a => JSON.parse(a));

  //iterate through list and find ratings for each href
  for(var i = 0;i < hrefList.length;i++){
    let ASsearch
    let MBFCsearch
    if(options.ASData){
      ASsearch = ASDatabaseHelper.search(hrefList[i].href)
    }
    if(options.MBFCData){
      MBFCsearch = MBFCDatabaseHelper.search(hrefList[i].href)
    }
    hrefList[i].ASbias = ASsearch?.bias
    hrefList[i].MBFCbias = MBFCsearch?.bias
    hrefList[i].MBFCfactual = MBFCsearch?.factual
  }

  //iterate through <a> elements
  for(var i = 0;i < aElements.length;i++){
    var href = aElements[i].href;
    //iterate over hrefs with ratings
    for(var j = 0;j < hrefList.length;j++){
      //if an elements has an href that matches the href attribute of the <a> element in the <a> array, 
      //add stickers and tooltips to <a> element based on user options
      if(href == hrefList[j].href){
        if(options.tooltips){
          addTooltip(hrefList[j],aElements[i])
        }
        if(options.stickers){
          addSticker(createMBFCFactualSticker(hrefList[j]), aElements[i]);
          addSticker(createMBFCBiasSticker(hrefList[j]), aElements[i]);
          addSticker(createAllsidesBiasSticker(hrefList[j]), aElements[i]);
        }
      }
    }
  }
}

function addTooltip(source,aElement){
  var tooltipMessage = ""
  if (source.ASbias){
    tooltipMessage = tooltipMessage + "All Sides: " + source.ASbias + " Bias\r\n"
  }
    if (source.MBFCbias){
      tooltipMessage = tooltipMessage + "Media Bias Fact Check: " + source.MBFCbias + " Bias\r\n"
      tooltipMessage = tooltipMessage + "Media Bias Fact Check: " + source.MBFCfactual + " Sourcing"
    }
    if(tooltipMessage !== ""){
      aElement.title = tooltipMessage
    }
}

function createMBFCFactualSticker (source){
  var factual = source.MBFCfactual;
  var elementType = "span";
  var sticker;
  var style = "color:#FFFFFF;border-radius: 5px;width: fit-content;font-size: 12px;";
  if(stickerStyle?.[factual]){
    sticker = document.createElement(elementType);
    sticker.innerHTML = "Media Bias Fact Check: " + factual + " Sourcing" + "<br>"
    //sticker.innerHTML = sticker.innerHTML + "<br>"
    sticker.setAttribute("style",stickerStyle?.[factual]+style);
    sticker.setAttribute("id",factual);
    return sticker;
  }
  else{
    return null
  }
}

function createMBFCBiasSticker (source){
  var bias = source.MBFCbias;
  var elementType = "span";
  var sticker;
  var style = "color:#FFFFFF;border-radius: 5px;width: fit-content;font-size: 12px;";
  if(stickerStyle?.[bias]){
    sticker = document.createElement(elementType);
    sticker.innerHTML = "Media Bias Fact Check: " + bias + " Bias" + "<br>"
    sticker.setAttribute("style",stickerStyle?.[bias]+style);
    sticker.setAttribute("id",bias);
    return sticker;
  }
  else{
    return null
  }
}

function createAllsidesBiasSticker (source){
  var bias = source.ASbias
  var thing = "Allsides: " + source.ASbias + " Bias<br>";
  var elementType = "span";
  var sticker;
  var style = "color:#FFFFFF;border-radius: 5px;width: fit-content;font-size: 12px;";

  if(stickerStyle?.[bias]){
    sticker = document.createElement(elementType);
    sticker.innerHTML = "All Sides: " + bias + " bias" + "<br>"
    sticker.setAttribute("style",stickerStyle?.[bias]+style);
    sticker.setAttribute("id",bias);
    return sticker;
  }
  else{
    return null
  }
}

const googleHTMLClasses = ["yuRUbf","ct3b9e","X5OiLe","WlydOe"]

function addSticker(sticker, aElement) {
  var parentNode = aElement.parentNode;  
  if(sticker !== null && (googleHTMLClasses.includes(parentNode.getAttribute("class"))||googleHTMLClasses.includes(aElement.getAttribute("class")))){
    //below code performs "insert after"
    parentNode.parentNode.insertBefore(sticker, parentNode.nextSibling);
  }
}