Chela
======

Recursive, asynchronous chmod and chown on Node.js.

Install
-------

    npm install clela

Example
-----

``` js
var chmod = require('chela').mod;

chmod('/home/tomas/.ssh', '0700', function(err, modified) {
  if (!err) 
    console.log(modified.length); // prints number of files that were modified
})

var chown = require('chela').own;

chmod('/tmp/foobar.txt', 'tomas', 'users', function(err) {
  if (err)
    console.log('Successfully chowned to tomas:users');
})
```

You can also omit the group (third) param, in which case chela will default to 
either the wheel group (on OSX) or a group matching the username.

Credits
-------
Written by Tomás Pollak.

Copyright
---------
(c) 2014 Fork Ltd. MIT license.

