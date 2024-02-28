const convertToDate = (time) => {
  const date = new Date(time);
  const options = {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
  };
  return date.toLocaleString('en-GB', options);
};

const loadingElement = document.getElementById('loading');
loadingElement.style.display = 'block';

const ctx = document.getElementById('myChart').getContext('2d');
const url = "https://app.astroport.fi/api/trpc/charts.prices?input=%7B%0A%20%20%20%22json%22%3A%7B%0A%20%20%20%20%20%20%22tokens%22%3A%5B%0A%20%20%20%20%20%20%20%20%20%22ibc%2FC4CFF46FD6DE35CA4CF4CE031E643C8FDC9BA4B99AE598E9B0ED98FE3A2319F9%22%2C%0A%20%20%20%20%20%20%20%20%20%22untrn%22%0A%20%20%20%20%20%20%5D%2C%0A%20%20%20%20%20%20%22chainId%22%3A%22neutron-1%22%2C%0A%20%20%20%20%20%20%22dateRange%22%3A%22D7%22%0A%20%20%20%7D%0A%7D"

fetch(url)
.then( async (response) => {
  let temp = await response.json()
  const graphData = temp?.result?.data?.json?.untrn ?? {};
  const {series, maxValue, minValue} = graphData

  loadingElement.style.display = 'none';

  const xAxisLabels = series.map(item => convertToDate(item.time))
  const plotData = series.map(item => item.value)
  const averagePrice = series.reduce((accumulator, current) => accumulator + current.value, 0) / series.length;

  new Chart(ctx, 
  {
    type: 'line',
    data: {
      labels: xAxisLabels,
      datasets: [
        {
          label: 'Price',
          data: plotData,
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1
        }, 
        {
          label: 'Average Price',
          data: new Array(series.length).fill(averagePrice),
          borderColor: 'rgb(255, 99, 132)',
          borderDash: [5, 5],
          fill: false
        }, 
        {
          label: 'Max Price',
          data: new Array(series.length).fill(maxValue),
          borderColor: 'rgb(54, 162, 235)',
          borderDash: [5, 5],
          fill: false
        }, 
        {
          label: 'Min Price',
          data: new Array(series.length).fill(minValue),
          borderColor: 'rgb(255, 206, 86)',
          borderDash: [5, 5],
          fill: false
        }
      ]
    },
    options: {
      maintainAspectRatio: false,
      responsive: true,
      scales: {
        x: {
          title: {
            display: true,
            text: 'Date and Time'
          }
        },
        y: {
          title: {
            display: true,
            text: 'Price'
          }
        }
      },
      plugins: {
        legend: {
          display: true,
          position: 'bottom'
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              let label = context.dataset.label || '';
              if (label) {
                  label += ': ';
              }
              if (context.parsed.y !== null) {
                  label += context.parsed.y.toFixed(2);
              }
              return label;
            }
          }
        }
      }
    }
  }
  );
})
.catch(error => console.log('Error>>>>', error))