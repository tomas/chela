Chela!
======

Recursive, asynchronous chmod and chown on Node.js, and maybe something else.

Install
-------

    npm install chela

Example
-----

``` js
var chmod = require('chela').mod;

chmod('/home/tomas/.ssh', '0700', function(err, modified) {
  if (!err) 
    console.log(modified); // prints list of files that were modified
})

var chown = require('chela').own;

chown('/tmp/foobar.txt', 'tomas', 'users', function(err) {
  if (!err)
    console.log('Successfully chowned to tomas:users');
})
```

When calling chown(), you can also omit the group (third) param, in which case 
chela will default to either the wheel group (on OS X) or a group matching the 
username (Linux and others). This is because OS X does not create a group for each username. 

Credits
-------
Written by Tomás Pollak.

Copyright
---------
(c) 2014 Fork Ltd. MIT license.

