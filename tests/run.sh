#!/usr/bin/env bash

# fail if any commands fails
set -e

# bring helper functions into scope
. ./helpers.sh

# Pre-processing check
for file in ./e2e/*; do
    if [ -f "$file" ]; then
        echo "[e2e] Running file $(basename "$file")"
        chmod +x "$file"
        "$file"
    fi
done