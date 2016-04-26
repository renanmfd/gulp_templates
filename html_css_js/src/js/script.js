/*jslint browser: true, devel: true, node: true, rhino: false, nomen: true,
         regexp: true, unparam: true, indent: 4, maxlen: 80*/

(function () {
    'use strict';

    var a = 12.32;

    function doSomething(number) {
        return number + Math.PI;
    }

    doSomething(a);
    //console.log('Script.js is runinng fine...', doSomething(a));
}());
