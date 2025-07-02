#!/bin/bash
set -e

echo "Installing Foundry..."

curl -L https://foundry.paradigm.xyz | bash

export PATH="$HOME/.foundry/bin:$PATH"

foundryup

echo "Foundry installed successfully:"
forge --version
cast --version

echo "Installing OpenZeppelin contracts..."
cd ../contracts

forge install OpenZeppelin/openzeppelin-contracts-upgradeable --no-git
forge install OpenZeppelin/openzeppelin-foundry-upgrades --no-git
cd ../web

echo "Generating Prisma client..."
prisma generate

echo "Generating wagmi contracts..."
wagmi generate

echo "Postinstallation complete!"