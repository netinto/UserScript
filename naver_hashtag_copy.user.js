// ==UserScript==
// @name         Naver Brand Store Hashtag Copier
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  네이버 브랜드 및 스마트 스토어 상품 상세 페이지에서 첫 번째 해시태그를 복사합니다.
// @author       Antigravity
// @match        https://brand.naver.com/*/products/*
// @match        https://m.brand.naver.com/*/products/*
// @match        https://smartstore.naver.com/*/products/*
// @match        https://m.smartstore.naver.com/*/products/*
// @grant        GM_setClipboard
// @grant        GM_addStyle
// @grant        unsafeWindow
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
        // 1. window.__PRELOADED_STATE__ 에서 추출 시도 (가장 정확함)
        // 유저스크립트 전용 스코프이므로 페이지의 window 객체에 직접 접근하기 위해 unsafeWindow 또는 스크립트 주입 활용 가능
        // 여기서는 안전하게 페이지 내의 정적 데이터를 텍스트로 읽어오는 방식이나, 
        // 이미 렌더링된 요소가 없을 경우에 대비해 데이터 객체를 탐색하는 로직을 추가합니다.

        try {
            // 브라우저 페이지의 클라이언트 사이드 변수에 접근 (비표준 방식이나 네이버에서 유효)
            const state = (typeof unsafeWindow !== 'undefined' ? unsafeWindow : window).__PRELOADED_STATE__;
            if (state && state.productSimpleView && state.productSimpleView.product && state.productSimpleView.product.seoInfo) {
                const tags = state.productSimpleView.product.seoInfo.sellerTags;
                if (tags && tags.length > 0) {
                    // 가상의 요소를 만들어 기존 doCopy 로직과 호환성 유지
                    const virtualEl = document.createElement('a');
                    virtualEl.innerText = tags[0].text;
                    // 데이터에서 가져온 경우 스크롤은 생략하거나 특정 영역으로 이동
                    virtualEl.isDataOnly = true;
                    return virtualEl;
                }
            }
        } catch (e) {
            console.log('Data extraction failed, falling back to DOM search');
        }

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

        // 1. 해당 위치로 스크롤 (실제 DOM 요소인 경우에만)
        if (!element.isDataOnly) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });

            // 2. 시각적 유도 (깜빡임 효과)
            const originalBg = element.style.backgroundColor;
            element.style.backgroundColor = '#ffff00';
            setTimeout(() => { element.style.backgroundColor = originalBg; }, 1000);
        }

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

    function autoExpandAndScroll() {
        const expandBtn = document.querySelector('.dnjZ5j9eOR');
        if (expandBtn && expandBtn.innerText.includes('펼쳐보기')) {
            expandBtn.click();
            showToast('상세정보를 자동으로 확장합니다.');
        }

        // 해시태그가 나타나면 해당 위치로 스크롤
        const scrolltoHashtag = () => {
            const element = findFirstHashtagElement();
            if (element && !element.isDataOnly) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                return true;
            }
            return false;
        };

        // 즉시 시도 및 약간의 대기 후 시도 (로딩 고려)
        if (!scrolltoHashtag()) {
            setTimeout(scrolltoHashtag, 1000);
            setTimeout(scrolltoHashtag, 2500);
        }
    }

    // 페이지 로드 후 자동 실행
    window.addEventListener('load', () => {
        // 네이버 페이지 특성상 지연 실행이 필요할 수 있음
        setTimeout(autoExpandAndScroll, 1000);
    });

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
