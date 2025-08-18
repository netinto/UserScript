// ==UserScript==
// @name         Leting AD cleaner
// @version      1.0
// @description  Leting AD Remove
// @match        *://leting.kr/*
// @run-at       document-end
// ==/UserScript==
(function () {
    'use strict';
    // <div class="contentsBox"> 의 **직접 자식** 중 class 에 'view-padding' 이 포함된 요소 찾기
    const targets = document.querySelectorAll('div.contentsBox > div.cropped');
    targets.forEach(el = > {
        // "cropped" 클래스가 있으면 제거
        if (el.classList.contains('cropped')) {
            el.classList.remove('cropped');
        }
    });
    const ads = document.querySelectorAll('div.adButton');
    ads.forEach(el = > {
        el.style.display = 'none';
    });
})();