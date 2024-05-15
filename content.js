

// // function updateTokens() {
// //     const table = document.querySelector('[role="table"]'); // 确保这是指向正确的表格选择器
// //     if (table) {
// //       const rows = table.querySelectorAll('tr');
// //       rows.forEach((row, index) => {
// //         // 跳过标题行
// //         if (index !== 0) {
// //           // 假设cells中的索引正确对应Amount、Price和Tokens数据
// //             const cells = row.querySelectorAll('td');
// //         //   const amount = parseFloat(cells[2].textContent.replace(/,/g, ''));
// //         //   const price = parseFloat(cells[3].textContent.replace(/,/g, ''));
// //         //   const tokens = amount * price;
// //             const amount = parseFloat(cells[2].textContent.replace(/,/g, ''));
        
// //             cells[3].textContent = tokens.toFixed(2); // 格式化为两位小数
// //             console.log("updating");
// //         }
// //       });
// //     }
// //   }
  
// //   // 暴露函数给background.js使用
// //   chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
// //     if (message.command === "update_tokens") {
// //       updateTokens();
// //       sendResponse({result: "Tokens updated"});
// //     }
// //   });
  

// // chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
// //   if (message.command === "update_tokens") {
// //     updateTokens(); // Call the update function directly
// //     sendResponse({ status: "tokens updated" });
// //   }
// // });

// // function updateTokens() {
// //   console.log("Updating tokens in content script");

// //   const table = document.querySelector('[role="table"]'); // Ensure this matches the actual table on your webpage
// //   if (table) {
// //     const rows = table.querySelectorAll('tr');
// //     rows.forEach((row, index) => {
// //       if (index !== 0) { // Skip the header row
// //         const cells = row.querySelectorAll('td');
// //         const amount = parseFloat(cells[2].textContent.replace(/,/g, ''));
// //         const price = parseFloat(cells[3].textContent.replace(/,/g, ''));
// //         const tokens = amount * price;

// //         cells[4].textContent = tokens.toFixed(2); // Update Tokens column
// //       }
// //     });
// //   }
// // }

// // content.js (P1)
// function fetchTransactionHashes() {
//   const rows = document.querySelectorAll('table tr');
//   const transactions = [];

//   rows.forEach(row => {
//     const cells = row.querySelectorAll('td');
//     if (cells.length > 0) {
//       // Assuming the first cell (index 0) is the "txn hash" column
//       const hashCell = cells[0].querySelector('a');
//       console.log(hashCell);
//       const tokenCell = cells[3];
//       if (hashCell && hashCell.href) {
//         const urlParts = hashCell.href.split('/');
//         const hash = urlParts[urlParts.length - 1]; // The last part of the URL is the hash
//         transactions.push({ hash, row, tokenCell });
//       }
//     }
//   });

//   return transactions;
// }

// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//   if (message.command === "update_token" && message.hash && message.tokens) {
//     console.log(`Updating tokens for transaction ${message.hash}`);
//     const transaction = transactions.find(t => t.hash === message.hash);
//     if (transaction) {
//       transaction.tokenCell.textContent = message.tokens;
//     }
//   }
//   return true;
// });

// // Start the process to fetch tokens for each transaction
// document.addEventListener('DOMContentLoaded', function() {
//   const transactions = fetchTransactionHashes();
//   chrome.runtime.sendMessage({
//     command: "fetch_tokens",
//     transactions: transactions
//   });
// });

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.command === "update_token" && message.hash && message.tokens) {
    const rows = document.querySelectorAll('table tr');
    rows.forEach(row => {
      const cells = row.querySelectorAll('td');
      if (cells.length > 0) {
        const hashCell = cells[0].querySelector('a');
        if (hashCell && hashCell.href) {
          const urlParts = hashCell.href.split('/');
          const hash = urlParts[urlParts.length - 1];
          if (hash === message.hash) {
            const tokenCell = cells[3];
            tokenCell.textContent = message.tokens;
          }
        }
      }
    });
  }
  return true;
});
