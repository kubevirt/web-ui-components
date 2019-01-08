# Travis CI

This project hooks into the [Travis job lifecycle](https://docs.travis-ci.com/user/job-lifecycle)
through following scripts:

- `before_script`: runs `tools/travis/beforeScript.js`
- `after_success`: runs `tools/travis/afterSuccess.js`

Refer to [Travis configuration](../.travis.yml) for details.
