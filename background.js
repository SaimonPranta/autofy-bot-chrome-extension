chrome.action.onClicked.addListener((tab) => {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: clickSubmitButton
    });
  });
  
  function clickSubmitButton() {
    const buttons = document.querySelectorAll('input[type="submit"], button[type="submit"]');
    if (buttons.length > 0) {
      buttons[0].click();
    } else {
      console.log("No submit button found on this page.");
    }
  }
  