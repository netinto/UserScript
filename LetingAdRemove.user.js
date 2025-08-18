// ==UserScript==
// @name         Leting AD cleaner
// @version      1.0
// @description  Leting AD Remove
// @match        *://leting.kr/*
// @run-at       document-start
// ==/UserScript==

(function() {
  'use strict';  
	for (i=0; i<document.forms.length; i++) {
		for (k=0; k<document.forms[i].length; k++) {
			el = document.forms[i].elements[k];    
			if (el.type == "select-one" && el.style.visibility == 'hidden')
				el.style.visibility = 'visible';
		}
	}
})();
