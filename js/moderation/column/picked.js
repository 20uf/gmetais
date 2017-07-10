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
 * Column Picked
 *
 * @type {Moderation.ColumnPicked}
 */
window.Socialive.Moderation.ColumnPicked = (function (jQuery, ModerationUtils) {
    'use strict';

    /**
     * @constructor
     *
     * @param {string} broadcastSlug
     * @param {string} columnId
     * @param {bool}   sortable handle sortable message
     */
    var ModerationColumnPicked = function (broadcastSlug, columnId, sortable) {
        this.broadcastSlug = broadcastSlug;
        this.columnId = columnId;
        this.sortable = sortable;
    };


    /**
     * @init
     */
    ModerationColumnPicked.prototype.init = function () {
        if (this.sortable) {

            jQuery('#picked').sortable({
                connectWith: '#picked',
                handle: '.avatar'
            });

            this.bindSortableActions();
        }
    };

    /**
     * Add Sort Actions
     */
    ModerationColumnPicked.prototype.bindSortableActions = function() {
        var self = this;

        jQuery('#picked').on('sortstop', function(event, ui) {
            (new ModerationUtils()).updateMessagesOrder(self.broadcastSlug, jQuery('.picked').find('form'));

            return ui;
        });
    };

    return ModerationColumnPicked;
})(jQuery, window.Socialive.Moderation.Utils);
