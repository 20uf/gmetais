/*!
 * This file is part of the Social Live project.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @author Michael COULLERET <michael.coulleret@francetv.fr>
 * @author Florent DESPIERRES <florent.despierres.ext@francetv.fr>
 */

// declare namespace of moderation globally.
if (typeof (window.Socialive.Moderation) === 'undefined') {
    window.Socialive.Moderation = {};
}

/**
 * Main moderation page
 *
 * @type {Moderation.Main}
 */
window.Socialive.Moderation.Main = (function (jQuery, ModerationHeader, ModerationClient, ModerationMessage, ModerationColumnFactory) {
    'use strict';

    /**
     * Constructor moderation main
     *
     * @constructor
     */
    var ModerationMain = function () {
        var $columnsWorkflow = jQuery('section.container-columns-workflow');
        this.broadcastDataSlug = $columnsWorkflow.data('broadcast-slug');
        this.timestampLastUpdatedAt = $columnsWorkflow.data('timestamp-last-updated');
        this.profile = $columnsWorkflow.data('profile');
    };

    /**
     * Init main
     *
     * - Columns
     * - Header events
     * - Synchronize message
     */
    ModerationMain.prototype.init = function () {
        (new ModerationMessage()).init();

        (new ModerationHeader()).init(this.broadcastDataSlug);

        // EventSource Global
        (new ModerationClient(Routing.generate('app_moderation_latest_change_push', {slug: this.broadcastDataSlug}, true))).push();

        // Column Initialisation
        (new ModerationColumnFactory()).create(this.broadcastDataSlug, this.timestampLastUpdatedAt, this.profile);
    };

    return ModerationMain;
})(jQuery, window.Socialive.Moderation.Header, window.Socialive.Moderation.Client, window.Socialive.Moderation.Message, window.Socialive.Moderation.ColumnFactory);

/**
 * Load main
 */
jQuery(document).ready(function () {
    (new window.Socialive.Moderation.Main()).init();
});
