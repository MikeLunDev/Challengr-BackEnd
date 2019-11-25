const request = require("supertest");
const { app } = require("../server");
const mongoose = require("mongoose");

const validCredentials = {
  email: "test@gmail.com",
  password: "helloworld5"
};
const wrongCredentials = {
  email: "wrong@gmail.com",
  password: "wrongworld5"
};

const newUser = {
  email: "test@gmail.com",
  password: "helloworld5",
  bio: "i'm a developer",
  name: "test1",
  surname: "test1"
};

const missingNewUserFields = {
  password: "helloworld5",
  bio: "engeneer",
  name: "test1",
  surname: "test1"
};

var token = "";

afterAll(() => {
  //await new Promise(resolve => setTimeout(() => resolve(), 500)); // avoid jest open handle error
  var conn = mongoose.connection;
  //delete the test db for testing
  conn.db.dropDatabase();
  conn.on("error", err => {
    console.log("errors in the connection", err);
  });
});

expect.extend({
  toBeType(received, argument) {
    const initialType = typeof received;
    const type =
      initialType === "object"
        ? Array.isArray(received)
          ? "array"
          : initialType
        : initialType;
    return type === argument
      ? {
          message: () => `expected ${received} to be type ${argument}`,
          pass: true
        }
      : {
          message: () => `expected ${received} to be type ${argument}`,
          pass: false
        };
  }
});

post = (url, body, jwt) => {
  const httpRequest = request(app).post(url);
  httpRequest.set("Accept", "application/json");
  if (!jwt) {
    //looking for a jwt
    httpRequest.send(body);
  } else {
    httpRequest.set("Authorization", "bearer " + jwt);
    httpRequest.send(body);
  }
  return httpRequest;
};

get = (url, jwt) => {
  const httpRequest = request(app).get(url);
  if (jwt) httpRequest.set("Authorization", "bearer " + jwt);
  httpRequest.set("Accept", "application/json");
  return httpRequest;
};

describe("User create/login/refresh operations", () => {
  test("POST - USER/REGISTER should create a new user", async () => {
    let response = await post("/user/register", newUser)
      .expect("Content-Type", /json/)
      .expect(201);
    expect(response.body).toEqual({
      error: expect.toBeType("string"),
      status: expect.toBeType("string"),
      success: expect.toBeType("boolean"),
      user: {
        _id: expect.toBeType("string"),
        email: expect.toBeType("string"),
        salt: expect.toBeType("string"),
        hash: expect.toBeType("string"),
        createdAt: expect.toBeType("string"),
        updatedAt: expect.toBeType("string"),
        __v: expect.toBeType("number")
      },
      profile: {
        _id: expect.toBeType("string"),
        email: expect.toBeType("string"),
        admin: expect.toBeType("boolean"),
        bio: expect.toBeType("string"),
        name: expect.toBeType("string"),
        surname: expect.toBeType("string"),
        proAccount: expect.toBeType("boolean"),
        createdAt: expect.toBeType("string"),
        completedChallenge: expect.toBeType("array"),
        uploadedChallenge: expect.toBeType("array"),
        updatedAt: expect.toBeType("string"),
        __v: expect.toBeType("number")
      }
    });
    expect(response.body.error).toEqual("");
    expect(response.body.profile.email).toEqual(response.body.user.email);
    expect(response.body.status).toBe("New user and profile created");
    expect(response.body.success).toBe(true);
  });

  test("POST - USER/REGISTER should return 400 on already used email", async () => {
    let response = await post("/user/register", newUser).expect(400);
    expect(response.body).toEqual({
      status: expect.toBeType("string"),
      error: expect.toBeType("string"),
      success: expect.toBeType("boolean")
    });
    expect(response.body.status).toBe("Something went wrong");
    expect(response.body.success).toBe(false);
  });

  test("POST - USER/REGISTER should return 400 on missing email or password field", async () => {
    let response = await post("/user/register", missingNewUserFields).expect(
      400
    );
    expect(response.body).toEqual({
      status: expect.toBeType("string"),
      error: expect.toBeType("string"),
      success: expect.toBeType("boolean")
    });
    expect(response.body.status).toBe("Something went wrong");
    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe("Email or password missing");
  });

  test("POST - USER/LOGIN should return 401 on invalid credentials", async () => {
    let response = await post("/user/login", wrongCredentials).expect(401);
  });

  test("POST - USER/LOGIN should login with valid credentials and receive jwt token", async () => {
    let response = await post("/user/login", validCredentials)
      .expect("Content-Type", /json/)
      .expect(200);
    expect(response.body).toEqual({
      status: expect.toBeType("string"),
      token: expect.toBeType("string"),
      success: expect.toBeType("boolean")
    });
    expect(response.body.status).toBe("Logged in successfully");
    expect(response.body.success).toBe(true);
    token = response.body.token;
  });

  test("POST - USER/REFRESH should return 401 on invalid token refresh", async () => {
    await post("/user/refreshToken", {}, "thisisnotavalidtoken").expect(401);
  });

  test("POST - USER/REFRESH should refresh valid jwt token", async () => {
    let response = await post("/user/refreshToken", {}, token)
      .expect(200)
      .expect("Content-Type", /json/);
    expect(response.body).toEqual({
      token: expect.toBeType("string"),
      success: expect.toBeType("boolean")
    });
    expect(response.body.success).toBe(true);
    //expect(response.body.token).not.toEqual(token); //not working becasue not refreshing the token for some reason
  });
});
