# README

1. Always create a new branch to work on, never push to master branch.
2. Try to pickup basic of CircleCI: https://www.youtube.com/watch?v=CB7vnoXI0pE, I strongly suggest that we cultivate devOps culture as early as possible.

Prerequisite:

1. You know Graphql
2. You know Prisma library

What you need to install:

1. Docker
2. Kitematic(optional): Docker GUI
3. TeamSQL(optional): SQL database GUI

With or without Kitematic and TeamSQL, we still able to get the app running, but I strongly recommend them because they are a powerful utility

Here is instruction to get running:

1. in the command line: npm run setup-dev

And BOOM, with just one script, our graphql playground is up and running, waiting for us to explore!

Note: npm run setup is for first time setup only, please explore other scripts to run the command you need.
Note1: if you are facing port is already allocated error, it is most likely you have postgres installed and running with default port, change PSQL_PORT in ./config/dev.env
Note2: to shut down container: npm run docker-down
