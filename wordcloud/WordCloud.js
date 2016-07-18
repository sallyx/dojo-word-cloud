define([
    'dojo/_base/declare', 'dojo/_base/lang', 'dojo/_base/window',
    'dijit/_WidgetBase', 'dojo/dom', 'dojo/dom-construct', "dojo/dom-style", 'dojo/dom-class', 'dojo/dom-geometry',
    'dojo/_base/array','dojo/_base/fx','dojo/on',
    'dojo/domReady!'
], function(declare, lang, win, _WidgetBase,dom, domConstruct, domStyle, domClass, domGeometry, arrayUtils,fx,on){
    function shuffle(array) {
	var currentIndex = array.length, temporaryValue, randomIndex;
	while (0 !== currentIndex) {
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;
		temporaryValue = array[currentIndex];
		array[currentIndex] = array[randomIndex];
		array[randomIndex] = temporaryValue;
	}
	return array;
    }

    var animationFunctions = {
	'translate': function(dim) {
		arrayUtils.forEach(this._elements, lang.hitch(this, function(container) {
			domStyle.set(container.element, {top:dim.h/2+'px',left:dim.w/2+'px'});
			fx.animateProperty({
				node:container.element,
				properties: container.properties,
				duration:1000
			}).play();
		}));
	},
	'none' : function(dim){
		arrayUtils.forEach(this._elements, lang.hitch(this, function(container) {
			if(container.properties && container.properties.top && container.properties.left) {
				domStyle.set(container.element, {
					top:container.properties.top+'px',
					left:container.properties.left+'px'
				});
			}
		}));
	}
    };

    var positionFunctions = {
	    simpleCircle: function(dim) {
		    positionFunctions._circle.call(this,dim, 0);
	    },
	    advancedCircle: function(dim) {
		    positionFunctions._circle.call(this,dim, 1);
	    },
	    rows: function(dim) {
			arrayUtils.forEach(this._elements, lang.hitch(this, function(container, ix) {
				domClass.add(container.element, 'inrow');
				domConstruct.place(container.element,this.domNode);
				domConstruct.place(win.doc.createTextNode(' '),container.element,'after');
			}));
	    },
	    _circle: function(dim, colisionTest) {
			var radStep = this.degStep/180.0*Math.PI;
			var alfa = 0;
			var deltax = deltay = x = y = 0;
			var toppx = 0;
			var leftpx = 0;

			var count = this._elements.length;
			var circles = Math.ceil(count*radStep/(Math.PI*2));
			var tests = 3;
			deltax = dim.w/circles;
			deltay = dim.h/circles;
			if(colisionTest) {
				deltax /= tests*2;
				deltay /= tests*2;
			}

			var firstGeo;
			arrayUtils.forEach(this._elements, lang.hitch(this, function(container, ix) {
				if((this._elements.length - ix) < Math.PI*2/alfa) {
					alfa = Math.PI*2/(this._elements.length - ix);
				}
				if(!x) {
					firstGeo = domGeometry.getContentBox(container.element);
				}
				var p;
				tests = 3;
				do {
					p = _normalizexy(toppx, leftpx, dim.w, dim.h, container.geo);
					alfa += radStep;
					if(!x) x += deltax/2;
					if(!y) y += deltay/2;
					if(alfa >= Math.PI*2) {
						x += deltax;
						y += deltay;
						alfa -= Math.PI*2;
						if(!--tests) break;
					}
					toppx = Math.cos(alfa)* x;
					leftpx = Math.sin(alfa)* y;
				} while(colisionTest && _colision.call(this,p, container.geo));
				container.properties =  {
					'top': p.top,
					'left': p.left
				};
			}));
	   		function _normalizexy(toppx, leftpx, w, h, geo) {
				var top  = (h-geo.h)/2+leftpx;
				var left = (w-geo.w)/2+toppx;
				if(top < 0) top = 0;
				if(left < 0) left = 0;
				if(top+geo.h > h) top = h - geo.h;
				if(left+geo.w > w) left = w - geo.w;
				return {top: top, left:left};
			}

			function _pointColision(cp,cgeo, point) {
				if(point[0] < cp.top) return false;
				if(point[0] > cp.top+cgeo.h) return false;
				if(point[1] < cp.left) return false;
				if(point[1] > cp.left+cgeo.w) return false;
				return true;
			}
			function _colision(p, geo) {
				var result = false;
				arrayUtils.forEach(this._elements, lang.hitch(this, function(container) {
					if(!container.properties) return;
					var cp = container.properties;
					var cgeo = container.geo;
					if(_pointColision(cp,cgeo,[p.top,p.left])) { result = true; return; }
					if(_pointColision(cp,cgeo,[p.top+geo.h,p.left])) { result = true; return; }
					if(_pointColision(cp,cgeo,[p.top+geo.h,p.left+geo.w])) { result = true; return; }
					if(_pointColision(cp,cgeo,[p.top,p.left+geo.w])) { result = true; return; }
				}));
				return result;
			}
	 },
    };

    return declare([_WidgetBase], {
		store: null,
	    	storeCountKey: 'count',
	    	storeWordKey: 'word',
	    	baseClass: 'WordCloud',
		wordClass: 'word',
		animation: 'translate',
		positionFce: 'simpleCircle',
		shuffle: 1,
		width: null,
		height: null,
		levels: 10,
		degStep: 42,
		verticalChance:0,
		_elements : null,
		_animationFunctions: animationFunctions,
		_positionFunctions: positionFunctions,
		constructor: function (args) {
			lang.mixin(this, args);
			this._elements = [];
			if(this.height === null && this.positionFce === 'rows')
				this.height = 'auto';
		},

		buildRendering: function(){
			// create nodes
			this.domNode = domConstruct.create('div',{className:this.baseClass});
			var minCount = 0, maxCount = 0;
			this.store.sort(this.storeCountKey, false).fetch().forEach(function(word) {
				var element = domConstruct.create('span',{innerHTML: word[this.storeWordKey], className:this.wordClass});
				this._elements.push({element:element, word:word, properties:null});
				domConstruct.place(element, this.domNode);
				var c = word[this.storeCountKey];
				minCount = c < minCount ? c  : minCount;
				maxCount = c > maxCount ? c  : maxCount;
			}, this);
			var interval = (maxCount  - minCount)/this.levels;
			arrayUtils.forEach(this._elements, lang.hitch(this, function(container) {
				var c = interval ? container.word[this.storeCountKey]/interval : 5;
				c = Math.round(c);
				var sizeClass = 'wc_l'+this.levels+'_'+c;
				domClass.add(container.element, sizeClass);
				if(Math.random() < this.verticalChance) domClass.add(container.element, 'vertical-text');
			}));
			this.shuffleWords();
		},
		shuffleWords: function() {
			if(this.shuffle) {
				shuffle(this._elements);
			} else {
				this._elements.reverse();
			}
		},
		postCreate: function() {
			this.own(on(window,'resize',lang.hitch(this,function() {
				this.resize();
			})));
		},
		computeDimension: function() {
			var geo = domGeometry.getContentBox(this.domNode);
			var w = this.width == null ? geo.w : this.width;
			var h = this.height == null ? w : this.height;
			return {w:w,h:h};
		},
		_computeGeometry: function() {
			arrayUtils.forEach(this._elements, lang.hitch(this, function(container) {
				container.geo = domGeometry.getContentBox(container.element);
			}));
		},
		resize: function() {
			this._computeGeometry();
			var dim = this.computeDimension();
			this._computePosition(dim);
			domStyle.set(this.domNode, {height:dim.h+'px'});
			this._animatePosition(dim);
		},
		_animatePosition: function(dim) {
			var fce;
			if(typeof this.animation === "function")
				fce = this.animation;
			else
				fce = this._animationFunctions[this.animation];
			fce.call(this, dim);
		},
		_computePosition: function(dim) {
			var fce;
			if(typeof this.positionFce === "function")
				fce = this.positionFce;
			else
				fce = this._positionFunctions[this.positionFce];
			fce.call(this, dim);
		},
		startup: function() {
			this.inherited(arguments);
			this.resize();
		}
    });
});
