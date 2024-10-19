document.getElementById('clickSubmit').addEventListener('click', () => {
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
    const modifyNews = async (article) => {
        try {

            const chatGptPrompt = " rewrite this news make the html layout same rewrite inner text, inner text main context and information will be same but line will be more changed"
            const inputText = `${chatGptPrompt} (${article})`
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
            await waitForOutputProcess(30000)

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

        } catch (error) {
            console.log("Error form modifyNews:-", error)
        }
    }
    const getNewsProcess = async () => {
        try {
            const newsResponse = await fetch(`http://localhost:5001/chrome-extension/get-collected-news`)
            const { data } = await newsResponse.json()
            if (data && data.htmlDescription) {
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
                            modifyData
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
        await getNewsProcess()
    } catch (error) {
        console.log("Error form clickSubmitButton :-", error)
    }

}



