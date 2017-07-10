'use strict';

/*
 * This file is part of the Social Live project.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @author Amine Fattouch <amine.fattouch@francetv.fr>
 * @author Michael COULLERET <michael.coulleret@francetv.fr>
 */

if (typeof (window.Socialive) === 'undefined') {
    window.Socialive = {};
}

jQuery(document).ready(function () {
    jQuery('.flash-modal').modal({
        'backdrop': 'static',
        'keyboard': false
    });

    jQuery('[data-toggle="tooltip"]').tooltip();

    jQuery('[data-modal="xhr"]').click(function (e) {
        e.preventDefault();
        var url = jQuery(this).attr('href');

        if (url.indexOf('#') == 0) {
            jQuery(url).modal('open');
        } else {
            $.get(url, function (data) {
                jQuery(data).modal();
            });
        }
    });

    setTimeout(function () {
        jQuery('.flash-modal').modal('hide');
    }, 5000);
});

var _paq = _paq || [];
_paq.push(['trackPageView']);
_paq.push(['enableLinkTracking']);
(function() {
    var u='//analytics.socialtv.ftven.net/';
    _paq.push(['setTrackerUrl', u+'piwik.php']);
    _paq.push(['setSiteId', '2']);
    var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
    g.type='text/javascript'; g.async=true; g.defer=true; g.src=u+'piwik.js'; s.parentNode.insertBefore(g,s);
})();