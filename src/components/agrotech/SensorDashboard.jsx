"use client"

import { useHistoricalData, useLatestSensorState } from '@/hooks/useSensorData';
import { useSensorSubscription } from '@/hooks/useSensorSubscription';
import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function SensorDashboard({ deviceId }) {
  const { data: latestInitial, loading: loadingLatest } = useLatestSensorState(deviceId);

  // Last 24 hours
  const [endTime] = useState(() => new Date().toISOString());
  const [startTime] = useState(() => new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

  const { data: history, loading: loadingHistory, error: historyError } = useHistoricalData(
    deviceId,
    startTime,
    endTime,
    100
  );

  if (historyError) {
    console.error("Error cargando historial:", historyError);
  }

  const realTimeUpdate = useSensorSubscription(deviceId);

  const [current, setCurrent] = useState(null);
  const [chartData, setChartData] = useState([]);

  // Initialize current state and update chart from polling (fallback)
  useEffect(() => {
    if (latestInitial) {
      setCurrent(latestInitial);
      setChartData(prev => {
        const exists = prev.find(p => p.timestamp === latestInitial.timestamp);
        if (exists) return prev;

        const newData = [...prev, latestInitial].sort((a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );

        if (newData.length > 100) return newData.slice(newData.length - 100);
        return newData;
      });
    }
  }, [latestInitial]);

  // Initialize chart data from history
  useEffect(() => {
    if (history && history.readings) {
      const sorted = [...history.readings].sort((a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
      setChartData(sorted);
    }
  }, [history]);

  // Handle real-time updates from subscription
  useEffect(() => {
    if (realTimeUpdate) {
      console.log("Real-time update:", realTimeUpdate);
      setCurrent(realTimeUpdate);
      setChartData(prev => {
        const exists = prev.find(p => p.timestamp === realTimeUpdate.timestamp);
        if (exists) return prev;

        const newData = [...prev, realTimeUpdate].sort((a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );

        if (newData.length > 100) return newData.slice(newData.length - 100);
        return newData;
      });
    }
  }, [realTimeUpdate]);

  if (loadingLatest && !current) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mr-3"></div>
      <div className="text-gray-500 font-medium">Cargando dashboard...</div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Monitor de Sensor en Tiempo Real</h2>
          <p className="text-sm text-gray-500 mt-1">Supervisión en vivo de variables ambientales</p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          <span className="text-sm font-mono text-gray-600 font-medium">{deviceId}</span>
        </div>
      </div>

      {/* Cards */}
      {current && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className={`rounded-xl shadow-sm border p-6 transition-all duration-200 hover:shadow-md ${current.is_anomalous ? 'bg-red-50 border-red-200' : 'bg-white border-gray-100'
            }`}>
            <div>
              <h3 className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-2">Temperatura</h3>
              <div className="text-3xl font-bold text-gray-900 flex items-baseline gap-1">
                {current.temperature.toFixed(1)}
                <span className="text-lg text-gray-400 font-normal">°C</span>
              </div>
            </div>
          </div>

          <div className={`rounded-xl shadow-sm border p-6 transition-all duration-200 hover:shadow-md ${current.is_anomalous ? 'bg-red-50 border-red-200' : 'bg-white border-gray-100'
            }`}>
            <div>
              <h3 className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-2">Humedad</h3>
              <div className="text-3xl font-bold text-gray-900 flex items-baseline gap-1">
                {current.humidity.toFixed(1)}
                <span className="text-lg text-gray-400 font-normal">%</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all duration-200 hover:shadow-md">
            <div>
              <h3 className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-2">Estado</h3>
              <div className="flex items-center gap-2 mb-2">
                {current.is_anomalous ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-red-100 text-red-800">
                    ⚠️ Anomalía
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    ✓ Normal
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-400 font-medium">
                Última act: {new Date(current.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-6">Historial (Últimas 24 Horas)</h3>
        {historyError ? (
          <div className="h-96 flex justify-center items-center text-red-500 bg-red-50 rounded-lg border border-red-100 p-4">
            <div className="text-center">
              <p className="font-bold">No se encontraron datos en las últimas 24 horas</p>
            </div>
          </div>
        ) : loadingHistory && chartData.length === 0 ? (
          <div className="h-96 flex justify-center items-center text-gray-400">Cargando historial...</div>
        ) : (
          <div className="h-96 w-full">
            <ResponsiveContainer>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={(str) => new Date(str).toLocaleTimeString()}
                  minTickGap={30}
                />
                <YAxis yAxisId="left" label={{ value: 'Temp (°C)', angle: -90, position: 'insideLeft' }} />
                <YAxis yAxisId="right" orientation="right" label={{ value: 'Hum (%)', angle: 90, position: 'insideRight' }} />
                <Tooltip
                  labelFormatter={(label) => new Date(label).toLocaleString()}
                />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="temperature"
                  stroke="#ff7300"
                  activeDot={{ r: 8 }}
                  name="Temperatura"
                  isAnimationActive={false}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="humidity"
                  stroke="#387908"
                  name="Humedad"
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
