 
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.command === "fetch_tokens" && request.tabId) {
    console.log("Fetching tokens for transactions in the background...");
    chrome.scripting.executeScript({
      target: {tabId: request.tabId},
      function: fetchTransactionHashes
    }, (result) => {
      const transactions = result[0].result;
      transactions.forEach(transaction => {
        chrome.scripting.executeScript({
          target: {tabId: request.tabId},
          func: fetchTokenFromP2,
          args: [transaction.hash]
        });
      });
    });
    sendResponse({ result: "Fetching tokens started" });
  }
  return true;
});

function fetchTransactionHashes() {
  console.log("starting to iterate the table...");
  const rows = document.querySelectorAll('mantine-Table-root mantine-1orkbxt tbody');
  const transactions = [];
  
  rows.forEach(row => {
    const cells = row.querySelectorAll('td');
    console.log(cells.length + " txs found");
    if (cells.length > 0) {
      const hashCell = cells[0].querySelector('a');
      const tokenCell = cells[3];
      if (hashCell && hashCell.href) {
        const urlParts = hashCell.href.split('/');
        const hash = urlParts[urlParts.length - 1];
        transactions.push({ hash, row, tokenCell });
      }
    }
  });
  
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
