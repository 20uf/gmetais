/*
 * This file is part of the social_live_bo project.;
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 */

/**
 * Message
 *  - Bind actions
 *  - Modal actions
 *
 * @type {Moderation.Message}
 */
window.Socialive.Moderation.Message = (function (jQuery, ModerationUtils) {
    'use strict';

    /**
     * @constructor
     */
    var ModerationMessage = function () {
        this.broadcastSlug = jQuery('section.container-columns-workflow').data('broadcast-slug');
    };

    /**
     * Init events tablet list
     */
    ModerationMessage.prototype.init = function () {
        this.bindActions();
    };

    /**
     * Handle OnAir Label/Button
     *
     * @param {jQuery} $onAirButton selected button on-air
     */
    ModerationMessage.prototype.handleOnAirStatus = function ($onAirButton){
        var self = this;

        var $onAirLabel = $onAirButton.parent('.row').children('.id-picked-message').children('.on-air');
        var isOnAir = $onAirLabel.hasClass('on');
        var messageId = $onAirButton.closest('.container-message').data('message-id');

        // Handle animation
        (new ModerationUtils).startAnimation($onAirButton);

        (new ModerationUtils).updateMessageStatus({
            'slug': self.broadcastSlug,
            'messageId': messageId,
            'statusName': 'on_air',
            'hasStatus': isOnAir ? 1 : 0
        })
    };

    /**
     * Display on-air button
     *
     * @param {jQuery} $message selected row
     */
    ModerationMessage.prototype.displayOnAirButton = function($message) {
        jQuery('.btn-on-air').removeClass('on'); // hide all OnAir button
        $message.children('.row').children('.btn-on-air').addClass('on'); // display row OnAir button
    };

    /**
     * Hide on-air button
     *
     * @param {jQuery} $row selected row
     */
    ModerationMessage.prototype.hideOnAirButton = function($row) {
        $row.children('.row').children('.btn-on-air').removeClass('on');
    };

    /**
     * Bind Actions:
     * - Click On Air
     * - Display On Air Button
     * - Hide On Air Button
     * - Move Message
     *
     * @param {jQuery} $context
     */
    ModerationMessage.prototype.bindActions = function ($context) {
        var self = this;

        if (typeof $context === 'undefined') {
            $context = jQuery('.container-message');
        }

        jQuery('.btn-on-air', $context).unbind('click').on('click', function() {
            self.handleOnAirStatus(jQuery(this));
        });

        $context.unbind('swipeleft').on('swipeleft', function(event) {
            self.displayOnAirButton(jQuery(this));
        });

        $context.unbind('swiperight').on('swiperight', function(event) {
            self.hideOnAirButton(jQuery(this));
        });

        jQuery('#picked').unbind('sortstop').on('sortstop', function() {
            (new ModerationUtils()).updateMessagesOrder(self.broadcastSlug, jQuery('form'));
        });
    };

    /**
     * Handle List Event Source Action
     * - Toggle On Air
     * - New Message
     * - Delete Message
     * - Change Position
     *
     * @param data
     */
    ModerationMessage.prototype.handleEventSource = function (data) {
        var $html = jQuery(data.html);
        var $context = jQuery('.container-message[data-message-id=' + data.id + ']');

        if (data.column === 'picked') {

            // Add new messages
            if ($context.length === 0) {
                (new ModerationUtils()).addPickedMessage($html);

                // rebind
                this.bindActions($html);

                return;
            }

            // On AIR
            var $labelOnAir = jQuery('.on-air', $context);

            // Check if the modified | new message has the same classes as the
            if ($html.find('.on-air').attr('class') !== $labelOnAir.attr('class')) {

                (new ModerationUtils()).stopAnimation();

                // Undisplay label and button ON-AIR
                jQuery('.on-air').removeClass('on');
                jQuery('.btn-on-air').removeClass('clicked');

                $labelOnAir.attr('class', $html.find('.on-air').attr('class'));

                if ($labelOnAir.hasClass('on')) {
                    jQuery('.btn-on-air', $context).addClass('clicked');
                }

                return;
            }

            // Move Position
            if ($html.data('message-position') !== $context.data('message-position')) {
                (new ModerationUtils()).movePickedMessage($context, $html);

                // rebind
                this.bindActions($html);
                return;
            }
        }

        // Delete message
        if (data.column !== 'picked') {
            $context.remove();
        }
    };

    /**
     * Push pushed message
     *
     * @param data
     * @param columnId
     */
    ModerationMessage.prototype.pushMessage = function (data, columnId) {
        this.handleEventSource(data);
    };

    return ModerationMessage;
})(jQuery, window.Socialive.Moderation.Utils);
