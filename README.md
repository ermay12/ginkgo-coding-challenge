# Ginkgo Coding Challenge

This is my submission for the ginkgo backend programming challenge.

http://ginkgo-app.s3-website.us-east-2.amazonaws.com/

In this repository, there are three directories: ginkgo-frontend, ginkgo-api, and alignment-microservice. Once all the dependencies are installed and setup, all three parts of this project can be run with

`npm start`

## ginkgo-frontend

This contains the code for the react webpage. It can be run with

`yarn install`

`yarn start`

and will run on local port 3000.

## ginkgo-api

This contains the code for restful backend api. There are two lambda functions defined here wired together by api-gateway. One to return the list of all alignments for a user and one to find a new alignment.

Run with

`serverless offline`

## alignment-microservice

This contains the code for a small flask server that runs on ec2. It handles the actual blast logic using ncbi-blast+.

Run with

`python3 app.py`

# Serverless Design

This project uses the aws serverless model.

## load page

Pages are loaded directly from s3 without hitting a server first

## authentication

Authentication is done using aws cognito

## load previous alignments table

An ajax request hits aws API Gateway, which points to an aws Lambda function which loads the data from dynamodb.

## find new alignment

An ajax request loads a user uploaded file to s3, saves the location of this file and then sends it in another ajax request to aws API Gateway, which forwards the request to an aws Lambda function. The function adds the file to the dynamodb table. Then the lambda function invokes the alignment microservice running on ec2 with the location of the query sequence in s3. The microservice computes the alignment, uploads it to s3, and returns the location of the file on s3.

# Problems

I originally made this using websockets and aws's serverless application model (sam), but the support for testing websockets locally with sam and amazon cognito is not entirely complete and required me to install and switch to linux because of lack of support for Windows 10 Home. This ended up being more of a headache than it was worth so I scrapped that code and just switched to not using websockets. I also switched to the `serverless` framework because `sam` seemed to be somewhat of a pain.

Right now local testing is somewhat wonky. `serverless` has problems with aws cognito and I didn't take the time to figure out a work around. Testing this offline will not work with the alignment microservice because of authentication problems.

As for security, in the future, everything would be https and not http and the alignmnent microservice should only be accessible to lamda. I just made it publicly accessible because I'm really crunched for time right now.
