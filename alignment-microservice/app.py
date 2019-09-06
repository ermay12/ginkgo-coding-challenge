from flask import Flask, request
from Bio.Blast.Applications import NcbiblastnCommandline
import boto3
import os
import time

app = Flask(__name__)

s3Bucket = 'ginkgo-files'


@app.route('/')
def index():
    s3 = boto3.client('s3')

    userId = request.args.get('userId')
    sequenceURI = request.args.get('sequenceURI')
    tempInputFileName = 'temp/'+userId+sequenceURI+'.fasta'
    tempOutputFileName = 'temp/'+userId+sequenceURI+'.xml'
    with open(tempFileName, 'wb') as data:
        s3.download_fileobj(s3Bucket, 'private/' +
                            userId+'/'+sequenceURI, data)
        blastn_cline = NcbiblastnCommandline(
            query="temp/"+data.name, db="nucleotide_database/nd", evalue=1e-30, outfmt=0, out=tempOutputFileName)
        stdout, stderr = blastn_cline()
    with open(tempOutputFileName, 'wb') as f:
        s3.upload_fileobj(f, s3Bucket, 'private/'+userId+'/' +
                          int(time.time())+sequenceURI.split('.')[0]+'.xml')
    os.remove(tempInputFileName)
    os.remove(tempOutputFileName)
    return userId+sequenceURI
