// Main Functions: parse data => calculate

let currentData = null;
let chart = null;

// Converts CSV to JS data
function handleFileUpload(event) {
  const file = event.target.files[0];
  if (file) {
    Papa.parse(file, {
      complete: function (results) {
        currentData = results.data;
        populateCoulmnSelector();
        showNotification("File uploaded sucessfully", "success");
      },
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
    });
  }
}

function loadSampleData() {
  const sampleCSV = `Hours_Studied,Test_Score
2,65
3,70
4,75
5,80
6,82
7,85
8,88
9,90
10,92
1,60
2.5,68
3.5,72
4.5,77
5.5,81
6.5,84
7.5,87
8.5,89
9.5,91
1.5,62
3.2,71`;
  Papa.parse(sampleCSV, {
    complete: function (results) {
      currentData = results.data;
      populateColumnSelectors();
      showNotification("Sample data loaded!", "success");
    },
    header: true,
    skipEmptyLines: true,
    dynamicTyping: true,
  });
}

// Update the column section
function populateColumnSelectors() {
  const xSelect = document.getElementById("xColumn");
  const ySelect = document.getElementById("yColumn");

  // Clear exisiting options
  xSelect.innerHTML = '<option value="">Select X column...</option>';
  ySelect.innerHTML = '<option value="">Select Y column...</option>';

  if (currentData && currentData.length > 0) {
    const headers = Object.keys(currentData[0]);
    headers.forEach((header) => {
      xSelect.innerHTML += `<option value="${header}">${header}</option>`;
      ySelect.innerHTML += `<option value="${header}">${header}</option>`;
    });
  }

  updateAnalyzeButton();
}

function updateAnalyzeButton() {
  const xColumn = document.getElementById("xColumn");
  const yColumn = document.getElementById("yColumn");

  const analyzeBtn = document.getElementById("analyzeBtn");
  analyzeBtn.disabled = !xColumn || !yColumn || !currentData;
}

function performRegression() {
  const xColumn = document.getElementById("xColumn").value;
  const yColumn = document.getElementById("yColumn").value;

  if (!currentData || !xColumn || !yColumn) return;

  // Extract Data points
  const points = currentData
    .map((row) => ({
      x: parseFloat(row[xColumn]),
      y: parseFloat(row[yColumn]),
    }))
    .filter((point) => !isNaN(point.x) && !isNaN(point.y));

  if (points.length < 2) {
    showNotification("Need at least 2 valid data points", "error");
    return;
  }

  const regression = calculateLinearRegression(points);
  document.getElementById("results").style.display = "flex";
  // Update statistics
  updateStatistics(regression, points.length, xColumn, yColumn);

  // Create chart
  createChart(points, regression, xColumn, yColumn);

  // Show results
  document.getElementById("results").style.display = "grid";
}

function calculateLinearRegression(points) {
  const n = points.length;

  const sumX = points.reduce((sum, point) => sum + point.x, 0);
  const sumY = points.reduce((sum, point) => sum + point.y, 0);

  const sumXX = points.reduce((sum, point) => sum + point.x * point.x, 0);
  const sumYY = points.reduce((sum, point) => sum + point.y * point.y, 0);
  const sumXY = points.reduce((sum, point) => sum + point.x * point.y, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // Calculate correlation coefficient
  const correlation =
    (n * sumXY - sumX * sumY) /
    Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));

  const rSquared = correlation * correlation;

  return { slope, intercept, correlation, rSquared };
}

// Update statistics display
function updateStatistics(regression, dataPoints, xColumn, yColumn) {
  document.getElementById(
    "equation"
  ).textContent = `y = ${regression.slope.toFixed(
    3
  )}x + ${regression.intercept.toFixed(3)}`;
  document.getElementById("rsquared").textContent =
    regression.rSquared.toFixed(4);
  document.getElementById("correlation").textContent =
    regression.correlation.toFixed(4);
  document.getElementById("slope").textContent = regression.slope.toFixed(4);
  document.getElementById("intercept").textContent =
    regression.intercept.toFixed(4);
  document.getElementById("dataPoints").textContent = dataPoints;
}

// Create and display the regression chart
function createChart(points, regression, xColumn, yColumn) {
  const ctx = document.getElementById("regressionChart").getContext("2d");

  // Destroy existing chart if it exists
  if (chart) {
    chart.destroy();
  }

  // Create regression line points
  const xMin = Math.min(...points.map((p) => p.x));
  const xMax = Math.max(...points.map((p) => p.x));
  const linePoints = [
    { x: xMin, y: regression.slope * xMin + regression.intercept },
    { x: xMax, y: regression.slope * xMax + regression.intercept },
  ];

  chart = new Chart(ctx, {
    type: "scatter",
    data: {
      datasets: [
        {
          label: "Data Points",
          data: points,
          backgroundColor: "rgba(52, 152, 219, 0.6)",
          borderColor: "rgba(52, 152, 219, 1)",
          pointRadius: 6,
          pointHoverRadius: 8,
        },
        {
          label: "Regression Line",
          data: linePoints,
          type: "line",
          borderColor: "rgba(231, 76, 60, 1)",
          backgroundColor: "rgba(231, 76, 60, 0.1)",
          borderWidth: 3,
          pointRadius: 0,
          tension: 0,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: `Linear Regression: ${yColumn} vs ${xColumn}`,
          font: {
            size: 16,
            weight: "bold",
          },
        },
        legend: {
          display: true,
          position: "top",
        },
      },
      scales: {
        x: {
          display: true,
          title: {
            display: true,
            text: xColumn,
            font: {
              size: 14,
              weight: "bold",
            },
          },
        },
        y: {
          display: true,
          title: {
            display: true,
            text: yColumn,
            font: {
              size: 14,
              weight: "bold",
            },
          },
        },
      },
      interaction: {
        intersect: false,
        mode: "point",
      },
    },
  });
}

// Show notification messages
function showNotification(message, type) {
  const notification = document.createElement('div');

  const borderColor = type === 'success' ? '#2ecc71' : '#e74c3c';
  const icon = type === 'success' ? '✅' : '⚠️';

  notification.innerHTML = `
    <span style="margin-right: 10px;">${icon}</span> ${message}
  `;

  // Style
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    max-width: 320px;
    padding: 10px 15px;
    display: flex;
    align-items: center;
    gap: 10px;
    font-family: system-ui, sans-serif;
    font-size: 14px;
    color: #333;
    background: #fff;
    border-left: 5px solid ${borderColor};
    border-radius: 5px;
    box-shadow: 0 8px 20px rgba(0,0,0,0.1);
    opacity: 0;
    transform: translateX(100%);
    transition: opacity 0.4s ease, transform 0.4s ease;
    z-index: 9999;
  `;

  // Add to DOM
  document.body.appendChild(notification);

  // Trigger animation
  requestAnimationFrame(() => {
    notification.style.opacity = '1';
    notification.style.transform = 'translateX(0)';
  });

  // Auto-dismiss
  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transform = 'translateX(100%)';
    notification.addEventListener('transitionend', () => {
      notification.remove();
    });
  }, 3000);
}

// Event listeners
document
  .getElementById("xColumn")
  .addEventListener("change", updateAnalyzeButton);
document
  .getElementById("yColumn")
  .addEventListener("change", updateAnalyzeButton);
