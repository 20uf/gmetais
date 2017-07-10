'use strict';

/**
 * This file is part of the Social Live project.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @author Michael COULLERET <michael.coulleret@francetv.fr>
 * @author Sylvain Cristofari <sylvain.cristofari@francetv.fr>
 * @author Amine Fattouch <amine.fattouch@francetv.fr>
 */


// declare namespace of program globally.
if (typeof (window.Socialive.Program) === 'undefined') {
    window.Socialive.Program = {};
}

/**
 * From for creating and updating a Program:
 *  - Handle validation of form.
 *  - Handle submitting form
 *  - Display modal when it's necessary.
 *
 * @type {Program.Form}
 */
window.Socialive.Program.Form = (function (jQuery, validator) {
    'use strict';

    /**
     * Constructor.
     *
     * @returns {ProgramForm}
     */
    var ProgramForm = function () {
        this.validator = validator;
        this.$form = jQuery('.form-program');
        this.enabledSMS();
    };

    /**
     * Initialize the calls for public methods.
     *
     * @returns {undefined}
     */
    ProgramForm.prototype.init = function () {
        this.submit();
    };

    ProgramForm.prototype.enabledSMS = function () {
        jQuery('.btn-on-off').on('click', function(e) {
            if (jQuery(this).hasClass('disabled')) {
                e.preventDefault();
                return false;
            }

            if (jQuery(this).hasClass('on')) {
                jQuery('.bs-callout.bs-callout-default.on').removeClass('hide');
                jQuery('.bs-callout.bs-callout-default.off').addClass('hide');
            }  else {
                jQuery('.bs-callout.bs-callout-default.on').addClass('hide');
                jQuery('.bs-callout.bs-callout-default.off').removeClass('hide');
            }
        });
    };

    /**
     * Handles the case when submitting the form (calls validation).
     *
     * @returns {boolean}
     */
    ProgramForm.prototype.submit = function () {
        var self = this;
        var $form = jQuery('.form-program');

        $form.submit(function () {
            window.scrollTo(0, 0);
            return self.isValid();
        });
    };

    /**
     * Tests whether the current form is valid or not.
     *
     * @returns {boolean}
     */
    ProgramForm.prototype.isValid = function () {
        var valid = true;
        var self = this;

        // Name is not empty empty
        if (!self.validator.validate({$field: jQuery('input#app_program_name'), type: 'required', message: 'error.field.empty'})) {
            valid = false;
        }

        // Name is not empty empty
        if (!self.validator.validate({$field: jQuery('input#app_program_maxLength'), type: 'required', message: 'error.field.empty'})) {
            valid = false;
        }

        return valid;
    };

    return ProgramForm;

})(jQuery, new window.Socialive.Validator());

/**
 * List of programs which contains:
 *  - Handle the remove of a program in list.
 *
 * @type {Program.List}
 */
window.Socialive.Program.List = (function (jQuery, dom) {
    'use strict';
    var ProgramList = function () {
        this._deleteModal = dom.getElementById('delete_program_modal');
        this._deleteModalButton = dom.getElementsByClassName('validate')[0];
        this.$deleteButtons = jQuery('.remove-program', '.container-list-program');
    };

    ProgramList.prototype.remove = function (e) {
        var path = e.currentTarget.getAttribute('data-program-remove-path');
        this._deleteModalButton.setAttribute('href', path);
        jQuery(this._deleteModal).modal();
    };

    ProgramList.prototype.init = function () {
        var self = this;
        self.$deleteButtons.on('click', function (e) {
            if (jQuery(this).closest('tr').data('has_active_broadcast') === 1) {
                jQuery('#delete_program_active_modal').modal();
                return false;
            } else if (jQuery(this).hasClass('disabled') === false) {
                self.remove(e);
            }
        });
    };

    return ProgramList;

})(jQuery, document);

/**
 * Load program
 */
jQuery(document).ready(function () {
    if (jQuery('.form-program').length > 0) {
        new window.Socialive.Program.Form().init();
    }

    if (jQuery('.container-list-program').length > 0) {
        new window.Socialive.Program.List().init();
    }
});
