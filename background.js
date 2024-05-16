chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.command === "fetch_tokens" && request.tabId) {
    console.log("Fetching tokens for transactions in the background...");
    console.log(request.tabId);

    chrome.cookies.getAll({ url: "https://eigenphi.io" }, (cookies) => {
      console.log("Cookies:", cookies);

      let cookieHeader = "";
      cookies.forEach(cookie => {
        cookieHeader += `${cookie.name}=${cookie.value}; `;
      });

      chrome.scripting.executeScript({
        target: { tabId: request.tabId },
        function: () => {
          console.log("Injected fetchTransactionHashes function is initialized.");
          console.log("Starting to iterate the table...");

          const table = document.querySelector('.mantine-Table-root.mantine-1orkbxt');
          const rows = table.querySelectorAll('tr');
          console.log(`Found ${rows.length} rows in the table.`);

          const transactions = [];
          rows.forEach(row => {
            const tx_url_alink = row.querySelectorAll('.mantine-Text-root.mantine-1y2m7rb a')[0];
            if (tx_url_alink) {
              const hash = tx_url_alink.getAttribute('href').split('/mev/eigentx/')[1].split('?')[0];
              console.log("hash: " + hash);
              const tx_url = "https://eigenphi.io/mev/eigentx/" + hash;
              const ethtx_url = "https://ethtx.info/mainnet/" + hash + "/";
              console.log("ethtx_url: " + ethtx_url);
              transactions.push({ hash, tx_url, ethtx_url });
            }
          });
          console.log("Fetched transactions:", transactions);

          return transactions;
        }
      }, async (result) => {
        if (chrome.runtime.lastError) {
          console.error("Error executing fetchTransactionHashes:", chrome.runtime.lastError.message);
          sendResponse({ error: chrome.runtime.lastError.message });
          return;
        }

        if (result && result.length > 0 && result[0].result) {
          const transactions = result[0].result;
          console.log("Transactions:", transactions);

          for (const transaction of transactions) {
            try {
              const response = await fetch(transaction.ethtx_url, {
                credentials: 'include',
                headers: {
                  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' // 模拟浏览器请求
                }
              });

              if (response.ok) {
                const data = await response.text();

                const parser = new DOMParser();
                const doc = parser.parseFromString(data, 'text/html');
                const transfersTable = doc.querySelector('.transfers.table tbody');
                if (!transfersTable) {
                  console.log("No transfers table found.");
                  continue;
                }

                const tokenSet = new Set();
                const rows = transfersTable.querySelectorAll('tr');
                rows.forEach(row => {
                  const tokenNameCell = row.querySelectorAll('td')[1];
                  if (tokenNameCell) {
                    tokenSet.add(tokenNameCell.textContent.trim());
                  }
                });

                const tokens = Array.from(tokenSet);
                console.log(`Tokens for ethtx_url ${transaction.ethtx_url}:`, tokens);
                chrome.tabs.sendMessage(
                  sender.tab.id,
                  {
                    command: "update_token",
                    hash: transaction.hash,
                    tokens: tokens
                  }
                );
              } else {
                console.error(`Error fetching TX detail page content: ${response.statusText}`);
              }
            } catch (error) {
              console.error(`Error fetching TX detail page content for URL ${transaction.ethtx_url}:`, error);
            }
          }

          sendResponse({ result: "Fetching tokens started" });
        } else {
          console.error("No transactions found or result is empty.");
          sendResponse({ error: "No transactions found or result is empty." });
        }
      });
    });

    return true; // Keeps the messaging channel open for the sendResponse
  }
});


//         if (result && result.length > 0 && result[0].result) {
//           const transactions = result[0].result;
//           console.log("Transactions:", transactions);

//           transactions.forEach(transaction => {
//             chrome.scripting.executeScript({
//               target: { tabId: request.tabId },
//               func: (ethtx_url, cookieHeader) => {
//                 // console.log(`Executing TX detail page content extraction function for URL: ${ethtx_url}`);
//                 fetch(ethtx_url, {
//                   credentials: 'include',
//                   headers: {
//                     'Cookie': cookieHeader,
//                     'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' //假定模拟浏览器请求
//                   }
//                 })
//                 .then(response => response.text())
//                 .then(data => {
//                   // console.log(`Fetched TX detail page content for URL ${ethtx_url}:`, data);

//                   const parser = new DOMParser();
//                   const doc = parser.parseFromString(data, 'text/html');
//                   // 确保 URL 没有 ?tab 参数
//                   const cleanedDom = doc.documentElement.outerHTML.replace(/\?tab=block/g, "");

//                   const cleanedDoc = new DOMParser().parseFromString(cleanedDom, 'text/html');
//                   const transfersTable = cleanedDoc.querySelector('.transfers.table tbody');
//                   if (!transfersTable) {
//                     console.log("No account balance changes table found.");
//                     return;
//                   }

//                   const tokenSet = new Set();
//                   const rows = balanceChangeTable.querySelectorAll('tr');
//                   console.log(`Found ${rows.length} rows in the table.`);
//                   rows.forEach(row => {
//                     const tokenNameCell = row.querySelectorAll('td')[1];
//                     if (tokenNameCell) {
//                       tokenSet.add(tokenNameCell.textContent.trim());
//                     }
//                   });

//                   const tokens = Array.from(tokenSet);
//                   console.log(`Tokens for tx_url ${tx_url}:`, tokens);  

//                   // 未验证的eigentx 取token 逻辑
//                   // const iconCells = Array.from(transfersTable.querySelectorAll('tbody:first-child td:nth-child(n+4)'));
//                   // const tokens = iconCells.map(cell => {
//                   //   const imgElement = cell.querySelector('img');
//                   //   const aElement = cell.querySelector('a');
//                   //   const iconUrl = imgElement ? imgElement.src : '';
//                   //   const tokenLink = aElement ? aElement.href : '';
//                   //   return { iconUrl, tokenLink };
//                   // });

//                   console.log(`Tokens for tx_url ${tx_url}:`, tokens);
//                   chrome.runtime.sendMessage({ command: "update_token", hash: tx_url.split('/').pop(), tokens: tokens });
//                 })
//                 .catch(error => {
//                   console.error(`Error fetching TX detail page content for URL ${tx_url}:`, error);
//                 });
//               },
//               args: [transaction.ethtx_url, cookieHeader]
//             }, (fetchResult) => {
//               if (chrome.runtime.lastError) {
//                 console.error("Error executing TX detail page content extraction:", chrome.runtime.lastError.message);
//               } else {
//                 console.log("fetchTokenFromP2 result:", fetchResult);
//               }
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
