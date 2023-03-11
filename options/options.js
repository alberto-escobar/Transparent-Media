//when options page is loaded, do the following to the checkboxes
document.addEventListener('DOMContentLoaded', function () {
    var tooltipsCheckbox = document.querySelector('#tooltips');
    var stickersCheckbox = document.querySelector('#stickers');
    var ASCheckbox = document.querySelector('#useAS');
    var MBFCCheckbox = document.querySelector('#useMBFC');
    var historyCheckbox = document.querySelector('#enableHistory');
    var collectionCheckbox = document.querySelector('#enableCollection');
    var deleteHistory = document.querySelector("#deleteHistory");
    var options;

    //get options from storage and set the checkboxes to the correct state
    chrome.storage.local.get("options", function(obj) {
      options = obj.options;
      tooltipsCheckbox.checked = options.tooltips;
      stickersCheckbox.checked = options.stickers;
      ASCheckbox.checked = options.ASData;
      MBFCCheckbox.checked = options.MBFCData;
      historyCheckbox.checked = options.a;
      collectionCheckbox.checked = options.b;
    });

    //if tooltips checkbox is changed, update the options in storage
    tooltipsCheckbox.addEventListener('change', function () {
      if (tooltipsCheckbox.checked) {
        options.tooltips = true;
      } else {
        options.tooltips = false;
      }

      chrome.storage.local.set({ "options":options });
    });

    //if stickers checkbox is changed, update the options in storage
    stickersCheckbox.addEventListener('change', function () {
      if (stickersCheckbox.checked) {
        options.stickers = true;
      } else {
        options.stickers = false;
      }

      chrome.storage.local.set({ "options":options });
    });

    //if allsides data checkbox is changed, update the options in storage
    ASCheckbox.addEventListener('change', function () {
      if (ASCheckbox.checked) {
        options.ASData = true;
      } else {
        options.ASData = false;
      }

      chrome.storage.local.set({ "options":options });
    });

    //if MBFC data checkbox is changed, update the options in storage
    MBFCCheckbox.addEventListener('change', function () {
      if (MBFCCheckbox.checked) {
        options.MBFCData = true;
      } else {
        options.MBFCData = false;
      }

      chrome.storage.local.set({ "options":options });
    });

    
    //if MBFC data checkbox is changed, update the options in storage
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

    
    //if MBFC data checkbox is changed, update the options in storage
    collectionCheckbox.addEventListener('change', function () {
      if (collectionCheckbox.checked) {
        options.b = true;
      } else {
        options.b = false;
      }

      chrome.storage.local.set({ "options":options });
    });
    
    deleteHistory.addEventListener ("click", function() {
      const response = confirm("Are you sure you want to delete your ratings history?");
      if (response) {
        chrome.storage.local.set({"logs":[]},() => {
          alert("Ratings history deleted.")
        });
      }
    });
  });