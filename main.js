// ==UserScript==
// @name         X url to Twitter
// @version      0.3
// @description  Add a button to copy the URL of a tweet on X and changes its url to old https://twitter.com/*, https://vxtwitter.com/* or https://fxtwitter.com/*
// @author       Taube
// @match        https://twitter.com/*
// @match        https://mobile.twitter.com/*
// @match        https://tweetdeck.twitter.com/*
// @match        https://x.com/*
// @icon         https://www.google.com/s2/favicons?domain=twitter.com

// ==/UserScript==

(function() {
    'use strict';

    const baseUrl = 'https://twitter.com';
    const vxtwitterUrl = 'https://vxtwitter.com';
    const fxUrl = 'https://fxtwitter.com';

    const defaultSVG = '<svg xmlns="http://www.w3.org/2000/svg" width="2em" height="1em" viewBox="0 0 24 24"><path fill="none" stroke="#71767B" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M23 3.01s-2.018 1.192-3.14 1.53a4.48 4.48 0 0 0-7.86 3v1a10.66 10.66 0 0 1-9-4.53s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5q-.001-.418-.08-.83C21.94 5.674 23 3.01 23 3.01"/></svg>';
    const vxtwitterSVG = '<svg xmlns="http://www.w3.org/2000/svg" width="0.75em" height="1em" viewBox="0 0 384 512"><path fill="#71767B" d="M19.7 34.5c16.3-6.8 35 .9 41.8 17.2L192 364.8L322.5 51.7c6.8-16.3 25.5-24 41.8-17.2s24 25.5 17.2 41.8l-160 384c-5 11.9-16.6 19.7-29.5 19.7s-24.6-7.8-29.5-19.7l-160-384c-6.8-16.3.9-35 17.2-41.8"/></svg>';
    const fxSVG = '<svg xmlns="http://www.w3.org/2000/svg" width="0.63em" height="1em" viewBox="0 0 320 512"><path fill="#71767B" d="M64 32C28.7 32 0 60.7 0 96v352c0 17.7 14.3 32 32 32s32-14.3 32-32V288h160c17.7 0 32-14.3 32-32s-14.3-32-32-32H64V96h224c17.7 0 32-14.3 32-32s-14.3-32-32-32z"/></svg>';
    const copiedSVG = '<svg xmlns="http://www.w3.org/2000/svg" width="0.88em" height="1em" viewBox="0 0 448 512"><path fill="#71767B" d="M208 0h124.1C344.8 0 357 5.1 366 14.1L433.9 82c9 9 14.1 21.2 14.1 33.9V336c0 26.5-21.5 48-48 48H208c-26.5 0-48-21.5-48-48V48c0-26.5 21.5-48 48-48M48 128h80v64H64v256h192v-32h64v48c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48"/></svg>';


    function addCopyButtonToTweets() {
        const tweets = document.querySelectorAll('button[data-testid="bookmark"]');

        tweets.forEach(likeButton => {
            const parentDiv = likeButton.parentElement;
            const tweet = parentDiv.closest('article[data-testid="tweet"]');
            if (tweet && !tweet.querySelector('.custom-copy-icon')) {
                const allButtons = [];

                const copyIcon = createButton(defaultSVG, baseUrl, tweet, allButtons);
                const vxtwitterIcon = createButton(vxtwitterSVG, vxtwitterUrl, tweet, allButtons);
                const fxIcon = createButton(fxSVG, fxUrl, tweet, allButtons);

                allButtons.push(copyIcon, vxtwitterIcon, fxIcon);

                copyIcon.defaultSVG = defaultSVG;
                vxtwitterIcon.defaultSVG = vxtwitterSVG;
                fxIcon.defaultSVG = fxSVG;

                const parentDivClone = parentDiv.cloneNode(true);
                parentDivClone.style.cssText = 'display: flex; align-items: center;';
                parentDiv.parentNode.insertBefore(parentDivClone, parentDiv.nextSibling);
                parentDivClone.innerHTML = '';
                parentDivClone.appendChild(copyIcon);
                parentDivClone.appendChild(vxtwitterIcon);
                parentDivClone.appendChild(fxIcon);
            }
        });
    }

    function createButton(svg, url, tweet, allButtons) {
        const icon = document.createElement('div');
        icon.classList.add('custom-copy-icon');
        icon.setAttribute('aria-label', 'Copy link');
        icon.setAttribute('role', 'button');
        icon.setAttribute('tabindex', '0');
        icon.style.cssText = 'display: flex; align-items: center; justify-content: center; width: 19px; height: 19px; border-radius: 9999px; transition-duration: 0.2s; cursor: pointer;';
        icon.innerHTML = svg;

        if (svg === defaultSVG) {
            icon.onmouseover = function() {
                this.querySelector('svg path').style.stroke = 'orange';
            };
            icon.onmouseout = function() {
                this.querySelector('svg path').style.stroke = '#71767B';
            };
        } else {
            icon.onmouseover = function() {
                this.querySelector('svg path').style.fill = 'orange';
            };
            icon.onmouseout = function() {
                this.querySelector('svg path').style.fill = '#71767B';
            };
        }

        icon.addEventListener('click', (event) => {
            event.stopPropagation();
            const tweetUrl = extractTweetUrl(tweet, url);
            if (tweetUrl) {
                navigator.clipboard.writeText(tweetUrl)
                    .then(() => {
                        console.log('Tweet link copied!');
                        icon.innerHTML = copiedSVG;

                        allButtons.forEach(button => {
                            if (button !== icon) {
                                button.innerHTML = button.defaultSVG;
                            }
                        });
                    })
                    .catch(err => console.error('Error copying link: ', err));
            }
        });

        return icon;
    }

    function extractTweetUrl(tweetElement, url) {
        const linkElement = tweetElement.querySelector('a[href*="/status/"]');

        if (!linkElement) {
            return;
        }

        let tweetUrl = linkElement.getAttribute('href').split('?')[0];

        if (tweetUrl.includes('/photo/')) {
            tweetUrl = tweetUrl.split('/photo/')[0];
        }
        return `${url}${tweetUrl}`;
    }

    const observer = new MutationObserver(addCopyButtonToTweets);
    observer.observe(document.body, { childList: true, subtree: true });

    addCopyButtonToTweets();
})();
