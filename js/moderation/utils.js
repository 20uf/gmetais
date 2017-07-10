/*!
 * This file is part of the Social Live project.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @author Michael COULLERET <michael.coulleret@francetv.fr>
 */

// declare namespace of moderation globally.
if (typeof (window.Socialive.Moderation) === 'undefined') {
    window.Socialive.Moderation = {};
}


/**
 * Handle message prototype index
 *
 * @global
 * @type {Integer}
 */
var pickedMessageIndex = jQuery('#picked > .container-message').length;

/**
 * Handle Animation
 *
 * @global
 * @type {Integer}
 */
var animationIntervalID = null;

/**
 * Moderation utils
 *  - Gauge
 *
 * @type {Moderation.Utils}
 */
window.Socialive.Moderation.Utils = (function (jQuery) {
    'use strict';

    /**
     * Moderation utils
     *
     * @constructor
     */
    var ModerationUtils = function () {};

    /**
     * Update Message Status.
     *
     * @param {object} params
     */
    ModerationUtils.prototype.updateMessageStatus = function (params) {
        jQuery.ajax(Routing.generate('app_moderation_update_status', params))
    };

    /**
     * Update messages order
     *
     * @param {string} broadcastSlug
     * @param {jQuery} $form
     */
    ModerationUtils.prototype.updateMessagesOrder = function (broadcastSlug, $form) {
        jQuery.ajax({
            url: Routing.generate('app_tablet_list_update_position', {'broadcast': broadcastSlug}),
            type: 'POST',
            data: $form.serialize()
        }).fail(function (jqXHR, textStatus, errorThrown) {
            console.error(errorThrown);
        });
    };


    /**
     * Append new Picked message from event source
     *
     * @param {jQuery} $newMessage
     */
    ModerationUtils.prototype.addPickedMessage = function ($newMessage) {
        pickedMessageIndex += 1;
        $newMessage.html($newMessage.html().replace(/__index__/g, pickedMessageIndex));
        jQuery('#picked').prepend($newMessage);
    };

    /**
     * Move Picked Message in Picked column
     *
     * @param {jQuery} $oldMessage existing message
     * @param {jQuery} $newMessage message from event source
     */
    ModerationUtils.prototype.movePickedMessage = function ($oldMessage, $newMessage) {
        pickedMessageIndex += 1;
        $newMessage.html($newMessage.html().replace(/__index__/g, pickedMessageIndex));

        if ($newMessage.data('message-position') === '1') {
            $newMessage.insertBefore('#picked > .container-message:nth-child('+$newMessage.data('message-position')+')');
        } else {
            $newMessage.insertAfter('#picked > .container-message:nth-child('+$newMessage.data('message-position')+')');
        }

        $oldMessage.remove();
    };

    /**
     * Gauge event in modal context
     * - Update Gauge when input change
     *
     * @param {jQuery} $context
     * @param textAreaId
     */
    ModerationUtils.prototype.modalBindGaugeMessage = function ($context, textAreaId) {
        var $elementTextArea = $context.find(textAreaId);

        if ($elementTextArea.length === 0) {
            return;
        }

        var $elementCurrentLength = $context.find('#text_current_length');
        var $progressBar = $context.find('.progress-bar');
        var textLength = $elementTextArea.val().length;
        var maxLength = parseInt($context.find('#text_max_length').data('max-length'));

        $elementTextArea.attr('maxlength', maxLength);

        var processProgressBar = function ($progressBar, currentLength, maxLength) {
            var percent = (currentLength / maxLength) * 100;

            $progressBar.css('width', percent + '%');

            if (percent >= 100) {
                $progressBar.css('width', '100%');
                $progressBar.addClass('progress-bar-danger');
            } else {
                $progressBar.removeClass('progress-bar-danger');
            }
        };

        $elementCurrentLength.html($elementTextArea.val().length);
        processProgressBar($progressBar, textLength, maxLength);

        $elementTextArea.bind('input propertychange', function () {
            var textLength = jQuery(this).val().length;

            processProgressBar($progressBar, textLength, maxLength);
            $elementCurrentLength.html(textLength);
        });
    };

    /**
     * Handle animation on the given element
     *
     * @param {jQuery} $element
     */
    ModerationUtils.prototype.startAnimation = function ($element) {
        animationIntervalID = setInterval(function () {
            $element.fadeTo('slow', 0.5).fadeTo('slow', 1.0);
        }, 500);
    };

    /**
     * Stop the animation
     */
    ModerationUtils.prototype.stopAnimation = function() {
        clearInterval(animationIntervalID);
    };

    return ModerationUtils;
})(jQuery);
