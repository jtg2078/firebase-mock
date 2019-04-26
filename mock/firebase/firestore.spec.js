const Firestore = require("./firestore");

const mockData = [
  {
    id: "0001",
    title: "apple",
    category: {
      type: "article"
    },
    rating: {
      score: 5
    }
  },
  {
    id: "0002",
    title: "book",
    category: {
      type: "article"
    },
    rating: {
      score: 20
    }
  },
  {
    id: "0003",
    title: "cedar",
    category: {
      type: "video"
    },
    rating: {
      score: 12
    }
  },
  {
    id: "0004",
    title: "Dog",
    category: {
      type: "video"
    },
    rating: {
      score: 999
    }
  }
];

describe("test firestore list", () => {
  const firestore = Firestore();
  mockData.forEach(item =>
    firestore
      .collection("items")
      .doc(item.id)
      .set(item)
  );
  test("should return filtered items accordingly 1", () => {
    expect.assertions(2);
    return firestore
      .collection("items")
      .where("category.type", "==", "video")
      .orderBy("rating.score", "DESC")
      .get()
      .then(querySnapshot => {
        const items = [];
        querySnapshot.forEach(doc => {
          const item = doc.data();
          items.push(item);
        });
        return items;
      })
      .then(items => {
        expect(items.length).toEqual(2);
        expect(items[0].id).toEqual("0004");
      });
  });
  test("should return filtered items accordingly 2", () => {
    expect.assertions(2);
    return firestore
      .collection("items")
      .where("category.type", "==", "article")
      .orderBy("title", "asc")
      .get()
      .then(querySnapshot => {
        const items = [];
        querySnapshot.forEach(doc => {
          const item = doc.data();
          items.push(item);
        });
        return items;
      })
      .then(items => {
        expect(items.length).toEqual(2);
        expect(items[0].id).toEqual("0001");
      });
  });
  test("should return items accordingly 1", () => {
    expect.assertions(2);
    return firestore
      .collection("items")
      .orderBy("rating.score", "desc")
      .get()
      .then(querySnapshot => {
        const items = [];
        querySnapshot.forEach(doc => {
          const item = doc.data();
          items.push(item);
        });
        return items;
      })
      .then(items => {
        expect(items.length).toEqual(mockData.length);
        expect(items[0].id).toEqual("0004");
      });
  });
});
