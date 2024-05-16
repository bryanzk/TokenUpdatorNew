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
    return true; // Indicate that we will call sendResponse asynchronously
  }
});
