import http from 'http';

const gracefulShutdown = (server: http.Server, forceTimeout = 15 * 1000) => {
  const shutdown = () => {
    console.log('shutting down');
    setTimeout(() => {
      console.log('could not close connection in time, forcefully terminating');
      process.exit(1);
    }, forceTimeout);
    server.close(() => {
      console.log('graceful shutdown');
      process.exit(0);
    });
  };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
};

export default gracefulShutdown;
