var fs         = require('fs'),
    join       = require('path').join,
    resolve    = require('path').resolve,
    uid_number = require('uid-number');

require('graceful-fs');

var uids = {},
    gids = {};

var debug = process.env.DEBUG ? console.log : function() { /* nope */ }

//////////////////////////////////////////////////////
// helpers

function get_ids(user, group, cb) {

  // if group is null, defaut to user name
  var group = group || (process.platform == 'darwin' ? 'wheel' : user);

  if (uids[user] && gids[group])
    return cb(null, uids[user], gids[group]);

  debug('Getting IDs for user ' + user + ' and group ' + group);
  uid_number(user, group, function(err, uid, gid) {
    if (err) return cb(err);

    uids[user]  = uid;
    gids[group] = gid;

    cb(null, uid, gid);
  })
}

//////////////////////////////////////////////////////
// luke filewalker

function walk(dir, fn, cb) {
  debug('Walking directory: ' + dir);

  var count,
      last_err,
      files_modified = [];

  var done = function(err, modified) {
    if (err) last_err = err;

    if (modified) {
      files_modified = files_modified.concat(modified);
    }

    --count || finished();
  }

  var finished = function() {
    fn(dir, function(err) {
      if (!err)
        files_modified.push(dir);

      cb(err || last_err, files_modified);
    })
  }

  fs.readdir(dir, function(err, files) {
    if (err) { // or stopped
      if (err.code == 'ENOTDIR')
        return finished();
      else
        return done(err);
    }
    else if (files.length == 0)
      return finished();

    count = files.length;

    files.forEach(function(file, index) {
      var path = join(dir, file);

      fs.lstat(path, function(err, stat) {
        if (err) // or stopped
          return done(err);

        if (stat.isDirectory()) { // recurse
          walk(path, fn, done);
        } else {
          fn(path, function(err) {
            if (!err) files_modified.push(path);

            // handle unexisting symlinks
            // var e = err && err.code != 'ENOENT' ? err : null;
            done(err);
          });
        }
      })
    })
  })

}

function chmod(method) {

  return function mod(path, mode, cb) {
    if (!fs[method])
      return cb(new Error(method + ' not supported.'));

    var fn = function(file, cb) {
      debug(method + 'ing ' + file + ' to ' + mode);
      fs[method](file, mode, cb);
    }

    walk(resolve(path), fn, cb);
  }

}

function chown(method) {

  return function own(path, user, group, cb) {
    if (!fs[method])
      return cb(new Error(method + ' not supported.'));

    if (typeof group == 'function') {
      var cb = group;
      group = null;
    }

    get_ids(user, group, function(err, uid, gid) {
      if (err) return cb(err);

      var fn = function(file, cb) {
        console.log(method + 'ing ' + file + ' to uid ' + uid + ' and gid ' + gid);
        fs[method](file, uid, gid, cb);
      }

      walk(resolve(path), fn, cb);
    })

  }
}

exports.mod  = chmod('chmod');
exports.own  = chown('chown');

exports.lmod = chmod('lchmod');
exports.lown = chown('lchown');
