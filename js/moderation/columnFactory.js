/*!
 * This file is part of the Social Live project.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @author Florent DESPIERRES <florent.despierres.ext@francetv.fr>
 */

// declare namespace of moderation globally.
if (typeof (window.Socialive.Moderation) === 'undefined') {
    window.Socialive.Moderation = {};
}

/**
 * Create columns
 *
 * @type {Moderation.Main}
 */
window.Socialive.Moderation.ColumnFactory = (function (jQuery, ColumnIncoming, ColumnPending, ColumnPicked) {
    'use strict';

    const PROFILE_MODERATION_EXPERT = 'moderation_expert';
    const PROFILE_MODERATION = 'moderation';
    const PROFILE_SELECTION = 'selection';
    const PROFILE_VALIDATION = 'validation';
    const PROFILE_VALIDATION_EXPERT = 'validation_expert';

    /**
     * Constructor moderation column factory.
     *
     * @constructor
     */
    var ModerationColumnFactory = function () {};

    /**
     * Init ColumnFactory
     */
    ModerationColumnFactory.prototype.create = function (broadcastSlug, timestampLastUpdatedAt, profile) {

        switch(profile) {
            case PROFILE_MODERATION_EXPERT:
                new ColumnIncoming(broadcastSlug, timestampLastUpdatedAt, '#incoming_1').init();
                new ColumnIncoming(broadcastSlug, timestampLastUpdatedAt, '#incoming_2').init();
                new ColumnPending(broadcastSlug, '#pending').init();
                break;
            case PROFILE_MODERATION:
                new ColumnIncoming(broadcastSlug, timestampLastUpdatedAt, '#incoming_1').init();
                new ColumnPending(broadcastSlug, '#pending').init();
                break;
            case PROFILE_VALIDATION_EXPERT:
                new ColumnIncoming(broadcastSlug, timestampLastUpdatedAt, '#incoming_1').init();
                new ColumnPending(broadcastSlug, '#pending').init();
                new ColumnPicked(broadcastSlug, '#picked', true).init();
                break;
            case PROFILE_VALIDATION:
                new ColumnPending(broadcastSlug, '#pending').init();
                new ColumnPicked(broadcastSlug, '#picked', true).init();
                break;
            case PROFILE_SELECTION:
                new ColumnPicked(broadcastSlug, '#picked', true).init();
                break;
            default:
                new ColumnIncoming(broadcastSlug, timestampLastUpdatedAt, '#incoming_1').init();
                new ColumnIncoming(broadcastSlug, timestampLastUpdatedAt, '#incoming_2').init();
                new ColumnPending(broadcastSlug, '#pending').init();
                new ColumnPicked(broadcastSlug, '#picked', false).init();
                break;
        }
    };

    return ModerationColumnFactory;
})(jQuery, window.Socialive.Moderation.ColumnIncoming, window.Socialive.Moderation.ColumnPending, window.Socialive.Moderation.ColumnPicked);
