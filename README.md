Database monitoring

## To Run Locally

````
git clone https://Goye-says@bitbucket.org/miaguila/db-monitoring.git
npm install
bower install
````

It's necessary have some node version in your computer

## Included Awesomeness

It’s necessary export the database variable using:

`export DATABASE_URL=postgres://user_name:pass@url/db_name`

If you need to use a ssl connection you can pass a param as:

`export DATABASE_URL=postgres://user_name:pass@url/db_name?ssl=true`

If you want to use a specific Sqlite file:

`export SQLITE_FILE=file_name`

You can use the following command `nodemon` to run the app (We are using Express 4)

Questions, Concerns, Ideas or Anomalies, please direct to [@Goye-says](karlos.goye@gmail.com or karlos.goye92@hotmail.com)