// document.addEventListener('DOMContentLoaded', () => {
//     console.log('Popup has loaded');
//     document.getElementById('updateButton').addEventListener('click', () => {
//       chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
//         chrome.scripting.executeScript({
//           target: {tabId: tabs[0].id},
//           function: tokenUpdaterFunction
//         });
//       });
//     });
//   });
  
//   function tokenUpdaterFunction() {
//     console.log("Button clicked, triggering Tokens update.");
//   }
  

document.addEventListener('DOMContentLoaded', function () {
    var updateButton = document.getElementById('updateButton');
    if (updateButton) {
        updateButton.addEventListener('click', function () {
            console.log("Button clicked");
            chrome.scripting.executeScript({
                          target: {tabId: tabs[0].id},
                          function: tokenUpdaterFunction
                        });
            // Any other logic to execute on click
        });
    } else {
        console.log("Button not found");
    }
});
