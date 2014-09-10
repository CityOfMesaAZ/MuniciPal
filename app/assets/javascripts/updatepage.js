
/*
UPDATEPAGE() IS CALLED ON USER ADDRESS ENTRY
OR USER MAP MARKER DRAGGING

IT UPDATES THE MAP AND THE COUNCIL ITEMS

This function is called from the main landing page through a JQuery function in addresses.js
It makes a get request to the Addresses controller with:
  -the user-entered Address, or
  -a Latitude and Longitude pair
   (from the map and map.js onDragEnd function)

The Addresses Controller returns the "data" object, an example of which can be found below:

Object {lat: 33.3781823,
        lng: -111.8430479,
        address: "455 West Baseline Road, Mesa, AZ 85210, USA",
        in_district: true,
        district_polygon: A PostGIS GeoJSON object,
        districts: Array of PostGIS GeoJSON objects,
        event_items: Array
        }

Example of item from event_items Array:

      {"id":8707,
       "event_id":1915,
       "EventItemId":33946,
       "EventItemGuid":"341796E6-ED95-4825-A9DD-3B3A44A9A490",
       "EventItemLastModified":null,
       "EventItemLastModifiedUtc":"2014-06-23T16:53:59.923",
       "EventItemRowVersion":"AAAAAAAv/Lg=",
       "EventItemEventId":1915,
       "EventItemAgendaSequence":12,
       "EventItemMinutesSequence":12,
       "EventItemAgendaNumber":"3-c",
       "EventItemVideo":null,
       "EventItemVideoIndex":null,
       "EventItemVersion":"1",
       "EventItemAgendaNote":null,
       "EventItemMinutesNote":null,
       "EventItemActionId":null,
       "EventItemAction":null,
       "EventItemActionText":null,
       "EventItemPassedFlag":null,
       "EventItemPassedFlagText":null,
       "EventItemRollCallFlag":0,
       "EventItemFlagExtra":"0",
       "EventItemTitle":"A restaurant that serves lunch and dinner is requesting a new Restaurant License for The Beer Research Institute, LLC, 1641 South Stapley Drive, Suite 104 - Matthew Trethewey, agent.  There is no existing license at this location. ",
       "EventItemTally":null,
       "EventItemConsent":0,
       "EventItemMoverId":null,
       "EventItemMover":null,
       "EventItemSeconderId":null,
       "EventItemSeconder":null,
       "EventItemMatterId":7021,
       "EventItemMatterGuid":"876CCADA-D418-4C14-ABBB-A9AC15014787",
       "EventItemMatterFile":"14-0727",
       "EventItemMatterName":"The Beer Research Institute",
       "EventItemMatterType":"Liquor License",
       "EventItemMatterStatus":"Agenda Ready",
       "council_district_id":3,
       "created_at":"2014-07-17T01:56:21.361Z",
       "updated_at":"2014-07-17T01:56:21.745Z"
       }
        
*/
function updatePage(ll) {
  $.ajax({
    type: 'GET',
    url: '/',
    data: ll,
    dataType: 'json',
    success: function( data ) {

      g_data = data;

      history.pushState({}, "", "?address=" + data.address + "&lat=" + data.lat + "&long=" + data.lng);
      marker.setLatLng(new L.LatLng(data.lat, data.lng));

      if (data.in_district) {

        var geoJSON = $.parseJSON(data.district_polygon.st_asgeojson);

        geoJSON.properties = { fill: DISTRICT_FILL };
        districtLayer.setGeoJSON(geoJSON);
        districtLayer.setFilter(function() { return true; });

        // HACK. this stuff should go in initializer on page load.
        // todo : on page load, hit a URL that will return just the districts.
        addDistrictsToMap(data.districts);

        updatePageContent(data);

      } else {

        districtLayer.setFilter(function() { return false; });
        $('.you-live-in').empty().append(
          'It looks like you\'re outside of Mesa.<br>' +
          'Maybe you want the <a href="http://www.mesaaz.gov/Council/">council and mayor webpage</a>?'
        ).addClass("no-district").show();
        $('.results').hide();

      }

      $( "#address").val(data.address);
      map.setView([data.lat, data.lng], MAP_START_ZOOM);
      document.getElementById('answer').scrollIntoView();
    }
  })
}


/*
This function fills out a bunch of mustache templates from the data above and AJAX
requests to the legistar REST API. 
 */

