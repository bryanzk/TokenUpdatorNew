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
            // const hash = extractHashFromHref(tx_url_alink);
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
      if (result && result.length > 0) {
        const transactions = result[0].result;
        console.log("Transactions:", transactions);
        sendResponse({ result: "Fetching tokens started" });
      } else {
        console.error("No transactions found or result is empty.");
        sendResponse({ error: "No transactions found or result is empty." });
      }
    });
    return true;  // Keeps the messaging channel open for the sendResponse
  }
});



function fetchTransactionHashes() {
  console.log("starting to iterate the table...");
  // console.log("Document content preview:", document.body.innerHTML.substring(0, 500));
  // const rows = document.querySelectorAll('.mantine-Table-root.mantine-1orkbxt tbody tr');
  const table = document.querySelector('.mantine-Table-root.mantine-1orkbxt');
  if (!table) {
    console.log("No table found in the document.");
    return [];
  }

  console.log("Found table:", table);
  
  const rows = table.querySelectorAll('tr'); // Try getting all rows in the table
  console.log(`Found ${rows.length} rows in the table.`);


  const transactions = [];
  console.log("tx counts:" + rows.length);
  // rows.forEach(row => {
  //   const cells = row.querySelectorAll('td');
  //   console.log(cells.length + " txs found");
  //   if (cells.length > 0) {
  //     const hashCell = cells[0].querySelector('a');
  //     const tokenCell = cells[3];
  //     if (hashCell && hashCell.href) {
  //       const urlParts = hashCell.href.split('/');
  //       const hash = urlParts[urlParts.length - 1];
  //       transactions.push({ hash, row, tokenCell });
  //     }
  //   }
  // });
  console.log("Fetched transactions:", transactions);

  return transactions;
}


// This function will be executed in the context of the tab to fetch and parse P2 page content
function fetchTokenFromP2(hash) {
  fetch(`https://eigenphi.io/mev/eigentx/${hash}?tab=to`).then(response => response.text()).then(data => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(data, 'text/html');
  
    const balanceChangeTable = doc.querySelector('.mantine-Table-root combined-list mantine-yrvn6m'); // Adjust selector as needed
    const tokenCells = balanceChangeTable ? balanceChangeTable.querySelectorAll('td:nth-child(2)') : [];
    const tokens = [...tokenCells].map(cell => cell.textContent.trim()).join(', ');

    chrome.runtime.sendMessage({ command: "update_token", hash: hash, tokens: tokens });
  });
}
