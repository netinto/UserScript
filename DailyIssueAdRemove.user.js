// ==UserScript==
// @name         DailyIssue AD cleaner
// @version      1.0
// @description  remove "hide" class from articleBody and hide .cover
// @match        *://dailyissue.net/*
// @run-at       document-end
// ==/UserScript==

(function() {
  'use strict';

  // itemprop="articleBody" 를 가진 div 요소를 찾음
  const articleDivs = document.querySelectorAll('div[itemprop="articleBody"]');

  articleDivs.forEach(div => {
    // class 속성에서 "hide" 를 제거
    div.classList.remove('hide');

    // 하위 div 중 class="cover" 를 찾음
    const coverDivs = div.querySelectorAll('div.cover');

    coverDivs.forEach(c => {
      // 해당 요소를 화면에서 숨김
      c.style.display = 'none';
    });
  });
})();
