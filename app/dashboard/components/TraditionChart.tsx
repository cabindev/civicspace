import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { TraditionChartData } from '@/app/types/types';

interface TraditionChartProps {
  data: TraditionChartData[];
}

export default function TraditionChart({ data }: TraditionChartProps) {
  const options: Highcharts.Options = {
    chart: { type: 'pie' },
    title: { text: 'Tradition Distribution by Category' },
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
      name: 'Traditions',
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