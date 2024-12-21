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
  const waitForOutputProcess = (time = 1000, selector) => {
    return new Promise((resolve, reject) => {
      if (!selector) {
        resolve("Query selector are required");
      }
     let intervalContainer = setInterval(() => {
        const checkOutputProcessing = document.querySelector(selector);
        if (!checkOutputProcessing) {
          setTimeout(() => {
          clearInterval(intervalContainer);
            resolve("done");
          }, time);
        }
      }, time);
    });
  };
  const waitForSubmitButtonReady = (time = 1000, selector) => {
    return new Promise((resolve, reject) => {
      if (!selector) {
        resolve("Query selector are required");
      }
     let intervalContainer = setInterval(() => {
        const checkBtnExist = document.querySelector(selector);
        if (checkBtnExist) {
          setTimeout(() => {
          clearInterval(intervalContainer);
            resolve("done");
          }, time);
        }
      }, time);
    });
  };
  const awaitForParagraphOutputLoad = (praElement, time = 1000) => {
    return new Promise((resolve, reject) => {
      if (!praElement) {
        resolve("Query selector are required");
      }
      let intervalContainer = setInterval(() => {
        console.log("---praElement -->>", praElement);
        const element = praElement.querySelector("p");
        const elementText = element?.innerText;
        console.log("elementText -->>", elementText);
        if (elementText && elementText?.trim()?.length > 2) {
          clearInterval(intervalContainer);
          resolve("done");
        }
      }, time);
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
      if (!inputFields.length) {
        return modifyNews(article, type);
      }
      const inputP = await inputFields[0].querySelector("p");
      if (!inputP) {
        return modifyNews(article, type);
      }
      inputP.innerText = await inputText;
      const submitBtnSelector =
        'button[aria-label="Send prompt"][data-testid="send-button"]';
      await waitForSubmitButtonReady(1000, submitBtnSelector);
      // await waitHere(1000);
      //   await waitForSubmitButtonReady(1000, submitBtnSelector);
      const submitButton = await document.querySelector(submitBtnSelector);
      if (!submitButton) {
        return modifyNews(article, type);
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
          return modifyNews(article, type);
        }
        const outPutField = await outPutFieldList[outPutFieldList.length - 1];
        const outPutParagraphField = await outPutField.querySelector("p");
        console.log("outPutFieldList -->", outPutFieldList);
        console.log("outPutParagraphField -->", outPutParagraphField);
        // here need

        await awaitForParagraphOutputLoad(outPutField);
        const output = await outPutParagraphField.innerText;
        console.log("output -->", output);

        if (!output) {
          return modifyNews(article, type);
        }
        return output;
      } else if (
        type === "Category Label" ||
        type === "Category Route" ||
        type === "Subcategory Label" ||
        type === "Subcategory Route"
      ) {
        await waitForOutputProcess(3000, outputSectionSelector);
        const outPutFieldList = await document.querySelectorAll(
          'div[class="group/conversation-turn relative flex w-full min-w-0 flex-col agent-turn"]'
        );
        if (!outPutFieldList.length) {
          return modifyNews(article, type);
        }
        const outPutField = await outPutFieldList[outPutFieldList.length - 1];
        const outPutParagraphField = await outPutField.querySelector("p");
        const output = await outPutParagraphField.innerText;
        if (!output) {
          return modifyNews(article, type);
        }
        return output;
      } else {
        await waitForOutputProcess(30000, outputSectionSelector);
        const outPutFieldList = await document.querySelectorAll(
          'code[class="!whitespace-pre hljs language-html"]'
        );
        if (!outPutFieldList.length) {
          return modifyNews(article, type);
        }
        const outPutField = await outPutFieldList[outPutFieldList.length - 1];
        const output = await outPutField.innerText;
        if (!output) {
          return modifyNews(article, type);
        }
        return output;
      }
    } catch (error) {
      return modifyNews(article, type);
    }
  };
  const getNewsProcess = async () => {
    try {
      const serverDomain = "https://server.somacharnews.com";
      // const serverDomain = "http://localhost:8001";
      const domainName = window.location.hostname;
      if (domainName !== "chatgpt.com") {
        return;
      }

      const newsResponse = await fetch(
        `${serverDomain}/chrome-extension/get-collected-news`
      );
      const { data } = await newsResponse.json();
      if (data && data?.title?.length && data?.htmlDescription?.length) {
        const modifyTitle = await modifyNews(data.title, "Title");
        const modifyHtmlDescription = await modifyNews(data.htmlDescription);
        let categoryInfo = { route: "", label: "" };
        let subcategoryInfo = { route: "", label: "" };

        if (data.category) {
          categoryInfo = { ...categoryInfo, ...data.category };
          if (!data.category.route || !data.category.label) {
            if (data.category?.route?.length && !data?.category?.label) {
              categoryInfo.label = await modifyNews(
                data.category.route.replaceAll("-", " "),
                "Category Label"
              );
            }
            if (!data?.category?.route && data?.category?.label?.length) {
              categoryInfo.route = await modifyNews(
                data.category.label,
                "Category Route"
              ).replaceAll(" ", "-");
            }
          }
        }
        if (data?.subcategory) {
          subcategoryInfo = { ...subcategoryInfo, ...data.subcategory };
          if (!data?.subcategory?.route || !data?.subcategory?.label) {
            if (data?.subcategory?.route?.length && !data?.subcategory?.label) {
              subcategoryInfo.label = await modifyNews(
                data.subcategory.route.replaceAll("-", " "),
                "Subcategory Label"
              );
            }
            if (!data?.subcategory?.route && data?.subcategory?.label?.length) {
              subcategoryInfo.route = await modifyNews(
                data.subcategory.label,
                "Subcategory Route"
              ).replaceAll(" ", "-");
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

        if (modifyTitle?.length && modifyHtmlDescription?.length) {
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
      await getNewsProcess();
    } catch (error) {
      console.log("Error from getNewsProcess:-", error);
    }
  };
  try {
    if (window.continueScraping) {
      return;
    }
    window.continueScraping = true;
    await getNewsProcess();
  } catch (error) {
    console.log("Error form clickSubmitButton :-", error);
  }
};
