/*
 * Let you smoothly surf on many websites blocking non-mainland visitors.
 * Copyright (C) 2012 Bo Zhu http://zhuzhu.org
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */


var unblock_youku = unblock_youku || {};  // namespace


unblock_youku.default_server = 'yo.uku.im/proxy.php';  // default backend server for redirect mode


unblock_youku.normal_url_list = unblock_youku.url_list.concat([
    //'http://shop.xunlei.com/*',
    'http://live.video.sina.com.cn/room/*',
    'http://music.baidu.com/data/music/songlink*',
    'http://music.baidu.com/data/music/songinfo*',
    'http://music.baidu.com/song/*/download*',
    'http://www.songtaste.com/*',
    'http://songtaste.com/*',
    'http://*.gougou.com/*',
    'http://www.yyets.com/*',
    'http://pay.youku.com/buy/redirect.html*'
]);
unblock_youku.redirect_url_list = unblock_youku.url_list;


unblock_youku.header_extra_url_list = [
    'http://*.xiami.com/*',  // xiami is blocked in HK and TW
    'http://*.ku6.com/*'
];


// ip & id settings
unblock_youku.ip_addr = new_random_ip();
console.log('ip addr: ' + unblock_youku.ip_addr);
unblock_youku.sogou_auth = new_sogou_auth_str();
console.log('sogou_auth: ' + unblock_youku.sogou_auth);


// mode setting functions
function get_current_mode() {
    if (!localStorage.unblock_youku_mode || (
            localStorage.unblock_youku_mode !== 'lite'    &&
            localStorage.unblock_youku_mode !== 'normal'  &&
            localStorage.unblock_youku_mode !== 'redirect'))
        localStorage.unblock_youku_mode = 'normal';

    return localStorage.unblock_youku_mode;
}


function set_current_mode(mode_name) {
    if (mode_name === 'lite' || mode_name === 'redirect')
        localStorage.unblock_youku_mode = mode_name;
    else
        localStorage.unblock_youku_mode = 'normal';
}


function init_current_mode() {
    switch (get_current_mode()) {
    case 'lite':
        setup_header();
        break;
    case 'redirect':
        setup_redirect();
        break;
    case 'normal':
        setup_header();
        setup_proxy();
        break;
    default:
        console.log('should never come here');
        break;
    }
    console.log('initialized the settings for the mode: ' + get_current_mode());
}


function change_mode(new_mode) {
    var old_mode = get_current_mode();
    if (new_mode === old_mode)
        return;

    // clear old settings
    switch (old_mode) {
    case 'lite':
        clear_header();
        console.log('cleared settings for lite');
        break;
    case 'redirect':
        clear_redirect();
        console.log('cleared settings for redirect');
        break;
    case 'normal':
        clear_proxy();
        clear_header();
        console.log('cleared settings for normal');
        break;
    default:
        console.log('should never come here');
        break;
    }

    // set up new settings
    set_current_mode(new_mode);
    init_current_mode();

    // track mode changes
    _gaq.push(['_trackEvent', 'Change Mode', old_mode + ' -> ' + new_mode]);
}


(function () {
    var xhr = new XMLHttpRequest();
    var url = chrome.extension.getURL('manifest.json');
    xhr.open('GET', url, false);  // blocking
    xhr.send();

    var manifest = JSON.parse(xhr.responseText);
    unblock_youku.version = manifest.version;
    console.log('version: ' + unblock_youku.version);
})();


function init_unblock_youku() {
    init_current_mode();

    _gaq.push(['_trackEvent', 'Init Mode', get_current_mode()]);
    _gaq.push(['_trackEvent', 'Version', unblock_youku.version]);
}


// set up mode settings when chrome starts
document.addEventListener("DOMContentLoaded", init_unblock_youku);

