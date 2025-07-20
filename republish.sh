#!/bin/bash

PROJ=${PWD##*/}
DEST=~/github/annolangen.github.io/$PROJ

rm -rf dist .parcel-cache $DEST/*
npm run build
cp dist/* $DEST
cd $DEST/..
git add .
git commit -m "Republish $PROJ"
git push
