# Description

Login Lambda for cycling-tracks-v2 application.

## Deploy

```bash
zip -r cycling-tracks-login.zip .
aws lambda update-function-code --function-name cycling-tracks-login --zip-file fileb://cycling-tracks-login.zip
```
