import React from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

interface RecentActivity {
  name: string;
  date: string;
}

interface CreativeActivityData {
  category: string;
  activityCount: number;
  recentActivities: RecentActivity[];
}

interface CreativeActivityChartProps {
  data: CreativeActivityData[];
}

const modernColors = [
  '#10B981', '#059669', '#34D399', '#6EE7B7', '#A7F3D0',
  '#047857', '#065F46', '#52B788', '#40916C', '#2D6A4F'
];

export default function CreativeActivityChart({ data }: CreativeActivityChartProps) {
  const chartOptions: Highcharts.Options = {
    chart: {
      type: 'column',
      height: 400,
      backgroundColor: 'transparent',
      spacing: [20, 20, 20, 20],
      scrollablePlotArea: data.length > 5 ? {
        minWidth: data.length * 100,
        scrollPositionX: 0
      } : undefined
    },
    title: {
      text: 'Creative Activities by Category',
      align: 'left',
      style: {
        fontSize: '18px',
        fontWeight: '600',
        color: '#1F2937',
        fontFamily: 'Inter, system-ui, sans-serif'
      },
      margin: 25
    },
    subtitle: {
      text: 'งานสร้างสรรค์จำแนกตามประเภท',
      align: 'left',
      style: {
        fontSize: '12px',
        fontWeight: '300',
        color: '#6B7280',
        fontFamily: 'Inter, system-ui, sans-serif'
      }
    },
    xAxis: {
      categories: data.map(item => item.category),
      labels: {
        style: {
          fontSize: '11px',
          fontWeight: '400',
          color: '#4B5563',
          fontFamily: 'Inter, system-ui, sans-serif'
        },
        rotation: data.length > 8 ? -45 : 0,
        align: data.length > 8 ? 'right' : 'center'
      },
      lineColor: '#E5E7EB',
      lineWidth: 1,
      tickColor: '#E5E7EB',
      max: data.length > 5 ? 4 : undefined,
      scrollbar: data.length > 5 ? {
        enabled: true,
        barBackgroundColor: '#10B981',
        barBorderColor: '#059669',
        buttonBackgroundColor: '#34D399',
        buttonBorderColor: '#10B981',
        rifleColor: '#FFFFFF',
        trackBackgroundColor: '#F0FDF4',
        trackBorderColor: '#BBF7D0'
      } : undefined
    },
    yAxis: {
      title: {
        text: 'จำนวนกิจกรรม',
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
      gridLineWidth: 1,
      min: 0
    },
    tooltip: {
      backgroundColor: 'rgba(255, 255, 255, 0.98)',
      borderColor: '#10B981',
      borderRadius: 12,
      borderWidth: 2,
      style: {
        fontSize: '12px',
        fontFamily: 'Inter, system-ui, sans-serif',
        color: '#1F2937'
      },
      useHTML: true,
      formatter: function (this: Highcharts.TooltipFormatterContextObject) {
        const point = this.point as Highcharts.Point & { category: string };
        const categoryData = data.find(item => item.category === point.category);

        let recentActivitiesHtml = '';
        if (categoryData?.recentActivities?.length) {
          recentActivitiesHtml = categoryData.recentActivities.slice(0, 3).map(activity =>
            `<div style="margin:2px 0;padding:2px 0;font-size:11px;color:#6B7280;">
              • ${activity.name}
              <span style="color:#9CA3AF;">(${new Date(activity.date).toLocaleDateString('th-TH')})</span>
            </div>`
          ).join('');
        }

        return `
          <div style="padding:8px;">
            <div style="font-weight:600;color:#065F46;margin-bottom:6px;font-size:13px;">
              🎨 ${point.category}
            </div>
            <div style="color:#374151;margin-bottom:8px;">
              <strong style="color:#10B981;">จำนวนกิจกรรม:</strong> ${point.y} กิจกรรม
            </div>
            ${recentActivitiesHtml ? `
              <div style="border-top:1px solid #BBF7D0;padding-top:6px;">
                <div style="font-size:11px;color:#059669;font-weight:500;margin-bottom:4px;">
                  กิจกรรมล่าสุด:
                </div>
                ${recentActivitiesHtml}
              </div>
            ` : ''}
          </div>
        `;
      }
    },
    plotOptions: {
      column: {
        borderRadius: 6,
        borderWidth: 0,
        pointPadding: 0.15,
        groupPadding: 0.1,
        dataLabels: {
          enabled: true,
          format: '{y}',
          style: {
            fontSize: '11px',
            fontWeight: '600',
            color: '#065F46',
            textOutline: 'none',
            fontFamily: 'Inter, system-ui, sans-serif'
          },
          y: -10
        },
        pointWidth: data.length > 5 ? 50 : undefined,
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
      type: 'column',
      name: 'กิจกรรม',
      data: data.map((item, index) => ({
        y: item.activityCount,
        category: item.category,
        color: {
          linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
          stops: [
            [0, modernColors[index % modernColors.length]],
            [1, modernColors[index % modernColors.length] + 'DD']
          ]
        },
        borderColor: modernColors[index % modernColors.length],
        borderWidth: 1
      }))
    }],
    legend: { enabled: false },
    credits: { enabled: false },
    navigation: { buttonOptions: { enabled: false } },
    responsive: {
      rules: [{
        condition: { maxWidth: 500 },
        chartOptions: {
          xAxis: {
            labels: {
              rotation: -45,
              align: 'right'
            }
          }
        }
      }]
    }
  };

  const totalActivities = data.reduce((sum, item) => sum + item.activityCount, 0);

  return (
    <div className="card bg-white shadow-lg border border-green-100 rounded-xl overflow-hidden">
      <div className="card-body p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-200 rounded-lg flex items-center justify-center border border-green-200">
              <span className="text-lg">🎨</span>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-green-800">Creative Activities</h3>
              <p className="text-xs text-green-600 font-light">กิจกรรมสร้างสรรค์ทางวัฒนธรรม</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-700">
              {totalActivities}
            </div>
            <div className="text-xs text-green-500 font-light">Total Activities</div>
          </div>
        </div>
        <div className="relative">
          <HighchartsReact
            highcharts={Highcharts}
            options={chartOptions}
            containerProps={{ style: { height: '400px', width: '100%' } }}
          />
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-xs text-green-600 font-medium">
              {data.length} categories tracked
            </span>
          </div>
          {data.length > 5 && (
            <div className="text-xs text-green-500 font-light bg-green-50 px-2 py-1 rounded-md">
              ← → เลื่อนเพื่อดูทั้งหมด {data.length} ประเภท
            </div>
          )}
        </div>
        <div className="mt-3 w-full bg-green-100 rounded-full h-1">
          <div
            className="bg-gradient-to-r from-green-400 to-emerald-500 h-1 rounded-full transition-all duration-300"
            style={{ width: '100%' }}
          ></div>
        </div>
      </div>
    </div>
  );
}
