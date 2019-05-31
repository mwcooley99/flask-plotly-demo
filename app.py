from flask import Flask, render_template, url_for, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_bootstrap import Bootstrap

from sqlalchemy import inspect
from sqlalchemy.ext.automap import automap_base
import os


curr_dir = os.path.abspath(os.path.dirname(__file__))

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(curr_dir,
                                                                    'db/bellybutton.sqlite')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
bootstrap = Bootstrap(app)

Base = automap_base()

Base.prepare(db.engine, reflect=True)

Samples = Base.classes.samples
Metadata = Base.classes.sample_metadata

inst = inspect(Samples)
attr_names = [c_attr.key for c_attr in inst.mapper.column_attrs]


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/samples/<sample>')
def get_sample(sample):
    sample_col = Samples.__table__.c[sample]
    query = db.session.query(Samples.otu_id, Samples.otu_label,
                             sample_col).filter(
        sample_col > 1).order_by(
        sample_col.desc()).limit(10).all()

    query = [list(i) for i in zip(*query)]

    results = {
        'otu_ids': query[0],
        'otu_labels': query[1],
        'otu_values': query[2]
    }

    return jsonify(results)


@app.route('/names')
def names():
    query = db.session.query(Metadata.sample).order_by(Metadata.sample).all()
    results = [q[0] for q in query]
    return jsonify(results)


@app.route('/metadata/<sample>')
def get_metadata(sample):
    sel = [
        Metadata.sample,
        Metadata.ETHNICITY,
        Metadata.GENDER,
        Metadata.AGE,
        Metadata.WFREQ,
        Metadata.LOCATION,
        Metadata.BBTYPE
    ]
    query = db.session.query(*sel).filter(Metadata.sample == sample)

    # convert to list of dictionaries
    keys = ['sample', 'ethnicity', 'gender', 'age', 'wfreq', 'location',
            'bbtype']
    results = [dict(zip(keys, values)) for values in query]

    return jsonify(results)


if __name__ == '__main__':
    app.run()
