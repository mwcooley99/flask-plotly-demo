from flask import Flask, render_template, url_for, jsonify
from flask_sqlalchemy import SQLAlchemy

from sqlalchemy import MetaData
from sqlalchemy.ext.automap import automap_base
import os
import pandas as pd

curr_dir = os.path.abspath(os.path.dirname(__file__))

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(curr_dir,
                                                                    'db/bellybutton.sqlite')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

metadata = MetaData(bind=db.engine)
metadata.reflect(db.engine)
Base = automap_base(metadata=metadata)

Base.prepare()

Samples = Base.classes.samples
Metadata = Base.classes.sample_metadata


# print(Samples.columns)

@app.route('/')
def index():
    return render_template('index.html')


@app.route('/samples/<sample>')
def get_sample(sample):
    statement = db.session.query(Samples).statement
    df = pd.read_sql_query(statement, db.session.bind)

    sample_data = df.loc[df[sample] > 0].sort_values(sample,
                                                     ascending=False).head(10)

    results = {
        'otu_id': sample_data['otu_id'].values.tolist(),
        'otu_label': sample_data['otu_label'].values.tolist(),
        'values': sample_data[sample].values.tolist()
    }

    return jsonify(results)


if __name__ == '__main__':
    app.run()
