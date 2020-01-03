import numpy as np
import os
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
app = Flask(__name__)
CORS(app)
model = pickle.load(open('knn.pickle','rb'))

df = pd.read_csv('data.csv')

@app.route('/', methods=['GET', 'POST'])
def hello_world():
    if request.method == 'GET':
         data = [[50, 2, 0.1, 1.0,3.0, 0.0, 0.2, 0.0, 1.0, 50.0, 1.5]]
    else:
         content = request.get_json()
         data = [content.get('nutrition')]
         print(content)
         print(data)
         #data =

    prediction = model.kneighbors(np.asarray(data))
    vals = prediction[1][0][:20]

    res = df.iloc[vals].to_json(orient='records')
    return res

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
    #app.run()
