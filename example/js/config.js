var dojoConfig = {
    async: true,
    baseUrl: "./js/",
    selectorEngine: "lite",
    tlmSiblingOfDojo: false,
    isDebug: true,
    packages: [
	{ name: "dojo", location: "../src/dojo" },
	{ name: "dijit", location: "../src/dijit" },
	{ name: "dojox", location: "../src/dojox" },
	{ name: "dstore", location: "../src/dstore" },
	{ name: "wordcloud", location: "../../wordcloud" }
   ],
   locale: "cs-cz"
};
