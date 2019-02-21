#!/bin/bash

set -xeuo pipefail

echo "--- Installing Node Modules"
npm install

echo "--- Run Full Test Suite"
npm run test

