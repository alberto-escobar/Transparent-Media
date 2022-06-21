
  
document.addEventListener('DOMContentLoaded', function () {
    var tooltipsCheckbox = document.querySelector('#tooltips');
    var stickersCheckbox = document.querySelector('#stickers');
    var options;
    chrome.storage.local.get("options", function(obj) {
      options = obj.options
      tooltipsCheckbox.checked = options.tooltips
      stickersCheckbox.checked = options.stickers
    });

    tooltipsCheckbox.addEventListener('change', function () {
      if (tooltipsCheckbox.checked) {
        options.tooltips = true;
      } else {
        options.tooltips = false;
      }
      console.log(options)
      chrome.storage.local.set({ "options":options });
    });

    stickersCheckbox.addEventListener('change', function () {
      if (stickersCheckbox.checked) {
        options.stickers = true;
      } else {
        options.stickers = false;
      }
      console.log(options)
      chrome.storage.local.set({ "options":options });
    });

  });