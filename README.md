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

- activities/1654609164
- activities/3868142407
- lines clickable
- gpx download link
- running activities
- stylischer
- Refactor API:
  - helper method for fetching which expects url only
  - harmonize usage of fetch-library (tunneled-got vs. node-fetch)
- Error management -> change status code on error
