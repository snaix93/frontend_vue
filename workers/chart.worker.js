import { merge } from 'lodash-es';
import DateTimeMixin from '@/mixins/useDateTime';

self.addEventListener('message', (event) => {
  let { response, pointRadius, datasetOptions, teamTimezone } = event.data;

  const returnData = {
    hasData: true,
    renderChart: true,
    chartData: {
      datasets: [],
    },
    lastDataPointValue: '',
  };
  const formattedData = [];

  if (response.length <= 0) {
    returnData.hasData = false;
    returnData.renderChart = false;
  } else {
    response.forEach((set) => {

      const i = response.indexOf(set);
      const input = set.data;

      const data = input.map(item => ({
        x: DateTimeMixin.methods.parseTimestampAsMomentObj(
          item.x,
          teamTimezone
        ).format(),
        y: item.y,
      }));

      let result = {
        label: set.label,
        borderWidth: 1.8,
        pointRadius,
        lineTension: 0,
        hidden: false,
        data,
      };

      if (datasetOptions) {
        if (datasetOptions.global) {
          result = merge(result, datasetOptions.global);
        }

        if (datasetOptions.single && datasetOptions.single[i]) {
          result = merge(result, datasetOptions.single[i]);
        }
      }

      formattedData.push(result);
    });

    returnData.chartData.datasets = formattedData;
    returnData.lastDataPointValue = formattedData[0].data[0].y;
  }


  self.postMessage(returnData);
});
