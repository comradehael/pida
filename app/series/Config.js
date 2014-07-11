define([],
	function ()
	{
		configOptions = {
			//The appid for the configured application
			appid: "",
			//The web map id
			webmaps: [
			{
				id: "5741865f0a484364ab4cbcaaeaccb829",
				title: "Deliver via Company Vehicle",
				// If your map has time properties, choose to show a single time instance instead of the time interval saved with the web map.
				showSingleTimeInstance: false,
				// Hide legend and legend toggle for specific map by setting this option to false
				legendVisible: false,
				// Set to true if you want the legend of this specific map to open when a user selects the tab for this map.
				openLegendOnChange: false
			},
			{
				id: "93c7b66a704a4ff5b8e788a2c2fa83bd",
				title: "Deliver via Commercial Carrier",
				// If your map has time properties, choose to show a single time instance instead of the time interval saved with the web map.
				showSingleTimeInstance: false,
				// Hide legend and legend toggle for specific map by setting this option to false
				legendVisible: false,
				// Set to true if you want the legend of this specific map to open when a user selects the tab for this map.
				openLegendOnChange: false
			},
			{
			id: "7707a92479f240e4a9ac6febd97f3117",
				title: "Field Staff Sales Support",
				// If your map has time properties, choose to show a single time instance instead of the time interval saved with the web map.
				showSingleTimeInstance: false,
				// Hide legend and legend toggle for specific map by setting this option to false
				legendVisible: false,
				// Set to true if you want the legend of this specific map to open when a user selects the tab for this map.
				openLegendOnChange: false
			}
			// To add additional maps to the template, uncomment the below section for
			// each map you would like to add. Webmap titles from ArcGIS Online will
			// be used unless you fill in title attribute.
			// , {
			
				// id: "739db23c3f674005a405c68e337f5011",
				// title: "",
				// // If your map has time properties, choose to show a single time instance instead of the time interval saved with the web map.
				// showSingleTimeInstance: false,
			 // // Hide legend and legend toggle for specific map by setting this option to false
				// legendVisible: true,
			 // // Set to true if you want the legend of this specific map to open when a user selects the tab for this map.
				// openLegendOnChange: false
				// },{
			
				// id: "739db23c3f674005a405c68e337f5011",
				// title: "",
				// // If your map has time properties, choose to show a single time instance instead of the time interval saved with the web map.
				// showSingleTimeInstance: false,
			 // // Hide legend and legend toggle for specific map by setting this option to false
				// legendVisible: true,
			 // // Set to true if you want the legend of this specific map to open when a user selects the tab for this map.
				// openLegendOnChange: false
				// }
			],
			//Enter a title, if no title is specified, the first webmap's title is used.
			title: "PIDA Service Areas",
			//Enter a subtitle, if no subtitle is specified, the first webmap's subtitle is used.
			subtitle: "Add a subtitle here",
			// If false, each tab will have a number on it. If true, the first tab will not have a number and the second tab will start counting at 1.
			startCountOnSecondTab: false,
			//Sync maps scale and location
			syncMaps: true,
			//Display geocoder search widget
			geocoderWidget: true,
			// Specify a proxy for custom deployment
			proxyurl: "",
			//specify the url to a geometry service
			geometryserviceurl: "http://tasks.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer",
			//If the webmap uses Bing Maps data, you will need to provided your Bing Maps Key
			bingmapskey : "",
			//Modify this to point to your sharing service URL if you are using the portal
			sharingurl: "http://www.arcgis.com/sharing/rest/content/items"
		}
	}
);
