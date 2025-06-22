// EthnicGroupChart.tsx
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { EthnicGroupChartData } from '@/app/types/types';

interface EthnicGroupChartProps {
  data: EthnicGroupChartData[];
}

export default function EthnicGroupChart({ data }: EthnicGroupChartProps) {
  const modernGreenColors = [
    '#10B981', // Emerald 500
    '#34D399', // Emerald 400
    '#6EE7B7', // Emerald 300
    '#A7F3D0', // Emerald 200
    '#059669', // Emerald 600
    '#047857', // Emerald 700
    '#52B788', // Custom green
    '#40916C', // Custom green
    '#2D6A4F', // Custom green
    '#74C69D'  // Custom green
  ];

  const options: Highcharts.Options = {
    chart: { 
      type: 'pie',
      backgroundColor: 'transparent',
      height: 400,
      spacing: [20, 20, 20, 20]
    },
    title: { 
      text: 'Ethnic Groups Distribution',
      align: 'left',
      style: {
        fontSize: '18px',
        fontWeight: '600',
        color: '#065F46',
        fontFamily: 'Inter, system-ui, sans-serif'
      },
      margin: 25
    },
    subtitle: {
      text: 'การกระจายของกลุ่มชาติพันธุ์',
      align: 'left',
      style: {
        fontSize: '12px',
        fontWeight: '300',
        color: '#059669',
        fontFamily: 'Inter, system-ui, sans-serif'
      }
    },
    colors: modernGreenColors,
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: 'pointer',
        dataLabels: {
          enabled: true,
          format: '<b>{point.name}</b><br/>{point.percentage:.1f}%',
          style: {
            fontSize: '11px',
            fontWeight: '500',
            color: '#065F46',
            textOutline: 'none',
            fontFamily: 'Inter, system-ui, sans-serif'
          },
          distance: 25,
          connectorColor: '#10B981'
        },
        showInLegend: true,
        borderWidth: 3,
        borderColor: '#ffffff',
        innerSize: '30%',
        point: {
          events: {
            mouseOver: function() {
              this.graphic?.attr({
                opacity: 0.8
              });
            },
            mouseOut: function() {
              this.graphic?.attr({
                opacity: 1
              });
            }
          }
        },
        states: {
          hover: {
            brightness: 0.1
          }
        }
      }
    },
    tooltip: {
      backgroundColor: 'rgba(255, 255, 255, 0.98)',
      borderColor: '#10B981',
      borderRadius: 12,
      borderWidth: 2,
      shadow: {
        color: 'rgba(16, 185, 129, 0.2)',
        offsetX: 0,
        offsetY: 4,
        opacity: 0.25,
        width: 8
      },
      style: {
        fontSize: '12px',
        fontFamily: 'Inter, system-ui, sans-serif',
        color: '#1F2937'
      },
      useHTML: true,
      formatter: function() {
        return `
          <div style="padding: 8px; text-align: center;">
            <div style="font-weight: 600; color: #065F46; margin-bottom: 6px; font-size: 13px;">
              👥 ${this.point.name}
            </div>
            <div style="color: #374151; margin-bottom: 4px;">
              <strong style="color: #10B981;">จำนวน:</strong> ${this.y} กลุ่ม
            </div>
            <div style="color: #6B7280;">
              <strong style="color: #059669;">สัดส่วน:</strong> ${this.percentage?.toFixed(1)}%
            </div>
          </div>
        `;
      }
    },
    legend: {
      enabled: true,
      layout: 'vertical',
      align: 'right',
      verticalAlign: 'middle',
      itemStyle: {
        fontSize: '11px',
        fontWeight: '400',
        color: '#059669',
        fontFamily: 'Inter, system-ui, sans-serif'
      },
      itemHoverStyle: {
        color: '#065F46'
      },
      symbolRadius: 6,
      symbolHeight: 10,
      symbolWidth: 10
    },
    series: [{
      type: 'pie',
      name: 'Ethnic Groups',
      data: data.map((item, index) => ({
        name: item.category,
        y: item.count,
        color: modernGreenColors[index % modernGreenColors.length]
      }))
    }],
    credits: {
      enabled: false
    }
  };

  return (
    <div className="card bg-white shadow-lg border border-green-100 rounded-xl overflow-hidden">
      <div className="card-body p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-200 rounded-lg flex items-center justify-center border border-green-200">
              <span className="text-lg">👥</span>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-green-800">Ethnic Groups</h3>
              <p className="text-xs text-green-600 font-light">กลุ่มชาติพันธุ์</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-700">
              {data.reduce((sum, item) => sum + item.count, 0)}
            </div>
            <div className="text-xs text-green-500 font-light">Total Groups</div>
          </div>
        </div>

        <HighchartsReact highcharts={Highcharts} options={options} />

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-xs text-green-600 font-medium">
              {data.length} ethnic categories
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}