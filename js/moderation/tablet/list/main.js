/**
 * This file is part of the Social Live project.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @author Stéphanie LOUX-DURAND <stephanie.loux-durand.ext@francetv.fr>
 */

/**
 *  Manage modal behaviour on the front page
 *
 *  @type {List}
 **/
window.Socialive.Moderation.Tablet.List = (function (jQuery, ModerationClient, ModerationMessage) {
    'use strict';

    /**
     * Tablet list mode
     *
     * @constructor
     */
    var ModerationTabletList = function () {
        this.broadcastSlug = jQuery('section.container-columns-workflow').data('broadcast-slug');
    };

    /**
     * Initialize variables and events
     */
    ModerationTabletList.prototype.init = function() {
        (new ModerationMessage()).init();

        // EventSource
        (new ModerationClient(Routing.generate('app_tablet_latest_change_push', {broadcast: this.broadcastSlug}, true))).push();

        jQuery('#picked').sortable({
            connectWith: '#picked',
            handle: '.id-picked-message'
        });
    };



    return ModerationTabletList;
})(jQuery, window.Socialive.Moderation.Client, window.Socialive.Moderation.Message);

/**
 *  Load this code on the tablet list page
 */
jQuery(document).ready(function() {
    (new window.Socialive.Moderation.Tablet.List()).init();
});
