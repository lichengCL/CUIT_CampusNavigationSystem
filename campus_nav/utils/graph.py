import requests
import config

AMAP_BASE = 'https://restapi.amap.com/v3'


def walking_route(orig_lng, orig_lat, dest_lng, dest_lat):
    """步行路径规划，返回路线坐标和距离"""
    url = f'{AMAP_BASE}/direction/walking'
    params = {
        'key': config.AMAP_WEB_KEY,
        'origin': f'{orig_lng},{orig_lat}',
        'destination': f'{dest_lng},{dest_lat}',
    }
    resp = requests.get(url, params=params).json()
    if resp.get('status') != '1':
        raise Exception(resp.get('info', '路径规划失败'))

    path = resp['route']['paths'][0]
    distance = int(path['distance'])  # 米
    duration = int(path['duration'])  # 秒

    # 提取路线坐标
    coords = []
    for step in path['steps']:
        polyline = step['polyline']
        for point in polyline.split(';'):
            lng, lat = point.split(',')
            coords.append([float(lng), float(lat)])

    return {
        'coords': coords,
        'distance': distance,
        'duration': round(duration / 60, 1)  # 转为分钟
    }


def multi_stop_route(stops):
    """多点步行路径规划，stops 为 [{lng, lat}, ...] 列表"""
    all_coords = []
    total_distance = 0
    total_duration = 0

    for i in range(len(stops) - 1):
        result = walking_route(
            stops[i]['lng'], stops[i]['lat'],
            stops[i + 1]['lng'], stops[i + 1]['lat']
        )
        if i > 0 and all_coords:
            result['coords'] = result['coords'][1:]
        all_coords.extend(result['coords'])
        total_distance += result['distance']
        total_duration += result['duration']

    return {
        'coords': all_coords,
        'distance': total_distance,
        'duration': round(total_duration, 1)
    }
