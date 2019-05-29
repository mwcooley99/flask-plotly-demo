from flask import Flask, render_template, url_for, jsonify
from flask_sqlalchemy import SQLAlchemy

from sqlalchemy import MetaData, inspect
from sqlalchemy.ext.automap import automap_base
import os
import pandas as pd

curr_dir = os.path.abspath(os.path.dirname(__file__))

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(curr_dir,
                                                                    'db/bellybutton.sqlite')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

Base = automap_base()

Base.prepare(db.engine, reflect=True)

Samples = Base.classes.samples
Metadata = Base.classes.sample_metadata

inst = inspect(Samples)
attr_names = [c_attr.key for c_attr in inst.mapper.column_attrs]
print(Samples.__table__.c['940'])


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/samples/<sample>')
def get_sample(sample):
    sample_col = Samples.__table__.c[sample]
    results = db.session.query(Samples.otu_id, Samples.otu_label,
                               sample_col).filter(
        sample_col > 1).order_by(
        sample_col.desc()).limit(10).all()


    print(results)
    return jsonify(results)


if __name__ == '__main__':
    app.run()
