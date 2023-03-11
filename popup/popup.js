let nodata = document.getElementById("no-data");
let ASprofile = document.getElementById("AS");
let MBFCprofile = document.getElementById("MBFC");

generateASPopup()
generateMBFCPopup()

async function generateASPopup(){
  //get allsides data from storage
  let obj = await chrome.storage.local.get("ASPopupData")
  ASdata = obj.ASPopupData
  //if the data in storage states "no data", hide the allsides element in the popup, otherwise generate the allsides element
  if(ASdata === "no data"){
    ASprofile.setAttribute("style","display:none;");
  }
  else{
    nodata.setAttribute("style","display:none;");
    //create allsides icon with link to allsides profile
    let link = document.createElement("a")
    link.setAttribute("href",ASdata.allsidesurl);
    link.setAttribute("target","_blank");
    link.setAttribute("title","Click here to go to the Allsides profile");
    let element = document.createElement("img")
    element.setAttribute("src","../icons/allsideslogo.png")
    element.setAttribute("style","max-width: 150px;")
    link.appendChild(element)
    ASprofile.append(link)
    //create title of news source
    element = document.createElement("h2")
    element.innerHTML = ASdata.name
    element.setAttribute("style","text-align: center")
    ASprofile.append(element)
    //create political bias header
    element = document.createElement("h3")
    element.innerHTML = "Political Bias: " + ASdata.bias
    ASprofile.append(element)
    //create confidence level header
    element = document.createElement("h3")
    element.innerHTML = "Confidence Level: " + ASdata.confidence
    ASprofile.append(element)
    //create community votes section
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
    //create new lines and horizantal line for ending element
    element = document.createElement("br")
    ASprofile.append(element) 
    element = document.createElement("br")
    ASprofile.append(element) 
    element = document.createElement("hr")
    ASprofile.append(element)
  } 
}

async function generateMBFCPopup(){
  let obj = await chrome.storage.local.get("MBFCPopupData")
  MBFCdata = obj.MBFCPopupData
  
  if(MBFCdata === "no data"){
    MBFCprofile.setAttribute("style","display:none;");
  }
  else{
    nodata.setAttribute("style","display:none;");

    let link = document.createElement("a")
    link.setAttribute("href",MBFCdata.profile);
    link.setAttribute("target","_blank");
    link.setAttribute("title","Click here to go to the MBFC profile");
    let element = document.createElement("img")
    element.setAttribute("src","../icons/MBFClogo.png")
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
}

//Event listeners for buttons to redirect you to a new tab based on what they click
document.addEventListener('DOMContentLoaded', function () {
  var settingsButton = document.getElementById('options');
  settingsButton.addEventListener('click', function () {
    var url = "chrome-extension://" + chrome.runtime.id + "/options/options.html";
    chrome.tabs.create({ url });
  });

  var historyButton = document.getElementById('history');
  historyButton.addEventListener('click', function () {
    var url = "chrome-extension://" + chrome.runtime.id + "/history/history.html";
    chrome.tabs.create({ url });
  });
});

