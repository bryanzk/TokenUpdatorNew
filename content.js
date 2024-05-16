chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.command === "update_token") {
    const { hash, tokens } = message;
    const rows = document.querySelectorAll('table tr');

    rows.forEach(row => {
      const cells = row.querySelectorAll('td');
      if (cells.length > 0) {
        const hashCell = cells[0].querySelector('a');
        if (hashCell && hashCell.href.includes(hash)) {
          const tokenCell = cells[3];
          tokenCell.innerHTML = ''; // 清空当前内容
          tokens.forEach(token => {
            const div = document.createElement('div');
            div.textContent = token;
            tokenCell.appendChild(div);
          });
        }
      }
    });

    sendResponse({ status: "Tokens updated" });
    return true;
  }
});

// chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
//   if (request.command === "fetch_tokens" && request.tabId) {
//     console.log("Fetching tokens for transactions in the background...");

//     chrome.cookies.getAll({ url: "https://eigenphi.io" }, (cookies) => {
//       if (chrome.runtime.lastError) {
//         console.error("Error getting cookies:", chrome.runtime.lastError);
//         sendResponse({ error: chrome.runtime.lastError });
//         return;
//       }

//       console.log("Cookies:", cookies);

//       let cookieHeader = "";
//       cookies.forEach(cookie => {
//         cookieHeader += `${cookie.name}=${cookie.value}; `;
//       });

//       chrome.scripting.executeScript({
//         target: { tabId: request.tabId },
//         function: () => {
//           console.log("Injected fetchTransactionHashes function is initialized.");
//           console.log("Starting to iterate the table...");

//           const table = document.querySelector('.mantine-Table-root.mantine-1orkbxt');
//           const rows = table.querySelectorAll('tr');
//           console.log(`Found ${rows.length} rows in the table.`);

//           const transactions = [];
//           console.log("tx counts:" + rows.length);
//           rows.forEach(row => {
//             const tx_url_alink = row.querySelectorAll('.mantine-Text-root.mantine-1y2m7rb a')[0];
//             if (tx_url_alink) {
//               const hash = tx_url_alink.getAttribute('href').split('/mev/eigentx/')[1].split('?')[0];
//               console.log("hash: " + hash);
//               const tx_url = "https://eigenphi.io/mev/eigentx/" + hash;
//               transactions.push({ hash, tx_url });
//             }
//           });
//           console.log("Fetched transactions:", transactions);

//           return transactions;
//         }
//       }, (result) => {
//         if (chrome.runtime.lastError) {
//           console.error("Error executing fetchTransactionHashes:", chrome.runtime.lastError.message);
//           sendResponse({ error: chrome.runtime.lastError.message });
//           return;
//         }

//         if (result && result.length > 0 && result[0].result) {
//           const transactions = result[0].result;
//           console.log("Transactions:", transactions);

//           transactions.forEach(transaction => {
//             console.log(`Fetching details for transaction: ${transaction.tx_url}`);
//             fetch(transaction.tx_url, {
//               credentials: 'include',
//               headers: {
//                 'Cookie': cookieHeader,
//                 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
//                 'Referer': 'https://eigenphi.io'
//               }
//             })
//             .then(response => {
//               if (response.redirected) {
//                 console.log("Detected redirection.");
//                 const redirectedUrl = response.url.split('?')[0];
//                 return fetch(redirectedUrl, {
//                   credentials: 'include',
//                   headers: {
//                     'Cookie': cookieHeader,
//                     'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, Gecko) Chrome/91.0.4472.124 Safari/537.36',
//                     'Referer': 'https://eigenphi.io'
//                   }
//                 });
//               }
//               return response.text();
//             })
//             .then(data => {
//               console.log(`Fetched TX detail page content for URL ${transaction.tx_url}:`, data);
//               const parser = new DOMParser();
//               const doc = parser.parseFromString(data, 'text/html');

//               const balanceChangeTable = doc.querySelector('#account-balance-changes');
//               if (!balanceChangeTable) {
//                 console.log("No account balance changes table found.");
//                 return;
//               }

//               const iconCells = Array.from(balanceChangeTable.querySelectorAll('tr:first-child td:nth-child(n+4)'));
//               const tokens = iconCells.map(cell => {
//                 const imgElement = cell.querySelector('img');
//                 const aElement = cell.querySelector('a');
//                 const iconUrl = imgElement ? imgElement.src : '';
//                 const tokenLink = aElement ? aElement.href.split('?')[0] : '';
//                 return { iconUrl, tokenLink };
//               });

//               console.log(`Tokens for tx_url ${transaction.tx_url}:`, tokens);
//               chrome.runtime.sendMessage({ command: "update_token", hash: transaction.tx_url.split('/').pop(), tokens: tokens });
//             })
//             .catch(error => {
//               console.error(`Error fetching TX detail page content for URL ${transaction.tx_url}:`, error);
//             });
//           });

//           sendResponse({ result: "Fetching tokens started" });
//         } else {
//           console.error("No transactions found or result is empty.");
//           sendResponse({ error: "No transactions found or result is empty." });
//         }
//       });
//     });

//     return true;  // Keeps the messaging channel open for the sendResponse
//   }
// });
