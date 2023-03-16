//Listener Event: when options page is loaded, fetch options from local storage, and add listener events to input elements.
document.addEventListener('DOMContentLoaded', function () {
    //Fetch options from local storage and set the checkboxes to the correct state
    var options;
    chrome.storage.local.get("options", function(obj) {
      options = obj.options;
      tooltipsCheckbox.checked = options.tooltips;
      stickersCheckbox.checked = options.stickers;
      ASCheckbox.checked = options.ASData;
      MBFCCheckbox.checked = options.MBFCData;
      historyCheckbox.checked = options.a;
      collectionCheckbox.checked = options.b;
    });

    //Listener Event: If tooltips checkbox is changed, update the options in storage
    var tooltipsCheckbox = document.querySelector('#tooltips');
    tooltipsCheckbox.addEventListener('change', function () {
      if (tooltipsCheckbox.checked) {
        options.tooltips = true;
      } else {
        options.tooltips = false;
      }

      chrome.storage.local.set({ "options":options });
    });

    //Listener Event: If stickers checkbox is changed, update the options in storage
    var stickersCheckbox = document.querySelector('#stickers');
    stickersCheckbox.addEventListener('change', function () {
      if (stickersCheckbox.checked) {
        options.stickers = true;
      } else {
        options.stickers = false;
      }

      chrome.storage.local.set({ "options":options });
    });

    //Listener Event: If allsides data checkbox is changed, update the options in storage
    var ASCheckbox = document.querySelector('#useAS');
    ASCheckbox.addEventListener('change', function () {
      if (ASCheckbox.checked) {
        options.ASData = true;
      } else {
        options.ASData = false;
      }

      chrome.storage.local.set({ "options":options });
    });

    //Listener Event: If MBFC data checkbox is changed, update the options in storage.
    var MBFCCheckbox = document.querySelector('#useMBFC');
    MBFCCheckbox.addEventListener('change', function () {
      if (MBFCCheckbox.checked) {
        options.MBFCData = true;
      } else {
        options.MBFCData = false;
      }

      chrome.storage.local.set({ "options":options });
    });
    
    //Listener Event: If history checkbox is changed, update the options in storage. If turned off, data collection turned off as well
    var historyCheckbox = document.querySelector('#enableHistory');
    historyCheckbox.addEventListener('change', function () {
      if (historyCheckbox.checked) {
        options.a = true;
        collectionCheckbox.checked = true;
        options.b = true;
      } else {
        options.a = false;
        collectionCheckbox.checked = false;
        options.b = false;
      }

      chrome.storage.local.set({ "options":options });
    });

    //Listener Event: If data collection checkbox is changed, update the options in storage
    var collectionCheckbox = document.querySelector('#enableCollection');
    collectionCheckbox.addEventListener('change', function () {
      if (collectionCheckbox.checked) {
        options.b = true;
      } else {
        options.b = false;
      }

      chrome.storage.local.set({ "options":options });
    });
    
    //Listener Event: If delete ratings history button is clicked delete history logs in storage. User will be asked to confirm before deletion.
    var deleteHistory = document.querySelector("#deleteHistory");
    deleteHistory.addEventListener ("click", function() {
      const response = confirm("Are you sure you want to delete your ratings history?");
      if (response) {
        chrome.storage.local.set({"logs":[]},() => {
          alert("Ratings history deleted.")
        });
      }
    });
  });