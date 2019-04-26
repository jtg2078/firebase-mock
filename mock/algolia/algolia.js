const Index = param => {
  const { name } = param;
  const index = {
    name,
    deleteObject(objectID, callback) {
      let err = null;
      if (!objectID) {
        err = new Error("missing objectID");
      }
      const content = {};
      callback(err, content);
    },
    addObject(model, callback) {
      let err = null;
      if (!model) {
        err = new Error("missing object");
      } else if (!model.objectID) {
        err = new Error("missing objectID");
      }
      const content = {};
      callback(err, content);
    }
  };
  return index;
};

const Algolia = () => {
  const algolia = {
    initIndex(name) {
      const index = Index({ name });
      return index;
    }
  };
  return algolia;
};

module.exports = Algolia;
