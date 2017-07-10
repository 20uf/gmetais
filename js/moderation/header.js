/*!
 * This file is part of the Social Live project.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @author Michael COULLERET <michael.coulleret@francetv.fr>
 */

var eventSourceHeader;

// declare namespace of moderation globally.
if (typeof (window.Socialive.Moderation) === 'undefined') {
    window.Socialive.Moderation = {};
}

/**
 * Headers events
 *  - history list
 *  - rescue form
 *
 * @type {Moderation.Header}
 */
window.Socialive.Moderation.Header = (function (jQuery, Translator, Source, Validator, Emojione) {
    'use strict';

    /**
     * Moderation header
     *
     * @constructor
     */
    var ModerationHeader = function () {
        this.$containerOptions = jQuery('div.leading ul.options');
        this.$toggleHistorical = jQuery('#toggle_historical');
        this.$toggleRescue = jQuery('#toggle_rescue');
        this.$toggleProfile = jQuery('#toggle_profile');
        this.$workflow = jQuery('section.container-columns-workflow');
    };

    /**
     * Init events moderation header
     */
    ModerationHeader.prototype.init = function (slug) {
        this.bindActions();
        this.slug = slug;
        this.source = new Source(Routing.generate('app_moderation_leading_push', {slug: slug}, true));
        this.validator = new Validator();
        this.leadingMessage();
    };

    /**
     * Returns a rendered view leading (on_air or rescue message status)
     *
     * @param message {json}
     */
    ModerationHeader.prototype.templateMessageLeading = function (message) {

        var $leading = jQuery('header div.leading');
        jQuery('a.on_air').removeClass('on');

        var $iconMoveLeft = jQuery('.column-move-left');
        var $iconUpdate = jQuery('.icon.update');

        if (message === null || jQuery.isEmptyObject(message)) {
            $leading.find('h2').html(Translator.trans('moderation.mentions.nothing', {}, 'messages'));
            $leading.find('.avatar').addClass('hidden');
            $leading.find('h3').addClass('hidden');
            $leading.find('h3').next('div').addClass('hidden');
            $iconMoveLeft.removeClass('hide');
            $iconUpdate.removeClass('hide');
            return;
        }

        if (typeof (message.message_status) !== 'undefined') {
            message.message_status.forEach(function (messageStatus) {
                if (messageStatus.status.name === 'on_air') {
                    $leading.find('h2').html(Translator.trans('moderation.mentions.forced', {}, 'messages'));
                }
                if (messageStatus.status.name === 'rescued') {
                    $leading.find('h2').html(Translator.trans('moderation.mentions.rescue', {}, 'messages'));
                }
            });
        }

        var defaultAvatar = this.$workflow.data('default-avatar');
        if (message.is_default_avatar) {
            $leading.find('.avatar').removeClass('hidden').attr('src', defaultAvatar);
        } else {
            $leading.find('.avatar').removeClass('hidden')
            if (typeof message.profile_avatar !== 'undefined') {
                $leading.find('.avatar').attr('src', message.profile_avatar);
            } else {
                $leading.find('.avatar').attr('src', defaultAvatar);
            }
        }

        var $span = $leading.find('h3 > span').html(message.network);

        $leading.find('h3').removeClass('hidden').html(message.profile_username + ' (' + $span[0].outerHTML + ')');

        var msg = message.text;

        if (msg.length > 140) {
            $leading.find('h3').next('div').removeClass('hidden').html(Emojione.unicodeToImage(msg.substring(0, 140)) + '...');
        } else {
            $leading.find('h3').next('div').removeClass('hidden').html(Emojione.unicodeToImage(msg));
        }

        $iconMoveLeft.removeClass('hide');
        $iconUpdate.removeClass('hide');

        var $message = jQuery('div.picked .container-message[data-message-id=' + message.id + ']');
        $message.find('.column-move-left').addClass('hide');
        $message.find('.icon.update').addClass('hide');
        $message.find('a.on_air').addClass('on');
    };

    /**
     * Source event on leading message (on_air or rescue status)
     */
    ModerationHeader.prototype.leadingMessage = function () {
        var self = this;

        eventSourceHeader = self.source.getEventSource();

        if (typeof (eventSourceHeader) === 'undefined') {
            console.error('browser does not support server-sent events');
            return;
        }

        eventSourceHeader.onmessage = function (event) {
            var message = JSON.parse(event.data);

            self.templateMessageLeading(message);
        };
    };

    /**
     * Bind actions
     */
    ModerationHeader.prototype.bindActions = function () {
        this.showRescueToggle();
        this.showHistoricalToggle();
        this.showProfileToggle();
    };

    /**
     * Show Profile toggle
     */
    ModerationHeader.prototype.showProfileToggle = function() {
        var self = this;

        jQuery('section.guidance li[data-toggle=profile]').unbind('click').on('click', function () {
            self.$toggleProfile.toggleClass('hidden');
        });
    };

    /**
     * Show rescue toggle
     */
    ModerationHeader.prototype.showRescueToggle = function () {
        var self = this;

        this.$containerOptions.find('[data-toggle=rescue]').unbind('click').on('click', function () {
            var $currentLi = jQuery(this);

            if (!self.$toggleRescue.hasClass('hidden')) {

                $currentLi.removeClass('active');
                self.$toggleRescue.addClass('hidden');
                self.$toggleRescue.find('form')[0].reset();
                if (self.$toggleRescue.find('form .help-block').length > 0) {
                    self.$toggleRescue.find('form .help-block').parent('.has-error').removeClass('has-error');
                    self.$toggleRescue.find('form .help-block').remove();
                }

                return true;
            }

            $currentLi.addClass('active');
            self.$toggleRescue.removeClass('hidden');

            if (!self.$toggleHistorical.hasClass('hidden')) {
                self.$toggleHistorical.addClass('hidden');
                jQuery('li[data-toggle=historical]').removeClass('active');
            }

            self.bindRescuedAction();
        });
    };

    /**
     * Show historical toggle
     */
    ModerationHeader.prototype.showHistoricalToggle = function () {
        var self = this;

        this.$containerOptions.find('[data-toggle=historical]').unbind('click').on('click', function () {
            var $currentLi = jQuery(this);

            if (!self.$toggleHistorical.hasClass('hidden')) {
                $currentLi.removeClass('active');
                self.$toggleHistorical.addClass('hidden');

                return true;
            }

            var promise = jQuery.ajax(Routing.generate('app_moderation_show_historical', {
                'slug': self.slug
            }));

            promise
                .done(function (html) {
                    self.$toggleHistorical.html(html);

                    $currentLi.addClass('active');
                    self.$toggleHistorical.removeClass('hidden');

                    if (!self.$toggleRescue.hasClass('hidden')) {
                        self.$toggleRescue.addClass('hidden');
                        jQuery('li[data-toggle=rescue]').removeClass('active');
                    }

                    self.bindRescuedAction();

                    return true;
                })
                .fail(function (jqXHR, textStatus, errorThrown) {
                    console.error(errorThrown);
                })
                ;
        });
    };

    /**
     * Bind rescued
     * - Forms
     * - Gauge
     * - Avatar
     */
    ModerationHeader.prototype.bindRescuedAction = function () {
        var self = this;

        self.$toggleRescue.find('form').submit(function (e) {
            e.preventDefault();
            self.rescueRequestSubmit(jQuery(this));
        });

        self.$toggleRescue.find('.remove-rescue').on('click', function (e) {
            e.preventDefault();
            self.removeRescueMessage();
        });

        self.modalBindGaugeMessage(self.$toggleRescue);
        self.bindUpdateAvatar(self.$toggleRescue);
    };

    /**
     * Request submit form
     *
     * @param $form
     */
    ModerationHeader.prototype.rescueRequestSubmit = function ($form) {
        var self = this;

        if (!self.formValidator($form)) {
            return false;
        }

        var promise = jQuery.post($form.attr('action'), $form.serialize());

        promise
            .done(function (html) {
                var $html = jQuery(html);

                $html.find('#app_rescue_message_import_urlNetwork').attr('value', '');
                self.$toggleRescue.html($html[0].outerHTML);
                self.bindRescuedAction();
            })
            .fail(function () {
                console.error('error when importing rescue message');
            })
            ;
    };

    /**
     * Removes a rescue message from header.
     */
    ModerationHeader.prototype.removeRescueMessage = function () {
        var self = this;
        var promise = jQuery.get(Routing.generate('app_moderation_remove_rescue_message', {broadcast: self.slug}));

        promise
            .done(function () {
                self.$toggleRescue.find('.message-import').nextAll().empty();
            })
            .fail(function () {
                console.error('error when removing rescue message');
            })
            ;

    }

    /**
     * Validator form
     *
     * @param $form
     * @returns {boolean}
     */
    ModerationHeader.prototype.formValidator = function ($form) {
        if ($form.attr('name') === 'app_rescue_message_import') {
            var twitterRegex = /^https?:\/\/twitter.com\/[^\/]+\/status\/([0-9]+)(\?([\w-]+(=[\w-]*)?(&[\w-]+(=[\w-]*)?)*)?)?$/,
                facebookRegex = /^((http|https):\/\/)?(www\.)?facebook\.com\/([A-Za-z0-9.]+\/)?posts\/(\d+)/,
                $url = $form.find('#app_rescue_message_import_urlNetwork');

            if (!this.validator.validate({$field: $url, type: 'required', message: 'error.field.empty'})) {
                return false;
            }

            if (!this.validator.validate({$field: $url, type: 'regex', regex: twitterRegex, message: 'error.field.message_url'}) &&
                !this.validator.validate({$field: $url, type: 'regex', regex: facebookRegex, message: 'error.field.message_url'})) {
                return false;
            }
        }

        return true;
    };

    /**
     * Gauge event in modal context
     * - Update Gauge when input change
     *
     * @param $context
     */
    ModerationHeader.prototype.modalBindGaugeMessage = function ($context) {
        var $elementTextArea = $context.find('#app_rescue_message_edit_text');
        if ($elementTextArea.length == 0) {
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
     * Bind event avatar in edit message modal
     *
     * @param $context
     */
    ModerationHeader.prototype.bindUpdateAvatar = function ($context) {

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

    return ModerationHeader;
})(jQuery, Translator, window.Socialive.Source, window.Socialive.Validator, emojione);
