import codecs
import csv
import sys
from math import cos, asin, sqrt


# taken from https://stackoverflow.com/a/21623206/429288
# returns distance in meter
def distance(lat1, lon1, lat2, lon2):
    p = 0.017453292519943295     #Pi/180
    a = 0.5 - cos((lat2 - lat1) * p)/2 + cos(lat1 * p) * cos(lat2 * p) * (1 - cos((lon2 - lon1) * p)) / 2
    return 12742 * asin(sqrt(a)) * 1000 #2*R*asin... R = 6371 km


if __name__ == "__main__":
    stations = []
    eateries = []

    with codecs.open('mrt_lat_long.csv', 'rU', 'utf-16') as rf:
        csv_reader = csv.DictReader(rf, delimiter='\t')
        stations = [row for row in csv_reader]

    with codecs.open('eating_establishment_lat_long.csv', 'rU', 'utf-16') as rf:
        csv_reader = csv.DictReader(rf, delimiter='\t')
        eateries = [row for row in csv_reader]

    postal_min_dist_map = {}
    for eatery in eateries:
        min_dist = sys.maxsize
        for station in stations:
            dist = distance(float(eatery['Latitude (generated)']),
                            float(eatery['Longitude (generated)']),
                            float(station['Latitude (generated)']),
                            float(station['Longitude (generated)']))
            if dist < min_dist:
                min_dist = dist
        postal_min_dist_map[eatery['Postal Code']] = min_dist

    with open('postal_dist_to_mrt.csv', 'w') as outfile:
        writer = csv.writer(outfile)
        writer.writerow(['Postal Code', 'Distance to MRT'])
        for key, value in postal_min_dist_map.items():
            writer.writerow([key, value])
