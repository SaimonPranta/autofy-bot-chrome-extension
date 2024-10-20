document.getElementById('clickSubmit').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            function: clickSubmitButton
        });
    });
});


// keep this title content same just rewrite it (বিচারপতি অপসারণে সুপ্রিম জুডিশিয়াল কাউন্সিল ফিরল). give me only title result, nothing else.

const clickSubmitButton = async () => {
    const waitHere = (time) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve("done");
            }, time || 100);
        });
    }
    const waitForOutputProcess = (time) => {
        return new Promise((resolve) => {
            setInterval(() => {
                const checkOutputProcessing = document.querySelector('button[aria-label="Stop streaming"][data-testid="stop-button"]');
                if (!checkOutputProcessing) {
                    resolve("done")
                }
            }, time || 1000);

        });
    }
    const modifyNews = async (article, type = "") => {
        try {

            const chatGptDesPrompt = " rewrite this news make the html layout same rewrite inner text, inner text main context and information will be same but line will be more changed"
            const chatGptTitlePrompt = "keep this title content same just rewrite it"
            const chatGptTitleEndPrompt = "give me only title result plain text, nothing else not."
            let inputText = ""
            if (type === "Title") {
                inputText = `${chatGptTitlePrompt}:- (${article}). ${chatGptTitleEndPrompt}`
            } else {
                inputText = `${chatGptDesPrompt}:- (${article}). ${chatGptTitleEndPrompt}`
            }
            console.log("inputText =>", inputText)
            const inputFields = await document.querySelectorAll('div[id="prompt-textarea"]');
            if (!inputFields.length) {
                return
            }
            const inputP = await inputFields[0].querySelector("p")
            if (!inputP) {
                return
            }

            inputP.innerText = await inputText

            await waitHere(1000)
            const submitButton = await document.querySelector('button[aria-label="Send prompt"][data-testid="send-button"]');
            if (!submitButton) {
                return
            }
            await submitButton.click()
            await waitHere(20000)
            if (type === "Title") {
                await waitForOutputProcess(3000)
            } else {
                await waitForOutputProcess(30000)
            }
            console.log("hello befor output ele")
            if (type === "Title") {
                // group/conversation-turn
                const outPutFieldList = await document.querySelectorAll('div[class="group/conversation-turn relative flex w-full min-w-0 flex-col agent-turn"]');
                console.log('outPutFieldList =>', outPutFieldList)
                if (!outPutFieldList.length) {
                    return
                }
                const outPutField = await outPutFieldList[outPutFieldList.length - 1]
                const outPutParagraphField = await outPutField.querySelector("p")
                const output = await outPutParagraphField.innerText
                if (!output) {
                    return
                }
                return output
            } else {
                const outPutFieldList = await document.querySelectorAll('code[class="!whitespace-pre hljs language-html"]');
                if (!outPutFieldList.length) {
                    return
                }
                const outPutField = await outPutFieldList[outPutFieldList.length - 1]
                const output = await outPutField.innerText
                if (!output) {
                    return
                }
                return output
            }

        } catch (error) {
            console.log("Error form modifyNews:-", error)
        }
    }
    const getNewsProcess = async () => {
        try {
            const newsResponse = await fetch(`http://localhost:5001/chrome-extension/get-collected-news`)
            const { data } = await newsResponse.json()
            if (data && data.htmlDescription) {
                const modifyTitle = await modifyNews(data.title, "Title")
                const modifyData = await modifyNews(data.htmlDescription)
                console.log("modifyData ==>>", modifyData)
                if (modifyData) {
                    await fetch(`http://localhost:5001/chrome-extension/send-news`, {
                        method: "POST",
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            ...data,
                            modifyTitle,
                            modifyData,
                        })
                    })

                }
            }
            await getNewsProcess(3000)

        } catch (error) {
            console.log("Error from getNewsProcess:-", error)
        }
    }

    try {
        // await getNewsProcess()
        const modifyTitle = await modifyNews("বিচারপতি অপসারণে সুপ্রিম জুডিশিয়াল কাউন্সিল ফিরল", "Title")
        console.log("modifyTitle ==>>", modifyTitle)
    } catch (error) {
        console.log("Error form clickSubmitButton :-", error)
    }

}



