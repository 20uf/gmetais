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
 * @type {Alert}
 */
window.Socialive.Alert = (function (jQuery) {
    'use strict';

    /**
     * Constructor.
     *
     * @returns {AlertForm}
     */
    var Alert = function () {};

    /**
     * Initialize the calls for public methods.
     *
     * @returns {undefined}
     */
    Alert.prototype.init = function () {
        var that = this;
        
        that.bindActions();
    };

    /**
     * Initialize datepicker options.
     *
     * @returns {undefined}
     */
    Alert.prototype.initDatePicker = function () {
       jQuery('input[type=datetime]').datepicker({
            dateFormat : "dd-mm-yy",
            dayNames: [ "Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi" ],
            dayNamesShort: [ "Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam" ],
            dayNamesMin: [ "Di", "Lu", "Ma", "Me", "Je", "Ve", "Sa" ],
            monthNames: [ "Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Decembre" ],
            monthNamesShort: [ "Jan", "Fev", "Mar", "Avr", "Mai", "Juin", "Juil", "Aou", "Sep", "Oct", "Nov", "Dec" ],
            firstDay: 1,
            navigationAsDateFormat: true,
            gotoCurrent: true,
            prevText: "Préc.",
            nextText: "Suiv.",
        });
    }

    /**
     * Initialize Radio button behaviour.
     *
     * @returns {undefined}
     */
    Alert.prototype.bindActions = function () {
        if (jQuery("input[name='app_alert[immediate]']:checked").val() == 0) {
            jQuery('.duration').css('display', 'none');
        } else {
            jQuery('.dates').css('display', 'none');            
        }

        jQuery("input[name='app_alert[immediate]']").on('change', function() {
            jQuery('.duration').toggle();
            jQuery('.dates').toggle();
        });
    }

    return Alert;

})(jQuery);

jQuery(document).ready(function () {
    (new window.Socialive.Alert()).init();
});
