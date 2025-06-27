#!/bin/bash
set -e

echo "Installing Foundry..."

curl -L https://foundry.paradigm.xyz | bash

export PATH="$HOME/.foundry/bin:$PATH"

foundryup

echo "Foundry installed successfully:"
forge --version
cast --version
