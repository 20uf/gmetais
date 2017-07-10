"use strict";
/**
 * This file is part of the Social Live project.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @author Amine Fattouch <amine.fattouch@francetv.fr>
 * @author Stéphanie Loux-Durand <stephanie.loux-durand@francetv.fr>
 */
 // declare namespace of moderation globally.
 if (typeof (window.Socialive.Modal) === 'undefined') {
    window.Socialive.Modal = {};
 };
/**
 * Modal handling moderation page view
 *
 *  @type {Modal}
 */
window.Socialive.Modal.ListFront = (function(translator) {
    "use strict";

    var ModalListFront = function() {
         this.broadcastSlug = '';
         this.$modal = jQuery('#list_front_modal');
    };

    ModalListFront.prototype.init = function () {
         let self = this;
         jQuery('a.show-configured-front').each( function() {
             self.broadcastSlug = jQuery(this).data('broadcast_slug');
             self.url = Routing.generate(('app_broadcast_list_fronts'), {'slug': self.broadcastSlug})
             self.bindClickEvent(jQuery(this));
         });
    };

    ModalListFront.prototype.bindClickEvent = function($element) {
         let self = this;
         $element.on('click', function() {
             self.renderView();
         });
     };

    ModalListFront.prototype.renderView = function() {
         let promise = {};
         let self = this;
         promise = jQuery.ajax({
             dataType: 'JSON',
             url: this.url
         });

         promise.done(function (data) {
             self.buildView(data);
             self.displayView();
         });

         promise.fail(function() {
             throw new Error('Exception has been detected when rendering view from server.');
         });
    };

    ModalListFront.prototype.displayView = function() {
         this.$modal.find('.modal-body').empty();
         this.$modal.find('.modal-body').html(this.content);
         this.$modal.modal();
         this.content = '';
    };

    ModalListFront.prototype.buildView = function(data) {
         let self = this;
         let htmlPrototype = this.$modal.data('prototype_html');
         self.content = '';
         data.forEach(function (front) {
             self.content += htmlPrototype
                 .replace(/__name__/g, front.name)
                 .replace(/__type__/g, translator.trans(front.type, {}, 'front_type'))
                 .replace(/__slug__/g, front.slug)
                 .replace(/__url__/g, Routing.generate('app_front_show_message', {'broadcast': self.broadcastSlug, 'front': front.slug}));
         });
     };

    return ModalListFront;
})(Translator);

jQuery(document).ready(function () {
    if (jQuery('a.show-configured-front').length > 0) {
        (new window.Socialive.Modal.ListFront()).init();
    }
});
