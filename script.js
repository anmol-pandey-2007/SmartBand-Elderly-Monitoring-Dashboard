// script.js
// Simple mocked telemetry + Chart.js live update
(() => {
  // DOM elements
  const hrEl = document.getElementById('hr');
  const spo2El = document.getElementById('spo2');
  const stressEl = document.getElementById('stress');
  const tempEl = document.getElementById('temp');
  const locEl = document.getElementById('loc');
  const latEl = document.getElementById('lat');
  const lonEl = document.getElementById('lon');
  const lastSeenEl = document.getElementById('lastSeen');
  const alertsList = document.getElementById('alertsList');
  const btnAlert = document.getElementById('btnAlert');
  const btnMute = document.getElementById('btnMute');

  // Chart setup
  const ctx = document.getElementById('hrChart').getContext('2d');
  const hrData = { labels: [], datasets: [{ label: 'BPM', data: [], borderColor: '#ef4444', tension:0.25, pointRadius:0 }] };
  const hrChart = new Chart(ctx, { type:'line', data: hrData, options:{ responsive:true, maintainAspectRatio:false, scales:{ x:{ display:false }, y:{ suggestedMin:40, suggestedMax:160 } }, plugins:{ legend:{ display:false } } } });

  // helper functions
  function nowTime(){ return new Date().toLocaleTimeString(); }
  function clamp(v,a,b){ return Math.max(a, Math.min(b, v)); }

  // push point to chart (keep ~60 points)
  function pushPoint(bpm){
    const label = nowTime();
    hrData.labels.push(label);
    hrData.datasets[0].data.push(bpm);
    if(hrData.labels.length > 60){ hrData.labels.shift(); hrData.datasets[0].data.shift(); }
    hrChart.update();
  }

  // alert helper
  function pushAlert(text, type='warning'){
    const d = document.createElement('div');
    d.textContent = text;
    d.style.padding = '8px';
    d.style.marginBottom = '8px';
    d.style.borderRadius = '8px';
    d.style.fontSize = '13px';
    d.style.background = type === 'critical' ? '#fee2e2' : '#fffbeb';
    alertsList.prepend(d);
  }

  // simulated telemetry generator
  let latitude = 28.6139, longitude = 77.2090;
  function generateTelemetry(){
    // base values
    const lastHr = hrData.datasets[0].data.slice(-1)[0] || 72;
    const hr = Math.round(clamp(lastHr + (Math.random()*8 - 4), 50, 150));
    const spo2 = Math.round(clamp((Math.random()*1.5 - 0.75) + (parseInt(spo2El.textContent) || 98), 88, 100));
    const stress = Math.round(clamp((parseInt(stressEl.textContent) || 30) + (Math.random()*6 - 3), 5, 95));
    const temp = (clamp((parseFloat(tempEl.textContent) || 36.6) + (Math.random()*0.2 - 0.1), 34.0, 39.0)).toFixed(1);

    // small jitter in location
    latitude = +(latitude + (Math.random()*0.0006 - 0.0003)).toFixed(6);
    longitude = +(longitude + (Math.random()*0.0006 - 0.0003)).toFixed(6);

    // update UI
    hrEl.textContent = hr + ' bpm';
    spo2El.textContent = spo2;
    stressEl.textContent = stress + ' %';
    tempEl.textContent = temp + ' °C';
    locEl.textContent = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
    latEl.textContent = latitude.toFixed(4);
    lonEl.textContent = longitude.toFixed(4);
    lastSeenEl.textContent = 'Last update: ' + new Date().toLocaleString();

    pushPoint(hr);

    // simple alert rules
    if(hr > 140 || stress > 85){
      pushAlert(`CRITICAL: HR ${hr} — Stress ${stress}`, 'critical');
    } else if(hr > 110 || stress > 65){
      pushAlert(`Warning: HR ${hr} — Stress ${stress}`, 'warning');
    }
  }

  // initial seed
  for(let i=0;i<30;i++){ pushPoint(70 + Math.round(Math.random()*8 - 4)); }

  // start updates every 2000ms
  const timer = setInterval(generateTelemetry, 2000);

  // manual simulate emergency
  btnAlert.addEventListener('click', ()=>{
    // simulate a spike
    const spikeHr = 170;
    const spikeStress = 92;
    hrEl.textContent = spikeHr + ' bpm';
    stressEl.textContent = spikeStress + ' %';
    tempEl.textContent = '37.8 °C';
    pushPoint(spikeHr);
    pushAlert(`SIMULATED EMERGENCY: HR ${spikeHr}, Stress ${spikeStress}`, 'critical');
  });

  btnMute.addEventListener('click', ()=>{
    alertsList.innerHTML = '<div style="color:#64748b">No alerts.</div>';
  });

  // Expose a window method to stop simulation if needed
  window.stopMock = () => clearInterval(timer);

})();
