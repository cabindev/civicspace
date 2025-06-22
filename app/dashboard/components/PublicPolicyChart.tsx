// PublicPolicyChart.tsx
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { PublicPolicyChartData } from '@/app/types/types';

interface PublicPolicyChartProps {
  data: PublicPolicyChartData[];
}

export default function PublicPolicyChart({ data }: PublicPolicyChartProps) {
  // Function to get appropriate icon for each level
  const getIconForLevel = (level: string): string => {
    const levelLower = level.toLowerCase();
    if (levelLower.includes('national') || levelLower.includes('ชาติ')) return '🏛️';
    if (levelLower.includes('regional') || levelLower.includes('ภาค')) return '🌏';
    if (levelLower.includes('provincial') || levelLower.includes('จังหวัด')) return '🏢';
    if (levelLower.includes('local') || levelLower.includes('ท้องถิ่น')) return '🏘️';
    if (levelLower.includes('community') || levelLower.includes('ชุมชน')) return '👥';
    return '📋';
  };

  const modernGreenShades = [
    '#10B981', '#059669', '#34D399', '#6EE7B7', '#A7F3D0', 
    '#047857', '#065F46', '#52B788', '#40916C', '#2D6A4F'
  ];

  const options: Highcharts.Options = {
    chart: { 
      type: 'bar',
      backgroundColor: 'transparent',
      height: 400,
      spacing: [20, 20, 20, 20]
    },
    title: { 
      text: 'Public Policies by Level',
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
      text: 'นโยบายสาธารณะจำแนกตามระดับ',
      align: 'left',
      style: {
        fontSize: '12px',
        fontWeight: '300',
        color: '#059669',
        fontFamily: 'Inter, system-ui, sans-serif'
      }
    },
    xAxis: { 
      categories: data.map(item => `${getIconForLevel(item.level)} ${item.level}`),
      labels: {
        style: { 
          fontSize: '11px',
          fontWeight: '500',
          color: '#047857',
          fontFamily: 'Inter, system-ui, sans-serif'
        }
      },
      gridLineWidth: 0,
      lineWidth: 0,
      tickWidth: 0
    },
    yAxis: { 
      title: { 
        text: 'จำนวนนโยบาย',
        style: { 
          fontSize: '12px',
          fontWeight: '300',
          color: '#6B7280',
          fontFamily: 'Inter, system-ui, sans-serif'
        }
      },
      labels: {
        style: {
          fontSize: '11px',
          fontWeight: '300',
          color: '#9CA3AF',
          fontFamily: 'Inter, system-ui, sans-serif'
        }
      },
      gridLineColor: '#F0FDF4',
      gridLineWidth: 1
    },
    tooltip: {
      backgroundColor: 'rgba(255, 255, 255, 0.98)',
      borderColor: '#10B981',
      borderWidth: 2,
      borderRadius: 12,
      shadow: {
        color: 'rgba(16, 185, 129, 0.2)',
        offsetX: 0,
        offsetY: 4,
        opacity: 0.25,
        width: 8
      },
      style: {
        fontSize: '12px',
        fontFamily: 'Inter, system-ui, sans-serif'
      },
      useHTML: true,
      formatter: function() {
        const point = this.point as any;
        const levelData = data[point.index];
        return `
          <div style="text-align: center; padding: 8px;">
            <div style="font-size: 18px; margin-bottom: 6px;">${getIconForLevel(levelData.level)}</div>
            <b style="color: #065F46; font-size: 13px;">${levelData.level}</b><br/>
            <span style="font-weight: 300; color: #6B7280;">จำนวนนโยบาย: </span>
            <b style="color: #10B981;">${point.y}</b>
          </div>
        `;
      }
    },
    plotOptions: {
      bar: {
        dataLabels: {
          enabled: true,
          format: '{y}',
          style: { 
            fontSize: '11px',
            fontWeight: '600',
            color: '#065F46',
            fontFamily: 'Inter, system-ui, sans-serif'
          },
          inside: false,
          align: 'right'
        },
        borderRadius: 6,
        pointPadding: 0.1,
        groupPadding: 0.1,
        states: {
          hover: {
            brightness: 0.1,
            borderColor: '#059669',
            borderWidth: 2
          }
        }
      }
    },
    series: [{
      type: 'bar',
      name: 'Policies',
      data: data.map((item, index) => ({
        y: item.count,
        color: {
          linearGradient: { x1: 0, y1: 0, x2: 1, y2: 0 },
          stops: [
            [0, modernGreenShades[index % modernGreenShades.length]],
            [1, modernGreenShades[index % modernGreenShades.length] + 'DD']
          ]
        }
      }))
    }],
    legend: {
      enabled: false
    },
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
              <span className="text-lg">📋</span>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-green-800">Public Policies</h3>
              <p className="text-xs text-green-600 font-light">นโยบายสาธารณะ</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-700">
              {data.reduce((sum, item) => sum + item.count, 0)}
            </div>
            <div className="text-xs text-green-500 font-light">Total Policies</div>
          </div>
        </div>

        <HighchartsReact highcharts={Highcharts} options={options} />

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-xs text-green-600 font-medium">
              {data.length} policy levels
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
