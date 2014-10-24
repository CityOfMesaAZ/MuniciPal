// stuff we want to happen on load for every page

var legislationTemplate, eventTemplate, attachmentsTemplate;

$(document).ready(function() {

	facebookTemplate = $('#facebook-template').html();
	Mustache.parse (facebookTemplate);

	facebookTemplateNoFacebook = $('#facebook-template-no-facebook').html();
	Mustache.parse (facebookTemplateNoFacebook);

	twitterTemplate = $('#twitter-template').html();
	Mustache.parse (twitterTemplate);

	legislationTemplate = $('#legislation-template').html();
	Mustache.parse (legislationTemplate);  // optional, speeds up future uses

	eventTemplate = $('#event-details-template').html();
	Mustache.parse (eventTemplate);  // optional, speeds up future uses

	attachmentsTemplate = $('#template-attachments').html();
	Mustache.parse (attachmentsTemplate);

});
