import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { CreativeActivityChartData } from '@/app/types/types';

interface CreativeActivityChartProps {
  data: CreativeActivityChartData[];
}

export default function CreativeActivityChart({ data }: CreativeActivityChartProps) {
  const options: Highcharts.Options = {
    chart: { type: 'column' },
    title: { text: 'Creative Activities by Category' },
    xAxis: { categories: data.map(item => item.category) },
    yAxis: { title: { text: 'Number of Activities' } },
    plotOptions: { column: { stacking: 'normal' } },
    series: data[0].subCategories.map(subCat => ({
      type: 'column',
      name: subCat,
      data: data.map(item => item.subCategoryCounts[subCat] || 0)
    }))
  };

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <HighchartsReact highcharts={Highcharts} options={options} />
      </div>
    </div>
  );
}