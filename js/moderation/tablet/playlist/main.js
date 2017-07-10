/**
 * This file is part of the Social Live project.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @author Stéphanie LOUX-DURAND <stephanie.loux-durand.ext@francetv.fr>
 */

/**
 * Manage swipe on the playlist
 *
 * @type {Playlist}
 */
window.Socialive.Moderation.Tablet.Playlist = (function (jQuery, ModerationClient, ModerationMessage) {
    'use strict';

    /**
     * Tablet playlist mode
     *
     * @constructor
     */
    var ModerationTabletPlaylist = function () {
        this.broadcastSlug = jQuery('#playlist').data('slug');
    };

    /**
     * Initialize variables and events
     */
    ModerationTabletPlaylist.prototype.init = function() {
        (new ModerationMessage()).init();

        // Display first message
        jQuery('.container-message:first-child').addClass('display');
        jQuery('.pagination-bubbles:first-child').addClass('on');

        // EventSource
        (new ModerationClient(Routing.generate('app_tablet_latest_change_push', {slug: this.broadcastSlug}, true))).push();
    };

    return ModerationTabletPlaylist;
})(jQuery, window.Socialive.Moderation.Client, window.Socialive.Moderation.Message);

/**
 *  Load this code on the tablet playlist page
 */
jQuery(document).ready(function() {
    (new window.Socialive.Moderation.Tablet.Playlist()).init();
});
