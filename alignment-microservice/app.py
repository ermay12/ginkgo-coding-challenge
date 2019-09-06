from flask import Flask, request
from Bio.Blast.Applications import NcbiblastnCommandline
import boto3
import os
import time
import sys

app = Flask(__name__)

s3Bucket = 'ginkgo-files'


@app.route('/')
def index():
    s3 = boto3.client('s3')
    userId = request.args.get('userId')
    sequenceURI = request.args.get('sequenceURI')
    tempInputFileName = 'temp/'+userId+sequenceURI.split('.')[0]+'.fasta'
    tempOutputFileName = str(int(time.time()))+sequenceURI.split('.')[0]+'.txt'
    tempOutputFilePath = 'temp/'+tempOutputFileName
    with open(tempInputFileName, 'wb') as data:
        s3.download_fileobj(s3Bucket, 'private/' +
                            userId+'/'+sequenceURI, data)
    blastn_cline = NcbiblastnCommandline(
        query=data.name, db="nucleotide_database/nd", outfmt=0, out=tempOutputFilePath)
    blastn_cline()
    os.remove(tempInputFileName)

    s3.upload_file(tempOutputFilePath, s3Bucket, 'private/' +
                   userId+'/' + tempOutputFileName)
    os.remove(tempOutputFilePath)
    return tempOutputFileName


if __name__ == "__main__":
    if(len(sys.argv) == 2 and sys.argv[1] == "test"):
        app.run(host="0.0.0.0", port=5000)
    else:
        app.run(host="0.0.0.0", port=80)