function updatePageContent(data) {

  $('body').removeClass('initial');
  var district = data.district_polygon.id;

  var member = find_member(district);
  var mayor = find_member(0); // 0 = mayor. for now anyway.

  $('.you-live-in').empty().append('District ' + district).removeClass("no-district").show();
  $('.results-text').empty().append(data.district_polygon.name);
  $('.results').show();

  $('#council-picture').attr({
    'src': 'http://tomcfa.s3.amazonaws.com/district'+district+'.jpg',
    'alt': 'Councilmember for District ' + district
  });
  $('#council-member').empty().append(data.district_polygon.name);
  $('#council-phone').empty().append(member.phone);
  $('#council-email').empty().append(member.email);
  $('#council-website').empty().append(member.website);
  $('#council-address').empty().append(member.address);
  $('#bio-card .bio').empty().append(member.bio);

  $(".fb-widget").hide();
  $(".fb-widget#facebook-" + district).show();


  $(".twit-widget").hide();
  $(".twit-widget#council-" + district).show();
//  $(".twit-widget#mention-" + district).show();

  $(".legislative-items").empty();

  // stick some event items in the frontend
  _.map(data.event_items, function(item) {

      // ---- transforms -------------------------------------------------------------

      // Simplify text by removing "(District X)" since we have that info elsewhere
      item.EventItemTitle = item.EventItemTitle.replace(/\(District \d\)/, '');

      var contract;
      // Contract Matters tend to look like "C12345 Something Human Friendly". Let's save & remove that contract #.
      if (item.EventItemMatterType == 'Contract') {
        contract = item.EventItemMatterName.split(' ')[0]; // save it
        console.log("Got contract: " + contract);
        if (/C\d+/.test(contract)) {
          item.EventItemMatterName = item.EventItemMatterName.substr(item.EventItemMatterName.indexOf(' ') + 1); // remove it
        } else {
          console.log("Weird. Expected " + contract + " to look like 'C' followed by some numbers.");
        }
      }

      // We don't want to duplicate the MatterName (used as a title) as the first line of the text, so remove if found.
      var re = new RegExp('^' + item.EventItemMatterName + '[\n\r]*');
      item.EventItemTitle = item.EventItemTitle.replace(re, '');

      // ---- end transforms ----------------------------------------------------------


      textToGeo(item.EventItemTitle);

      console.log("constructing legislative item");
      console.log(item.EventItemMatterId);

      var view = {
        title: function() {
          if (item.EventItemMatterType == 'Ordinance' &&
              (/^Z\d{2}.*/.test(item.EventItemMatterName) ||
               /^Zon.*/.test(item.EventItemMatterName))) {
            return "Zoning: " + item.EventItemMatterName;
          } else if (item.EventItemMatterType == "Liquor License") {
            return "Liquor License for " + item.EventItemMatterName;
          } else if (item.EventItemMatterType == "Contract") {
            return "Contract: " + item.EventItemMatterName;
          } else {
            return item.EventItemMatterName;
          }
        },
        distance: function () {
          return Math.floor(Math.random() * (6 - 2)) + 2;
        },
        body: function() {
          return summarize(item.EventItemTitle);
        },
        matterId: item.EventItemMatterId,
        icon: icons.get(item.EventItemMatterType),
        scope: function() {
          // if Citywide, "Citywide" (TODO), else
          return "In District " + district;
        }
      };

      var itemHtml = Mustache.render(legislationTemplate, view);
      $('.legislative-items').append(itemHtml);

      // get and populate matter attachments section
      $.ajax({
        type: 'GET',
        crossDomain: true,
        url: 'http://www.corsproxy.com/webapi.legistar.com/v1/mesa/Matters/' + item.EventItemMatterId + '/Attachments',
        dataType: 'json',
        success: function( data ) {

          var list = _.map(data, function (attachment) {
            return {
              link: attachment.MatterAttachmentHyperlink,
              name: attachment.MatterAttachmentName,
            };
          });

          if (list.length) {
            var view = {
              matterId: item.EventItemMatterId,
              attachmentCount: list.length,
              attachments: list,
            };
            var html = Mustache.render(attachmentsTemplate, view);
            $('#attachments-' + item.EventItemMatterId).html(html);
            $('#attachments-' + item.EventItemMatterId + ' a.attachments').click(function(event) {
              var matterId = $(this).attr('data-matter-id');
              console.log("setting link handler for attachments on matter " + matterId + "(matter " + item.EventItemMatterId + ")");
              $('#attachments-' + matterId + ' ul.attachments').toggle();
              event.preventDefault();
            }).click();
          }
        },
      });

      // get and populate event details section
      $.ajax({
        type: 'GET',
        url: '/events/' + item.EventItemEventId + '.json',
        dataType: 'json',
        success: function( data ) {
          var view = {
            date: function() {
              var months = [ "January", "February", "March", "April", "May", "June",
               "July", "August", "September", "October", "November", "December" ],
                date = data.EventDate.replace(/T.*/, '').split('-'); //YYYY-MM-DDT00:00:00Z -> [yyyy,mm,dd]

              // EventDate doesn't come in the right format (timezone is 0 instead of -7), so we fix it
               var correctDate = new Date(date[0], date[1] - 1, date[2]);
              return months[correctDate.getMonth()] + ' ' + correctDate.getDate();
            },
            time: data.EventTime,
            location: data.EventLocation,
            name: data.EventBodyName,
            d: data.EventDate,
          }
          console.log(view);
          var html = Mustache.render(eventTemplate, view);
          console.log("adding details to event item");
          console.log(item.EventItemMatterId);

          $('#event-details-' + item.EventItemMatterId).html(html);
        }
      });
  });

  $('.legislative-items a.readmore').click(function(event) {
    // toggle visibility of the clicked teaser and body.
    event.preventDefault();
    legislation = $(this).closest('.title');
    legislation.find('.teaser').toggle();
    legislation.find('.body').toggle();
  });

  $('a.comments').click(function(event) {
    event.preventDefault()
    // get the matter id
    var matter = $(this).attr('data-matter-id')
    console.log("clicked matter: " + matter)

    var element;
    if ($('#disqus_thread').length == 0) {
      // element = document.create("div").attr('id', 'disqus_thread');
      element = document.createElement('div');
      element.setAttribute('id', 'disqus_thread')
    } else {
      $('#disqus_thread').parent().hide()
      element = $('#disqus_thread').detach();
    }

    var selectedCommentDiv = $('#' + matter).find('div.comments');
    // append either the element if it exists or a new disqus_thread element.
    // selectedCommentDiv.append(element.length > 0 ? element : "<div id='disqus_thread'></div>");
    selectedCommentDiv.append(element);

    selectedCommentDiv.show();

    DISQUS.reset({
      reload: true,
      config: function () {
        this.page.identifier = matter;
        this.page.url = "http://yerhere.herokuapp.com/matters/" + matter;
      }
    });
  });


  // twitter & facebook only render on page load by default, so
  // we need to call on them to parse & render the new content
  twttr.widgets.load();
  FB.XFBML.parse(); // pass document.getElementById('legislative') for efficiency.

  $('#results-area').show();
}
