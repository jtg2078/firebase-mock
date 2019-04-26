const AppService = () => {
  const appService = {
    apps: {},
    add({ id, name }) {
      const app = {
        id,
        sent: {
          message: null
        },
        messaging() {
          const messenger = {
            send(message) {
              app.sent.message = message;
              const fakeMessageID = "11223344";
              return Promise.resolve(fakeMessageID);
            }
          };
          return messenger;
        }
      };
      appService.apps[id] = {
        id,
        name,
        app
      };
      return app;
    }
  };
  return appService;
};

module.exports = AppService;
