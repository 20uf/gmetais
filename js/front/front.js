"use strict";

/*
 * This file is part of the Social Live project.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @author Michael COULLERET <michael.coulleret@francetv.fr>
 * @author Amine Fattouch <amine.fattouch@francetv.fr>
 */

// declare namespace of moderation globally.
if (typeof (window.Socialive.Front) === 'undefined') {
    window.Socialive.Front = {};
}

/**
 * Front for show message "On Air" or "rescue"
 *
 * @type {Front}
 */
window.Socialive.Front = (function (jQuery, Source) {
    "use strict";

    /**
     * @constructor
     */
    var Front = function () {
        this.$templateContainer = jQuery('div.container-template');
        var broadcastSlug = this.$templateContainer.data('broadcast-slug');
        var frontSlug = this.$templateContainer.data('front-slug');
        this.frontType = this.$templateContainer.data('front-type');
        this.source = null;

        if (this.frontType !== 'custom') {
            this.source = new Source(Routing.generate('app_front_push_onair_message', {broadcast: broadcastSlug, front: frontSlug}, true));
        }
    };

    /**
     * Source Event push message On Air
     */
    Front.prototype.pushOnAirMessage = function () {
        var self = this;

        if (this.source === null) {
            return;
        }

        var eventSource = self.source.getEventSource();

        if (typeof (eventSource) === 'undefined') {
            console.error('browser does not support server-sent events');
            return;
        }

        var $containerTemplateMessage = jQuery('.message', self.$templateContainer);

        eventSource.onmessage = function (event) {
            var message = JSON.parse(event.data);
            if (message !== null && typeof message === 'object') {
                if (message.id !== $containerTemplateMessage.data('message-id')) {
                    jQuery('body').removeClass().addClass(message.network + ' ' + self.frontType);

                    $containerTemplateMessage.html(message.html);
                    $containerTemplateMessage.data('message-id', message.id);
                }
            } else {
                $containerTemplateMessage.empty();
                $containerTemplateMessage.data('message-id', null);
            }
        };
    };

    return Front;
})(jQuery, window.Socialive.Source);

/**
 * Load front
 */
jQuery(document).ready(function () {
    new window.Socialive.Front().pushOnAirMessage();
});
