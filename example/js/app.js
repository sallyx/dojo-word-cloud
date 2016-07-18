require([
		'dojo/parser',
		'dstore/Memory',
		'wordcloud/WordCloud',
		'dojo/domReady!'
    ],
    function(parser, Memory, Cloud) {

	     var words = [
		             {count:1, word:'<b>strong</b>', title: null},
		             {count:5, word:'five', title: null},
		             {count:8, word:'osum', title: null},
		             {count:10, word:'deset', title: null},
		             {count:15, word:'Patnáct', title: null},
		             {count:30, word:'Třicet', title: null},
		             {count:100, word:'Sto', title: null},
		             {count:50, word:'pade', title: null},
		             {count:50, word:'pade', title: null},
		             {count:50, word:'pade', title: null},
		             {count:50, word:'pade', title: null},
		             {count:50, word:'pade', title: null},
		             {count:50, word:'pade', title: null},
		             {count:50, word:'pade', title: null},
		             {count:30, word:'Třicet', title: null},
		             {count:30, word:'Třicet', title: null},
		             {count:30, word:'Třicet', title: null},
		             {count:30, word:'Třicet', title: null},
		             {count:30, word:'Třicet', title: null},
		             {count:30, word:'Třicet', title: null},
		             {count:30, word:'Třicet', title: null},
		             {count:30, word:'Třicet', title: null},
		             {count:30, word:'Třicet', title: null},
		             {count:30, word:'Třicet', title: null},
		             {count:30, word:'Třicet', title: null},
		             {count:30, word:'Třicet', title: null},
		             {count:30, word:'Třicet', title: null},
		             {count:30, word:'Třicet', title: null},
 	    ];
	    var store = new Memory({data:words});
	    var cloud = new Cloud({
		    store:store,
		    animation:'translate',
		    height:300,
		    positionFce:'advancedCircle',
		    verticalChance: 0,
		    shuffle: 0
	    });
	    cloud.placeAt('container');
	    cloud.startup();
	    var cloud = new Cloud({
		    store:store,
		    animation:'none',
		    positionFce:'rows'
	    });
	    cloud.placeAt('container2');
	    cloud.startup();
    }
); 

