document.getElementById("clickSubmit").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      function: clickSubmitButton
    });
  });
});

 

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
      const chatGptCategoryLabelPrompt =
        "Give me the Bengali meaning of this word";
      const chatGptCategoryLabeEndPrompt =
        "Give me only Bengali  meaning nothing else";
      const chatGptCategoryRoutePrompt =
        "Give me the English meaning of this word";
      const chatGptCategoryRouteEndPrompt =
        "Give me only English  meaning nothing else";

      let inputText = "";
      if (type === "Title") {
        inputText = `${chatGptTitlePrompt}:- (${article}). ${chatGptTitleEndPrompt}`;
      } else if (type === "Category Label" || type === "Subcategory Label") {
        inputText = `${chatGptCategoryLabelPrompt}:- ( ${article} ). ${chatGptCategoryLabeEndPrompt}`;
      } else if (type === "Category Route" || type === "Subcategory Route") {
        inputText = `${chatGptCategoryRoutePrompt}:- ( ${article} ). ${chatGptCategoryRouteEndPrompt}`;
      } else {
        inputText = `${chatGptDesPrompt}:- (${article}). ${chatGptDesEndPrompt}`;
      }
      const inputFields = await document.querySelectorAll(
        'div[id="prompt-textarea"]'
      );
      console.log("inputFields ==>>", inputFields);
      if (!inputFields.length) {
        return;
      }
      const inputP = await inputFields[0].querySelector("p");
      if (!inputP) {
        console.log("inputP not found ==>");

        return;
      }
      inputP.innerText = await inputText;
      const submitBtnSelector =
        'button[aria-label="Send prompt"][data-testid="send-button"]';
      await waitForSubmitButtonReady(1000, submitBtnSelector);
      console.log("submitBtnSelector ==>>", submitBtnSelector);
      // await waitHere(1000);
      //   await waitForSubmitButtonReady(1000, submitBtnSelector);
      const submitButton = await document.querySelector(submitBtnSelector);
      if (!submitButton) {
        console.log("submitButton not found ==>");
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
          console.log("outPutFieldList not found ==>");

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
      console.log("hello from start function")
      const serverDomain = "http://localhost:8001";
      const domainName = window.location.hostname;
      if (domainName !== "chatgpt.com" ) {
        return;
      }

      const newsResponse = await fetch(
        `${serverDomain}/chrome-extension/get-collected-news`
      );
      const { data } = await newsResponse.json();
      if (data && data.htmlDescription) {
        const modifyTitle = await modifyNews(data.title, "Title");
        const modifyHtmlDescription = await modifyNews(data.htmlDescription);
        let categoryInfo = { route: "", label: "" };
        let subcategoryInfo = { route: "", label: "" };

        if (data.category) {
          categoryInfo = { ...categoryInfo, ...data.category };
          if (!data.category.route || !data.category.label) {
            if (data.category.route && !data.category.label) {
              categoryInfo.label = await modifyNews(
                data.category.route.replaceAll("-", " "),
                "Category Label"
              )
            }
            if (!data.category.route && data.category.label) {
              categoryInfo.route = await modifyNews(
                data.category.label,
                "Category Route"
              ).replaceAll(" ", "-")
            }
          }
        }
        if (data.subcategory) {
          subcategoryInfo = { ...subcategoryInfo, ...data.subcategory };
          if (!data.subcategory.route || !data.subcategory.label) {
            if (data.subcategory.route && !data.subcategory.label) {
              subcategoryInfo.label = await modifyNews(
                data.subcategory.route.replaceAll("-", " "),
                "Subcategory Label"
              );
            }
            if (!data.subcategory.route && data.subcategory.label) {
              subcategoryInfo.route = await modifyNews(
                data.subcategory.label,
                "Subcategory Route"
              ).replaceAll(" ", "-")
            }
          }
        }

        console.log("modifyHtmlDescription ==>>", {
          modifyTitle,
          modifyHtmlDescription,
          // modifyDescription,
          categoryInfo,
          subcategoryInfo
        });

        if ( modifyTitle && modifyHtmlDescription) {
          const divElement = document.createElement("div");
          divElement.innerHTML = modifyHtmlDescription;
          const modifyDescription = divElement.innerText;
          await fetch(`${serverDomain}/chrome-extension/send-news`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              ...data,
              modifyTitle,
              modifyHtmlDescription,
              modifyDescription,
              categoryInfo,
              subcategoryInfo
            })
          });
        }
      }
      console.log("hello from before getNewsProcess --<<<")
      await getNewsProcess();
    } catch (error) {
      console.log("Error from getNewsProcess:-", error);
    }
  };
  try {
    if (window.continueScraping) {
      return
    }
    window.continueScraping = true;
    await getNewsProcess();
  } catch (error) {
    console.log("Error form clickSubmitButton :-", error);
  }
};
