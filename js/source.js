'use strict';

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
if (typeof (window.Socialive.Source) === 'undefined') {
    window.Socialive.Source = {};
}

/**
 * Event Source
 *
 * @type {Source}
 */
window.Socialive.Source = (function () {
    'use strict';

    /**
     * Constructor
     *
     * @param url
     *
     * @constructor
     */
    var Source = function (url) {
        this.url = url;

        this.initEventSource();
    };

    /**
     * Init event source
     */
    Source.prototype.initEventSource = function () {
        this.eventSource = new EventSource(this.url);

        return this;
    };

    /**
     * Get event source
     *
     * @returns {EventSource}
     */
    Source.prototype.getEventSource = function () {
        return this.eventSource;
    };

    /**
     * Close EventSource
     */
    Source.prototype.close = function () {
        this.eventSource.close();
    };

    return Source;
})();
