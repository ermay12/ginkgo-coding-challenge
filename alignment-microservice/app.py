from flask import Flask, request, jsonify
from Bio.Blast.Applications import NcbiblastnCommandline
from Bio.Blast import NCBIXML
from Bio import SeqIO
import boto3
import os
import time
import sys

app = Flask(__name__)

s3Bucket = 'ginkgo-files'


def blast(inputFilePath, outputFileName, eValue):
    txtOutputPath = "temp/"+outputFileName+".txt"
    xmlOutputPath = "temp/"+outputFileName+".xml"
    blastn_cline = NcbiblastnCommandline(
        query=inputFilePath,
        db="nucleotide_database/nd",
        outfmt=5,
        out=xmlOutputPath,
        evalue=eValue)
    blastn_cline()
    blastn_cline = NcbiblastnCommandline(
        query=inputFilePath,
        db="nucleotide_database/nd",
        outfmt=0,
        out=txtOutputPath,
        evalue=eValue)
    blastn_cline()
    return txtOutputPath, xmlOutputPath


@app.route('/')
def index():
    s3 = boto3.client('s3')
    userId = request.args.get('userId')
    sequenceURI = request.args.get('sequenceURI')
    eValue = request.args.get('eValue')
    tempInputFilePath = 'temp/'+userId+sequenceURI.split('.')[0]+'.fasta'
    outputFileName = str(int(time.time()))+sequenceURI.split('.')[0]
    with open(tempInputFilePath, 'wb') as data:
        s3.download_fileobj(s3Bucket, 'private/' +
                            userId+'/'+sequenceURI, data)

    txtOutputPath, xmlOutputPath = blast(
        tempInputFilePath, outputFileName, eValue)

    extraArgs = {'ContentType': 'text/plain'}
    s3.upload_file(txtOutputPath, s3Bucket, 'private/' +
                   userId+'/' + outputFileName + ".txt", ExtraArgs=extraArgs)
    s3.upload_file(xmlOutputPath, s3Bucket, 'private/' +
                   userId+'/' + outputFileName + ".xml", ExtraArgs=extraArgs)
    resp = {"outputURI": outputFileName + ".txt",
            "inputSequences": [{
                "id": seq_record.id,
                "name": seq_record.name,
                "description": seq_record.description,
                "length": len(seq_record)}
                for seq_record in SeqIO.parse(tempInputFilePath, "fasta")],
            "outputAlignments": []}
    with open(xmlOutputPath) as result:
        for blast_record in NCBIXML.parse(result):
            if not blast_record.alignments:
                resp["outputAlignments"].append({})
                continue
            alignment = blast_record.alignments[0]
            hsp = alignment.hsps[0]
            resp["outputAlignments"].append({"hit_id": alignment.hit_id,
                                             "expect": hsp.expect,
                                             "align_length": hsp.align_length,
                                             "query_start": hsp.query_start,
                                             "query_end": hsp.query_end,
                                             "sbjct_start": hsp.sbjct_start,
                                             "sbjct_end": hsp.sbjct_end})
    os.remove(tempInputFilePath)
    os.remove(txtOutputPath)
    os.remove(xmlOutputPath)
    return jsonify(resp)


if __name__ == "__main__":
    if(len(sys.argv) == 2 and sys.argv[1] == "test"):
        app.run(host="0.0.0.0", port=5000)
    else:
        app.run(host="0.0.0.0", port=80)
