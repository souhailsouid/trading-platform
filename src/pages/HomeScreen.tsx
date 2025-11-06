import React from 'react';
import Dashboard from '../components/Dashboard';
import Form from '../components/Form';
import TradingAlerts from '../components/TradingAlerts';

const Home: React.FC = () => {
  return (
    <div style={{ margin: "3rem auto" }}>
      <Form />
      <Dashboard />
      <TradingAlerts />
    </div>
  );
};

export default Home;