export const getHighchartsScript = (chartId: string) => `
  try {
    const chartElement = document.querySelector('${chartId}');
    const chartIndex = window.Highcharts.attr(
      chartElement,
      'data-highcharts-chart'
    );
    const chart = window.Highcharts.charts[+chartIndex];

    return chart.series.map(({ xData, yData, name }) => ({
      xData,
      yData,
      name,
    }));
  } catch (err) {
    return [];
  }
`;