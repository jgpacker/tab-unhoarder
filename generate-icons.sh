#!/bin/bash
set -u -e -o pipefail

echo -n 128 96 48 16 | xargs -d ' ' -I SIZE inkscape -z -e ./src/icon/SIZE.png -w SIZE -h SIZE ./src/icon/original.svg
echo -n 64 32 16 | xargs -d ' ' -I SIZE inkscape -z -e ./src/popup/icon/SIZE.png -w SIZE -h SIZE ./src/icon/original.svg
