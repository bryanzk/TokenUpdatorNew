document.addEventListener('DOMContentLoaded', () => {
    const updateButton = document.getElementById('updateButton');
    const useEtherscanApiCheckbox = document.getElementById('useEtherscanApi');
  
    updateButton.addEventListener('click', () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, { command: "fetch_tokens", useEtherscan: useEtherscanApiCheckbox.checked });
      });
    });
  });
  