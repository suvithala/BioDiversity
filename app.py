import datetime as dt
import numpy as np
import pandas as pd

import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, func
from sqlalchemy import inspect
from flask import (
    Flask,
    render_template,
    jsonify,
    request,
    redirect)

#################################################
# Database Setup
#################################################
engine = create_engine("sqlite:///DataSets/belly_button_biodiversity.sqlite")
# reflect an existing database into a new model
Base = automap_base()
# reflect the tables
Base.prepare(engine, reflect=True)

# Save references to the invoices and invoice_items tables
biometadata = Base.classes.samples_metadata
biosamples = Base.classes.samples
biootu = Base.classes.otu

# Create our session (link) from Python to the DB
session = Session(engine)


#################################################
# Flask Setup
#################################################
app = Flask(__name__)

#################################################
# Routes
#################################################

@app.route("/")
def index():
    return render_template('index.html')

@app.route("/names")
def names():
    query_obj = session.query(biosamples)
    samplenames = pd.read_sql(query_obj.statement, query_obj.session.bind)
    samplenames.set_index('otu_id', inplace = True)
    return jsonify(list(samplenames.columns))

@app.route("/otu")
def otu():
	query_obj = session.query(biootu)
	otu_description = pd.read_sql(query_obj.statement, query_obj.session.bind)
	otu_description.set_index('otu_id', inplace = True)
	return jsonify(list(otu_description['lowest_taxonomic_unit_found']))

@app.route("/metadata/<sample>")
def sample(sample):
    metadata_sample = session.query(biometadata.AGE, biometadata.BBTYPE, biometadata.ETHNICITY, biometadata.GENDER, biometadata.LOCATION, biometadata.SAMPLEID).filter(biometadata.SAMPLEID == sample).all()
    metadata_sample_dict = {}
    for row in metadata_sample: 
        metadata_sample_dict["AGE"] = row[0]
        metadata_sample_dict["BBTYPE"] = row[1]
        metadata_sample_dict["ETHNICITY"] = row[2]
        metadata_sample_dict["GENDER"] = row[3]
        metadata_sample_dict["LOCATION"] = row[4]
        metadata_sample_dict["SAMPLEID"] = row[5]
    return jsonify(metadata_sample_dict)

@app.route("/wfreq/<sample>")
def wfreq(sample):
    wash_freq = session.query(biometadata.WFREQ).filter(biometadata.SAMPLEID == sample).all()
    return(jsonify(wash_freq[0]))

@app.route("/samples/<sample>")
def sample_otu(sample):
    query = session.query(biosamples).statement
    df = pd.read_sql_query(query,session.bind)
    df = df.sort_values(by=sample,ascending=False)
    samplist=[{'otu_ids': df.loc[:,'otu_id'].tolist(),
             'sample_values': df.loc[:,sample].tolist()
             }]
    return jsonify(samplist)


if __name__ == "__main__":
    app.run(debug=True)




