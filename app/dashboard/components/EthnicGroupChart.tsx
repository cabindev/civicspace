import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { EthnicGroupChartData } from '@/app/types/types';

interface EthnicGroupChartProps {
  data: EthnicGroupChartData[];
}

export default function EthnicGroupChart({ data }: EthnicGroupChartProps) {
  const options: Highcharts.Options = {
    chart: { type: 'pie' },
    title: { text: 'Ethnic Groups Distribution' },
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: 'pointer',
        dataLabels: {
          enabled: true,
          format: '<b>{point.name}</b>: {point.percentage:.1f} %'
        }
      }
    },
    series: [{
      type: 'pie',
      name: 'Ethnic Groups',
      data: data.map(item => ({
        name: item.category,
        y: item.count
      }))
    }]
  };

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <HighchartsReact highcharts={Highcharts} options={options} />
      </div>
    </div>
  );
}