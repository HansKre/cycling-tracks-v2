# Description

![alt](doc/demo.gif)

## Backend

### API

#### Routes

- <http://localhost:3000/api/cycling/activities>
- <http://localhost:3000/api/cycling/activities/7131682282>
- <http://localhost:3000/api/cycling/activities/polyline/7147476023>
- <http://localhost:3000/api/cycling/activities/download/7147476023>

#### Generic Routs

- </api/cycling/activities>
- </api/cycling/activities/{id}>
- </api/cycling/activities/polyline/{id}>
- </api/cycling/activities/download/{id}>

### Size comparison

Comparing a cycling activity `7147476023` with ca. 37km length.

| Endpoint                                                                                                                                                 | Size  |
| -------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- |
| [garmin/polyline/7147476023](https://connect.garmin.com/modern/proxy/activity-service/activity/polyline/7147476023)                                      | 4kb   |
| [localhost/details/7147476023](http://localhost:3000/api/cycling/activities/7147476023)                                                                  | 30kb  |
| [garmin/details/7147476023](https://connect.garmin.com/modern/proxy/activity-service/activity/7147476023/details?maxChartSize=2000&maxPolylineSize=4000) | 785kb |

## Backlog

### Filters

- Search for places to show nearby routs
- Polyline similarity compare

### Raspberry

- [use pm2 // ADVANCED, PRODUCTION PROCESS MANAGER FOR NODE.JS](https://pm2.keymetrics.io)
- use `scp <folder>` for raspi deployments
- use `git actions` for raspi deployments?

### Overall

- username/password auth -> local storage
- use localstorage
- [watch](https://egghead.io/lessons/react-add-geojson-location-data-to-a-map-using-markers-and-popups-in-react-leaflet)
- lines clickable
- gpx download link
- add choice for running activities
- stylischer
- Refactor API:
  - helper method for fetching which expects url only
  - harmonize usage of fetch-library (tunneled-got vs. node-fetch)
- Error management -> change status code on error

## Good Reading

- [Session Storage and Local Storage in React (using hooks)](https://www.robinwieruch.de/local-storage-react)
