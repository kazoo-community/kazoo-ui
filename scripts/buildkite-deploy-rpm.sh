#!/bin/bash

set -euo pipefail

buildkite-agent artifact download "*.rpm" .
mv *.rpm /repo/development/CentOS_7/noarch/RPMS
createrepo --update /repo/development/CentOS_7/noarch/
