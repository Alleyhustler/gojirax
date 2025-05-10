(function (width, height, src, createAndAppendIframe, programmaticFullScreen) {
            const parentNode = (document.currentScript ||
                (function () {
                    const nodeList = document.getElementsByTagName('script');
                    return nodeList.item(nodeList.length - 1);
                })()).parentNode;
            const iframeElement = createAndAppendIframe({ width: width, height: height, src: src }, parentNode);
            let exitFullScreen = null;
            window.addEventListener('message', (event) => {
                if (event.source !== iframeElement.contentWindow) {
                    return;
                }
                if (event.data.eventName === 'enterProgrammaticFullScreen') {
                    exitFullScreen || (exitFullScreen = programmaticFullScreen(iframeElement));
                }
                else if (event.data.eventName === 'exitProgrammaticFullScreen') {
                    exitFullScreen && exitFullScreen();
                    exitFullScreen = null;
                }
            });
        })(320, 180, 'https://embed.nicovideo.jp/watch/sm33376841?persistence=1&oldScript=1&referer=https%3A%2F%2Fyamiyuri.neocities.org%2FTranslations&from=0&allowProgrammaticFullScreen=1', function createAndAppendIframe(attributes, parent) {
        const iframeElement = document.createElement('iframe');
        iframeElement.setAttribute('allowfullscreen', 'allowfullscreen');
        iframeElement.setAttribute('allow', 'autoplay');
        iframeElement.setAttribute('frameborder', '0');
        iframeElement.width = attributes.width.toString();
        iframeElement.height = attributes.height.toString();
        iframeElement.src = attributes.src;
        parent.appendChild(iframeElement);
        if (window.getComputedStyle(iframeElement).getPropertyValue('max-width') === 'none') {
            iframeElement.style.maxWidth = '100%';
        }
        return iframeElement;
    }, function (iframe) {
        let stylesToModify = [
            'width',
            'height',
            'top',
            'left',
            'position',
            'z-index',
            'max-width',
            'transform',
            '-webkit-transform',
            'transform-origin',
            '-webkit-transform-origin'
        ];
        let originalStyles = stylesToModify.reduce((acc, style) => {
            acc[style] = {
                value: iframe.style.getPropertyValue(style),
                priority: iframe.style.getPropertyPriority(style)
            };
            return acc;
        }, {});
        let timer;
        let ended = false;
        let initialScrollX = window.scrollX;
        let initialScrollY = window.scrollY;
        let wasLandscape = null;
        function pollingResize() {
            if (ended) {
                return;
            }
            const isLandscape = window.innerWidth >= window.innerHeight;
            const width = `${isLandscape ? window.innerWidth : window.innerHeight}px`;
            const height = `${isLandscape ? window.innerHeight : window.innerWidth}px`;
            if (iframe.style.width !== width || iframe.style.height !== height) {
                iframe.style.setProperty('width', width, 'important');
                iframe.style.setProperty('height', height, 'important');
                window.scrollTo(0, 0);
            }
            if (isLandscape !== wasLandscape) {
                wasLandscape = isLandscape;
                if (isLandscape) {
                    // 回転しない
                    iframe.style.setProperty('transform', 'none', 'important');
                    iframe.style.setProperty('-webkit-transform', 'none', 'important');
                    iframe.style.setProperty('left', '0', 'important');
                }
                else {
                    // 回転する
                    iframe.style.setProperty('transform', 'rotate(90deg)', 'important');
                    iframe.style.setProperty('-webkit-transform', 'rotate(90deg)', 'important');
                    iframe.style.setProperty('left', '100%', 'important');
                }
            }
            timer = setTimeout(startPollingResize, 200);
        }
        function startPollingResize() {
            if (window.requestAnimationFrame) {
                window.requestAnimationFrame(pollingResize);
            }
            else {
                pollingResize();
            }
        }
        startPollingResize();
        iframe.style.setProperty('top', '0', 'important');
        iframe.style.setProperty('position', 'fixed', 'important');
        iframe.style.setProperty('z-index', '2147483647', 'important');
        iframe.style.setProperty('max-width', 'none', 'important');
        iframe.style.setProperty('transform-origin', '0% 0%', 'important');
        iframe.style.setProperty('-webkit-transform-origin', '0% 0%', 'important');
        return function () {
            stylesToModify.forEach((style) => {
                const originalStyle = originalStyles[style];
                iframe.style.removeProperty(style);
                iframe.style.setProperty(style, originalStyle.value, originalStyle.priority);
            });
            clearTimeout(timer);
            ended = true;
            window.scrollTo(initialScrollX, initialScrollY);
        };
    });