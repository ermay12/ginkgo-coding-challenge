# Ginkgo Coding Challenge

This is my submission for the ginkgo backend programming challenge.

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

This project uses the aws serverless model. Below is a sequence diagram explaining the flow of the app.

```
/* load page */
browser -> s3
	    <- [react page]

/* authentication */
browser -> cognito
	    <- [Authentication]

/* refresh table */
browser [refresh] -> api gateway -> lambda -> dynamodb
				                            <- [table data]

/* blast sequence */
browser [input fasta] -> s3
		              <- [input uri]
browser [input uri] -> api gateway ->	lambda	 -> ec2 server -> blast script [output file] -> s3
					     	                     <-             	      				     <- [output uri]
				                        [input, output] -> dynamodb
		            <-		       <-		            <- [success]
	[refresh] -> api gateway -> lambda -> dynamodb
					                    <- [table data]
```

## load page

Pages are loaded directly from s3 without hitting a server first

## authentication

Authentication is done using aws cognito

## load previous alignments table

An ajax request hits aws API Gateway, which points to an aws Lambda function which loads the data from dynamodb.

## find new alignment

An ajax request loads a user uploaded file to s3, saves the location of this file and then sends it to aws API Gateway, which forwards the request to a aws Lambda function. The function adds the file to the dynamodb table. Then the lambda function invokes the alignment microservice running on ec2 with the location of the query sequence in s3. The microservice computes the alignment, uploads it so s3, and returns the location of the file on s3.

# Problems
