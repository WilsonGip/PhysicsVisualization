/*!
 * matter-tools 0.11.1 by Liam Brummitt 2017-07-02
 * https://github.com/liabru/matter-tools
 * License MIT
 */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("Matter"), require("MatterTools"));
	else if(typeof define === 'function' && define.amd)
		define(["Matter", "MatterTools"], factory);
	else if(typeof exports === 'object')
		exports["Demo"] = factory(require("Matter"), require("MatterTools"));
	else
		root["MatterTools"] = root["MatterTools"] || {}, root["MatterTools"]["Demo"] = factory(root["Matter"], root["MatterTools"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_1__, __WEBPACK_EXTERNAL_MODULE_2__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "../libraries";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	/**
	 * A tool for for running and testing example scenes.
	 * @module Demo
	 */

	var Matter = __webpack_require__(1);
	var Common = Matter.Common;
	var Demo = module.exports = {};
	var ToolsCommon = __webpack_require__(3);

	Demo._isIOS = window.navigator && /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

	Demo._matterLink = '';

	/**
	 * Creates a new demo instance.
	 * See example for options and usage.
	 * @function Demo.create
	 * @param {} options
	 */
	Demo.create = function (options) {
	  var demo = Object.assign({
	    example: {
	      instance: null
	    },
	    examples: [],
	    resetOnOrientation: false,
	    preventZoom: false,
	    inline: false,
	    startExample: true,
	    appendTo: document.body,
	    toolbar: {
	      title: null,
	      url: null,
	      reset: true,
	      source: false,
	      tools: false,
	      exampleSelect: false
	    },
	    dom: {}
	  }, options || {});

	  if (demo.examples.length > 1 && options.toolbar.exampleSelect !== false) {
	    demo.toolbar.exampleSelect = true;
	  }

	  demo.dom = Demo._createDom(demo);
	  Demo._bindDom(demo);

	  if (demo.inline) {
	    demo.dom.root.classList.add('matter-demo-inline');
	  }

	  if (demo.appendTo) {
	    demo.appendTo.appendChild(demo.dom.root);
	  }

	  if (demo.startExample) {
	    Demo.start(demo, demo.startExample);
	  }

	  return demo;
	};

	/**
	 * Starts a new demo instance by running the first or given example.
	 * See example for options and usage.
	 * @function Demo.start
	 * @param {demo} demo
	 * @param {string} [initalExampleId] example to start (defaults to first)
	 */
	Demo.start = function (demo, initalExampleId) {
	  initalExampleId = typeof initalExampleId === 'string' ? initalExampleId : demo.examples[0].id;

	  if (window.location.hash.length > 0) {
	    initalExampleId = window.location.hash.slice(1);
	  }

	  Demo.setExampleById(demo, initalExampleId);
	};

	/**
	 * Stops the currently running example in the demo.
	 * This requires that the `example.init` function returned 
	 * an object specifiying a `stop` function.
	 * @function Demo.stop
	 * @param {demo} demo
	 */
	Demo.stop = function (demo) {
	  if (demo.example && demo.example.instance) {
	    demo.example.instance.stop();
	  }
	};

	/**
	 * Stops and restarts the currently running example.
	 * @function Demo.reset
	 * @param {demo} demo
	 */
	Demo.reset = function (demo) {
	  Common._nextId = 0;
	  Common._seed = 0;

	  Demo.setExample(demo, demo.example);
	};

	/**
	 * Starts the given example by its id. 
	 * Any running example will be stopped.
	 * @function Demo.setExampleById
	 * @param {demo} demo
	 * @param {string} exampleId 
	 */
	Demo.setExampleById = function (demo, exampleId) {
	  var example = demo.examples.filter(function (example) {
	    return example.id === exampleId;
	  })[0];

	  Demo.setExample(demo, example);
	};

	/**
	 * Starts the given example.
	 * Any running example will be stopped.
	 * @function Demo.setExample
	 * @param {demo} demo
	 * @param {example} example 
	 */
	Demo.setExample = function (demo, example) {
	  if (example) {
	    var instance = demo.example.instance;

	    if (instance) {
	      instance.stop();

	      if (instance.canvas) {
	        instance.canvas.parentElement.removeChild(instance.canvas);
	      }
	    }

	    window.location.hash = example.id;

	    demo.example.instance = null;
	    demo.example = example;

	    demo.example.instance = instance = example.init(demo);

	    if (!instance.canvas && instance.render) {
	      instance.canvas = instance.render.canvas;
	    }

	    if (instance.canvas) {
	      demo.dom.header.style.maxWidth = instance.canvas.width + 'px';
	      document.getElementById('diagram').appendChild(instance.canvas);
	    }

	    demo.dom.exampleSelect.value = example.id;

	  } else {
	    Demo.setExample(demo, demo.examples[0]);
	  }
	};

	Demo._bindDom = function (demo) {
	  var dom = demo.dom;

	  window.addEventListener('orientationchange', function () {
	    setTimeout(function () {
	      if (demo.resetOnOrientation) {
	        Demo.reset(demo);
	      }
	    }, 300);
	  });

	  if (demo.preventZoom) {
	    document.body.addEventListener('gesturestart', function (event) {
	      event.preventDefault();
	    });

	    var allowTap = true,
	        tapTimeout;

	    document.body.addEventListener('touchstart', function (event) {
	      if (!allowTap) {
	        event.preventDefault();
	      }

	      allowTap = false;

	      clearTimeout(tapTimeout);
	      tapTimeout = setTimeout(function () {
	        allowTap = true;
	      }, 500);
	    });
	  }

	  if (dom.exampleSelect) {
	    dom.exampleSelect.addEventListener('change', function () {
	      var exampleId = this.options[this.selectedIndex].value;
	      Demo.setExampleById(demo, exampleId);
	    });
	  }

	};

	Demo._createDom = function (options) {
	  var styles = __webpack_require__(4);
	  ToolsCommon.injectStyles(styles, 'matter-demo-style');

	  var root = document.createElement('div');

	  var exampleOptions = options.examples.map(function (example) {
	    return '<option value="' + example.id + '">' + example.name + '</option>';
	  }).join(' ');

	  var preventZoomClass = options.preventZoom && Demo._isIOS ? 'prevent-zoom-ios' : '';

	  root.innerHTML = `
	      
	      	
	        <header class="matter-header">
	            <div class="matter-toolbar">
	              <div class="matter-select-wrapper">
	                <select class="matter-example-select matter-select">
	                  ${exampleOptions}
	                </select>
	              </div>
	            </div>
	        </header>
	      
	  `;
	  var dom = {
	    root: root.firstElementChild,
	    header: root.querySelector('.matter-header'),
	    exampleSelect: root.querySelector('.matter-example-select'),
	  };


	  if (!options.toolbar.exampleSelect) {
	    ToolsCommon.domRemove(dom.exampleSelect.parentElement);
	  }

	  return dom;
	};

	/*** EXPORTS FROM exports-loader ***/

/***/ },
/* 1 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_1__;

/***/ },
/* 2 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_2__;

/***/ },
/* 3 */
/***/ function(module, exports) {

	"use strict";

	/**
	* @class Common
	*/

	var Common = module.exports = {};

	Common.injectStyles = function (styles, id) {
	  if (document.getElementById(id)) {
	    return;
	  }

	  var root = document.createElement('div');
	  root.innerHTML = '<style id="' + id + '" type="text/css">' + styles + '</style>';

	  var lastStyle = document.head.querySelector('style:last-of-type');

	  if (lastStyle) {
	    Common.domInsertBefore(root.firstElementChild, lastStyle);
	  } else {
	    document.head.appendChild(root.firstElementChild);
	  }
	};

	Common.injectScript = function (url, id, callback) {
	  if (document.getElementById(id)) {
	    return;
	  }

	  var script = document.createElement('script');
	  script.id = id;
	  script.src = url;
	  script.onload = callback;

	  document.body.appendChild(script);
	};

	Common.domRemove = function (element) {
	  return element.parentElement.removeChild(element);
	};

	Common.domInsertBefore = function (element, before) {
	  return before.parentNode.insertBefore(element, before.previousElementSibling);
	};

	/*** EXPORTS FROM exports-loader ***/

/***/ },
/* 4 */
/***/ function(module, exports) {

	module.exports = ``
/***/ }
/******/ ])
});
;