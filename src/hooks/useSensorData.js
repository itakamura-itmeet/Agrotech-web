
import { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/api';

const getClient = () => generateClient();

const GET_LATEST_STATE = `
  query GetLatestState($deviceId: ID!) {
    getLatestState(device_id: $deviceId) {
      device_id
      timestamp
      temperature
      humidity
      is_anomalous
      updated_at
    }
  }
`;

const GET_HISTORICAL = `
  query GetHistoricalReadings(
    $deviceId: ID!
    $startTime: AWSDateTime!
    $endTime: AWSDateTime!
    $limit: Int
  ) {
    getHistoricalReadings(
      device_id: $deviceId
      start_time: $startTime
      end_time: $endTime
      limit: $limit
    ) {
      readings {
        timestamp
        temperature
        humidity
        is_anomalous
      }
      count
    }
  }
`;

export function useLatestSensorState(deviceId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const result = await getClient().graphql({
          query: GET_LATEST_STATE,
          variables: { deviceId }
        });
        setData(result.data.getLatestState);
      } catch (err) {
        console.error("Error fetching latest state:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
    // Fallback polling
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [deviceId]);

  return { data, loading, error };
}

export function useHistoricalData(deviceId, startTime, endTime, limit = 100) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const result = await getClient().graphql({
          query: GET_HISTORICAL,
          variables: {
            deviceId,
            startTime,
            endTime,
            limit,
          }
        });
        setData(result.data.getHistoricalReadings);
      } catch (err) {
        console.error("Error fetching historical data:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [deviceId, startTime, endTime, limit]);

  return { data, loading, error };
}
