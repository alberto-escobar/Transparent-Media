// Initialize button with user's preferred color
let title = document.getElementById("title");
let bias = document.getElementById("bias");
let confidence = document.getElementById("confidence");
let allsidesurl = document.getElementById("allsidesurl");
let agreement = document.getElementById("agreement");
let disagreement = document.getElementById("disagreement");

chrome.storage.local.get("popup", function(obj) {
  var recievedData = obj.popup
  if (recievedData !== "no data"){
    var total = parseInt(recievedData.agreement) + parseInt(recievedData.disagreement)
    var agreementPercent = (parseInt(recievedData.agreement)/total) * 100
    var disagreementPercent = (parseInt(recievedData.disagreement)/total) * 100
    title.innerHTML = recievedData.name;
    bias.innerHTML = recievedData.bias;
    confidence.innerHTML = recievedData.confidence;
    agreement.innerHTML = recievedData.agreement + " agree";
    agreement.setAttribute("style",agreement.getAttribute("style")+"width:"+agreementPercent.toString()+"%;background-color:green");
    disagreement.innerHTML = recievedData.disagreement + " disagree";
    disagreement.setAttribute("style",disagreement.getAttribute("style")+"width:"+disagreementPercent.toString()+"%;background-color:red");
    allsidesurl.href = recievedData.allsidesurl;
    allsidesurl.text = "Click here to view this news source allsides profile.";

  }
  else {
    
    title.innerHTML = "No Data";
  }

});



document.addEventListener('DOMContentLoaded', function () {
  var settingsButton = document.getElementById('options');
  settingsButton.addEventListener('click', function () {
    var url = "chrome-extension://" + chrome.runtime.id + "/options.html"
    chrome.tabs.create({ url });
  });
  var allsidesButton = document.getElementById('allsides');
  allsidesButton.addEventListener('click', function () {
    chrome.tabs.create({ url:"https://www.allsides.com/unbiased-balanced-news" });
  });
  var albertoButton = document.getElementById('alberto');
  albertoButton.addEventListener('click', function () {
    chrome.tabs.create({ url:"https://alberto-escobar.github.io/" });
  });

});

