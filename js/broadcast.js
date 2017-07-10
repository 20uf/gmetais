'use strict';

/**
 * This file is part of the Social Live project.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @author Sylvain Cristofari <sylvain.cristofari@francetv.fr>
 * @author Amine Fattouch <amine.fattouch@francetv.fr>
 */

// declare namespace of broadcast globally.
if (typeof (window.Socialive.Broadcast) === 'undefined') {
    window.Socialive.Broadcast = {};
}

/**
 * From for creating and updating a broadcast:
 *  - Handle validation of form.
 *  - Add source in broadcast.
 *  - Handle submitting form
 *  - Display modal when it's necessary.
 *
 * @type {Broadcast.Form}
 */
window.Socialive.Broadcast.Form = (function (jQuery, validator, Translator) {
    'use strict';

    // private attribute
    var urlRegex = /(http|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&amp;:/~\+#]*[\w\-\@?^=%&amp;/~\+#])?/;
    var hashtagRegex = /^(\#)(.)+$/;
    var facebookRegex = /((http|https):\/\/)?(www\.)?facebook\.com\/([A-Za-z0-9.]+\/)?(posts|videos|photos)\/([A-Za-z0-9.]+\/)?(\d+\/?)$/;

    /**
     * Constructor.
     *
     * @returns {BroadcastForm}
     */
    var BroadcastForm = function () {
        this.validator = validator;
        this.$sourceAddContainer = jQuery('.content-add-source');
        this.$sourceListContainer = jQuery('.content-list-source');
        this.$htmlPrototypeContainer = jQuery('.prototype-html');
        this.$form = jQuery('.form-broadcast');
    };

    /**
     * Initialize the calls for public methods.
     *
     * @returns {undefined}
     */
    BroadcastForm.prototype.init = function () {
        this.index = jQuery('ul.source', this.$sourceListContainer).length;
        this.bindTabs();
        this.bindRemoveSource();
        this.bindAddSource();
        this.submit();
        this.deleteAvatar();
        this.updateMaxLength();
        this.bindDisplaySectionAdvancedOptions();
    };

    /**
     * Renders the form for adding a source (depends on type)
     *
     * @returns {undefined}
     */
    BroadcastForm.prototype.renderAddForm = function (type) {
        var prototypeSource = this.$htmlPrototypeContainer.data('prototype-' + type);

        this.$sourceAddContainer.removeClass('error');
        this.$sourceAddContainer.unbind().html('').append(jQuery(prototypeSource)).append(jQuery('.prototype-html').data('prototype-button'));

        var messageId = 'broadcast.source.spredfast.help.url';

        if (type === 'json_info') {
            messageId = 'broadcast.source.json_info.help.url';
        } else if (type === 'facebook') {
            messageId = 'broadcast.source.facebook.help.url';
        }

        jQuery('label[for="app_broadcast_sources___name___url"]').children('i').prop('title', Translator.trans(messageId));
        jQuery('[data-toggle="tooltip"]').tooltip();

        this.bindAddSource();
    };

    /**
     * Binds action click to add a new source.
     *
     * @returns {undefined}
     */
    BroadcastForm.prototype.bindAddSource = function () {
        var self = this;
        this.$sourceAddContainer.find('.source-add').on('click', function () {
            if (self.isValidSource(jQuery(this).parent())) {
                self.addSource();
            }
        });
    };

    /**
     * Tests whether a source is valid or not.
     *
     * @param {object} $sourceFormContainer The jQuery container for source form.
     *
     * @returns {Boolean}
     */
    BroadcastForm.prototype.isValidSource = function ($sourceFormContainer) {
        var validText = true;
        var validUrl = true;
        var self = this;
        self.$sourceAddContainer.removeClass('error');
        var type = jQuery('ul.nav-tabs li.active a').data('type');
        var $textFields = $sourceFormContainer.find('input[type="text"]');
        if ($textFields.length > 0) {
            $textFields.each(function () {
                if (!self.validator.validate({$field: jQuery(this), type: 'required', message: 'error.field.empty'})) {
                    validText = false;
                }
                /** url check */
                else if (type === 'twitter' && jQuery(this).attr('id') === 'app_broadcast_sources___name___hashtag' && !self.validator.validate({$field: jQuery(this), type: 'regex', regex: hashtagRegex, message: 'error.source.hashtag.invalid'})) {
                    validText = false;
                }
                /** check source already exist by name */
                else if (!self.validator.validate({$field: jQuery(this), type: 'unique', message: 'error.source.name.unique'})) {
                    validText = false;
                }
            });
        }

        var $urlField = $sourceFormContainer.find('input[type="url"]');
        if ($urlField.length > 0) {
            if (!self.validator.validate({$field: $urlField, type: 'required', message: 'error.field.empty'})) {
                validUrl = false;
            }
            /** url check */
            else if (type === 'facebook' && !self.validator.validate({$field: $urlField, type: 'regex', regex: facebookRegex, message: 'error.source.url.invalid_fb'})) {
                validUrl = false;
            }
            /** url check */
            else if (!self.validator.validate({$field: $urlField, type: 'regex', regex: urlRegex, message: 'error.source.url.invalid'})) {
                validUrl = false;
            }
            /** check source already exist */
            else if (!self.validator.validate({$field: $urlField, type: 'unique', message: 'error.source.url.unique'})) {
                validUrl = false;
            }
        }

        return validText && validUrl;
    };

    /**
     * Adds a source in the list of sources in the form.
     *
     * @returns {undefined}
     */
    BroadcastForm.prototype.addSource = function () {
        var self = this;
        var type = jQuery('ul.nav-tabs li.active a').data('type');
        var $newSource = jQuery(this.$htmlPrototypeContainer.data('prototype-html-' + type));
        // add data in dom
        jQuery('input[type="text"], input[type="url"]', $newSource).each(function () {
            jQuery(this).prevAll('label, i').remove();
            jQuery(this).attr('value', self.$sourceAddContainer.find('#' + jQuery(this).attr('id')).val());
            jQuery(this).prop('readonly', true);
        });
        $newSource.find('input[id$="type"]').val(type);
        // add source form to dom and replace the regex __name__ by the correct index
        this.$sourceListContainer.append($newSource[0].outerHTML.replace(/__name__/g, this.index));
        this.$sourceAddContainer.find('input[type="text"], input[type="url"]').val('');
        this.index++;
        // bind delete
        this.bindRemoveSource();
    };

    /**
     * Binds the action of click on delete source icon to remove the corresponding source.
     *
     * @returns {undefined}
     */
    BroadcastForm.prototype.bindRemoveSource = function () {
        jQuery('.delete-source a', this.$sourceListContainer).unbind().on('click', function (e) {
            e.preventDefault();
            var $deleteModal = jQuery('#delete_source_modal');
            var $sourceButton = jQuery(this);
            $deleteModal.modal();
            jQuery('.btn-default', $deleteModal).unbind().on('click', function () {
                $sourceButton.closest('.row').remove();
                $deleteModal.modal('hide');
            });
        });
    };

    /**
     * Validation for the ftp
     *
     * @returns {boolean}
     */
    BroadcastForm.prototype.validFtp = function () {
        var self = this;
        var count = 0;
        var $fields = [
            jQuery('#app_broadcast_ftp_host'),
            jQuery('#app_broadcast_ftp_username'),
            jQuery('#app_broadcast_ftp_password'),
            jQuery('#app_broadcast_ftp_root')
        ];

        jQuery.each($fields, function (k, $field) {
            if ($field.val() == '') {
                self.validator.removeError($field);
                count++;
            }
        });

        if (count == $fields.length || count == 0) {
            return true;
        }

        jQuery.each($fields, function (k, $field) {
            if ($field.val() == '') {
                self.validator.renderError($field, 'error.field.empty');
            } else {
                self.validator.removeError($field);
            }
        });
        return false;
    };

    /**
     * Handles the case when submitting the form (calls validation + disable the widget for
     * source add container).
     *
     * @returns {undefined}
     */
    BroadcastForm.prototype.submit = function () {
        var self = this;
        var submitButtonName;
        var $form = jQuery('.form-broadcast');

        jQuery('.submit-button').on('click', function () {
            submitButtonName = jQuery(this).data('name');
        });

        $form.submit(function () {
            if (submitButtonName === 'moderate') {
                if (!self.submitAndModerate()) {
                    return false;
                }
            }

            // validate form
            if (self.isValid() === true && self.validFtp() === true) {
                jQuery('input:text, input[type="url"]', self.$sourceAddContainer).each(function () {
                    jQuery(this).prop('disabled', 'disabled');
                });
                // remove choices input
                self.$sourceAddContainer.html('');
                return true;
            }

            window.scrollTo(0, 0);
            return false;
        });
    };

    /**
     * Tests whether the current form is valid or not.
     *
     * @returns {Boolean}
     */
    BroadcastForm.prototype.isValid = function () {
        var valid = true;
        var self = this;

        // Name is not empty empty
        if (!self.validator.validate({$field: jQuery('input#app_broadcast_name'), type: 'required', message: 'error.field.empty'})) {
            valid = false;
        }

        // validate empty sources.
        var totalOfSources = self.$sourceListContainer.find('input[type="text"], input[type="url"]').length;

        if (totalOfSources === 0) {
            self.$sourceAddContainer.find('input[type="text"], input[type="url"]').each(function () {
                self.validator.renderError(jQuery(this), 'error.field.empty');
            });
            valid = false;
        }

        return valid;
    };

    /**
     * Handles the case when clicking on the button submit and moderation (if the broadcast is not enabled,
     * display the adequat modal).
     *
     * @returns {boolean}
     */
    BroadcastForm.prototype.submitAndModerate = function () {
        if (jQuery('#app_broadcast_enabled_1').is(':checked')) {
            return true;
        } else {
            jQuery('#inactive_broadcast_modal').modal();
            return false;
        }
    };

    /**
     * Binds click action in the tabs.
     *
     * @returns {boolean}
     */
    BroadcastForm.prototype.bindTabs = function () {
        var self = this;

        jQuery('.nav-tabs a.tab').on('click', function () {
            self.renderAddForm(jQuery(this).data('type'));
        });
    };

    /**
     * Deletes an avatar.
     *
     * @returns {undefined}
     */
    BroadcastForm.prototype.deleteAvatar = function () {
        var config = this.$form.find('.config-broadcast');
        config.find('.close').click(function () {
            jQuery(this).hide();
            config.find('img').addClass('hidden');
            config.find('#input-file-avatar').removeClass('hide');
            config.find('input#app_broadcast_deleteAvatar').val('1');
        });
    };

    /**
     * Updates max length when changing the select of program.
     *
     * @returns {undefined}
     */
    BroadcastForm.prototype.updateMaxLength = function () {
        var $form = jQuery('form.container-form-create-broadcast');
        $form.find('#app_broadcast_program').change(function () {
            $form.find('#app_broadcast_maxLength').val(jQuery(this).find('option:selected').data('max_length'));
        });
    };

    /**
     * Bind action on link to display/hide section Advanced Options.
     */
    BroadcastForm.prototype.bindDisplaySectionAdvancedOptions = function () {
        jQuery('a.advanced-options').on('click', function() {
            jQuery('.advanced-options').toggleClass('hidden');
        });
    };

    return BroadcastForm;

})(jQuery, new window.Socialive.Validator(), Translator);

/**
 * List of broadcasts which contains:
 *  - Handle the remove of a broadcast in list.
 *
 * @type {Broadcast.List}
 */
window.Socialive.Broadcast.List = (function (jQuery, dom) {
    'use strict';
    var BroadcastList = function () {
        this._deleteModal = dom.getElementById('delete_broadcast_modal');
        this._deleteModalButton = dom.getElementsByClassName('validate')[0];
        this._deleteButtons = jQuery('.remove-broadcast:not(disabled)', '.container-list-broadcast');
    };

    BroadcastList.prototype.removeBroadcast = function (e) {
        var path = e.currentTarget.getAttribute('data-broadcast-remove-path');
        this._deleteModalButton.setAttribute('href', path);
        jQuery(this._deleteModal).modal();
    };

    BroadcastList.prototype.init = function () {
        var self = this;
        self._deleteButtons.on('click', function (e) {
            if (jQuery(this).hasClass('disabled') === false) {
                self.removeBroadcast(e);
            }
        });
    };

    return BroadcastList;

})(jQuery, document);

/**
 * List of broadcasts which contains:
 *  - Handle the remove of a broadcast in list.
 *
 * @type {Broadcast.Modal}
 */
window.Socialive.Broadcast.Modal = (function (jQuery, Translator) {
    'use strict';

    var BroadcastModal = function () {
        this.$htmlPrototypeContainer = jQuery('.prototype-html');

        // Front Modal
        this.$frontListContainer = jQuery('.container-list-front');
        this.$addFrontModal = jQuery('#add_front_modal');
        this.$addFrontModalBody = jQuery('.modal-body', this.$addFrontModal);

        // Advanced Options
        this.$confirmRemoveMessageHistoryModal = jQuery('#confirm_remove_message_history_modal');
        this.$successRemoveMessageHistoryModal = jQuery('#success_remove_message_history_modal');
    };


    /**
     * Bind the action :
     *  - click on Remove History Message
     *  - click on Validate Modal
     */
    BroadcastModal.prototype.bindRemoveMessageHistory = function () {

        var self = this;

        jQuery('#advanced_options_messages_history .btn').on('click', function() {

            var $select = jQuery('#advanced_options_messages_history select');

            if ($select.val() != '') {
                jQuery('.modal-body', self.$successRemoveMessageHistoryModal)
                    .html(Translator.trans('broadcast.form.modal.success_message_history'));

                jQuery('.modal-body p', self.$confirmRemoveMessageHistoryModal)
                    .text(Translator.trans('broadcast.form.modal.confirm_message_history_'+$select.val()));

                self.$confirmRemoveMessageHistoryModal.modal();
            }
        });

        jQuery('.btn.validate', this.$confirmRemoveMessageHistoryModal).on('click', function(){
            self.$confirmRemoveMessageHistoryModal.modal('hide');
            self.removeMessageHistory();
        });
    };

    /**
     * Remove Message History.
     */
    BroadcastModal.prototype.removeMessageHistory = function () {
        var self = this;
        var slug = jQuery('.broadcast-info').data('slug');

        switch (jQuery('#advanced_options_messages_history select').val()) {
        case '1':
            jQuery.ajax({
                url: Routing.generate('app_broadcast_remove_message_history', {'broadcast': slug, 'columnStatus': 'pending'}),
                type: 'GET'
            }).done(function () {
                self.$successRemoveMessageHistoryModal.modal();
            });
            break;
        case '2':
            jQuery.ajax({
                url: Routing.generate('app_broadcast_remove_message_history', {'broadcast': slug, 'columnStatus': 'picked'}),
                type: 'GET'
            }).done(function () {
                self.$successRemoveMessageHistoryModal.modal();
            });
            break;
        case '3':
            jQuery.ajax({
                url: Routing.generate('app_broadcast_remove_message_history', {'broadcast': slug, 'columnStatus': 'pending'}),
                type: 'GET'
            }).done(function () {
                jQuery.ajax({
                    url: Routing.generate('app_broadcast_remove_message_history', {'broadcast': slug, 'columnStatus': 'picked'}),
                    type: 'GET'
                }).done(function () {
                    self.$successRemoveMessageHistoryModal.modal();
                });
            });
            break;
        }
    };

    /**
     * Bind the action of click on Add Front Button on broadcast form.
     *
     * @returns {undefined}
     */
    BroadcastModal.prototype.bindAddFront = function () {

        var self = this;

        jQuery('.front-add', self.$frontListContainer).on('click', function () {
            self.renderAddFrontModal(self.$addFrontModalBody);
            self.bindAddFrontModalValidation();
        });
    };

    /**
     * Bind the action of remove a front on broadcast form.
     *
     * @returns {undefined}
     */
    BroadcastModal.prototype.bindRemoveFront = function () {
        jQuery('#front_list .delete-front').on('click', function (e) {
            e.preventDefault();
            jQuery(this).closest('.front-block').remove();
        });
    };

    /**
     * Bind the action of reset form
     *
     * @param $context
     */
    BroadcastModal.prototype.bindResetFormFilter = function($context) {
        var $formFilter = jQuery('form[name="app_front_filter"]', $context);
        if ($formFilter.length > 0) {
            (new window.Socialive.Front.Filter()).resetForm($formFilter);
        }
    };

    /**
     * Bind action toggle on display more filter.
     *
     * @param $context
     */
    BroadcastModal.prototype.bindToggleFormFilter = function($context) {
        jQuery('.collapse.filters', $context).on('show.bs.collapse', function () {
            var $btn = $context.find('.btn-show-filter');
            $btn.html($btn.data('message-less'));
        });

        jQuery('.collapse.filters', $context).on('hidden.bs.collapse', function () {
            var $btn = $context.find('.btn-show-filter');
            $btn.html($btn.data('message-more'));
        });
    };

    /**
     * Bind action on selection front.
     *
     * @param $context
     */
    BroadcastModal.prototype.bindToggleSelectFront = function ($context) {
        jQuery('.front-block', $context).unbind().on('click', function () {
            if (jQuery(this).hasClass('selected')) {
                jQuery('.above', this).addClass('hide');
                jQuery(this).removeClass('selected');

                // Remove Existing Front on broadcast form
                var frontId = jQuery(this).find('.thumbnail').data('front-id');
                var $thumbnail = jQuery('#front_list .front-block > .thumbnail[data-front-id=' + frontId + ']');
                $thumbnail.closest('.front-block').remove();

            } else {
                // Disable selection when list contains already 5 selected fronts
                if(jQuery('.front-block.selected', $context).length < 5) {
                    jQuery('.above', this).removeClass('hide');
                    jQuery(this).addClass('selected');
                }
            }
        });

        jQuery('.front-block:not(.selected)', $context).on({
            mouseenter: function () {
                jQuery('.above', this).removeClass('hide');
            },
            mouseleave: function () {
                if (jQuery(this).hasClass('selected')) {
                    return false;
                }
                jQuery('.above', this).addClass('hide');
            }
        });
    };

    /**
     * Render Modal HTML Content
     *
     * @returns {undefined}
     */
    BroadcastModal.prototype.renderAddFrontModal = function (dom) {

        var self = this;
        var $form = jQuery('form', dom);
        var promise = null;

        if ($form.length > 0) {
            promise = jQuery.ajax({
                url: Routing.generate('app_front_filtered_list'),
                type: 'POST',
                data: $form.serialize()
            });
        } else {
            promise = jQuery.ajax(Routing.generate('app_front_filtered_list', {}));
        }

        promise.done(function (html) {
            var $html = jQuery(html);

            // Handle Reset Front Filter
            self.bindResetFormFilter($html);
            self.bindToggleFormFilter($html);
            self.bindToggleSelectFront($html);


            // Bind Submit Filter Form //
            jQuery('form', $html).unbind().on('submit', function (e) {
                e.preventDefault();
                self.renderAddFrontModal($html);
            });

            // Mark Front already selected on Broadcast
            jQuery('#front_list .front-block > .thumbnail').each(function(){
                var id = jQuery(this).data('front-id');
                var $thumbnail = jQuery('.thumbnail[data-front-id=\'' + id + '\']', $html);

                if(typeof $thumbnail !== 'undefined') {
                    jQuery('.above', $thumbnail).removeClass('hide');
                    $thumbnail.closest('.front-block').addClass('selected');
                }
            });

            // Hydrate Modal //
            self.$addFrontModalBody.html($html);
            self.$addFrontModal.modal();
        });

    };

    /**
     * Bind the action of click on validate button of the modal
     *
     * @returns {undefined}
     */
    BroadcastModal.prototype.bindAddFrontModalValidation = function () {

        var self = this;

        jQuery('.btn-default', self.$addFrontModal).unbind().on('click', function () {
            jQuery('.front-block.selected > .thumbnail', self.$addFrontModal).each(function () {
                var data = {
                    id: jQuery(this).data('front-id'),
                    name: jQuery(this).data('front-name'),
                    type: jQuery(this).data('front-type-trans'),
                    thumbnail: jQuery(this).data('front-thumbnail'),
                };

                self.addFront(data);
            });
            self.$addFrontModal.modal('hide');
            self.bindRemoveFront();
        });
    };

    /**
     * Add Front to FrontList on Broadcast form
     *
     * @param {object} front
     * @returns {undefined}
     */
    BroadcastModal.prototype.addFront = function (front) {
        var $list = jQuery('#front_list');
        var $newFront = jQuery(this.$htmlPrototypeContainer.data('prototype-html-front'));

        if (jQuery('#front_list .front-block').length < 5
            && jQuery('#front_list .front-block > .thumbnail[data-front-id=' + front.id + ']').length === 0) {

            $list.append($newFront[0].outerHTML
                .replace(/__id__/g, front.id)
                .replace(/__front_name__/g, front.name)
                .replace(/__front_type__/g, front.type)
                .replace(/__front_thumbnail__/g, front.thumbnail)
                .replace(/__name__/g, this.index));
            jQuery('#app_broadcast_fronts_' + this.index + ' option[value=\'' + front.id + '\']').prop('selected', true);

            this.index++;
        }
    };

    BroadcastModal.prototype.init = function () {
        this.index = 5;
        this.bindAddFront();
        this.bindRemoveFront();
        this.bindRemoveMessageHistory();
    };

    return BroadcastModal;

})(jQuery, Translator);

/**
 * Load broadcast
 */
jQuery(document).ready(function () {
    if (jQuery('.form-broadcast').length > 0) {
        new window.Socialive.Broadcast.Form().init();
    }

    if (jQuery('.container-list-broadcast').length > 0) {
        new window.Socialive.Broadcast.List().init();
    }

    if (jQuery('.container-list-front').length > 0 || jQuery('.advanced_options').length > 0) {
        new window.Socialive.Broadcast.Modal().init();
    }
});
