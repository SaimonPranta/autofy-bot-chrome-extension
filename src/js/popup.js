document.getElementById("clickSubmit").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      // function: testFunc
      function: clickSubmitButton,
    });
  });
});

const testFunc = () => {
  setInterval(() => {
    // const ele = document.querySelector(".transition-width")
    const ele = document.querySelector("#spacemyfooter");

    console.log("ele =====>>>", ele);
  }, 3000);
};

const clickSubmitButton = async () => {
  const waitHere = (time) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve("done");
      }, time || 100);
    });
  };
  const waitForOutputProcess = (time, selector) => {
    return new Promise((resolve, reject) => {
      if (!selector) {
        resolve("Query selector are required");
      }
      setInterval(() => {
        const checkOutputProcessing = document.querySelector(selector);
        if (!checkOutputProcessing) {
          resolve("done");
        }
      }, time || 1000);
    });
  };
  const waitForSubmitButtonReady = (time, selector) => {
    return new Promise((resolve, reject) => {
      if (!selector) {
        resolve("Query selector are required");
      }
      setInterval(() => {
        const checkBtnExist = document.querySelector(selector);
        if (checkBtnExist) {
          resolve("done");
        }
      }, time || 1000);
    });
  };
  const waitInputFieldReady = (time, element) => {
    return new Promise((resolve, reject) => {
      if (!selector) {
        resolve("Query selector are required");
      }
      setInterval(() => {
        const checkBtnExist = document.querySelector(selector);
        if (checkBtnExist) {
          resolve("done");
        }
      }, time || 1000);
    });
  };

  const modifyNews = async (article, type = "") => {
    try {
      const chatGptDesPrompt =
        " rewrite this news make the html layout same rewrite inner text, inner text main context and information will be same but line will be more changed";
      const chatGptDesEndPrompt = "result show in code element";
      const chatGptTitlePrompt = "keep this title content same just rewrite it";
      const chatGptTitleEndPrompt =
        "give me only title result plain text, nothing else not.";
      const chatGptCategoryPrompt = "Give me the Bengali meaning of this word";
      const chatGptCategoryEndPrompt =
        "Give me only Bengali  meaning nothing else";

      let inputText = "";
      if (type === "Title") {
        inputText = `${chatGptTitlePrompt}:- (${article}). ${chatGptTitleEndPrompt}`;
      } else if (type === "Category" || type === "Subcategory") {
        inputText = `${chatGptCategoryPrompt}:- ( ${article} ). ${chatGptCategoryEndPrompt}`;
      } else {
        inputText = `${chatGptDesPrompt}:- (${article}). ${chatGptDesEndPrompt}`;
      }
      const inputFields = await document.querySelectorAll(
        'div[id="prompt-textarea"]'
      );
      if (!inputFields.length) {
        return;
      }
      const inputP = await inputFields[0].querySelector("p");
      if (!inputP) {
        return;
      }
      await waitForSubmitButtonReady(1000, submitBtnSelector);
      inputP.innerText = await inputText;
      const submitBtnSelector =
        'button[aria-label="Send prompt"][data-testid="send-button"]';

      await waitHere(1000);
    //   await waitForSubmitButtonReady(1000, submitBtnSelector);
      const submitButton = await document.querySelector(submitBtnSelector);
      if (!submitButton) {
        return;
      }
      await submitButton.click(); 

      const outputSectionSelector =
        'button[aria-label="Stop streaming"][data-testid="stop-button"]';
      if (type === "Title") {
        await waitForOutputProcess(3000, outputSectionSelector);
        const outPutFieldList = await document.querySelectorAll(
          'div[class="group/conversation-turn relative flex w-full min-w-0 flex-col agent-turn"]'
        );
        if (!outPutFieldList.length) {
          return;
        }
        const outPutField = await outPutFieldList[outPutFieldList.length - 1];
        const outPutParagraphField = await outPutField.querySelector("p");
        const output = await outPutParagraphField.innerText;
        if (!output) {
          return;
        }
        return output;
      } else if (type === "Category" || type === "Subcategory") {
        await waitForOutputProcess(3000, outputSectionSelector);
        const outPutFieldList = await document.querySelectorAll(
          'div[class="group/conversation-turn relative flex w-full min-w-0 flex-col agent-turn"]'
        );
        if (!outPutFieldList.length) {
          return;
        }
        const outPutField = await outPutFieldList[outPutFieldList.length - 1];
        const outPutParagraphField = await outPutField.querySelector("p");
        const output = await outPutParagraphField.innerText;
        if (!output) {
          return;
        }
        return output;
      } else {
        await waitForOutputProcess(30000, outputSectionSelector);
        const outPutFieldList = await document.querySelectorAll(
          'code[class="!whitespace-pre hljs language-html"]'
        );
        if (!outPutFieldList.length) {
          return;
        }
        const outPutField = await outPutFieldList[outPutFieldList.length - 1];
        const output = await outPutField.innerText;
        if (!output) {
          return;
        }
        return output;
      }
    } catch (error) {
      console.log("Error form modifyNews:-", error);
    }
  };
  const getNewsProcess = async () => {
    try {
      const domainName = window.location.hostname;
      if (domainName !== "chatgpt.com" || window.continueScraping) {
        return;
      }
      window.continueScraping = true 
      
      const newsResponse = await fetch(
        `http://localhost:5001/chrome-extension/get-collected-news`
      );
      const { data } = await newsResponse.json();
      if (data && data.htmlDescription) {
        const modifyTitle = await modifyNews(data.title, "Title");
        console.log("modifyTitle ==>>", modifyTitle);
        let categoryLabel = null;
        let subcategoryLabel = null;

        if (data.category) {
          categoryLabel = await modifyNews(data.category, "Category");
          console.log("categoryLabel ==>>", categoryLabel);
        }
        if (data.subcategory) {
          subcategoryLabel = await modifyNews(data.subcategory, "Subcategory");
          console.log("subcategoryLabel ==>>", subcategoryLabel);
        }

        const modifyHtmlDescription = await modifyNews(data.htmlDescription);
        console.log("modifyHtmlDescription ==>>", modifyHtmlDescription);
        if (modifyTitle && modifyHtmlDescription) {
          const divElement = document.createElement("div");
          divElement.innerHTML = modifyHtmlDescription;
          const modifyDescription = divElement.innerText;
          await fetch(`http://localhost:5001/chrome-extension/send-news`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              ...data,
              modifyTitle,
              modifyHtmlDescription,
              modifyDescription,
              categoryLabel,
              subcategoryLabel,
            }),
          });
        }
      }
      await getNewsProcess(3000);
    } catch (error) {
      console.log("Error from getNewsProcess:-", error);
    }
  };

  try {
   
    // setInterval(async () => {
    //   const title = await modifyNews(
    //     "প্রধান উপদেষ্টা ড. ইউনূসের সঙ্গে বিএনপির ৩ নেতার বৈঠক",
    //     "Title"
    //   );
    //   console.log("title ========>>>", title);
    // }, 3000);
    await getNewsProcess()
  } catch (error) {
    console.log("Error form clickSubmitButton :-", error);
  }
};
