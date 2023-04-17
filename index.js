chrome.runtime.onMessage.addListener(message => {
    if (message === 'page-loaded') {
        const tabsContainer = document.getElementsByClassName('text-to-song-tabs')[0];
        
        const lyricsTab = tabsContainer.childNodes[2];
        lyricsTab.lastChild.lastChild.textContent = 'Movie/TV Show';
        
        const changeLyricsTabContent = () => {
            // Change title
            const content = document.getElementsByClassName('step-lyrics')[0];
            content.firstChild.firstChild.textContent = 'Write down the name of a movie or TV show!';
            
            // Add input for movie/TV show
            const input = document.createElement('input');
            input.setAttribute('placeholder', 'Movie or TV show');
            input.classList.add('text-input');
            input.type = 'text';
            
            content.firstChild.insertAdjacentElement('afterEnd', input);
            
            // Disable and hide input for lyrics
            const lyricsTextArea = document.getElementsByClassName('step-lyrics__textInput')[0];
            lyricsTextArea.setAttribute('disabled', 'true');
            lyricsTextArea.removeAttribute('placeholder');
            // lyricsTextArea.style.visibility = 'hidden';
            // lyricsTextArea.style.height = '0';
            
            // Add button for generating lyrics
            const button = document.createElement('button');
            button.textContent = 'Generate lyrics';
            button.classList.add('lyrics-button');
            
            button.onclick = () => {
                // Call ChatGPT to generate lyrics and update lyrics input
                (async () => {
                    button.disabled = true;
                    lyricsTextArea.value = '';
                    lyricsTextArea.dispatchEvent(new Event('input'));

                    let {lyrics, chorus} = await chrome.runtime.sendMessage({ production: input.value });

                    let splicedChorus = chorus.split('\n');
                    splicedChorus = splicedChorus[0].toLowerCase().includes('chorus') ? splicedChorus.splice(1) : splicedChorus;
                    chorus = splicedChorus.join('\n');

                    button.disabled = false;
                    lyricsTextArea.value = chorus;
                    lyricsTextArea.dispatchEvent(new Event('input'));
                })();
            }
            
            input.insertAdjacentElement('afterEnd', button);
        };
        
        const observer = new MutationObserver(mutationList => {
            const mutation = mutationList.find(({ type, attributeName }) => type === 'attributes' && attributeName === 'class');
            if (mutation && mutation.target.classList.contains('text-to-song-tabs__tab-active'))
                changeLyricsTabContent();
        });
        
        observer.observe(lyricsTab, { attributes: true });
        if (lyricsTab.classList.contains('text-to-song-tabs__tab-active'))
            changeLyricsTabContent();
    }
});
