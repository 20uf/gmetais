/*
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
 * Column Pending
 *
 * @type {Moderation.ColumnPending}
 */
window.Socialive.Moderation.ColumnPending = (function (jQuery) {
    'use strict';

    /**
     * @constructor
     *
     * @param {string} broadcastSlug
     * @param {string} columnId
     */
    var ModerationColumnPending = function (broadcastSlug, columnId) {
        this.broadcastSlug = broadcastSlug;
        this.columnId = columnId;
    };

    ModerationColumnPending.prototype.init = function (){};

    return ModerationColumnPending;
})(jQuery);
