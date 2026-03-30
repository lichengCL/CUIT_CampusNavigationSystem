// 分类颜色映射
const CATEGORY_COLORS = {
    '食堂': '#FF4444',
    '教学楼': '#4285F4',
    '宿舍': '#34A853',
    '图书馆': '#9C27B0',
    '运动场所': '#FF9800',
    '行政': '#607D8B',
    '医疗': '#E91E63'
};

// 初始化高德地图
const map = new AMap.Map('mapContainer', {
    zoom: MAP_ZOOM,
    center: MAP_CENTER,
    viewMode: '2D'
});

// 存储当前标记和路线
let markers = [];
let routeLine = null;

// 绘制校区轮廓
if (CAMPUS_BOUNDARY && CAMPUS_BOUNDARY.length > 0) {
    const polygon = new AMap.Polygon({
        path: CAMPUS_BOUNDARY.map(c => new AMap.LngLat(c[0], c[1])),
        strokeColor: '#1E90FF',
        strokeWeight: 3,
        strokeOpacity: 0.8,
        fillColor: '#1E90FF',
        fillOpacity: 0.1
    });
    map.add(polygon);
}

// 添加 POI 标记
function addMarkers(pois) {
    // 清除旧标记
    markers.forEach(m => map.remove(m));
    markers = [];

    pois.forEach(p => {
        const color = CATEGORY_COLORS[p.category] || '#4285F4';
        const marker = new AMap.Marker({
            position: [p.lng, p.lat],
            title: p.name
        });

        const info = new AMap.InfoWindow({
            content: `<div class="amap-info-content"><b>${p.name}</b><br><small>${p.category}</small><br>${p.description}</div>`,
            offset: new AMap.Pixel(0, -30)
        });

        marker.on('click', function () {
            info.open(map, marker.getPosition());
        });

        map.add(marker);
        markers.push(marker);
    });
}

// 初始加载所有 POI
addMarkers(POIS);

// 分类筛选
document.querySelectorAll('.category-btn').forEach(btn => {
    btn.addEventListener('click', function () {
        document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        const category = this.dataset.category;
        const filtered = category ? POIS.filter(p => p.category === category) : POIS;
        addMarkers(filtered);
    });
});

// 搜索
document.getElementById('searchBtn').addEventListener('click', doSearch);
document.getElementById('searchInput').addEventListener('keyup', function (e) {
    if (e.key === 'Enter') doSearch();
});

function doSearch() {
    const q = document.getElementById('searchInput').value.trim();
    if (!q) return;
    fetch(`/api/search?q=${encodeURIComponent(q)}`)
        .then(r => r.json())
        .then(results => {
            const container = document.getElementById('searchResults');
            if (results.length === 0) {
                container.innerHTML = '<div class="list-group-item text-muted">未找到相关地点</div>';
            } else {
                container.innerHTML = results.map(p =>
                    `<a href="#" class="list-group-item list-group-item-action search-item"
                        data-lng="${p.lng}" data-lat="${p.lat}" data-name="${p.name}">
                        <strong>${p.name}</strong>
                        <small class="text-muted ms-2">${p.category}</small>
                    </a>`
                ).join('');
                container.querySelectorAll('.search-item').forEach(item => {
                    item.addEventListener('click', function (e) {
                        e.preventDefault();
                        const lng = parseFloat(this.dataset.lng);
                        const lat = parseFloat(this.dataset.lat);
                        map.setCenter([lng, lat]);
                        map.setZoom(18);
                        container.innerHTML = '';
                    });
                });
            }
        });
}

// 点击其他地方关闭搜索结果
document.addEventListener('click', function (e) {
    if (!e.target.closest('#searchInput') && !e.target.closest('#searchResults')) {
        document.getElementById('searchResults').innerHTML = '';
    }
});

// 绘制路线
function drawRoute(coords, distance, duration) {
    // 清除旧路线
    if (routeLine) {
        map.remove(routeLine);
    }
    routeLine = new AMap.Polyline({
        path: coords.map(c => new AMap.LngLat(c[0], c[1])),
        strokeColor: '#4285F4',
        strokeWeight: 6,
        strokeOpacity: 0.8
    });
    map.add(routeLine);
    map.setFitView([routeLine, ...markers]);

    document.getElementById('routeInfo').style.display = 'block';
    document.getElementById('routeDistance').textContent = `距离: ${distance}m`;
    document.getElementById('routeTime').textContent = `步行约: ${duration}分钟`;
}

// 路径规划
document.getElementById('routeBtn').addEventListener('click', function () {
    const orig = document.getElementById('origSelect').value;
    const dest = document.getElementById('destSelect').value;
    if (!orig || !dest) {
        alert('请选择起点和终点');
        return;
    }
    const [origLng, origLat] = orig.split(',');
    const [destLng, destLat] = dest.split(',');

    this.disabled = true;
    this.textContent = '规划中...';

    fetch(`/api/route?orig_lng=${origLng}&orig_lat=${origLat}&dest_lng=${destLng}&dest_lat=${destLat}`)
        .then(r => r.json())
        .then(data => {
            if (data.error) {
                alert(data.error);
            } else {
                drawRoute(data.coords, data.distance, data.duration);
            }
        })
        .catch(() => alert('路径规划失败'))
        .finally(() => {
            this.disabled = false;
            this.textContent = '开始导航';
        });
});

// 多点路径 - 添加途经点
document.getElementById('addStopBtn').addEventListener('click', function () {
    const container = document.getElementById('multiStops');
    const idx = container.children.length + 1;
    const div = document.createElement('div');
    div.className = 'mt-1 d-flex align-items-center gap-1';
    div.innerHTML = `
        <select class="form-select form-select-sm stop-select">
            <option value="">途经点${idx}</option>
            ${POIS.map(p => `<option value="${p.lng},${p.lat}">${p.name}</option>`).join('')}
        </select>
        <button class="btn btn-outline-danger btn-sm remove-stop">×</button>
    `;
    div.querySelector('.remove-stop').addEventListener('click', () => div.remove());
    container.appendChild(div);
});

// 多点导航
document.getElementById('multiRouteBtn').addEventListener('click', function () {
    const orig = document.getElementById('origSelect').value;
    const dest = document.getElementById('destSelect').value;
    if (!orig || !dest) {
        alert('请先选择起点和终点');
        return;
    }

    const stops = [];
    const [oLng, oLat] = orig.split(',');
    stops.push({ lng: parseFloat(oLng), lat: parseFloat(oLat) });

    document.querySelectorAll('.stop-select').forEach(sel => {
        if (sel.value) {
            const [lng, lat] = sel.value.split(',');
            stops.push({ lng: parseFloat(lng), lat: parseFloat(lat) });
        }
    });

    const [dLng, dLat] = dest.split(',');
    stops.push({ lng: parseFloat(dLng), lat: parseFloat(dLat) });

    this.disabled = true;
    this.textContent = '规划中...';

    fetch('/api/multi_route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stops })
    })
        .then(r => r.json())
        .then(data => {
            if (data.error) {
                alert(data.error);
            } else {
                drawRoute(data.coords, data.distance, data.duration);
            }
        })
        .catch(() => alert('多点路径规划失败'))
        .finally(() => {
            this.disabled = false;
            this.textContent = '多点导航';
        });
});
