'use strict';

/*
 * This file is part of the Social Live project.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @author Stéphanie LOUx-DURAND <stephanie.loux-durand@francetv.fr>
 */

if (typeof (window.Socialive) === 'undefined') {
    window.Socialive = {};
}

/**
 * From for creating and updating an Alert:
 *  -Display Datepicker
 *
 * @type {Dashboard}
 */
window.Socialive.Dashboard = (function (jQuery) {
    'use strict';

    /**
     * Constructor.
     * 
     * @constructor
     */
    var Dashboard = function () {};

    /**
     * Initialize the calls for public methods.
     */
    Dashboard.prototype.init = function () {
        var that = this;
        
        if (jQuery("#dashboard").data('show-welcome-slides') == "1") {
            jQuery(".modal").show();
        }

        that.bindActions();   
    };


    /**
     * Display the Welcome modal if supposed to .
     */
    Dashboard.prototype.bindActions = function () {
        jQuery(".slide").last().on("click", function() {
            jQuery.get({
                url: Routing.generate('app_user_update_show_welcome_slides', {user: jQuery("#dashboard").data('user-id') , show: 0}),
                method: 'GET'
            });
        
            jQuery(".modal").toggle();
        });

        jQuery(".left").on('click', function() {
            jQuery(".welcome-presentation").carousel('prev');
        });

        
        jQuery(".right").on('click', function() {
            jQuery(".welcome-presentation").carousel('next');
        })
        
        jQuery(".btn-reload-welcome").on('click', function () {
            jQuery(".modal").toggle();  
        })
    };

    return Dashboard;

})(jQuery);

jQuery(document).ready(function () {
    (new window.Socialive.Dashboard()).init();
});