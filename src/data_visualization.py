import dash
from dash import dcc, html
from dash.dependencies import Input, Output
import plotly.graph_objs as go
import random

app = dash.Dash(__name__)

app.layout = html.Div([
    dcc.Graph(id='live-graph', animate=True),
    dcc.Interval(
        id='graph-update',
        interval=300,  # 1000ms = 1초마다 업데이트
        n_intervals=0
    )
])

@app.callback(Output('live-graph', 'figure'),
              [Input('graph-update', 'n_intervals')])
def update_graph_scatter(n):
    x = list(range(n))
    y = [random.uniform(0, 10) for _ in range(n)]
    data = go.Scatter(
        x=x,
        y=y,
        mode='lines+markers'
    )
    return {'data': [data],
            'layout': go.Layout(xaxis=dict(range=[max(0, n-100), n]),
                                yaxis=dict(range=[0, 10]),
                                title="실시간 데이터 시각화")}

if __name__ == '__main__':
    app.run_server(debug=True)
