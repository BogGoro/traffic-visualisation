let activityData = [];

const ctx = document.getElementById("activityChart").getContext("2d");
const chart = new Chart(ctx, {
  type: 'bar',
  data: {
    labels: [],
    datasets: [{
      label: 'Requests',
      data: [],
      backgroundColor: '#58a6ff'
    }]
  },
  options: {
    scales: {
      y: { beginAtZero: true }
    }
  }
});

const minMinute = 32;
const maxMinute = 42;

// Populate time dropdowns
function populateTimeDropdowns() {
  const fromMinute = document.getElementById("fromMinute");
  const toMinute = document.getElementById("toMinute");
  const fromSecond = document.getElementById("fromSecond");
  const toSecond = document.getElementById("toSecond");

  for (let m = minMinute; m <= maxMinute; m++) {
    fromMinute.add(new Option(m.toString().padStart(2, '0'), m));
    toMinute.add(new Option(m.toString().padStart(2, '0'), m));
  }

  for (let s = 0; s <= 59; s++) {
    const label = s.toString().padStart(2, '0');
    fromSecond.add(new Option(label, s));
    toSecond.add(new Option(label, s));
  }

  // Set default values
  fromMinute.value = minMinute;
  fromSecond.value = 0;
  toMinute.value = maxMinute;
  toSecond.value = 0;
}

populateTimeDropdowns();

function getUnixTime(minute, second) {
  const d = 1736919120000 + (minute - 32) * 60 * 1000 + second * 1000;
  return d;
}

function updateActivityChart() {
  const fromUnix = getUnixTime(+fromMinute.value, +fromSecond.value);
  const toUnix = getUnixTime(+toMinute.value, +toSecond.value);

  if (fromUnix >= toUnix) {
    alert("Start time must be earlier than end time!");
    return;
  }

  const bucketSize = 10_000; // 10 sec buckets
  const bucketCount = Math.ceil((toUnix - fromUnix) / bucketSize);
  const counts = Array(bucketCount).fill(0);
  const labels = Array(bucketCount).fill(0).map((_, i) => {
    const ts = new Date(fromUnix + i * bucketSize);
    return ts.toUTCString().split(" ")[4]; // HH:MM:SS
  });

  activityData.forEach(p => {
    const t = new Date(p.timestamp).getTime();
    if (t >= fromUnix && t <= toUnix) {
      const idx = Math.floor((t - fromUnix) / bucketSize);
      if (idx >= 0 && idx < bucketCount) {
        counts[idx]++;
      }
    }
  });

  chart.data.labels = labels;
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

  document.getElementById("timestamp").textContent = new Date().toLocaleTimeString();

  activityData = points;
  updateActivityChart();
  updateTable(points);
}

setInterval(fetchData, 2000);

document.getElementById("updateBtn").addEventListener("click", updateActivityChart);
