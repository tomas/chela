var fs      = require('fs'),
    join    = require('path').join,
    should  = require('should'),
    sinon   = require('sinon'),
    rmdir   = require('rimraf'),
    chela   = require('..'),
    helpers = require('./helpers');

function abort(str) {
  console.log(str) || process.exit(1);
}

if (process.platform == 'win32')
  return abort('Not supported');
else if (process.getuid && process.getuid() != 0)
  return abort('Must run as root.')

describe('chown', function() {

  var path,
      user,
      users_dir = process.platform == 'darwin' ? '/Users' : '/home',
      temp_path = '/tmp/chela';

  before(function(done) {
    fs.readdir(users_dir, function(err, list) {
      // return the first path without dots or plus signs (lost+found)
      user = list.filter(function(dir) { return !dir.match(/\.|\+/) })[0];
      // console.log('User is ' + user);
      fs.mkdir(temp_path, done);
    })
  })

  after(function(done) {
    rmdir(temp_path, done);
  })

  function run(user, group, cb) {
    chela.own(path, user, group, cb);
  }

  function test(entry, user, group, success, cb) {
    helpers.get_ids(user, group, function(err, uid, gid) {
      if (err) return cb(err);

      fs.lstat(entry, function(err, stat) {
        if (err) return cb(err);

        if (success) {
          stat.uid.should.eql(uid);
          stat.gid.should.eql(gid);
        } else {
          stat.uid.should.not.eql(uid);
          stat.gid.should.not.eql(gid);
        }
        cb();
      })
    })
  }

  describe('when pointing to a file', function() {

    beforeEach(function(done) {
      path = join(temp_path, 'file.txt');
      fs.writeFile(path, '', done);
    })

    afterEach(function(done) {
      fs.unlink(path, done);
    })

    describe('with permissions', function() {

      it('does not return error', function(done) {
        run(user, null, function(err, modified) {
          should.not.exist(err);
          done();
        })
      })

      it('chowns the file', function(done) {
        run(user, null, function(err, modified) {
          test(path, user, null, true, done);
        })
      })

      it('returns file as callbacks second argument', function(done) {
        run(user, null, function(err, modified) {
          modified.should.eql([path]);
          done();
        })
      })

    })

/*
    describe('without permissions', function() {

      beforeEach(function(done) {
        fs.chmod(path, 000, done);
      })

      afterEach(function(done) {
        fs.chmod(path, 700, done);
      })

      it('returns error', function(done) {
        run(user, null, function(err, modified) {
          err.should.be.a.Error;
          done();
        })
      })

      it('does not chown file', function(done) {
        run(user, null, function(err, modified) {
          test(path, user, null, false, done);
        })
      })

      it('returns empty array as callbacks second argument', function(done) {
        run(user, null, function(err, modified) {
          modified.should.eql([]);
          done();
        })
      })

    })
*/

  })

  describe('when pointing to a dir', function() {

    beforeEach(function(done) {
      path = join(temp_path, 'dir');
      fs.mkdir(path, done);
    })

    afterEach(function(done) {
      rmdir(path, done);
    })

    describe('and dir is empty', function() {

      beforeEach(function(done) {
        fs.readdir(path, function(err, files) {
          files.length.should.eql(0);
          done();
        })
      })

      describe('with permissions', function() {

        it('does not return error', function(done) {
          run(user, null, function(err, modified) {
            should.not.exist(err);
            done();
          })
        })

        it('chowns the dir', function(done) {
          run(user, null, function(err, modified) {
            test(path, user, null, true, done);
          })
        })

        it('returns dir as callbacks second argument', function(done) {
          run(user, null, function(err, modified) {
            modified.should.eql([path]);
            done();
          })
        })

      })

    })

    describe('and dir contains one file', function() {

      var file;

      beforeEach(function(done) {
        file = join(path, 'foo.txt');
        fs.writeFile(file, 'hola', done);
      })

      describe('with permissions', function() {

        it('does not return error', function(done) {
          run(user, null, function(err, modified) {
            should.not.exist(err);
            done();
          })
        })

        it('chowns the dir and the file', function(done) {
          run(user, null, function(err, modified) {
            test(path, user, null, true, function() {
              test(file, user, null, true, done);
            });
          })
        })

        it('returns dir as callbacks second argument', function(done) {
          run(user, null, function(err, modified) {
            modified.should.eql([file, path]);
            done();
          })
        })

      });

    })

    describe('and dir contains another dir', function() {

      var nested;

      beforeEach(function(done) {
        nested = join(path, 'another dir');
        fs.mkdir(nested, done);
      })

      describe('with permissions', function() {

        it('does not return error', function(done) {
          run(user, null, function(err, modified) {
            should.not.exist(err);
            done();
          })
        })

        it('chowns the nested dir', function(done) {
          run(user, null, function(err, modified) {
            test(path, user, null, true, function() {
              test(nested, user, null, true, done);
            });
          })
        })

        it('returns dir as callbacks second argument', function(done) {
          run(user, null, function(err, modified) {
            modified.should.eql([nested, path]);
            done();
          })
        })

      })

    })

  })

})
