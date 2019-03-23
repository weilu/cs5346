## Download & unzip data
# wget https://s3-us-west-2.amazonaws.com/ai2-s2-research-public/open-corpus/corpus-2019-01-31/s2-corpus-00.gz
# gzip -d s2-corpus-*.gz

## Extract venue arXiv and venue ICSE into their own json files
VENUES="ArXiv ICSE"
for VENUE in $VENUES;
do
  grep -r --exclude="*.gz" '"venue":"'$VENUE'"' s2-corpus-00 > "$VENUE.txt"
  echo '[' > "$VENUE.json"
  sed -e 's/s2-corpus-00:/,/' "$VENUE.txt" | tail -c +2 >> "$VENUE.json"
  echo ']' >> "$VENUE.json"
done
