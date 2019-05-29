from flask import Flask, render_template, url_for
import json

app = Flask(__name__)


@app.route('/')
def hello_world():
    with open('static/data/data.json') as json_file:
        data = json.load(json_file)
        print(data)

    return render_template('index.html')


if __name__ == '__main__':
    app.run()
