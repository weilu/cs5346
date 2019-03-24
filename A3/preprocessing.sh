#!/usr/bin/env bash

## Download & unzip data
# wget https://s3-us-west-2.amazonaws.com/ai2-s2-research-public/open-corpus/manifest.txt
# wget -B https://s3-us-west-2.amazonaws.com/ai2-s2-research-public/open-corpus/ -i manifest.txt
# gzip -d s2-corpus-*.gz

## Extract venue arXiv and venue ICSE into their own json files
VENUES="ArXiv ICSE"
for VENUE in $VENUES;
do
  grep -r --exclude="*.gz" '"venue":"'$VENUE'"' s2-corpus-* > "$VENUE.txt"
  echo '[' > "$VENUE.json"
  sed -E 's/s2-corpus-[[:digit:]]{2}:/,/g' "$VENUE.txt" | tail -c +2 >> "$VENUE.json"
  echo ']' >> "$VENUE.json"
done
