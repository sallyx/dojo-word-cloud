define([
    'dojo/_base/declare', 'dojo/_base/lang',
    'dijit/_WidgetBase', 'dojo/dom', 'dojo/dom-construct', "dojo/dom-style", 'dojo/dom-class', 'dojo/dom-geometry',
    'dojo/_base/array','dojo/_base/fx','dojo/on',
    'dojo/domReady!'
], function(declare, lang, _WidgetBase,dom, domConstruct, domStyle, domClass, domGeometry, arrayUtils,fx,on){

    return declare([_WidgetBase], {
		store: null,
	    	storeCountKey: 'count',
	    	storeWordKey: 'word',
	    	baseClass: 'WordCloud',
		wordClass: 'word',
		animation: 'translate',
		width: null,
		height: null,
		levels: 10,
		degStep: 30,
		_elements : null,
		constructor: function (args) {
			lang.mixin(this, args);
			this._elements = [];
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
				var c = container.word['count']/interval;
				c = Math.round(c);
				var sizeClass = 'wc_l'+this.levels+'_'+c;
				domClass.add(container.element, sizeClass);
			}));
			this._elements.reverse();
		},
		postCreate:function() {
			this.own(on(window,'resize',lang.hitch(this,function() {
				this.resize();
			})));
		},
		resize: function() {
			var geo = domGeometry.getContentBox(this.domNode);
			var w = this.width == null ? geo.w : this.width;
			var h = this.height == null ? w : this.height;
			var radStep = this.degStep/180.0*Math.PI;
			var alfa = 0;
			var deltax = deltay = x = y = 0;
			var toppx = 0;
			var leftpx = 0;

			var count = this._elements.length;
			var circles = Math.ceil(count*radStep/(Math.PI*2));
			deltax = w/circles/2;
			deltay = h/circles/2;

			var firstGeo;
			arrayUtils.forEach(this._elements, lang.hitch(this, function(container) {
				if(!x) {
					firstGeo = domGeometry.getContentBox(container.element);
				}
				var p = this._normalizexy(toppx,leftpx,w,h,firstGeo, container.element);
				container.properties =  {
					'top': p.top,
					'left': p.left
				};
				alfa += radStep;
				if(!x) x += deltax;
				if(!y) y += deltay;
				if(alfa >= Math.PI*2) {
					x += deltax;
					y += deltay;
					alfa -= Math.PI*2;
				}
				toppx = Math.sin(alfa)* x;
				leftpx = Math.cos(alfa)* y;
			}));
			domStyle.set(this.domNode, {height:h+'px'});
			this._animatePosition(w,h,firstGeo);
		},
		_normalizexy: function(toppx,leftpx,w,h,firstGeo, element) {
			var geo = domGeometry.getContentBox(element);

			var top = (w-geo.w)/2+toppx;
			var left = (h-firstGeo.h-geo.h)/2+leftpx;
			if(top < 0) top = 0;
			if(left < 0) left = 0;
			if(top+geo.h > h) top = h - geo.h;
			if(left+geo.w > w) left = w - geo.w;
			return {top: top, left:left};
		},
		_animatePosition: function(w,h,g) {
			var fce = this._animationFunctions[this.animation];
			fce.call(this, w,h,g);
		},
		_animationFunctions: {
			'translate': function(w,h,g) {
				arrayUtils.forEach(this._elements, lang.hitch(this, function(container) {
				domStyle.set(container.element, {top:h/2-g.h/2+'px',left:w/2-g.w/2+'px'});
				fx.animateProperty({
					node:container.element,
					properties: container.properties,
					duration:1000
				}).play();
				}));
			},
			'none' : function(w,h,g){
				arrayUtils.forEach(this._elements, lang.hitch(this, function(container) {
					domStyle.set(container.element, {
						top:container.properties.top+'px',
						left:container.properties.left+'px'
					});
				}));
			}
		},
		startup: function() {
			this.inherited(arguments);
			this.resize();
		}
    });
});
