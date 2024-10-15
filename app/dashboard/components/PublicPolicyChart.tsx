import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { PublicPolicyChartData } from '@/app/types/types';

interface PublicPolicyChartProps {
  data: PublicPolicyChartData[];
}

export default function PublicPolicyChart({ data }: PublicPolicyChartProps) {
  const options: Highcharts.Options = {
    chart: { type: 'bar' },
    title: { text: 'Public Policies by Level' },
    xAxis: { categories: data.map(item => item.level) },
    yAxis: { title: { text: 'Number of Policies' } },
    series: [{
      type: 'bar',
      name: 'Policies',
      data: data.map(item => item.count)
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