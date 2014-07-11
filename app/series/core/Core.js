define(["esri/map", "esri/arcgis/utils", "esri/layout", "esri/widgets", "dojo/_base/connect", "dojo/has", "storymaps/utils/Helper", "dojo/dom", "esri/domUtils"], function (Map, Utils, Layout, Widgets, connect, Has, Helper, dom, domUtils) {
	$(window).resize(function () {
		Helper.resetLayout();
		setAccordionContentHeight();
		responsiveLayout();
		mobileReady();
	});
	$(document).ready(function () {
		Helper.resetLayout();
		$(".loader").fadeIn();
	});
	function init() {
		app = {
			maps : [],
			currentMap : null
		}
		if (!configOptions.sharingurl) {
			if (location.host.match("localhost") || location.host.match("storymaps.esri.com") || location.host.match("esri.github.io"))
				configOptions.sharingurl = "http://www.arcgis.com/sharing/rest/content/items";
			else
				configOptions.sharingurl = location.protocol + '//' + location.host + "/sharing/content/items";
		}
		if (configOptions.geometryserviceurl && location.protocol === "https:")
			configOptions.geometryserviceurl = configOptions.geometryserviceurl.replace('http:', 'https:');
		esri.arcgis.utils.arcgisUrl = configOptions.sharingurl;
		esri.config.defaults.io.proxyUrl = configOptions.proxyurl;
		esri.config.defaults.geometryService = new esri.tasks.GeometryService(configOptions.geometryserviceurl);
		var urlObject = esri.urlToObject(document.location.href);
		urlObject.query = urlObject.query || {};
		if ($("#application-window").width() > 550 && urlObject.query.embed || urlObject.query.embed === "") {
			$("#banner").hide();
		}
		if (configOptions.appid || (urlObject.query && urlObject.query.appid)) {
			var appid = configOptions.appid || urlObject.query.appid;
			var requestHandle = esri.request({
					url : configOptions.sharingurl + "/" + appid + "/data",
					content : {
						f : "json"
					},
					callbackParamName : "callback",
					load : function (response) {
						if (response.values.title !== undefined) {
							configOptions.title = response.values.title;
						}
						if (response.values.subtitle !== undefined) {
							configOptions.subtitle = response.values.subtitle;
						}
						if (response.values.webmap !== undefined) {
							configOptions.webmaps = Helper.getWebmaps(response.values.webmap);
						}
						if (response.values.mapTitle !== undefined) {
							dojo.forEach(Helper.getWebmapTitles(response.values.mapTitle), function (item, i) {
								if (configOptions.webmaps[i])
									configOptions.webmaps[i].title = item;
							});
						}
						if (response.values.syncMaps !== undefined) {
							configOptions.syncMaps = response.values.syncMaps;
						}
						loadMaps();
						initBanner();
					},
					error : function (response) {
						var e = response.message;
						alert("Error: " + response.message);
					}
				});
		} else {
			loadMaps();
			initBanner();
		}
	}
	function initBanner() {
		$("#title").html(configOptions.title);
		$("#subtitle").html(configOptions.subtitle);
		if (configOptions.webmaps.length < 2) {
			$("#mobile-navigation").hide();
			Helper.resetLayout();
		}
		Helper.resetLayout();
		responsiveLayout();
	}
	function loadMaps() {
		$("#map-pane").append('<div id="map' + app.maps.length + '" class="map"></div>');
		$("#legend-pane").append('<div id="legend' + app.maps.length + '" class="legend"></div>');
		$("#mobile-popup").append('<div class="mobile-popup-content"></div>');
		$(".map").last().fadeTo(0, 0);
		var mapDeferred = esri.arcgis.utils.createMap(configOptions.webmaps[app.maps.length].id, "map" + app.maps.length, {
				mapOptions : {
					extent : getExtent()
				},
				bingMapsKey : configOptions.bingmapskey
			});
		mapDeferred.addCallback(function (response) {
			var map = response.map;
			map.itemData = {
				title : configOptions.webmaps[app.maps.length].title || response.itemInfo.item.title || "",
				description : response.itemInfo.item.description || ""
			}
			app.maps.push(map);
			updateMobileNavigation();
			map.infoWindow.set("popupWindow", false);
			var layers = esri.arcgis.utils.getLegendLayers(response);
			if (map.loaded) {
				if (app.maps.length <= configOptions.webmaps.length) {
					if (app.maps.length < configOptions.webmaps.length) {
						loadMaps();
					}
					createAppItems(map, layers, app.maps.length - 1);
				}
			} else {
				dojo.connect(map, "onLoad", function () {
					if (app.maps.length <= configOptions.webmaps.length) {
						if (app.maps.length < configOptions.webmaps.length) {
							loadMaps();
						}
						createAppItems(map, layers, app.maps.length - 1);
					}
				});
			}
			dojo.connect(map, "onUpdateEnd", function () {
				if (!map.firstLoad) {
					map.firstLoad = true;
					setAccordionContentHeight();
					if (map === app.maps[0]) {
						appReady();
					}
				}
			});
			dojo.connect(map, "onExtentChange", function () {
				if (configOptions.syncMaps && map === app.currentMap) {
					Helper.syncMaps(app.maps, app.currentMap, map.extent);
				}
			});
			dojo.connect(map.infoWindow, "onShow", function () {
				var mapIndex = $.inArray(map, app.maps);
				if ($("#application-window").width() <= 550) {
					if ($(".mobile-popup-content").eq(mapIndex).html() === "") {
						$(".mobile-popup-content").each(function (i) {
							$(this).append($(".contentPane").eq(i));
						});
					}
					$(".mobile-popup-content").eq(mapIndex).show();
					$("mobile-popup").slideDown();
					$("#close-mobile-popup").show();
				} else {
					if ($(".esriPopup .sizer.content").eq(mapIndex).html() === "") {
						$(".esriPopup .sizer.content").each(function (i) {
							$(this).append($(".contentPane").eq(i));
						});
					}
				}
			});
			dojo.connect(map.infoWindow, "onHide", function () {
				$(".mobile-popup-content").hide();
				$("mobile-popup").hide();
				$("#close-mobile-popup").hide();
			});
			createAccordionPanel(app.maps.length, response);
		});
	}
	function getExtent() {
		if (configOptions.syncMaps && app.maps.length > 0) {
			return (app.maps[0].extent);
		}
	}
	function createAppItems(map, layers, index) {
		$(".esriSimpleSliderIncrementButton").last().addClass("zoomButtonIn").after("<div class='esriSimpleSliderIncrementButton initExtentButton'><img style='margin-top:5px' src='resources/images/app/home.png'></div>");
		$(".initExtentButton").last().click(function () {
			map.setExtent(map._mapParams.extent);
		});
		initializeSidebar(map);
		if (configOptions.geocoderWidget) {
			$("#" + map.container.id).append('<div id="' + map.container.id + 'geocoder" class="geocoderWidget"></div>');
			var geocoder = new esri.dijit.Geocoder({
					map : map,
					autoNavigate : true,
					autoComplete : true,
				}, map.container.id + 'geocoder');
			geocoder.startup();
			geocoder.focus();
			z = dojo.connect(geocoder, 'onSelect', function (gresponse) {
					findGeo(gresponse);
				});
		}
		if (index == configOptions.webmaps.length - 1) {
			appReady();
		}
	}
	function findGeo(gresponse) {
		var symbol = new esri.symbol.PictureMarkerSymbol({
				"angle" : 0,
				"xoffset" : 0,
				"yoffset" : 10,
				"type" : "esriPMS",
				"url" : "http://static.arcgis.com/images/Symbols/Shapes/BluePin1LargeB.png",
				"contentType" : "image/png",
				"width" : 24,
				"height" : 24
			});
		map = app.currentMap;
		map.infoWindow.hide();
		georesult = gresponse;
		geogeom = georesult.feature.geometry;
		geopt = new esri.Graphic(geogeom, symbol);
		geopt.attributes = georesult.feature.attributes;
		map.graphics.clear();
		$("#popupArea").show();
		queryMap(geogeom, geopt);
	};
	function queryMap(geogeom, geopt) {
		map = app.currentMap;
		var query = new esri.tasks.Query();
		query.spatialRelationship = esri.tasks.Query.SPATIAL_REL_INTERSECTS;
		query.returnGeometry = false;
		query.geometry = geogeom;
		query.outSpatialReference = map.spatialReference;
		query.outFields = ["*"];
		var queryTask = new esri.tasks.QueryTask(map.getLayer(map.graphicsLayerIds[0]).url);
		var queryEx = queryTask.execute(query, function (r) {
				ll = map.getLayer(map.graphicsLayerIds[0]);
				if (r.features.length == 0) {
					dijit.byId("popupArea").set("content", '');
					popup.setFeatures(r.features);
					$('#pager').hide();
					dom.byId("featureCount").innerHTML = "0 distributor(s)";
					dom.byId("featurePos").innerHTML = "";
				} else {
					r.features.forEach(function (f) {
						f.setInfoTemplate(ll.infoTemplate)
					});
					foundLocation = r;
					map.centerAndZoom(geogeom, 16);
					popup.setFeatures(r.features);
					map.graphics.add(geopt);
				}
			});
	}
	function initializeSidebar(map) {
		popup = map.infoWindow;
		dojo.connect(popup, "onSelectionChange", function () {
			displayPopupContent(popup.getSelectedFeature());
		});
		connect.connect(popup, "onSetFeatures", function () {
			displayPopupContent(popup.getSelectedFeature());
			if (popup.features == null) {
				dom.byId("featureCount").innerHTML = "0 distributors";
				dom.byId("featurePos").innerHTML = "Distributor 0 of 0";
			} else if (popup.features.length > 1) {
				dom.byId("featureCount").innerHTML = popup.features.length + " distributors";
				dom.byId("featurePos").innerHTML = "Distributor " + (1 * popup.features.indexOf(popup.getSelectedFeature()) + 1) + " of " + popup.features.length;
				domUtils.show(dom.byId("pager"));
			} else {
				dom.byId("featureCount").innerHTML = popup.features.length + " distributor";
				domUtils.hide(dom.byId("pager"));
			}
		});
	}
	function displayPopupContent(feature) {
		if (feature) {
			var content = feature.getContent();
			dijit.byId("popupArea").set("content", content);
		}
	}
	function appReady() {
		dojo.connect(dom.byId("previous"), "click", selectPrevious);
		dojo.connect(dom.byId("next"), "click", selectNext);
		start = false;
		changeSelection(0);
		start = true;
		$("#mobile-navigation").click(function () {
			changeSelection($(this).attr("map-link"));
		});
		$(".loader").fadeOut();
		app.currentMap = app.maps[0];
		mobileReady();
		$("#mobile-header").html(app.currentMap.itemData.title);
		$("#header-text").slideDown();
		$(".accordion-header").first().addClass("active");
		$('.esriGeocoder input').each(function () {
			this.placeholder = "Please enter your address."
		})
		$(".mobile-popup-toggle").click(function () {
			hidePopups();
		});
	}
	function setLegendToggle() {
		if ($("#legend-pane").is(":visible")) {
			$("#legend-toggle").html("LEGEND &#9650;");
		} else {
			$("#legend-toggle").html("LEGEND &#9660;");
		}
	}
	function hidePopups() {
		dojo.forEach(app.maps, function (qmap) {
			qmap.infoWindow.hide();
		});
	}
	function changeSelection(index) {
		var speed = 400;
		map = app.currentMap;
		if (start) {
			app.currentMap.graphics.clear();
			if (popup && popup.features && popup.features.length > 0) {
				prevGeom = true;
			} else {
				prevGeom = false;
			}
		} else {
			prevGeom = false;
		}
		app.currentMap = app.maps[index];
		$("#mobile-header").html(app.currentMap.itemData.title);
		if (!$(".accordion-header").eq(index).hasClass("active")) {
			$(".accordion-header.active").removeClass("active");
			$(".accordion-header").eq(index).addClass("active");
			selectMap(index, speed);
		}
		if (prevGeom) {
			map.graphics.clear();
			queryMap(geogeom, geopt);
			$('.esriGeocoder input').val(georesult.name)
		}
	}
	function selectPrevious() {
		popup.selectPrevious();
		dom.byId("featurePos").innerHTML = "Distributor " + (1 * popup.features.indexOf(popup.getSelectedFeature()) + 1) + " of " + popup.features.length;
	}
	function selectNext() {
		popup.selectNext();
		dom.byId("featurePos").innerHTML = "Distributor " + (1 * popup.features.indexOf(popup.getSelectedFeature()) + 1) + " of " + popup.features.length;
	}
	function selectMap(mapIndex, speed) {
		app.currentMap.graphics.clear();
		$(".map").not($(".map").eq(mapIndex)).removeClass("active").fadeTo(speed, 0);
		$(".map").eq(mapIndex).addClass("active").fadeTo(speed, 1);
		dojo.forEach(app.maps, function (rmap) {
			rmap.reposition();
		});
	}
	function createAccordionPanel(index, response) {
		if (configOptions.startCountOnSecondTab) {
			var num = (index == 1 ? "" : index - 1),
			setHeight = (index == 1 ? " style='min-height:72px'" : "")
			title = configOptions.webmaps[index - 1].title || response.itemInfo.item.title || "",
			description = response.itemInfo.item.description || "";
			$("#acc").append('<div class="accordion-header"><div class="accordion-header-arrow"></div><table' + setHeight + '><tr><td class="accordion-header-number">' + num + '</td><td class="accordion-header-title">' + title + '</td></tr></table></div>');
		} else {
			var num = index,
			title = configOptions.webmaps[index - 1].title || response.itemInfo.item.title || "",
			description = response.itemInfo.item.description || "";
			$("#acc").append('<div class="accordion-header"><div class="accordion-header-arrow"></div><table><tr><td class="accordion-header-number">' + num + '</td><td class="accordion-header-title">' + title + '</td></tr></table></div>');
		}
		$(".accordion-header").last().click(function () {
			changeSelection(index - 1);
		});
	}
	function setAccordionContentHeight() {
		var height = 0,
		compareHeight = $("#side-pane").outerHeight();
		$(".accordion-header").each(function () {
			height += $(this).outerHeight();
		});
		if (compareHeight - height - 1 < 200) {
			$(".accordion-content").css("height", "auto");
		} else {
			$(".accordion-content").outerHeight(compareHeight - height - 1);
		}
	}
	function mobileReady() {
		var appWidth = $("#application-window").width();
		if (appWidth <= 550) {
			$("#header-text").removeClass("region-center").css({
				"height" : "auto",
				"width" : "auto"
			}).hide();
			if ($('.map.active .simpleGeocoder').length > 0) {
				$("#side-pane").prepend($('.map.active .simpleGeocoder'));
				$('.map.active .simpleGeocoder input').focus();
				$('#acc')[0].style.position = 'relative';
				$('#acc')[0].style.top = '50px';
			}
			$("#content").prepend($("#side-pane"));
		}
	}
	function responsiveLayout() {
		var appWidth = $("#application-window").width();
		hidePopups();
		if (appWidth <= 550) {
			$("#header-text").removeClass("region-center").css({
				"height" : "auto",
				"width" : "auto"
			}).hide();
			$("#side-pane").show();
			$("#map-pane").hide();
		} else {
			$("#header-text").addClass("region-center").show();
			$("#content").prepend($("#side-pane"));
			$("#side-pane").show();
		}
	}
	function updateMobileNavigation() {
		if ($.inArray(app.currentMap, app.maps) < app.maps.length - 1) {
			$("#mobile-navigation-content").html("Next map: " + app.maps[$.inArray(app.currentMap, app.maps) + 1].itemData.title);
			$("#mobile-navigation").attr("map-link", $.inArray(app.currentMap, app.maps) + 1);
		} else {
			$("#mobile-navigation-content").html("Back to first map");
			$("#mobile-navigation").attr("map-link", 0);
		}
	}
	return {
		init : init
	}
});
