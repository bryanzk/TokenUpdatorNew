chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.command === "fetch_tokens" && request.tabId) {
    console.log("Fetching tokens for transactions in the background...");
    console.log(request.tabId);
    chrome.scripting.executeScript({
      target: {tabId: request.tabId},
      function: () => {
        console.log("Injected fetchTransactionHashes function is initialized.");
        console.log("starting to iterate the table...");

        const table = document.querySelector('.mantine-Table-root.mantine-1orkbxt');
        const rows = table.querySelectorAll('tr'); // Try getting all rows in the table
        console.log(`Found ${rows.length} rows in the table.`);
      
      
        const transactions = [];
        console.log("tx counts:" + rows.length);
        rows.forEach(row => {
          const tx_url_alink = row.querySelectorAll('.mantine-Text-root.mantine-1y2m7rb a')[0];
          // console.log("tx_url_alink: " + tx_url_alink);
          if (tx_url_alink) {
            const hash = tx_url_alink.getAttribute('href').split('/mev/eigentx/')[1].split('?')[0];
            const tx_url = "https://eigenphi.io/mev/eigentx/" + hash;
            // console.log("hash: " + hash);
            // console.log("tx_url: " + tx_url);
            transactions.push({ hash, tx_url });
          }
        });
        console.log("Fetched transactions:", transactions);
      
        return transactions;      
      }
    }, (result) => {
      if (chrome.runtime.lastError) {
        console.error("Error executing fetchTransactionHashes:", chrome.runtime.lastError.message);
        sendResponse({ error: chrome.runtime.lastError.message });
        return;
      }

      if (results && results[0] && results[0].result) {
          const transactions = results[0].result;
          console.log("Transactions:", transactions);
          sendResponse({ result: "Fetching tokens started" });
  
          transactions.forEach(transaction => {
            chrome.scripting.executeScript({
              target: { tabId: request.tabId },
              func: (hash) => {
                // This function will be executed in the context of the tab to fetch and parse TX detail page content
                console.log(`Executing TX detail page content extraction function for hash: ${hash}`);
                fetch(`https://eigenphi.io/mev/eigentx/${hash}`)
                  .then(response => response.text())
                  .then(data => {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(data, 'text/html');
  
                    const balanceChangeTable = doc.querySelector('#account-balance-changes');
                    if (!balanceChangeTable) {
                      console.log("No account balance changes table found.");
                      return;
                    }

                    const iconCells = Array.from(balanceChangeTable.querySelectorAll('tr:first-child td:nth-child(n+4)'));
                    const tokens = iconCells.map(cell => {
                    const imgElement = cell.querySelector('img');
                    const aElement = cell.querySelector('a');
                    const iconUrl = imgElement ? imgElement.src : '';
                    const tokenLink = aElement ? aElement.href : '';
                    return { iconUrl, tokenLink };
                  });

                  console.log(`Tokens for hash ${hash}:`, tokens);
                    chrome.runtime.sendMessage({ command: "update_token", hash: hash, tokens: tokens });
                  })
                  .catch(error => {
                    console.error(`Error executing TX detail page content extraction for hash ${hash}:`, error);
                  });
              },
              args: [transaction.hash]
            }, (fetchResult) => {
              if (chrome.runtime.lastError) {
                console.error("Error executing TX detail page content extraction:", chrome.runtime.lastError.message);
              } else {
                console.log("fetchTokenFromP2 result:", fetchResult);
              }
            });
          });
  
          sendResponse({ result: "Fetching tokens started" });
        } else {
          console.error("No transactions found or result is empty.");
          sendResponse({ error: "No transactions found or result is empty." });
        }
      });
      return true;  // Keeps the messaging channel open for the sendRespons
      } else {
        console.error("No transactions found or result is empty.");
        sendResponse({ error: "No transactions found or result is empty." });
      }
    });
    return true;  // Keeps the messaging channel open for the sendResponse
  }
});


