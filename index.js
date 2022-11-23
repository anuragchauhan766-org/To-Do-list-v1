require("dotenv").config();
const express = require("express");
const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
// const serviceaccount = require("./key.json");

// const serviceaccount = JSON.parse(process.env.PROJECT_DATA);

const app = express();
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
//item array
// let items = [];

// firebase
initializeApp({
  credential: cert({
    type: "service_account",
    project_id: process.env.PROJECT_ID,
    private_key_id: process.env.PROJECT_KEY_ID,
    private_key: process.env.PRIVATE_KEY,
    client_email: process.env.CLIENT_EMAIL,
    client_id: process.env.CLIENT_ID,
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: process.env.CLIENT_CERT_URL,
  }),
});
const db = getFirestore();

async function getdata(list) {
  let items = [];
  const snapshot = await db.collection(list).get();
  snapshot.forEach((doc) => {
    items.push({
      id: doc.id,

      ...doc.data(),
    });
  });
  return items;
}
app.get("/", async (req, res) => {
  const lists = await getdata("todo");

  res.render("list", { listheading: "home", newitem: lists });
});
app.post("/", async (req, res) => {
  // console.log(req.body);
  const item = req.body.newitem;
  const list = req.body.list;
  if (list === "home") {
    await db.collection("todo").add({
      item: item,
    });
    res.redirect("/");
  } else {
    await db.collection(list).add({
      item: item,
    });
    res.redirect("/" + list);
  }
});
app.post("/delete", async (req, res) => {
  const id = req.body.checkbox;
  const list = req.body.listname;
  if (list === "home") {
    await db.collection("todo").doc(id).delete();

    res.redirect("/");
  } else {
    await db.collection(list).doc(id).delete();
    res.redirect("/" + list);
  }
});
//custom list
app.get("/:id", async (req, res) => {
  let listName = req.params.id;
  listName.toLocaleLowerCase;
  const lists = await getdata(listName);
  res.render("list", { listheading: listName, newitem: lists });
});
app.listen(process.env.PORT || 4000, () => {
  console.log("sever is started on port 4000");
});
