//fetch options from storage so that content script knows weather to put stickers, tooltips, or boths.
var options;
chrome.storage.local.get("options", function(obj) {
  options = obj.options;
});

//main function that runs this content script. If the current URL has no data from allsides or MBFC on it, 
//it will send an array of URLs present on the active tab to the background script to query and wait for a reply.
chrome.runtime.sendMessage({"data": [{"href":location.href, "bias": "no data"}]}, function(response) {
  if(response.data[0].bias == "no data" && response.data[0].MBFCbias == "no data"){
    //generate an array of URLs generated from an array of <a> elements that appear on the active tab
    var links = document.getElementsByTagName('a');
    var list = [];
    for(var i = 0;i < links.length;i++){
      var obj = {"href":links[i].href, "bias": "no data"};
      list.push(obj);
    }

    //this line is used to remove duplicated URLs in the array.
    list = [...new Set(list.map(a => JSON.stringify(a)))].map(a => JSON.parse(a));
    
    //send array to background script to lookup in databases
    chrome.runtime.sendMessage({"data": list}, function(response) {
      var data = response.data;
      //iterate over the array of <a> 
      for(var i = 0;i < links.length;i++){
        var href = links[i].href;
        //iterate over the array of URLs that have appended bias information 
        for(var j = 0;j < data.length;j++){
          //if the URL on the URL array matches the href attribute of the <a> element in the <a> array
          //and the active tab is on google, and not in an image search then insert stickers or tooltips (based on options)  
          if(href == data[j].href && 
          location.href.split(".")[1] == "google" && 
          !location.href.includes("tbm=isch")){
            if(options.tooltips){
              var tooltipMessage = ""
              if (data[j].bias !== "no data"){
                tooltipMessage = tooltipMessage + "Allsides: " + data[j].bias + " bias\r\n"
              }
              if (data[j].MBFCbias !== "no data"){
                tooltipMessage = tooltipMessage + "MBFC: " + data[j].MBFCbias + " bias\r\n"
              }
              if (!data[j].MBFCfactual.includes("no")){
                tooltipMessage = tooltipMessage + "MBFC: " + data[j].MBFCfactual + " factual reporting"
              }
              if(tooltipMessage !== ""){
                links[i].title = tooltipMessage
              }
            }
            if(options.stickers){
              addSticker(createMBFCFactualSticker(data[j]), links[i]);
              addSticker(createMBFCBiasSticker(data[j]), links[i]);
              addSticker(createAllsidesBiasSticker(data[j]), links[i]);
            }
          }
        }
      }
    });
  }
});

//create html element of a sticker based on MBFC factual data.
function createMBFCFactualSticker (source){
  var factual = source.MBFCfactual;
  var elementType = "span";
  var sticker;
  var style = "color:#FFFFFF;border-radius: 5px;width: min-content;font-size: 12px;";
  if(!factual.includes("no")){
    sticker = document.createElement(elementType);
    sticker.innerHTML = "MBFC: " + factual + " factual reporting"
    sticker.innerHTML = sticker.innerHTML + "<br>"
  }
  else{
    return null
  }

  if(factual == "very high"){
    sticker.setAttribute("style","background-color:#1a9830;"+style);
    sticker.setAttribute("id",factual);
  }
  else if(factual == "high"){
    sticker.setAttribute("style","background-color:#1a9830;"+style);
    sticker.setAttribute("id",factual);
  }
  else if(factual == "mostly"){
    sticker.setAttribute("style","background-color:#88a81e;"+style);
    sticker.setAttribute("id",factual);
  }
  else if(factual == "mixed"){
    sticker.setAttribute("style","background-color:#E36C0A;"+style);
    sticker.setAttribute("id",factual);
  }
  else if(factual == "low"){
    sticker.setAttribute("style","background-color:#FF0000;"+style);
    sticker.setAttribute("id",factual);
  }
  else if(factual == "very low"){
    sticker.setAttribute("style","background-color:#FF0000;"+style); 
    sticker.setAttribute("id",factual);
  }
  return sticker;
}

//create html element of a sticker based on MBFC bias data.
function createMBFCBiasSticker (source){
  var bias = source.MBFCbias;
  var elementType = "span";
  var sticker;
  var style = "color:#FFFFFF;border-radius: 5px;width: min-content;font-size: 12px;";
  if(bias !== "no data"){
    sticker = document.createElement(elementType);
    sticker.innerHTML = "MBFC: " + bias
    
  }
  else{
    return null
  }
  if(bias == "left"){
    sticker.setAttribute("style","background-color:#2c64a4;"+style);
    sticker.setAttribute("id",bias);
    sticker.innerHTML = sticker.innerHTML + " bias"
  }
  else if(bias == "left-center"){
    sticker.setAttribute("style","background-color:#9cccec;"+style);
    sticker.setAttribute("id",bias);
    sticker.innerHTML = sticker.innerHTML + " bias"
  }
  else if(bias == "center"){
    sticker.setAttribute("style","background-color:#9464a4;"+style);
    sticker.setAttribute("id",bias);
    sticker.innerHTML = sticker.innerHTML + " bias"
  }
  else if(bias == "right-center"){
    sticker.setAttribute("style","background-color:#cc9c9c;"+style);
    sticker.setAttribute("id",bias);
    sticker.innerHTML = sticker.innerHTML + " bias"
  }
  else if(bias == "right"){
    sticker.setAttribute("style","background-color:#cc2424;"+style);
    sticker.setAttribute("id",bias);
    sticker.innerHTML = sticker.innerHTML + " bias"
  }
  else if(bias == "satire"){
    sticker.setAttribute("style","background-color:#d3db39;"+style); 
    sticker.setAttribute("id",bias);
  }
  else if(bias == "pro-science"){
    sticker.setAttribute("style","background-color:#1a9830;"+style); 
    sticker.setAttribute("id",bias);
  }
  else if(bias == "fake-news"){
    sticker.setAttribute("style","background-color:#000000;"+style); 
    sticker.setAttribute("id",bias);
  }
  else if(bias == "conspiracy"){
    sticker.setAttribute("style","background-color:#000000;"+style); 
    sticker.setAttribute("id",bias);
  }
  sticker.innerHTML = sticker.innerHTML + "<br>"
  return sticker;
}

