$(function() {

    // Globals
    var $winH = $(window).outerHeight(),
        $navH = $('nav').outerHeight() + 30;  

	// Load the Foundation plugin
	$(document).foundation();

    Template.players.rendered = function() {      

        $('.playerlist-container').css('height', $(window).outerHeight() * 0.4 + 'px');

        $('#footer .tab').on('click', function() {

            var $this = $(this);

            $('.playerlist-container').not(':animated').slideToggle(400, function() {
                
                if( $(this).is(':hidden') )
                {
                    $this.find('span').html('+');   
                }
                else
                {
                    $this.find('span').html('-');
                }

                $('#teams').css('height', $winH - $navH - $('#footer').height() + 'px');
            });
        });

        $('.flash').delay(3500).fadeOut('fast');
    };

	// Hide / show side-nav lists
	$('.side-nav a').on('click', function(e) {
		
		var $this = $(this),
			$toggle = $this.data('list');

		e.preventDefault();

		$('ul.players').hide();
		$('ul.players.'+ $toggle +':hidden').fadeIn('fast');

	});

	// Handlebar Helpers
	Handlebars.registerHelper('tolower', function(options) {
    	return options.fn(this).toLowerCase();
	});

});
