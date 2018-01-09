#!/bin/bash

set -euo pipefail

echo "--- :page_facing_up: Writing VERSION"
echo $(git describe --tags) > VERSION

echo "--- :package: Packaging RPM"
./scripts/fpm-build-rpm.sh

echo "--- :wastebasket: Removing VERSION"
rm -f VERSION
