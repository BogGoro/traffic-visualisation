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
   updateTable(points);
 }

setInterval(fetchData, 2000);