// Server
if (Meteor.isClient) 
{
    Meteor.startup(function () {

        Meteor.methods({

            resize_windows : function()
            {
                var $winH = $(window).outerHeight(),
                    $navH = $('nav').outerHeight() + 30;

                $('#footer .playerlist-container').css('height', $winH * 0.3 + 'px');
                $('#teams').css('height', $winH + 'px');
            }

        }); 
    });
}