#!/usr/bin/env sh

set -e # Fail if any command fails
SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" &>/dev/null && pwd)
source "$SCRIPT_DIR/../helpers.sh"

# Given
cd ../examples/basic

# When
echo "Solidity compiles successfully in examples/basic" \
    "creating the appropriate artifacts"
run_test_and_handle_failure "yarn compile" 0

# THen
assert_directory_exists "artifacts-pvm"
assert_directory_exists "cache-pvm"
assert_directory_not_empty "artifacts-pvm"
assert_directory_not_empty "cache-pvm"