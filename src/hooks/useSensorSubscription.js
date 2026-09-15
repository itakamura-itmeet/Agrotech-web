
import { useEffect, useState } from 'react';
import { generateClient } from 'aws-amplify/api';

const getClient = () => generateClient();

const SUBSCRIPTION = `
  subscription OnSensorUpdate($deviceId: ID!) {
    onSensorUpdate(device_id: $deviceId) {
      device_id
      timestamp
      temperature
      humidity
      is_anomalous
    }
  }
`;

export function useSensorSubscription(deviceId) {
  const [latestUpdate, setLatestUpdate] = useState(null);

  useEffect(() => {
    const sub = (getClient().graphql({
      query: SUBSCRIPTION,
      variables: { deviceId }
    })).subscribe({
      next: (event) => {
        const data = event.data.onSensorUpdate;
        setLatestUpdate(data);
      },
      error: (error) => {
        console.error('Subscription error:', error);
      },
    });

    return () => sub.unsubscribe();
  }, [deviceId]);

  return latestUpdate;
}
