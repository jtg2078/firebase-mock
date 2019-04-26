const AdminAuth = () => {
  const MockAuthService = {
    verifyIdToken(token) {
      const match = MockAuthService.data.validUsers.users.find(
        user => user.token === token
      );
      if (match) {
        return Promise.resolve({
          uid: match.userId
        });
      }
      return Promise.reject(new Error("invalid token"));
    },
    deleteUser(userId) {
      const user = MockAuthService.data.firebaseAuth.users[userId];
      if (user) {
        delete MockAuthService.data.firebaseAuth.users[userId];
        return Promise.resolve(true);
      }
      return Promise.reject(new Error("userId not exists"));
    },
    data: {
      validUsers: {
        users: [],
        add(userId, token) {
          MockAuthService.data.validUsers.users.push({
            userId,
            token
          });
        }
      },
      firebaseAuth: {
        users: {},
        add(userId) {
          MockAuthService.data.firebaseAuth.users[userId] = userId;
        }
      }
    }
  };
  return MockAuthService;
};

module.exports = AdminAuth;
