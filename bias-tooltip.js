var options;
chrome.storage.local.get("options", function(obj) {
  options = obj.options
});

chrome.runtime.sendMessage({"data": [{"href":location.href, "bias": "no data"}]}, function(response) {
  if(response.data[0].bias == "no data"){
    //console.log("checking page for news articles to inject data into...")
    var links = document.getElementsByTagName('a');
    var list = []
    for(var i = 0;i < links.length;i++){
      var obj = {"href":links[i].href, "bias": "no data"};
      list.push(obj);
    }

    //this line is used to remove duplicated href in the list array.
    list = [...new Set(list.map(a => JSON.stringify(a)))].map(a => JSON.parse(a));

    chrome.runtime.sendMessage({"data": list}, function(response) {
      var data = response.data;
      var links = document.getElementsByTagName('a');
      for(var i = 0;i < links.length;i++){
        var href = links[i].href
        for(var j = 0;j < data.length;j++){
          if(href == data[j].href && data[j].bias !== "no data" && location.href.split(".")[1] == "google" && !location.href.includes("tbm=isch")){ //put another logic statement that the current page should be a google page
            if(options.tooltips){
              links[i].title = "polical bias: " + data[j].bias;
            }

            if(location.href.split(".")[1] == "google" && !location.href.includes("tbm=isch") && options.stickers){
              addSticker(createBiasSticker(data[j]), links[i]);
            }
          }
        }
      }
    });
  }
});

//create html element of a stick based on source data.
function createBiasSticker (source){
  var bias = source.bias;
  var elementType = "span"
  var sticker;
  var style = "color:#FFFFFF;border-radius: 5px;width: min-content;font-size: 12px;"
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

//insert after function for DOM stuff
function insertAfter(newNode, existingNode) {
  existingNode.parentNode.insertBefore(newNode, existingNode.nextSibling);
}

//adds the sticker to the the node
function addSticker(sticker, link) {
  var grandparentNode = link.parentNode.parentNode;
  var parentNode = link.parentNode
  if(parentNode.getAttribute("class") == "yuRUbf"){ //insert into regular search result in all tab
    /*
    var lol1 = link.querySelector(".vJOb1e").querySelector(".iRPxbe").querySelector(".mCBkyc")
    var lol2 = link.querySelector(".rCXe4d").querySelector(".g5wfEd").querySelector(".mCBkyc")
    var lol3 = link.querySelector(".vJOb1e").querySelector(".iRPxbe").querySelector(".mCBkyc")
    if(lol1 !== null){
      insertAfter(sticker, lol1);
    }
    else if (lol2 !== null){
      insertAfter(sticker, lol2);
    }
    else if (lol3 !== null){
      insertAfter(sticker, lol3);
    }
    */
    insertAfter(sticker, parentNode);
    console.log("case 1: injected " + sticker.innerHTML + " bias data into following href: " + link.href + " at the element with class " + parentNode.getAttribute("class"));
  }
  else if(parentNode.getAttribute("class") == "ct3b9e"){ //insert into Video search result in video tab
    insertAfter(sticker, parentNode);
    console.log("case 2: injected " + sticker.innerHTML + " bias data into following href: " + link.href + " at the element with class " + parentNode.getAttribute("class"));
  }
  else if(link.getAttribute("class") == "X5OiLe"){ //insert into Video result in all tab
    insertAfter(sticker, link);
    console.log("case 3: injected " + sticker.innerHTML + " bias data into following href: " + link.href + " at the element with class " + parentNode.getAttribute("class"));
  }
  else if(link.getAttribute("class") == "WlydOe"){ //insert into news card or news result in all tab
    insertAfter(sticker, parentNode);
    console.log("case 4: injected " + sticker.innerHTML + " bias data into following href: " + link.href + " at the element with class " + parentNode.getAttribute("class"));
  }
  else {
    return 0;
  }

}