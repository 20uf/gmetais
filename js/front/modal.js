"use strict";

/*
 * This file is part of the Social Live project.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @author Stéphanie Loux-Durand <stephanie.loux-durand@francetv.fr>
 */

// declare namespace of moderation globally.
if (typeof (window.Socialive.Front) === 'undefined') {
    window.Socialive.Front = {};
}

/**
 *  Manage modal behaviour on the front page
 *  @type {Front}
 **/
window.Socialive.Front.Modal = (function(jQuery) {
    "use strict";

    var FrontModal = function() {
        this.bindPreview();
    }

    /**
     * Display an image in the middle of the screen
     */
    FrontModal.prototype.bindPreview = function()  {
        jQuery("a.thumbnail-preview").on("click", function() {

            var $img = jQuery(this);

            jQuery('#front_modal').on('shown.bs.modal', function() {
                var $modal = jQuery('.modal-img');
                $modal.attr('src', $img.data('src-modal-img'));
            })

        })
    }

    return FrontModal;
})(jQuery);

/**
 *  Load Modal on the front page
 **/
jQuery(document).ready(function() {
    new window.Socialive.Front.Modal();
});
