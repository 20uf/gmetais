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
     * Moderation bind
     *
     * @constructor
     */
    var ModerationMessage = function () {
        this.broadcastSlug = jQuery('#picked').data('slug');
        this.slidePageNumber = 1;
    };

    /**
     * Inherited from Moderation
     */
    ModerationMessage.prototype.init = function () {
        this.bindActions();
    };

    /**
     * Show animation to indicate to a refresh is needed.
     */
    ModerationMessage.prototype.showRefreshNeeded = function () {
        var $element = jQuery('.diaporama');
        var $iconRefresh = jQuery('<i class=\'fa fa-refresh\' aria-hidden=\'true\'></i>');

        $element.addClass('reload').html($iconRefresh);

        // Handle animation
        (new ModerationUtils()).startAnimation($element);
    };

    /**
     * Handle playlist Event source actions:
     * - New message
     * - Update Position
     * - Toggle On Air
     *
     * @param data
     */
    ModerationMessage.prototype.handleEventSource = function(data) {
        var $html = jQuery(data.html);
        var $context = jQuery('.container-message[data-message-id=' + data.id + ']');

        if (data.column === 'picked') {

            // New Message Or Update position
            if ($context.length === 0 || ($html.data('message-position') <= 5 && $html.data('message-position') !== $context.data('message-position'))) {
                this.showRefreshNeeded();

                return;
            }

            // On AIR
            if ($html.find('.on-air').attr('class') !== jQuery('.on-air', $context).attr('class')) {
                jQuery('.on-air').removeClass('on');
                jQuery('.message-content > span').removeClass('on');

                if($html.find('.on-air').hasClass('on')) {
                    $context.find('.on-air').addClass('on');
                    $context.find('.message-content > span').addClass('on');
                }

                return;
            }
        }

        // Delete message
        if (data.column !== 'picked') {
            this.showRefreshNeeded();
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

    /**
     * Bind Actions:
     * - Swipe Left : Move to next message
     * - Swipe Right : Move to previous message
     * - Swipe Up : Push message On Air
     * - Swipe Down : Discard message On Air
     */
    ModerationMessage.prototype.bindActions = function() {
        var self = this;

        jQuery('.container-message').on('swipeleft', function() {
            self.displayNextMessage(jQuery(this));
        });

        jQuery('.container-message').on('swiperight', function() {
            self.displayPreviousMessage(jQuery(this));
        });

        jQuery('.container-message').on('swipeup', function() {
            self.pushMessageOnAir(jQuery(this));
        });

        jQuery('.container-message').on('swipedown', function() {
            self.unpushMessageOnAir(jQuery(this));
        });

        // Only in Dev env
        jQuery('.btn-on-air').on('click', function() {
            jQuery(this).parent().trigger('swipeup');
        });

        jQuery('.btn-not-on-air').on('click', function() {
            jQuery(this).parent().trigger('swipedown');
        });

        jQuery('.btn-previous-msg').on('click', function() {
            jQuery(this).parent().trigger('swipeleft');
        });

        jQuery('.btn-next-msg').on('click', function() {
            jQuery(this).parent().trigger('swiperight');
        });
    };

    /**
     *  Navigate inside Carrousel
     *
     *  @param {jQuery} $slide selected slide
     */
    ModerationMessage.prototype.displayNextMessage = function($slide) {
        var self = this;
        $slide.removeClass('display');
        jQuery('.pagination-bubbles').removeClass('on');

        if($slide.index() !== jQuery('.container-message:last-child').index()){
            $slide.next().addClass('display');
            self.slidePageNumber = $slide.next().index() + 1;
        } else {
            jQuery('.container-message:first-child').addClass('display');
            self.slidePageNumber = 1;
        }
        jQuery('.pagination-bubbles:nth-child('+ self.slidePageNumber +')').addClass('on');
    };

    /**
     *  Navigate inside Carrousel
     *
     *  @param {jQuery} $slide selected slide
     */
    ModerationMessage.prototype.displayPreviousMessage = function($slide) {
        var self = this;
        $slide.removeClass('display');
        jQuery('.pagination-bubbles').removeClass('on');

        if( $slide.index() === 0 ){
            jQuery('.container-message:last-child').addClass('display');
            self.slidePageNumber = jQuery('.container-message:last-child').index() + 1;
        } else {
            $slide.prev().addClass('display');
            self.slidePageNumber = $slide.prev().index() + 1;
        }
        jQuery('.pagination-bubbles:nth-child('+ self.slidePageNumber +')').addClass('on');
    };

    /**
     *  Change message status to on-air and display on-air indicator
     *
     *  @param {jQuery} $slide selected slide
     */
    ModerationMessage.prototype.pushMessageOnAir = function($slide) {

        // All slides
        jQuery('.on-air').removeClass('on');
        jQuery('.message-content > span').removeClass('on');

        // Our selected slide
        $slide.find('.on-air').addClass('on');
        $slide.find('.message-content > span').addClass('on');

        (new ModerationUtils()).updateMessageStatus({
            'slug': this.broadcastSlug,
            'messageId': $slide.closest('.container-message').data('message-id'),
            'statusName': 'on_air',
            'hasStatus': $slide.find('.on-air').hasClass('on') ? 0 : 1
        });
    };

    /**
     *  Change message status to tv-ok and hide on-air indicator
     *
     *  @param {jQuery} $slide selected slide
     */
    ModerationMessage.prototype.unpushMessageOnAir = function($slide) {

        var $labelOnAir = $slide.find('.on-air');

        if ($labelOnAir.hasClass('on')) {
            $labelOnAir.removeClass('on');
            $slide.find('.message-content > span').removeClass('on');
        }

        (new ModerationUtils()).updateMessageStatus({
            'slug': this.broadcastSlug,
            'messageId': $slide.closest('.container-message').data('message-id'),
            'statusName': 'on_air',
            'hasStatus': $slide.find('.on-air').hasClass('on') ? 0 : 1
        });
    };

    return ModerationMessage;
})(jQuery, window.Socialive.Moderation.Utils);
