'use strict';

/*
 * This file is part of the Social Live project.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @author Amine Fattouch <amine.fattouch@francetv.fr>
 */

// declare namespace of moderation globally.
if (typeof (window.Socialive.Validator) === 'undefined') {
    window.Socialive.Validator = {};
}
/**
 * Validator class for validating a form.
 *
 * @type Validator
 */
window.Socialive.Validator = (function (jQuery, Translator) {
    'use strict';

    var Validator = function () {};

    /**
     * Validates the given constraint.
     *
     * @param {object} constraint The constraint used in validation.
     *
     * @returns {Boolean}
     */
    Validator.prototype.validate = function (constraint) {
        if (constraint.type === 'required') {
            if (constraint.$field.val() === '') {
                this.renderError(constraint.$field, constraint.message);
                return false;
            }
        }
        if (constraint.type === 'regex') {
            if (constraint.regex.test(constraint.$field.val()) === false) {
                this.renderError(constraint.$field, constraint.message);
                return false;
            }
        }
        if (constraint.type === 'unique') {
            if (jQuery('input[value="' + constraint.$field.val() + '"]').length > 0) {
                this.renderError(constraint.$field, constraint.message);
                return false;
            }
        }

        this.removeError(constraint.$field);
        return true;
    };

    /**
     * Renders the message error in the given field.
     *
     * @param {string} $field  The jQuery field object where the error will be rendred.
     * @param {string} message The id of message to display.
     *
     * @returns {undefined}
     */
    Validator.prototype.renderError = function ($field, message) {
        var $error = jQuery('<span/>', {
            'class': 'help-block',
            text: Translator.trans(message, {}, 'validators')
        });
        this.removeError($field);
        $field.parent().addClass('has-error');
        $field.parent().append($error);
    };

    /**
     * Removes the error from a field.
     *
     * @param {string} $field  The jQuery field object from where the error will be removed.
     *
     * @returns {undefined}
     */
    Validator.prototype.removeError = function ($field) {
        $field.parent().removeClass('has-error');
        $field.parent().find('.help-block').remove();
    };

    return Validator;
})(jQuery, Translator);
