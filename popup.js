document.getElementById('updateButton').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length > 0) {
            const activeTab = tabs[0];
            chrome.runtime.sendMessage({ command: "fetch_tokens", tabId: activeTab.id });
            console.log("Token fetch initiated");
        } else {
            console.error("No active tab found.");
        }
    });
});
