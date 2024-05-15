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
  

// document.addEventListener('DOMContentLoaded', function () {
//     var updateButton = document.getElementById('updateButton');
//     if (updateButton) {
//         updateButton.addEventListener('click', function () {
//             console.log("Button clicked");
//             chrome.scripting.executeScript({
//                           target: {tabId: tabs[0].id},
//                           function: tokenUpdaterFunction
//                         });
//             // Any other logic to execute on click
//         });
//     } else {
//         console.log("Button not found");
//     }
// });


// // added on 2024.05.14
// document.getElementById('updateButton').addEventListener('click', () => {
//     chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
//         if (tabs[0]) {
//             chrome.runtime.sendMessage({command: "update_tokens", tabId: tabs[0].id}, (response) => {
//                 console.log(response.result);
//             });
//         } else {
//             console.log("No active tab found.");
//         }
//     });
// });

document.getElementById('updateButton').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length > 0) {
            const activeTab = tabs[0];
            chrome.runtime.sendMessage({ command: "fetch_tokens", tabId: activeTab.id });
            console.log("Token fetch initiated");
        } else {
            console.error("No active tab found.");
        }
    });
});

// document.getElementById('updateButton').addEventListener('click', () => {
//     console.log("Update Tokens button clicked");

//     // Query the active tab
//     chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//         if (tabs.length > 0) {
//             const activeTab = tabs[0];
//             console.log(`Active tab URL: ${activeTab.url}`);

//             chrome.scripting.executeScript({
//                 target: { tabId: activeTab.id },
//                 func: fetchTransactionHashesAndUpdate,
//             }, () => {
//                 console.log("Updates initiated.");
//                 // window.close(); // Close the popup after sending the message
//             });
//         } else {
//             console.error("No active tab found.");
//         }
//     });
// });

// function fetchTransactionHashesAndUpdate() {
//     // Function definition to be executed in the context of P1
//     function fetchTransactionHashes() {
//         const rows = document.querySelectorAll('table tr');
//         const transactions = [];

//         rows.forEach(row => {
//             const cells = row.querySelectorAll('td');
//             if (cells.length > 0) {
//                 // Assuming the first cell (index 0) is the "txn hash" column
//                 const hashCell = cells[0].querySelector('a');
//                 const tokenCell = cells[3];
//                 if (hashCell && hashCell.href) {
//                     const urlParts = hashCell.href.split('/');
//                     const hash = urlParts[urlParts.length - 1]; // The last part of the URL is the hash
//                     transactions.push({ hash, row, tokenCell });
//                 }
//             }
//         });

//         return transactions;
//     }

//     const transactions = fetchTransactionHashes();
//     chrome.runtime.sendMessage({
//         command: "fetch_tokens",
//         transactions: transactions
//     });
// }
