/*!
 * This file is part of the Social Live project.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @author Michael COULLERET <michael.coulleret@francetv.fr>
 * @author Amine FATTOUCH <amine.fattouch@francetv.fr>
 */
var eventSourceClient;

// declare namespace of moderation globally.
if (typeof (window.Socialive.Moderation) === 'undefined') {
    window.Socialive.Moderation = {};
}

/**
 * Moderation client
 *  - Event source
 *  - Push message
 *
 * @type {Moderation.Client}
 */
window.Socialive.Moderation.Client = (function (jQuery, Source, ModerationMessage) {
    'use strict';

    /**
     * Moderation column
     *
     * @constructor
     */
    var ModerationClient = function (url, columnId) {
        this.source = new Source(url);
        this.columnId = columnId;
    };

    /**
     * Source event on pushing message
     */
    ModerationClient.prototype.push = function () {
        var self = this;

        eventSourceClient = self.source.getEventSource();

        if (typeof (eventSourceClient) === 'undefined') {
            console.error('browser does not support server-sent events');
            return;
        }

        eventSourceClient.onmessage = function (event) {
            var data = JSON.parse(event.data);
            if (data !== null) {
                (new ModerationMessage()).pushMessage(data, self.columnId);
            }
        };
    };

    /**
     * Close EventSource
     */
    ModerationClient.prototype.close = function () {
        this.source.close();
    };

    return ModerationClient;
})(jQuery, window.Socialive.Source, window.Socialive.Moderation.Message);
