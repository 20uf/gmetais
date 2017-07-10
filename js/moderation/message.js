/*!
 * This file is part of the Social Live project.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @author Michael COULLERET <michael.coulleret@francetv.fr>
 * @author Amine FATTOUCH <amine.fattouch@francetv.fr>
 * @author Florent DESPIERRES <florent.despierres.ext@francetv.fr>
 * @author Stéphanie LOUX-DURAND <stephanie.loux-durand.ext@francetv.fr>
 */

// declare namespace of moderation globally.
if (typeof (window.Socialive.Moderation) === 'undefined') {
    window.Socialive.Moderation = {};
}

/**
 * Message
 *  - Bind actions
 *  - Modal actions
 *
 * @type {Moderation.Message}
 */
window.Socialive.Moderation.Message = (function (jQuery, ModerationHeader, ModerationUtils) {
    'use strict';

    var $section = jQuery('section.container-columns-workflow');
    const SOURCE_ID_FAVORITE = $section.data('const-source-favorite');
    const SOURCE_ID_SMS = $section.data('const-source-sms');
    const SOURCE_ID_MESSAGE_IMPORTED = $section.data('const-source-message-imported');

    /**
     * Moderation bind
     *
     * @constructor
     */
    var ModerationMessage = function () {
        this.slug = $section.data('broadcast-slug');
        this.$modalInfo = jQuery('#modal_info_message');
    };

    /**
     * Init events moderation column
     */
    ModerationMessage.prototype.init = function () {
        this.bindActions();
        this.modalBindActions();
    };

    /**
     * Handle Global EventSource Action
     * - Toggle Favorite
     * - Toggle Tv_OK
     * - Move to another column
     * - Remove favorite MSG
     *
     * @param data
     */
    ModerationMessage.prototype.handleGlobalEventSource = function (data) {
        var self = this;
        var $html = jQuery(data.html);
        var $context = jQuery('.container-message[data-message-id=' + data.id + ']');
        var fromColumn = $context.parent('.container-messages').data('column');
        var $iconFavorite = jQuery('i.favorite', $context);
        var $iconTvOk = jQuery('.tv_ok', '.container-message[data-message-id=' + data.id + ']');

        // Remove unfavorite message
        if (! $html.find('i.favorite').hasClass('on')) {
            this.removeFavoriteMessage(data.id);
        }

        // Move Message to an other column
        if (fromColumn !== data.column) {
            $context.remove();

            if (data.column === 'incoming') {
                jQuery('.incoming').each(function () {
                    var $column = jQuery(this);
                    var $form = $column.find('.container-filters');
                    var filterSelected = jQuery('select:last', $form).val();

                    // Without Filters
                    if (filterSelected == "") {
                        self.addMessage(data, $column);

                        return;
                    }

                    // With Filters
                    if ((filterSelected == $html.data('message-source')) || (filterSelected == SOURCE_ID_FAVORITE && $html.find('i.favorite').hasClass('on'))) {
                        self.addMessage(data, $column);

                        return;
                    }
                });
            } else {
                self.addMessage(data);
            }
        }

        // Toggle Favorite
        if ($html.find('i.favorite').attr('class') !== $iconFavorite.attr('class')) {
            $iconFavorite.attr('class', $html.find('i.favorite').attr('class'));
            return;
        }

        // Toggle TV_OK
        if ($html.find('.tv_ok').attr('class') !== $iconTvOk.attr('class')) {
            $iconTvOk.attr('class', $html.find('.tv_ok').attr('class'));
            return;
        }

        // Move Position
        if ($html.data('message-position') !== $context.data('message-position')) {
            (new ModerationUtils()).movePickedMessage($context, $html);

            return;
        }
    };

    /**
     * Handle Incoming Column Event Source Action
     * - Add new Message
     *
     * @param data
     * @param columnId
     */
    ModerationMessage.prototype.handleIncomingEventSource = function (data, columnId) {
        var $msg = jQuery(columnId).find('.container-message[data-message-id=' + data.id + ']');

        if((typeof $msg !== 'undefined') && ($msg.length === 0)) {
            jQuery(columnId).prepend(data.html);
        }
    };

    /**
     * Push pushed message
     *
     * @param data
     * @param columnId
     */
    ModerationMessage.prototype.pushMessage = function (data, columnId) {
        if (typeof columnId === 'undefined') {
            this.handleGlobalEventSource(data);
        } else {
            this.handleIncomingEventSource(data, columnId);
        }

        this.reBindActions(data.id);
        this.modalBindActions();

    };

    /**
     * Add message to targeted column.
     *
     * @param data
     * @param {jQuery} $column
     */
    ModerationMessage.prototype.addMessage = function (data, $column) {
        // Max messages displayed in incoming columns
        var messageMax = 200;

        // remove messages over "messageMax""
        if ($column.hasClass('incoming')) {
            var $messages = jQuery('.container-message', $column);

            if($messages.length >= messageMax) {
                $messages.slice(messageMax).detach();
            }    
        }

        // Add new messages on top of the columns
        var $html = jQuery(data.html);
        jQuery('.container-messages[data-column='+data.column+']', $column).prepend($html);
    };

    /**
     * Remove Message by id in favorite column.
     *
     * @param {Integer} id
     */
    ModerationMessage.prototype.removeFavoriteMessage = function (id) {
        jQuery('.incoming').each(function(){
            var $column = jQuery(this);
            var $form = $column.find('.container-filters');

            if (jQuery('select:last', $form).find('option:selected').val() == SOURCE_ID_FAVORITE) {
                jQuery('.container-message[data-message-id=' + id + ']', $column).remove();
            }
        });
    };

    /**
     * Rebind actions on a single message.
     *
     * @param {Integer} messageId
     */
    ModerationMessage.prototype.reBindActions = function (messageId) {
        this.bindActions(jQuery('.container-message[data-message-id=' + messageId + ']'));
    };

    /**
     * Bind actions
     *
     * @param {jQuery} $context
     */
    ModerationMessage.prototype.bindActions = function ($context) {
        var self = this;

        if (typeof $context === 'undefined') {
            $context = jQuery('.container-message');
        }

        jQuery('i.favorite', $context).unbind('click').on('click', function () {
            var messageId = jQuery(this).closest('.container-message').data('message-id');
            var hasStatus = jQuery(this).hasClass('on');
            var promise = self.updateStatusMessage(messageId, 'fav', hasStatus);

            promise
                .done(function () {
                    if (hasStatus) {
                        jQuery('.container-message[data-message-id=' + messageId + ']').find('i.favorite').removeClass('on');
                    } else {
                        jQuery('.container-message[data-message-id=' + messageId + ']').find('i.favorite').addClass('on');
                        self.removeFavoriteMessage(messageId);
                    }
                })
                .fail(function (jqXHR, textStatus, errorThrown) {
                    console.error(errorThrown);
                })
                ;
        });

        jQuery('a.tv_ok', $context).unbind('click').on('click', function () {
            var messageId = jQuery(this).closest('.container-message').data('message-id');
            var hasStatus = jQuery(this).hasClass('on');
            var promise = self.updateStatusMessage(messageId, 'tv_ok', hasStatus);

            promise
                .done(function () {
                    if (hasStatus) {
                        jQuery('.container-message[data-message-id=' + messageId + ']').find('a.tv_ok').removeClass('on');
                    } else {
                        jQuery('.container-message[data-message-id=' + messageId + ']').find('a.tv_ok').addClass('on');
                    }
                })
                .fail(function (jqXHR, textStatus, errorThrown) {
                    console.error(errorThrown);
                })
                ;
        });

        jQuery('a.on_air', $context).unbind('click').on('click', function () {
            var messageId = jQuery(this).closest('.container-message').data('message-id');
            var hasStatus = jQuery(this).hasClass('on');
            var promise = self.updateStatusMessage(messageId, 'on_air', hasStatus);
            var $parentElement = jQuery(this).closest('.options');

            promise
                .done(function (message) {

                    jQuery('.column-move-left').removeClass('hide');

                    if (hasStatus) {
                        jQuery(this).removeClass('on');
                    } else {
                        jQuery('a.on_air').removeClass('on');
                        jQuery(this).addClass('on');
                        $parentElement.find('.column-move-left').addClass('hide');
                        $parentElement.find('.icon.update').addClass('hide');
                    }
                    (new ModerationHeader()).templateMessageLeading(message);
                })
                .fail(function (jqXHR, textStatus, errorThrown) {
                    self.$modalInfo.find('.modal-body').html(jqXHR.responseJSON);
                    self.$modalInfo.modal();
                });
        });

        jQuery('i.column-move-right', $context).unbind('click').on('click', function () {
            self.updateColumn(jQuery(this), 'up');
        });

        jQuery('i.column-move-left', $context).unbind('click').on('click', function () {
            self.updateColumn(jQuery(this), 'down');
        });
    };

    /**
     * Update status message
     *
     * @param messageId
     * @param statusName
     * @param hasStatus
     * @returns {*}
     */
    ModerationMessage.prototype.updateStatusMessage = function (messageId, statusName, hasStatus) {
        return jQuery.ajax(Routing.generate('app_moderation_update_status', {
            'slug': this.slug,
            'messageId': messageId,
            'statusName': statusName,
            'hasStatus': hasStatus ? 1 : 0
        }));
    };

    /**
     * Event: Moving an item on another column
     *
     * @param {jQuery} $element
     * @param direction
     */
    ModerationMessage.prototype.updateColumn = function ($element, direction) {
        var self = this;
        var $container = $element.closest('.container-messages');
        var $message = $element.closest('.container-message');
        var statusMessage;

        if (direction === 'up') {
            statusMessage = $container.data('next-column');
        } else {
            statusMessage = $container.data('prev-column');
        }

        if (typeof (statusMessage) === 'undefined') {
            return;
        }

        var messageId = $message.data('message-id');
        var promise = jQuery.ajax(Routing.generate('app_moderation_update_message_status_column', {
            'messageId': messageId,
            'statusMessage': statusMessage
        }));

        promise
            .done(function (data) {
                jQuery('.container-message[data-message-id=' + messageId + ']').remove();
                if(!(direction === 'down' && $container.data('column') === 'pending')) {
                    jQuery('div.container-messages[data-column=' + statusMessage + ']').prepend(data.html);
                }

                self.reBindActions(messageId);
                return true;
            })
            .fail(function (jqXHR, textStatus, errorThrown) {
                console.error(errorThrown);
            });
    };

    /**
     * Bind actions for modal
     */
    ModerationMessage.prototype.modalBindActions = function () {
        var self = this;

        jQuery('[data-modal="ajax"]').unbind('click').on('click', function (e) {
            e.preventDefault();

            var $this = jQuery(this);
            var remote = $this.data('remote') || $this.attr('href');
            var action = $this.data('modal-action') || '';

            jQuery.get(remote).done(function (html) {

                var $html = jQuery(html);

                if (action === 'edit') {
                    self.modalSubmitMessage($html);
                    (new ModerationUtils).modalBindGaugeMessage($html, '#app_message_edit_text');
                    self.bindUpdateAvatar($html);
                }

                $html.modal({
                    backdrop: 'static',
                    keyboard: false
                });


            });
        });
    };

    /**
     * Bind form for modal
     *
     * @param {jQuery} $context
     */
    ModerationMessage.prototype.modalSubmitMessage = function ($context) {
        var self = this;

        $context.find('form').on('submit', function (e) {
            e.preventDefault();
            var $form = jQuery(this);

            var promise = jQuery.post($form.attr('action'), $form.serialize());

            promise
                .done(function (data) {
                    var $message = jQuery('.container-message[data-message-id=' + data.id + ']', jQuery('.container-messages'));
                    $message.replaceWith(data.html);

                    jQuery('.modal').modal('hide');

                    self.reBindActions(data.id);
                })
                ;
        });
    };

    /**
     * Bind event avatar in edit message modal
     *
     * @param {jQuery} $context
     */
    ModerationMessage.prototype.bindUpdateAvatar = function ($context) {

        $context.find('.btn-on-off').unbind('click').on('click', function () {

            var $this = jQuery(this);
            var $image = $context.find('img.avatar-update');

            if ($this.hasClass('on')) {
                $image.attr('src', $image.data('src-avatar-default'));
            } else {
                $image.attr('src', $image.data('src-avatar'));
            }
        });
    };

    return ModerationMessage;
})(jQuery, window.Socialive.Moderation.Header, window.Socialive.Moderation.Utils);
