chrome.action.onClicked.addListener((tab) => {
    console.log('Extension icon clicked!');

    // 检查当前标签的URL，确保它是允许运行此脚本的页面
    if (tab.url && tab.url.includes("https://eigenphi.io")) {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: triggerContentScript
      });
    }
  });
  
  // 此函数是注入到目标页面的，并在该环境中执行
  function triggerContentScript() {
    chrome.runtime.sendMessage({command: "update_tokens"}, function(response) {
      if (chrome.runtime.lastError) {
        // Handle any errors that might have occurred
        console.log("Error sending message: ", chrome.runtime.lastError.message);
      } else {
        console.log("Received response: ", response);
      }
    });
  }
  