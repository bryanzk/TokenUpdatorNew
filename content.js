

function updateTokens() {
    const table = document.querySelector('[role="table"]'); // 确保这是指向正确的表格选择器
    if (table) {
      const rows = table.querySelectorAll('tr');
      rows.forEach((row, index) => {
        // 跳过标题行
        if (index !== 0) {
          // 假设cells中的索引正确对应Amount、Price和Tokens数据
            const cells = row.querySelectorAll('td');
        //   const amount = parseFloat(cells[2].textContent.replace(/,/g, ''));
        //   const price = parseFloat(cells[3].textContent.replace(/,/g, ''));
        //   const tokens = amount * price;
            const amount = parseFloat(cells[2].textContent.replace(/,/g, ''));
        
            cells[3].textContent = tokens.toFixed(2); // 格式化为两位小数
            console.log("updating");
        }
      });
    }
  }
  
  // 暴露函数给background.js使用
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.command === "update_tokens") {
      updateTokens();
      sendResponse({result: "Tokens updated"});
    }
  });
  