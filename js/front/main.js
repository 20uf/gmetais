/*!
 * This file is part of the Social Live project.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @author Michael COULLERET <michael.coulleret@francetv.fr>
 * @author Amine FATTOUCH <amine.fattouch@francetv.fr>
 */

/**
 * Render app
 */

var element = document.getElementById("app_front_editor");

ReactDOM.render(
    <FrontForm useManifest={ element.dataset.environment == 'dev' } />,
    element
);
