var uid_number = require('uid-number');

var uids = {},
    gids = {};

exports.get_ids = function(user, group, cb) {

  // if group is null, defaut to user name
  var group = group || (process.platform == 'darwin' ? 'wheel' : user);

  if (uids[user] && gids[group])
    return cb(null, uids[user], gids[group]);

  // debug('Getting IDs for user ' + user + ' and group ' + group);
  uid_number(user, group, function(err, uid, gid) {
    if (err) return cb(err);

    uids[user]  = uid;
    gids[group] = gid;

    cb(null, uid, gid);
  })
}
