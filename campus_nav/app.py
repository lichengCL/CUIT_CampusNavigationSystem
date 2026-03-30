from flask import Flask, render_template, request, jsonify
import config
from utils.poi import load_pois, get_categories, filter_by_category, search_pois
from utils.graph import walking_route, multi_stop_route

app = Flask(__name__)
app.config.from_object(config)

# 加载 POI 数据
POIS = load_pois()


@app.route('/')
def index():
    categories = get_categories(POIS)
    return render_template('index.html',
                           categories=categories,
                           pois=POIS,
                           amap_js_key=config.AMAP_JS_KEY,
                           map_center=config.MAP_CENTER,
                           map_zoom=config.MAP_ZOOM,
                           campus_boundary=config.CAMPUS_BOUNDARY)


@app.route('/api/search')
def api_search():
    """模糊搜索 POI"""
    keyword = request.args.get('q', '')
    if not keyword:
        return jsonify([])
    results = search_pois(POIS, keyword)
    return jsonify(results)


@app.route('/api/route')
def api_route():
    """计算两点间步行最短路径"""
    try:
        orig_lng = float(request.args.get('orig_lng'))
        orig_lat = float(request.args.get('orig_lat'))
        dest_lng = float(request.args.get('dest_lng'))
        dest_lat = float(request.args.get('dest_lat'))
    except (TypeError, ValueError):
        return jsonify({'error': '参数错误'}), 400

    try:
        result = walking_route(orig_lng, orig_lat, dest_lng, dest_lat)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/multi_route', methods=['POST'])
def api_multi_route():
    """多点路径规划"""
    data = request.get_json()
    stops = data.get('stops', [])
    if len(stops) < 2:
        return jsonify({'error': '至少需要两个途经点'}), 400

    try:
        result = multi_stop_route(stops)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(debug=config.DEBUG, host='0.0.0.0', port=5000)
