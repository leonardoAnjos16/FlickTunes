chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
    if (changeInfo.status === 'complete') {
        chrome.tabs.sendMessage(tabId, 'page-loaded');
    }
});

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
    const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer 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',
    };
    
    const { production } = request;
    let data = {
        model: 'gpt-3.5-turbo',
        messages: [{
            role: 'user',
            content: `Create a song about ${production}`,
        }],
    };

    fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers,
        body: JSON.stringify(data)
    })
        .then(response => response.json())
        .then(response => {
            const lyrics = response.choices[0].message.content
            data.messages[0].content = `Give me the chorus of this song: ${lyrics}`
            fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers,
                body: JSON.stringify(data)
            })
            .then(response2 => response2.json())
            .then(response2 => {
                console.log(response2.choices[0].message.content)
                const chorus = response2.choices[0].message.content;
                sendResponse({lyrics, chorus })
            })
        })
    return true;
});
