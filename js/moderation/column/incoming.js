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
 * Column Incoming
 *  - Create event source for the column
 *  - Bind modal create new message
 *
 * @type {Moderation.ColumnIncoming}
 */
window.Socialive.Moderation.ColumnIncoming = (function (jQuery, ModerationClient, ModerationUtils, Validator, ModerationMessage) {
    'use strict';

    /**
     * @constructor
     *
     * @param {string} broadcastSlug
     * @param {string} timestampLastUpdatedAt
     * @param {string} columnId
     */
    var ModerationColumnIncoming = function (broadcastSlug, timestampLastUpdatedAt, columnId) {
        this.broadcastDataSlug = broadcastSlug;
        this.timestampLastUpdatedAt = timestampLastUpdatedAt;
        this.columnId = columnId;
        // this.colNum =  this.columnId.split('_');
        this.validator = new Validator();

        this.moderationClient = this.getIncomingModerationClient('');
    };

    ModerationColumnIncoming.prototype.init = function (){
        this.modalBindActions();
        this.bindModerationFilter();

        // EventSource
        this.moderationClient.push();
    };

    /**
     * Create ClientModeration.
     *
     * @param {string} urlQuery
     *
     * @returns {Moderation.Client}
     */
    ModerationColumnIncoming.prototype.getIncomingModerationClient = function (urlQuery) {
        var columnIncomingLastSinceId = jQuery(this.columnId + ' .container-message:first-child').data('message-id');
        var url = Routing.generate('app_moderation_incoming_push', {slug: this.broadcastDataSlug, lastSinceId: columnIncomingLastSinceId, lastSinceUpdatedAt: this.timestampLastUpdatedAt, columnId: this.columnId}, true) + urlQuery;

        return new ModerationClient(url, this.columnId);
    };

    /**
     *  Bind Filter Submit/Update
     */
    ModerationColumnIncoming.prototype.bindModerationFilter = function() {
        var self = this;
        var $context = jQuery('.container-column-content[data-column-id="'+self.columnId+'"]');

        jQuery('form[name=app_moderation_message_filter]', $context).unbind('submit').on('submit change', function(e) {
            e.preventDefault();

            // Refresh EventSource with filters
            self.moderationClient.close();
            self.moderationClient = self.getIncomingModerationClient('?' + jQuery(this).serialize());
            self.moderationClient.push();

            // Refresh Column Messages
            jQuery.get({
                url: Routing.generate('app_moderation_column_filter', {slug: self.broadcastDataSlug, messageColumn: 'incoming'}),
                method: 'GET',
                data: jQuery(this).serialize()
            }).done( function(html) {
                jQuery(self.columnId).empty().html(html);

                // Rebind Actions
                (new ModerationMessage()).bindActions();
            }).fail( function(error) {
                console.error(error);
            });
        });
    };

    /**
     * Bind actions
     */
    ModerationColumnIncoming.prototype.modalBindActions = function () {
        var self = this;

        jQuery('[data-modal=ajax-add-message]').unbind('click').on('click', function (e) {
            e.preventDefault();

            var $this = jQuery(this);
            var remoteUrl = $this.data('remote') || $this.attr('href');

            jQuery.get(remoteUrl).done(function (html) {
                var $html = jQuery(html);

                self.bindModalCreateMessage($html);
                (new ModerationUtils).modalBindGaugeMessage($html, '#app_message_create_text')
                self.modalSubmitMessage($html);

                $html.modal({
                    backdrop: 'static',
                    keyboard: false
                });
            });
        });
    };

    /**
     * Bind modal create message
     * - Show form for URL social network
     * - Show form for edito message
     *
     * @param $context
     */
    ModerationColumnIncoming.prototype.bindModalCreateMessage = function ($context) {
        $context.find('[data-bind-action=tabs]').unbind('click').on('click', function () {
            var $this = jQuery(this);
            var iconUp = $this.data('icon-up');
            var iconDown = $this.data('icon-down');
            var tabIdUp = $this.data('tab-id-up');
            var tabIdDown = $this.data('tab-id-down');

            if ($this.hasClass('fa-angle-double-down')) {
                $context.find(tabIdDown).addClass('hide');
                $context.find(tabIdUp).removeClass('hide');
                $this.attr('class', iconUp);
            } else {
                $context.find(tabIdUp).addClass('hide');
                $context.find(tabIdDown).removeClass('hide');
                $this.attr('class', iconDown);
            }
        });
    };

    /**
     * Event modal create message
     *
     * @param $context
     */
    ModerationColumnIncoming.prototype.modalSubmitMessage = function ($context) {
        var self = this;

        $context.find('form').on('submit', function (e) {
            e.preventDefault();

            var $form = jQuery(this);

            if (!self.formValidator($form)) {
                return false;
            }

            var promise = $.post($form.attr('action'), $form.serialize());

            promise
                .done(function () {
                    jQuery('.modal').modal('hide');
                    jQuery('#modal_confirm_create_message').modal('show');
                })
            ;
        });
    };

    /**
     * Validator form
     *
     * @param $form
     * @returns {boolean}
     */
    ModerationColumnIncoming.prototype.formValidator = function ($form) {
        var status = true;

        if ($form.attr('name') == 'app_message_create') {
            var $username = $form.find('#app_message_create_profileUsername'),
                $text = $form.find('#app_message_create_text');

            if (!this.validator.validate({$field: $username, type: 'required', message: 'error.field.empty'})) {
                status = false;
            }
            if (!this.validator.validate({$field: $text, type: 'required', message: 'error.field.empty'})) {
                status = false;
            }
        }

        if ($form.attr('name') == 'app_message_import') {
            var twitterRegex = /^https?:\/\/twitter.com\/[^\/]+\/status\/([0-9]+)(\?([\w-]+(=[\w-]*)?(&[\w-]+(=[\w-]*)?)*)?)?$/,
                facebookRegex = /^((http|https):\/\/)?(www\.)?facebook\.com\/([A-Za-z0-9.]+\/)?posts\/(\d+)/,
                $url = $form.find('#app_message_import_urlNetwork');

            if (!this.validator.validate({$field: $url, type: 'required', message: 'error.field.empty'})) {
                return false;
            }

            if (!this.validator.validate({$field: $url, type: 'regex', regex: twitterRegex, message: 'error.field.message_url'}) &&
                !this.validator.validate({$field: $url, type: 'regex', regex: facebookRegex, message: 'error.field.message_url'})) {
                return false;
            }
        }
        return status;
    };

    return ModerationColumnIncoming;
})(jQuery,window.Socialive.Moderation.Client, window.Socialive.Moderation.Utils, window.Socialive.Validator, window.Socialive.Moderation.Message);
