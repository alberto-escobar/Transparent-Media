let nodata = document.getElementById("no-data");

chrome.storage.local.get("popup", function(obj) {
  var ASdata = obj.popup;
  //is AS data in popup storage is not "no data", create the HTML elements and add it to the popup
  if (ASdata !== "no data"){
    nodata.setAttribute("style","display:none;");
    let ASprofile = document.getElementById("AS");

    let link = document.createElement("a")
    link.setAttribute("href",ASdata.allsidesurl);
    link.setAttribute("target","_blank");
    link.setAttribute("title","Click here to go to the Allsides profile");
    let element = document.createElement("img")
    element.setAttribute("src","icons/allsideslogo.png")
    element.setAttribute("style","max-width: 150px;")
    link.appendChild(element)
    ASprofile.append(link)

    element = document.createElement("h2")
    element.innerHTML = ASdata.name
    element.setAttribute("style","text-align: center")
    ASprofile.append(element)

    element = document.createElement("h3")
    element.innerHTML = "Political Bias: " + ASdata.bias
    ASprofile.append(element)

    element = document.createElement("h3")
    element.innerHTML = "Confidence Level: " + ASdata.confidence
    ASprofile.append(element)

    element = document.createElement("h3")
    element.innerHTML = "Community Votes:"
    ASprofile.append(element)

    var total = parseInt(ASdata.agreement) + parseInt(ASdata.disagreement);
    var agreementPercent = (parseInt(ASdata.agreement)/total) * 100;
    var disagreementPercent = (parseInt(ASdata.disagreement)/total) * 100;
    agreement = document.createElement("div")
    agreement.innerHTML = ASdata.agreement + "<br>" + " agree";
    agreement.setAttribute("style","text-align:center;color:white;float:left;"+"width:"+agreementPercent.toString()+"%;background-color:green");
    disagreement = document.createElement("div")
    disagreement.innerHTML = ASdata.disagreement + "<br>" + " disagree";
    disagreement.setAttribute("style","text-align:center;color:white;float:left;"+"width:"+disagreementPercent.toString()+"%;background-color:red");
    votes = document.createElement("div")
    votes.appendChild(agreement);
    votes.appendChild(disagreement);
    ASprofile.append(votes)

    element = document.createElement("br")
    ASprofile.append(element) 
    element = document.createElement("br")
    ASprofile.append(element) 
    element = document.createElement("hr")
    ASprofile.append(element) 
  }
  else { 
    //do nothing
  }
});

chrome.storage.local.get("MBFCpopup", function(obj) {
  var MBFCdata = obj.MBFCpopup;
  //is MBFC data in popup storage is not "no data", create the HTML elements and add it to the popup
  if (MBFCdata !== ("no data")){
    nodata.setAttribute("style","display:none;");
    let MBFCprofile = document.getElementById("MBFC");

    let link = document.createElement("a")
    link.setAttribute("href",MBFCdata.profile);
    link.setAttribute("target","_blank");
    link.setAttribute("title","Click here to go to the MBFC profile");
    let element = document.createElement("img")
    element.setAttribute("src","icons/MBFClogo.png")
    element.setAttribute("style","max-width: 150px;")
    link.appendChild(element)
    MBFCprofile.append(link)

    element = document.createElement("h2")
    element.innerHTML = MBFCdata.name
    element.setAttribute("style","text-align: center;")
    MBFCprofile.append(element)

    element = document.createElement("h3")
    element.innerHTML = "Political Bias: " + MBFCdata.bias
    MBFCprofile.append(element)

    element = document.createElement("h3")
    element.innerHTML = "Factual Reporting: " + MBFCdata.factual
    MBFCprofile.append(element)

    element = document.createElement("h3")
    element.innerHTML = "Credibility Rating: " + MBFCdata.credibility
    MBFCprofile.append(element) 

    element = document.createElement("hr")
    MBFCprofile.append(element)       
  }
  else {
    //do nothing
  }
});

//following is exceuted once the popup html has loaded. 
//Here event listeners are added to buttons redirect you to a new tab based on what they click
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

  var MBFCButton = document.getElementById('MBFCsite');
  MBFCButton.addEventListener('click', function () {
    chrome.tabs.create({ url:"https://mediabiasfactcheck.com/" });
  });
  
  var albertoButton = document.getElementById('alberto');
  albertoButton.addEventListener('click', function () {
    chrome.tabs.create({ url:"https://alberto-escobar.github.io/" });
  });
});

