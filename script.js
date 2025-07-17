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
function populateColumnSelectors (){
    const xSelect = document.getElementById('xColumn')
    const ySelect = document.getElementById("yColumn")

    // Clear exisiting options 
    xSelect.innerHTML = '<option value="">Select X column...</option>'
    ySelect.innerHTML = '<option value="">Select Y column...</option>'

    if (currentData && currentData.length > 0){
        const headers = Object.keys(currentData[0])
        headers.forEach(header => {
            xSelect.innerHTML += `<option value="${header}">${header}</option>`;
            ySelect.innerHTML += `<option value="${header}">${header}</option>`;
        })
    }

    updateAnalyzeButton()
}

function updateAnalyzeButton(){
    const xColumn = document.getElementById("xColumn")
    const yColumn = document.getElementById("yColumn")
    
    const analyzeBtn = document.getElementById('analyzeBtn')
    analyzeBtn.disabled = !xColumn || !yColumn || !currentData
}

