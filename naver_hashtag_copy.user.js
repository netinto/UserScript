// ==UserScript==
// @name         Naver Brand Store Hashtag Copier
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  네이버 브랜드스토어 상품 상세 페이지에서 첫 번째 해시태그를 복사합니다.
// @author       Antigravity
// @match        https://brand.naver.com/*/products/*
// @match        https://m.brand.naver.com/*/products/*
// @grant        GM_setClipboard
// @grant        GM_addStyle
// ==/UserScript==

(function () {
    'use strict';

    // CSS 스타일 추가 (플로팅 버튼 전용)
    GM_addStyle(`
        #hashtag-copy-btn {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 9999;
            padding: 12px 20px;
            background-color: #03c75a;
            color: white;
            border: none;
            border-radius: 50px;
            font-weight: bold;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            transition: transform 0.2s, background-color 0.2s;
        }
        #hashtag-copy-btn:hover {
            background-color: #02b351;
            transform: scale(1.05);
        }
        #hashtag-copy-btn:active {
            transform: scale(0.95);
        }
        #hashtag-copy-toast {
            position: fixed;
            bottom: 80px;
            right: 20px;
            z-index: 9999;
            padding: 10px 20px;
            background-color: #333;
            color: white;
            border-radius: 8px;
            font-size: 14px;
            opacity: 0;
            transition: opacity 0.3s;
            pointer-events: none;
        }
    `);

    let isAlreadyCopied = false;

    function findFirstHashtagElement() {
        const container = document.querySelector('.NAR95xKIue');
        if (container) {
            const firstLink = container.querySelector('a');
            if (firstLink && firstLink.innerText.trim().startsWith('#')) return firstLink;
        }
        const hashtagLinks = document.querySelectorAll('.f_JzwGZdbu a');
        if (hashtagLinks.length > 0) return hashtagLinks[0];
        const allLinks = Array.from(document.querySelectorAll('a'));
        const firstHashtag = allLinks.find(a => a.innerText && a.innerText.trim().startsWith('#'));
        return firstHashtag || null;
    }

    function showToast(message) {
        let toast = document.getElementById('hashtag-copy-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'hashtag-copy-toast';
            document.body.appendChild(toast);
        }
        toast.innerText = message;
        toast.style.opacity = '1';
        setTimeout(() => { toast.style.opacity = '0'; }, 3000);
    }

    function doCopy(element, isAuto = false) {
        if (isAlreadyCopied) return;
        const text = element.innerText.trim().replace(/^#/, '');
        GM_setClipboard(text);

        // 1. 해당 위치로 스크롤
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // 2. 시각적 유도 (깜빡임 효과)
        const originalBg = element.style.backgroundColor;
        element.style.backgroundColor = '#ffff00';
        setTimeout(() => { element.style.backgroundColor = originalBg; }, 1000);

        showToast(`${isAuto ? '[자동] ' : ''}복사됨: ${text}`);
        isAlreadyCopied = true;
    }

    function copyHashtag() {
        const element = findFirstHashtagElement();
        if (element) {
            isAlreadyCopied = false; // 수동 클릭 시에는 다시 복사 가능하게
            doCopy(element);
        } else {
            const expandBtn = document.querySelector('.dnjZ5j9eOR');
            if (expandBtn) {
                showToast('상세정보를 펼쳐서 해시태그를 찾는 중...');
                expandBtn.click();
                setTimeout(() => {
                    const newElement = findFirstHashtagElement();
                    if (newElement) {
                        doCopy(newElement);
                    } else {
                        window.scrollTo({ top: document.body.scrollHeight / 2, behavior: 'smooth' });
                        showToast('해시태그를 찾기 위해 조금 더 스크롤해 보세요.');
                    }
                }, 800);
            } else {
                alert('해시태그를 찾을 수 없습니다. 페이지 하단으로 스크롤해 보세요.');
            }
        }
    }

    // 자동 복사: 해시태그가 DOM에 나타나면 즉시 수행
    const observer = new MutationObserver(() => {
        if (isAlreadyCopied) return;
        const element = findFirstHashtagElement();
        if (element) {
            doCopy(element, true);
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // 버튼 생성 및 연결
    const btn = document.createElement('button');
    btn.id = 'hashtag-copy-btn';
    btn.innerText = '첫 해시태그 복사';
    btn.onclick = (e) => {
        e.preventDefault();
        copyHashtag();
    };
    document.body.appendChild(btn);

})();
