const clearNode = node => {
    const descendants = []
    const getDescendants = node => {
        descendants.push(node);
        node.childNodes.forEach(getDescendants);
    };

    getDescendants(node);
    descendants.forEach(node => node.remove());
    node.remove();
};

chrome.runtime.onMessage.addListener(message => {
    if (message === 'page-loaded') {
        const tabsContainer = document.getElementsByClassName('text-to-song-tabs')[0];
        
        const lyricsTab = tabsContainer.childNodes[2];
        lyricsTab.lastChild.lastChild.textContent = 'Movie/TV Show';
        
        const changeLyricsTabContent = () => {
            // Change title
            const content = document.getElementsByClassName('step-lyrics')[0];
            content.firstChild.firstChild.textContent = 'Write down the name of a movie or TV show!';
            const positioning = document.createElement('div')
            positioning.classList.add('pos')
            const pos =  ['TV Show', 'Movie'];
            const selected = document.createElement('select');

            for(var i =0; i<pos.length; i++){
                var option = document.createElement('option')
                option.value= pos[i]
                option.text = pos[i]
                selected.appendChild(option)
            }
            positioning.append(selected)
            content.firstChild.firstChild.insertAdjacentElement('afterEnd', positioning)
            selected.classList.add('select')

            // Add input for movie/TV show
            const input = document.createElement('input');
            input.setAttribute('placeholder', 'Movie or TV show');
            input.classList.add('text-input');
            input.type = 'text';
            
            content.firstChild.insertAdjacentElement('afterEnd', input);
            
            // Disable and hide input for lyrics
            const lyricsTextArea = document.getElementsByClassName('step-lyrics__textInput')[0];
            console.log(lyricsTextArea)
            lyricsTextArea.setAttribute('disabled', 'true');
            lyricsTextArea.removeAttribute('placeholder');
            lyricsTextArea.style.visibility = 'hidden';
            lyricsTextArea.style.height = '0';
            
            // Add button for generating lyrics
            const button = document.createElement('button');
            button.textContent = 'Generate lyrics';
            button.classList.add('lyrics-button');

            const createSongButton = document.querySelector('button[aria-label="Create song"]');
            createSongButton.firstChild.childNodes[6].textContent = 'Create chorus audio';
            
            const allLyrics = document.createElement('div');
            lyricsTextArea.insertAdjacentElement('afterEnd', allLyrics);

            button.onclick = () => {
                // Call ChatGPT to generate lyrics and update lyrics input
                (async () => {
                    button.disabled = true;
                    const waiting = document.createElement('h3');
                    waiting.classList.add('waitingText')
                    const elText = document.createTextNode('Your lyrics will be ready soon');
                    waiting.append(elText);
                    lyricsTextArea.insertAdjacentElement('beforebegin', waiting);

                    clearNode(allLyrics);
                    lyricsTextArea.value = '';
                    lyricsTextArea.dispatchEvent(new Event('input'));

                    let {lyrics, chorus} = await chrome.runtime.sendMessage({ production: input.value, type: selected.value });

                    let splicedChorus = chorus.split('\n');
                    splicedChorus = splicedChorus[0].toLowerCase().includes('chorus') ? splicedChorus.splice(1) : splicedChorus;
                    chorus = splicedChorus.join('\n');

                    const verses = lyrics.split('\n\n');
                    verses.forEach(verse => {
                        const verseContainer = document.createElement('div');
                        verse.split('\n').slice(1).forEach(line => {
                            const paragraph = document.createElement('p');
                            const text = document.createTextNode(line);
                            paragraph.append(text);

                            paragraph.classList.add('verse-row');
                            verseContainer.append(paragraph);
                        });

                        verseContainer.classList.add('verse-container');
                        allLyrics.append(verseContainer);
                    });

                    lyricsTextArea.insertAdjacentElement('afterEnd', allLyrics);

                    waiting.remove()
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
