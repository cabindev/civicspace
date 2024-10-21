import React from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

interface CreativeActivityData {
  category: string;
  activityCount: number;
  recentActivities: { name: string; date: Date }[];
}

interface CreativeActivityChartProps {
  data: CreativeActivityData[];
}

export default function CreativeActivityChart({ data }: CreativeActivityChartProps) {
  const chartOptions: Highcharts.Options = {
    chart: { 
      type: 'column',
      height: '400px' // ปรับความสูงตามต้องการ
    },
    title: { 
      text: 'Creative Activities by Category',
      style: { fontSize: '20px' }
    },
    xAxis: { 
      categories: data.map(item => item.category),
      labels: { style: { fontSize: '14px' } }
    },
    yAxis: { 
      title: { 
        text: 'Number of Activities',
        style: { fontSize: '14px' }
      }
    },
    tooltip: {
      formatter: function() {
        const point = this.point as any;
        const category = data.find(item => item.category === point.category);
        let tooltipContent = `<b>${point.category}</b><br/>`;
        tooltipContent += `Total Activities: ${point.y}<br/><br/>`;
        tooltipContent += `Recent Activities:<br/>`;
        category?.recentActivities.slice(0, 3).forEach(activity => {
          tooltipContent += `${activity.name} - ${new Date(activity.date).toLocaleDateString()}<br/>`;
        });
        return tooltipContent;
      }
    },
    plotOptions: {
      column: {
        dataLabels: {
          enabled: true,
          format: '{y}',
          style: { fontSize: '12px' }
        }
      }
    },
    series: [{
      type: 'column',
      name: 'Activities',
      data: data.map(item => ({
        y: item.activityCount,
        category: item.category,
        color: Highcharts.getOptions().colors![data.indexOf(item) % 10] // เพื่อให้แต่ละแท่งมีสีต่างกัน
      }))
    }]
  };

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <HighchartsReact highcharts={Highcharts} options={chartOptions} />
      </div>
    </div>
  );
}