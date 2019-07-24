#!/bin/bash

# stops logging pushd/popd directories
silentpushd () {
  command pushd "$@" > /dev/null
}

silentpopd () {
  command popd "$@" > /dev/null
}

SOURCE="${BASH_SOURCE[0]}"
while [ -h "$SOURCE" ]; do # resolve $SOURCE until the file is no longer a symlink
  DIR="$( cd -P "$( dirname "$SOURCE" )" >/dev/null 2>&1 && pwd )"
  SOURCE="$(readlink "$SOURCE")"
  [[ $SOURCE != /* ]] && SOURCE="$DIR/$SOURCE" # if $SOURCE was a relative symlink, we need to resolve it relative to the path where the symlink file was located
done
DIR="$( cd -P "$( dirname "$SOURCE" )" >/dev/null 2>&1 && pwd )"

silentpushd $DIR
echo "Running Yarn"
silentpushd graphql
yarn
silentpopd

silentpushd ux
yarn
silentpopd

echo "Running Builds"
silentpushd graphql
yarn build
silentpopd

silentpushd ux
yarn build
silentpopd
silentpopd