//create html element of a sticker based on alsides bias data.
function createAllsidesBiasSticker (source){
  var bias = source.bias
  var thing = "Allsides: " + source.bias + " bias<br>";
  var elementType = "span";
  var sticker;
  var style = "color:#FFFFFF;border-radius: 5px;width: min-content;font-size: 12px;";
  if (bias == "left"){
    sticker = document.createElement(elementType);
    sticker.innerHTML = thing;
    sticker.setAttribute("style","background-color:#2c64a4;"+style);
    sticker.setAttribute("id",bias);
  }
  else if (bias == "left-center"){
    sticker = document.createElement(elementType);
    sticker.innerHTML = thing;
    sticker.setAttribute("style","background-color:#9cccec;"+style);
    sticker.setAttribute("id",bias);
  }
  else if (bias == "center"){
    sticker = document.createElement(elementType);
    sticker.innerHTML = thing;
    sticker.setAttribute("style","background-color:#9464a4;"+style);
    sticker.setAttribute("id",bias);
  }
  else if (bias == "right-center"){
    sticker = document.createElement(elementType);
    sticker.innerHTML = thing;
    sticker.setAttribute("style","background-color:#cc9c9c;"+style);
    sticker.setAttribute("id",bias);
  }
  else if (bias == "right"){
    sticker = document.createElement(elementType);
    sticker.innerHTML = thing;
    sticker.setAttribute("style","background-color:#cc2424;"+style);
    sticker.setAttribute("id",bias);
  }
  else if (bias == "mixed"){
    sticker = document.createElement(elementType);
    sticker.innerHTML = thing;
    sticker.setAttribute("style","background-color:#f4e3fa;"+style);
    sticker.setAttribute("id",bias);
  }
  else {
    return null;
  }
  return sticker;
}

//insert after function for inserting a node after an existing node
function insertAfter(newNode, existingNode) {
  existingNode.parentNode.insertBefore(newNode, existingNode.nextSibling);
}

//adds the sticker to the the node
function addSticker(sticker, link) {
  var parentNode = link.parentNode;
  //insert into regular search result in all tab
  if(sticker == null){
    return false;
  }
  else {
    //do nothing
  }

  //insert into general result in all tab
  if(parentNode.getAttribute("class") == "yuRUbf"){ 
    insertAfter(sticker, parentNode);
    console.log("Google case 1: injected " + sticker.innerHTML + " bias data into following href: " + link.href + " at the element with class " + parentNode.getAttribute("class"));
    return true;
  }
  //insert into Video search result in video tab
  else if(parentNode.getAttribute("class") == "ct3b9e"){ 
    insertAfter(sticker, parentNode);
    console.log("Google case 2: injected " + sticker.innerHTML + " bias data into following href: " + link.href + " at the element with class " + parentNode.getAttribute("class"));
    return true;
  }
  //insert into Video result in all tab
  else if(link.getAttribute("class") == "X5OiLe"){ 
    insertAfter(sticker, link);
    console.log("Google case 3: injected " + sticker.innerHTML + " bias data into following href: " + link.href + " at the element with class " + parentNode.getAttribute("class"));
    return true;
  }
  //insert into news card or news result in all tab
  else if(link.getAttribute("class") == "WlydOe"){ 
    insertAfter(sticker, parentNode);
    console.log("Google case 4: injected " + sticker.innerHTML + " bias data into following href: " + link.href + " at the element with class " + parentNode.getAttribute("class"));
    return true;
  }
/*
  //reddit cases
  else if(link.getAttribute("class") == "_13svhQIUZqD9PVzFcLwOKT styled-outbound-link"){ 
    insertAfter(sticker, parentNode);
    console.log("Reddit case 1: injected " + sticker.innerHTML + " bias data into following href: " + link.href + " at the element with class " + parentNode.getAttribute("class"));
    return true;
  }

  //duckduckgo cases
  else if(link.getAttribute("class") == "eVNpHGjtxRBq_gLOfGDr"){ 
    insertAfter(sticker, parentNode);
    console.log("Duckduckgo case 1: injected " + sticker.innerHTML + " bias data into following href: " + link.href + " at the element with class " + parentNode.getAttribute("class"));
    return true;
  }
  else if(link.getAttribute("class") == "module--carousel__body__title js-carousel-item-title"){ 
    insertAfter(sticker, parentNode);
    console.log("Duckduckgo case 2: injected " + sticker.innerHTML + " bias data into following href: " + link.href + " at the element with class " + parentNode.getAttribute("class"));
    return true;
  }
  else if(link.getAttribute("class") == "result__a"){ 
    insertAfter(sticker, parentNode);
    console.log("Duckduckgo case 3: injected " + sticker.innerHTML + " bias data into following href: " + link.href + " at the element with class " + parentNode.getAttribute("class"));
    return true;
  }
  else {
    console.log("Could not insert stickers with" + sticker.innerHTML + " bias data into following href: " + link.href)
    return false;
  }
*/
}