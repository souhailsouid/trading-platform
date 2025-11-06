import React from 'react';
import Dashboard from '../components/Dashboard';
import Form from '../components/Form';
import SendAlertForm from '../components/SendAlertForm';
import WebhookResults from '../components/WebhookResults';

const Home: React.FC = () => {
  return (
    <div style={{ margin: "3rem auto" }}>
      <Form />
      <Dashboard />
      <SendAlertForm />
      <WebhookResults />
    </div>
  );
};

export default Home;