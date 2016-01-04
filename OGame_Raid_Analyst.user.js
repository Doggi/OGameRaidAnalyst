// ==UserScript==
// @name        OGame Raid Analyst
// @namespace   ogame
// @include     http://*.ogame.gameforge.com/game/index.php?page=overview*
// @version     1
// @updateURL   https://github.com/Doggi/OGameRaidAnalyst/raw/master/OGame_Raid_Analyst.user.js
// @downloadURL https://github.com/Doggi/OGameRaidAnalyst/raw/master/OGame_Raid_Analyst.user.js
// @grant       none
// ==/UserScript==

// PLUGINS //
Number.decPoint = ',';
Number.thousand_sep = '.';

Number.prototype.format = function (k, fixLength) {
    if (!k) k = 0;
    var neu = '';
    var sign = this < 0 ? '-' : '';

    // Runden
    var f = Math.pow(10, k);
    var zahl = Math.abs(this);
    zahl = '' + parseInt(zahl * f + .5) / f;

    // Komma ermittlen
    var idx = zahl.indexOf('.');
    // fehlende Nullen einfügen
    if (fixLength && k) {
        zahl += (idx == -1 ? '.' : '' )
            + f.toString().substring(1);
    }

    // Nachkommastellen ermittlen
    idx = zahl.indexOf('.');
    if (idx == -1) idx = zahl.length;
    else neu = Number.decPoint + zahl.substr(idx + 1, k);

    // Tausendertrennzeichen
    while (idx > 0) {
        if (idx - 3 > 0)
            neu = Number.thousand_sep + zahl.substring(idx - 3, idx) + neu;
        else
            neu = zahl.substring(0, idx) + neu;
        idx -= 3;
    }
    return sign + neu;
};

// Script //
var fightReturnSelector = "table#eventContent tr[data-mission-type=1][data-return-flight=true]";
var flightsStorageName = "ogame_raid_analyst_flights";

(function () {
    var $ = window.jQuery;
    try {
        $ = unsafeWindow.jQuery;
    } catch (e) {
        console.error("no jquery detected");
    }


    //add menu
    //$("ul#menuTableTools").append("hallo");

    var flights = localStorage.getItem(flightsStorageName);
    if (flights === null){
        console.info("[OGame Raid Analyst]", "create new storage object");
        flights = {};
    } else {
        flights = JSON.parse(flights);
    }


    $(fightReturnSelector).each(function() {

        var fleetTable = $(this).next("tr.ago_eventlist").children("td").children("div.ago_eventlist_fleet").children("table");
        var ressources = parseInt($(fleetTable).children("tr:nth-child(1)").find("td:nth-child(3)").text().match(/\d+.*/g)[0].replace(".", ""));
        var metal = $(fleetTable).children("tr:nth-child(2)").find("td:nth-child(3)").text().match(/\d+.*/g);
        var crystal = $(fleetTable).children("tr:nth-child(3)").find("td:nth-child(3)").text().match(/\d+.*/g);
        var deuterium = $(fleetTable).children("tr:nth-child(4)").find("td:nth-child(3)").text().match(/\d+.*/g);

        metal = metal === null ? 0 : parseInt(metal[0].replace(".", ""));
        crystal = crystal === null ? 0 : parseInt(crystal[0].replace(".", ""));
        deuterium = deuterium === null ? 0 : parseInt(deuterium[0].replace(".", ""));

        if (ressources > 0 && Object.keys(flights).indexOf($(this).attr("id")) < 0) {
            var flight = {
                id: $(this).attr('id'),
                time: $(this).attr('data-arrival-time'),
                ressources: ressources,
                metal: metal,
                crystal: crystal,
                deuterium: deuterium
            };
            flights[flight.id] = flight;
        }

    });

    console.log(flights);

    var today=new Date();
    today.setHours(0); today.setMinutes(0); today.setSeconds(0); today.setMilliseconds(0);
    var tomorrow = new Date(today);
    tomorrow.setHours(24);



    var ress = {
        total: 0,
        metal: 0,
        crystal: 0,
        deuterium: 0
    };

    $.each(flights, function(){
        var d = new Date(this.time * 1000);
        console.log("do");
        console.log(d, today, tomorrow);
        if( d >= today && d < tomorrow ) {
            ress.total += this.ressources;
            ress.metal += this.metal;
            ress.crystal += this.crystal;
            ress.deuterium += this.deuterium;
        }
    });


    var result = $("#toolLinksWrapper").append(
        "<div id='ora_result'>" +
            "<table width='100%'>" +
            "<tr><td>Gesamt:</td><td align='right'> " + ress.total.format() +  "</td>" +
        "<tr><td>Metall:</td><td align='right'> " + ress.metal.format() +  "</td>" +
        "<tr><td>Kristall:</td><td align='right'> " + ress.crystal.format() +  "</td>" +
        "<tr><td>Deuterium:</td><td align='right'> " + ress.deuterium.format() +  "</td>" +
        "</tr>" +
        "</table>" +
        "</div>");


    localStorage.setItem(flightsStorageName, JSON.stringify(flights));
})();