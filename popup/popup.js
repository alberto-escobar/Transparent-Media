//styling map for getting style of various media bias or sourcing ratings to be displayed on popup.
const stylingMap = 
  {
    "Left":"background-color:#2c64a4;color:#ffffff;",
    "Lean Left":"background-color:#9cccec;color:#ffffff;",
    "Center":"background-color:#9464a4;color:#ffffff;",
    "All Sides":"background-color:#9464a4;color:#ffffff;",
    "Lean Right":"background-color:#cc9c9c;color:#ffffff;",
    "Right":"background-color:#cc2424;color:#ffffff;",
    "Satire":"background-color:#d3db39;color:#ffffff;",
    "Pro-Science":"background-color:#1a9830;color:#ffffff;",
    "Fake News":"background-color:#000000;color:#ffffff;",
    "Conspiracy":"background-color:#000000;color:#ffffff;",
    "Very High":"background-color:#1a9830;color:#ffffff;",
    "High":"background-color:#1a9830;color:#ffffff;",
    "Moderate":"background-color:#88a81e;color:#ffffff;",
    "Mixed":"background-color:#E36C0A;color:#ffffff;",
    "Low":"background-color:#FF0000;color:#ffffff;",
    "Very Low":"background-color:#FF0000;color:#ffffff;"
  }

//Event listener: When page is loaded add event listeners for buttons at the bottom of popup
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

//Main
generateMBFCPopup()
generateASPopup()

async function generateMBFCPopup(){
  let nodata = document.getElementById("no-data");
  let MBFCprofile = document.getElementById("MBFC");
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
    link.setAttribute("title","Click here to go to the Media Bias Fact Check profile");
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
    element.innerHTML = "Media Bias Rating: <span style=" + stylingMap[MBFCdata.bias] + ">&nbsp;" + MBFCdata.bias + "&nbsp;</span>"
    element.setAttribute("title","Media bias rating is determined by mediabiasfactcheck.com by reviewing content published by the news site to determine where their media bias lies on the left right political spectrum.");
    MBFCprofile.append(element)

    element = document.createElement("h3")
    element.innerHTML = "Sourcing Rating: <span style=" + stylingMap[MBFCdata.factual] + ">&nbsp;" + MBFCdata.factual + "&nbsp;</span>"
    element.setAttribute("title","Sourcing Rating is determined by mediabiasfactcheck.com by reviewing the quality of the sources used in articles published by the news site. Sourcing rating has the following levels: very low, low, mixed, moderate, high, very high");
    MBFCprofile.append(element)

    element = document.createElement("hr")
    MBFCprofile.append(element)
  }       
}

async function generateASPopup(){
  let nodata = document.getElementById("no-data");
  let ASprofile = document.getElementById("AS");
  let obj = await chrome.storage.local.get("ASPopupData")
  ASdata = obj.ASPopupData

  if(ASdata === "no data"){
    ASprofile.setAttribute("style","display:none;");
  }
  else{
    nodata.setAttribute("style","display:none;");

    let link = document.createElement("a")
    link.setAttribute("href",ASdata.allsidesurl);
    link.setAttribute("target","_blank");
    link.setAttribute("title","Click here to go to the All Sides profile");
    let element = document.createElement("img")
    element.setAttribute("src","../icons/allsideslogo.png")
    element.setAttribute("style","max-width: 150px;")
    link.appendChild(element)
    ASprofile.append(link)

    element = document.createElement("h2")
    element.innerHTML = ASdata.name
    element.setAttribute("style","text-align: center")
    ASprofile.append(element)

    element = document.createElement("h3")
    element.innerHTML = "Media Bias Rating: <span style=" + stylingMap[ASdata.bias] + ">&nbsp;" + ASdata.bias + "&nbsp;</span>"
    element.setAttribute("title","Media bias rating is determined by allsides.com by reviewing content published by the news site to determine where their media bias lies on the left right political spectrum.");
    ASprofile.append(element)

    element = document.createElement("h3")
    element.innerHTML = "Community Votes:"
    element.setAttribute("title","Community agreement is determined by allsides.com by their voting system, those who choose to vote can dictate whether they agree or disagree with the media bias rating assigned.");
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
}




