let title = document.getElementById("title");
let bias = document.getElementById("bias");
let confidence = document.getElementById("confidence");
let allsidesurl = document.getElementById("allsidesurl");
let agreement = document.getElementById("agreement");
let disagreement = document.getElementById("disagreement");

//Fetch popup data from storage. I did this because it worked and I dont plan to change it
chrome.storage.local.get("popup", function(obj) {
  var recievedData = obj.popup;
  //if the popup in storage has data (essentially the active tab has a URL that is present in the database) 
  //then update the popup html
  if (recievedData !== "no data"){
    title.innerHTML = recievedData.name;
    allsidesurl.href = recievedData.allsidesurl;
    allsidesurl.text = "Click here to view this news source allsides profile.";
    bias.innerHTML = recievedData.bias;
    confidence.innerHTML = recievedData.confidence;

    //next few lines was how the green/red bars showing community agreement show up
    var total = parseInt(recievedData.agreement) + parseInt(recievedData.disagreement);
    var agreementPercent = (parseInt(recievedData.agreement)/total) * 100;
    var disagreementPercent = (parseInt(recievedData.disagreement)/total) * 100;
    agreement.innerHTML = recievedData.agreement + " agree";
    agreement.setAttribute("style",agreement.getAttribute("style")+"width:"+agreementPercent.toString()+"%;background-color:green");
    disagreement.innerHTML = recievedData.disagreement + " disagree";
    disagreement.setAttribute("style",disagreement.getAttribute("style")+"width:"+disagreementPercent.toString()+"%;background-color:red");
  }
  //if the popup in storage has no data (The active tab has a URL that is not present in the database) 
  //then do not update anything in the popup html
  else { 
    title.innerHTML = "No Data";
  }
});

//following is exceuted once the popup html has loaded. 
//Here event listeners are added to redirect the used to a new tab based on what they click
document.addEventListener('DOMContentLoaded', function () {
  var settingsButton = document.getElementById('options');
  settingsButton.addEventListener('click', function () {
    var url = "chrome-extension://" + chrome.runtime.id + "/options.html";
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

