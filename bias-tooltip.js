var options;
//fetch options from storage so that content script know weather to but stickers, tooltips, or boths.
chrome.storage.local.get("options", function(obj) {
  options = obj.options;
});

//main function that runs this content script. If the current URL has no data on it, 
//it will send an array of URLs present on the active tab to the background script to query and wait for a reply.
chrome.runtime.sendMessage({"data": [{"href":location.href, "bias": "no data"}]}, function(response) {
  if(response.data[0].bias == "no data"){
    //generate an array of URLs generated from an array of <a> elements that appear on the active tab
    var links = document.getElementsByTagName('a');
    var list = [];
    for(var i = 0;i < links.length;i++){
      var obj = {"href":links[i].href, "bias": "no data"};
      list.push(obj);
    }

    //this line is used to remove duplicated URLs in the array.
    list = [...new Set(list.map(a => JSON.stringify(a)))].map(a => JSON.parse(a));
    
    //send array to background script to process
    chrome.runtime.sendMessage({"data": list}, function(response) {
      var data = response.data;
      //iterate over the array of <a> 
      for(var i = 0;i < links.length;i++){
        var href = links[i].href;
        //iterate over the array of URLs that have appended bias information 
        for(var j = 0;j < data.length;j++){
          //if the URL on the URL array matches the href attribute of the <a> element in the <a> array
          //and the active tab is on google, and not in an image search then insert sticker or tooltip (based on current options)  
          if(href == data[j].href && data[j].bias !== "no data" && 
          location.href.split(".")[1] == "google" && 
          !location.href.includes("tbm=isch")){
            if(options.tooltips){
              links[i].title = "polical bias: " + data[j].bias;
            }

            if(options.stickers){
              addSticker(createBiasSticker(data[j]), links[i]);
            }
          }
        }
      }
    });
  }
});

//create html element of a sticker based on source data.
function createBiasSticker (source){
  var bias = source.bias;
  var elementType = "span";
  var sticker;
  var style = "color:#FFFFFF;border-radius: 5px;width: min-content;font-size: 12px;";
  if (bias == "left"){
    sticker = document.createElement(elementType);
    sticker.innerHTML = bias;
    sticker.setAttribute("style","background-color:#2c64a4;"+style);
    sticker.setAttribute("id",bias);
  }
  else if (bias == "left-center"){
    sticker = document.createElement(elementType);
    sticker.innerHTML = bias;
    sticker.setAttribute("style","background-color:#9cccec;"+style);
    sticker.setAttribute("id",bias);
  }
  else if (bias == "center"){
    sticker = document.createElement(elementType);
    sticker.innerHTML = bias;
    sticker.setAttribute("style","background-color:#9464a4;"+style);
    sticker.setAttribute("id",bias);
  }
  else if (bias == "right-center"){
    sticker = document.createElement(elementType);
    sticker.innerHTML = bias;
    sticker.setAttribute("style","background-color:#cc9c9c;"+style);
    sticker.setAttribute("id",bias);
  }
  else if (bias == "right"){
    sticker = document.createElement(elementType);
    sticker.innerHTML = bias;
    sticker.setAttribute("style","background-color:#cc2424;"+style);
    sticker.setAttribute("id",bias);
  }
  else if (bias == "mixed"){
    sticker = document.createElement(elementType);
    sticker.innerHTML = bias;
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
  if(parentNode.getAttribute("class") == "yuRUbf"){ 
    insertAfter(sticker, parentNode);
    console.log("case 1: injected " + sticker.innerHTML + " bias data into following href: " + link.href + " at the element with class " + parentNode.getAttribute("class"));
    return true;
  }
  //insert into Video search result in video tab
  else if(parentNode.getAttribute("class") == "ct3b9e"){ 
    insertAfter(sticker, parentNode);
    console.log("case 2: injected " + sticker.innerHTML + " bias data into following href: " + link.href + " at the element with class " + parentNode.getAttribute("class"));
    return true;
  }
  //insert into Video result in all tab
  else if(link.getAttribute("class") == "X5OiLe"){ 
    insertAfter(sticker, link);
    console.log("case 3: injected " + sticker.innerHTML + " bias data into following href: " + link.href + " at the element with class " + parentNode.getAttribute("class"));
    return true;
  }
  //insert into news card or news result in all tab
  else if(link.getAttribute("class") == "WlydOe"){ 
    insertAfter(sticker, parentNode);
    console.log("case 4: injected " + sticker.innerHTML + " bias data into following href: " + link.href + " at the element with class " + parentNode.getAttribute("class"));
    return true;
  }
  else {
    return false;
  }

}