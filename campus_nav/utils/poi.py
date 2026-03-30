import json
from rapidfuzz import fuzz
import config


def load_pois():
    """加载 POI 数据"""
    with open(config.POI_DATA_PATH, 'r', encoding='utf-8') as f:
        return json.load(f)

    
def get_categories(pois):
    """获取所有 POI 分类"""
    return sorted(set(p['category'] for p in pois))


def filter_by_category(pois, category):
    """按分类筛选 POI"""
    return [p for p in pois if p['category'] == category]


def search_pois(pois, keyword, threshold=60):
    """模糊搜索 POI，返回匹配度高于阈值的结果"""
    results = []
    for p in pois:
        score = max(
            fuzz.partial_ratio(keyword, p['name']),
            fuzz.partial_ratio(keyword, p.get('description', ''))
        )
        if score >= threshold:
            results.append({**p, 'score': score})
    results.sort(key=lambda x: x['score'], reverse=True)
    return results
