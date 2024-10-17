document.getElementById('clickSubmit').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            function: clickSubmitButton
        });
    });
});


const waitHere = (time) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve("done");
        }, time || 100);
    });
}

const clickSubmitButton = async () => {
    console.log("hello form")
    try {

        const chatGptPrompt = " rewrite this news make the html layout same rewrite inner text, inner text main context and information will be same but line will be more changed"
        const article = ""


        const inputText = `${chatGptPrompt} (${article})`
        console.log("1")

        const inputFields = await document.querySelectorAll('div[id="prompt-textareaa"]');
        console.log("2")

        if (!inputFields.length) {
            return
        }

        const inputP = await inputFields[0].querySelector("p")
        if (!inputP) {
            return
        }

        inputP.innerText = await inputText

        await waitHere(1000)

        console.log("after wait")

        const submitButton = await document.querySelector('button[aria-label="Send prompt"][data-testid="send-button"]');
        if (!submitButton) {
            return
        }
        await submitButton.click()
        await waitHere(1000)

        const outPutFieldList = await document.querySelectorAll('code[class="!whitespace-pre hljs language-html"]');
        if (!outPutFieldList.length) {
            return
        }
        const outPutField = await outPutFieldList[outPutFieldList.length - 1]
        console.log("outPutField ==>>", outPutField)
        console.log("outPutField ==>>", outPutField.innerText)




    } catch (error) {
        console.log("error ==>>", error)
    }
}


const clickSubmitButtons = () => {
    const chatGptPrompt = " rewrite this news make the html layout same rewrite inner text, inner text main context and information will be same but line will be more changed"
    const article = ""


    const inputText = `${chatGptPrompt} (${article})`


    const inputFields = document.querySelectorAll('div[id="prompt-textarea"]');
    const submitButton = document.querySelector('button[aria-label="Send prompt"][data-testid="send-button"]');
    if (submitButton) {
        console.log("submitButton =>>", submitButton)
        submitButton.click()
    }

    if (inputFields.length > 0) {
        const inputP = inputFields[0].querySelector("p")
        console.log("inputP", inputP)

        if (inputP) {
            inputP.innerText = inputText
            setTimeout(() => {
                const submitButton = document.querySelector('button[aria-label="Send prompt"][data-testid="send-button"]');
                if (submitButton) {
                    console.log("submitButton =>>", submitButton)
                    submitButton.click()
                }
                setTimeout(() => {
                    const outPutFieldList = document.querySelectorAll('code[class="!whitespace-pre hljs language-html"]');
                    if (outPutFieldList.length) {
                        const outPutField = outPutFieldList[outPutFieldList.length - 1]
                        console.log("outPutField ==>>", outPutField)
                        console.log("outPutField ==>>", outPutField.innerText)

                    }
                }, 3000);


            }, 100);

        }
        // Trigger input and change events to simulate typing interaction
        // inputFields[0].dispatchEvent(new Event('input', { bubbles: true }));
        // inputFields[0].dispatchEvent(new Event('change', { bubbles: true }));

        console.log("Text typed in the textarea.")
    } else {
        alert('No submit button found.');
    }
}
