#!/bin/bash

set -xeuo pipefail

echo "--- Installing Node Modules"
npm install

echo "--- Run Full Test Suite"
npm run test

echo "--- Linting consul config template"
DIFF_RESULT=$(git diff origin/develop -- config/config.js.tmpl)
if [ "$DIFF_RESULT" != "" ]; then
    node_modules/.bin/eslint config/config.js.tmpl
fi
