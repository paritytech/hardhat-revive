#!/usr/bin/env sh

# Fail if any command fails
set -e

# Bring helper functions into scope
. ./helpers.sh

# Given


# When
echo "Solidity Smart contracts compile successfully in basic example" \
    "creating the appropriate artifacts"
run_test_and_handle_failure "yarn compile" 0

# THen
assert_directory_exists "artifacts-zk"
assert_directory_exists "cache-zk"
assert_directory_not_empty "artifacts-zk"
assert_directory_not_empty "cache-zk"