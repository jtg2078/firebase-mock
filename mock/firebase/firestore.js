const _ = require("lodash");
const uuidv1 = require("uuid/v1");

const Store = () => {
  const store = {};
  return store;
};

const DocumentSnapshot = param => {
  const { id, exists, data, ref } = param;
  const doc = {
    id,
    exists,
    ref,
    internalData: data,
    data() {
      return doc.internalData;
    }
  };
  return doc;
};

const DocumentReference = param => {
  const { store, collectionName, id } = param;
  const ref = {
    id,
    get() {
      const docSnapshot = ref.internal.get();
      return Promise.resolve(docSnapshot);
    },
    create(data) {
      return ref
        .get()
        .then(docSnapshot => {
          if (docSnapshot.exists) {
            throw new Error("doc id already exist");
          }
        })
        .then(() => {
          return ref.set(data);
        });
    },
    set(data, opt) {
      return ref.get().then(docSnapshot => {
        if (opt && opt.merge === true && docSnapshot.exists) {
          _.merge(docSnapshot.internalData, data);
        } else {
          docSnapshot.exists = true;
          docSnapshot.internalData = data;
          if (!store[collectionName]) {
            store[collectionName] = {};
          }
          store[collectionName][id] = docSnapshot;
        }
        return true;
      });
    },
    update(changes) {
      return ref.get().then(docSnapshot => {
        if (!docSnapshot.exists) {
          throw new Error("doc does not exist");
        }
        _.forEach(changes, (newVal, path) => {
          _.set(docSnapshot.internalData, path, newVal);
        });
        return true;
      });
    },
    delete() {
      return ref.get().then(docSnapshot => {
        if (!docSnapshot.exists) {
          throw new Error("doc does not exist");
        }
        delete store[collectionName][id];
        return true;
      });
    },
    internal: {
      get() {
        const docSnapshot =
          _.get(store, `${collectionName}.${id}`) ||
          DocumentSnapshot({
            id,
            exists: false,
            ref,
            data: {}
          });
        return docSnapshot;
      },
      create(data) {
        const docSnapshot = ref.internal.get();
        if (docSnapshot.exists) {
          throw new Error("doc id already exist");
        }
        ref.internal.set(data);
      },
      set(data, opt) {
        const docSnapshot = ref.internal.get();
        if (opt && opt.merge === true && docSnapshot.exists) {
          _.merge(docSnapshot.internalData, data);
        } else {
          docSnapshot.exists = true;
          docSnapshot.internalData = data;
          if (!store[collectionName]) {
            store[collectionName] = {};
          }
          store[collectionName][id] = docSnapshot;
        }
      },
      update(changes) {
        const docSnapshot = ref.internal.get();
        if (!docSnapshot.exists) {
          throw new Error("doc does not exist");
        }
        _.forEach(changes, (newVal, path) => {
          _.set(docSnapshot.internalData, path, newVal);
        });
      },
      delete() {
        const docSnapshot = ref.internal.get();
        if (!docSnapshot.exists) {
          throw new Error("doc does not exist");
        }
        delete store[collectionName][id];
      }
    }
  };
  return ref;
};

const QuerySnapshot = param => {
  const { docSnapshots } = param;
  const querySnapshot = {
    docs: docSnapshots,
    empty: docSnapshots.length === 0,
    size: docSnapshots.length,
    forEach(fn) {
      docSnapshots.forEach(fn);
    }
  };
  return querySnapshot;
};

const Query = param => {
  const { docSnapshots } = param;
  const query = {
    internal: {
      whereFns: [],
      orderByFns: [],
      orderByDirections: [],
      limit: null,
      startAfter: null
    },
    get() {
      let processing = docSnapshots;
      query.internal.whereFns.forEach(fn => {
        processing = processing.filter(fn);
      });
      processing = _.orderBy(
        processing,
        query.internal.orderByFns,
        query.internal.orderByDirections
      );
      if (query.internal.startAfter) {
        const index = _.findIndex(processing, docSnapshot => {
          return docSnapshot.id === query.internal.startAfter;
        });
        if (index !== -1) {
          if (index + 1 < processing.length) {
            processing = processing.slice(index + 1);
          } else {
            processing = [];
          }
        }
      }
      if (query.internal.limit) {
        processing = processing.slice(0, query.internal.limit);
      }
      return Promise.resolve(
        QuerySnapshot({
          docSnapshots: processing
        })
      );
    },
    limit(count) {
      query.internal.limit = count;
      return query;
    },
    orderBy(path, direction) {
      const fn = docSnapshot => _.get(docSnapshot.data(), path);
      query.internal.orderByFns.push(fn);
      query.internal.orderByDirections.push(_.toLower(direction));
      return query;
    },
    where(fieldPath, opStr, value) {
      const fn = docSnapshot => {
        const fieldValue = _.get(docSnapshot.data(), fieldPath);
        return fieldValue === value;
      };
      query.internal.whereFns.push(fn);
      return query;
    },
    startAfter(docSnapshot) {
      query.internal.startAfter = docSnapshot.id;
      return query;
    }
  };
  return query;
};

const CollectionReference = param => {
  const { store, collectionName } = param;
  const collection = {
    doc(id) {
      return DocumentReference({
        store,
        collectionName,
        id: id || uuidv1()
      });
    },
    where(fieldPath, opStr, value) {
      const docSnapshots = _.values(store[collectionName] || {});
      const query = Query({ docSnapshots });
      query.where(fieldPath, opStr, value);
      return query;
    },
    orderBy(path, direction) {
      const docSnapshots = _.values(store[collectionName] || {});
      const query = Query({ docSnapshots });
      query.orderBy(path, direction);
      return query;
    }
  };
  return collection;
};

const Transaction = () => {
  const transaction = {
    get(docRef) {
      return docRef.get();
    },
    create(docRef, data) {
      docRef.internal.create(data);
      return transaction;
    },
    delete(docRef) {
      docRef.internal.delete();
      return transaction;
    },
    set(docRef, data, opt) {
      docRef.internal.set(data, opt);
      return transaction;
    },
    update(docRef, changes) {
      docRef.internal.update(changes);
      return transaction;
    }
  };
  return transaction;
};

const FireStore = () => {
  const store = Store();
  const firestore = {
    store,
    collection(collectionName) {
      return CollectionReference({
        store: firestore.store,
        collectionName
      });
    },
    runTransaction(updateFunction) {
      const transaction = Transaction();
      return updateFunction(transaction);
    },
    doc(documentPath) {
      const [collectionName, id] = _.split(documentPath, "/", 2);
      return DocumentReference({
        store,
        collectionName,
        id
      });
    }
  };
  return firestore;
};

module.exports = FireStore;
