const Globe = window.Globe;
const world = Globe()
  .globeImageUrl('//unpkg.com/three-globe/example/img/earth-night.jpg')
  .pointAltitude(0.02)
  .pointColor(d => d.suspicious ? 'red' : 'cyan')
  .pointsData([]);

document.getElementById('globeViz').appendChild(world());

let activityData = [];
const maxSeconds = 30;

const ctx = document.getElementById("activityChart").getContext("2d");
const chart = new Chart(ctx, {
  type: 'bar',
  data: {
    labels: Array.from({ length: maxSeconds }, (_, i) => `${i}s ago`).reverse(),
    datasets: [{
      label: 'Requests',
      data: Array(maxSeconds).fill(0),
      backgroundColor: '#58a6ff'
    }]
  },
  options: {
    scales: {
      y: { beginAtZero: true, max: 10 }
    }
  }
});

function updateActivityChart() {
  const counts = Array(maxSeconds).fill(0);
  const now = new Date();
  activityData = activityData.filter(p => (now - new Date(p.timestamp)) / 1000 < maxSeconds);

  activityData.forEach(p => {
    const secondsAgo = Math.floor((now - new Date(p.timestamp)) / 1000);
    if (secondsAgo < maxSeconds) counts[maxSeconds - 1 - secondsAgo]++;
  });

  chart.data.datasets[0].data = counts;
  chart.update();
}

function updateTable(points) {
  const counts = {};
  points.forEach(p => {
    if (p.suspicious) {
      counts[p.ip] = (counts[p.ip] || 0) + 1;
    }
  });

  const sorted = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const tbody = document.querySelector("#ipTable tbody");
  tbody.innerHTML = "";
  sorted.forEach(([ip, count]) => {
    const row = `<tr><td>${ip}</td><td>${count}</td></tr>`;
    tbody.insertAdjacentHTML("beforeend", row);
  });
}

async function fetchData() {
  const res = await fetch("http://localhost:5000/data");
  const points = await res.json();

  world.pointsData(points.map(p => ({
    lat: p.latitude,
    lng: p.longitude,
    suspicious: p.suspicious
  })));

  document.getElementById("timestamp").textContent = new Date().toLocaleTimeString();

  activityData.push(...points);
  updateActivityChart();
  updateTable(points);
}

setInterval(fetchData, 2000);
