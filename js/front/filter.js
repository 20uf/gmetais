"use strict";

/*
 * This file is part of the Social Live project.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @author Florent DESPIERRES <florent.despierres.ext@francetv.fr>
 */

// declare namespace of moderation globally.
if (typeof (window.Socialive.Front) === 'undefined') {
    window.Socialive.Front = {};
}

/**
 * Front Filter bind actions
 *
 * @type {Front.Filter}
 */
window.Socialive.Front.Filter = (function (jQuery) {

    var FrontFilter = function () {};

    FrontFilter.prototype.resetForm = function ($form) {

        $form.find(':reset').on("click", function (e){
            e.preventDefault();

            $form.find('input:checkbox').each(function() {
                this.checked = false;
            });

            $form.find('input:text').each(function() {
                this.value = '';
            });

            $form.find('select').each(function() {
                this.selectedIndex = '';
            });
        });

    };

    return FrontFilter;
})(jQuery);

/**
 * Load front filter actions
 */
jQuery(document).ready(function () {

    var $form = jQuery('form[name="app_front_filter"]');
    if ($form.length > 0) {
        new window.Socialive.Front.Filter().resetForm($form);
    }
});
