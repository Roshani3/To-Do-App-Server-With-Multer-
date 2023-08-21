const express = require("express");
const app = express();
const fs = require("fs");

const multer = require("multer");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static("uploads/"));
const upload = multer({ dest: "uploads/" });

app.use(upload.single("todoimg"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.get("/script.js", (req, res) => {
  res.sendFile(__dirname + "/script.js");
});

app.post("/todo", (req, res) => {
  const inp = req.body.inp;
  const pri = req.body.pri;
  const todoimg = req.file;

  if (!inp || !pri || !todoimg) {
    return res.status(400).send("Bad Request: Missing fields");
  }

  const todo = {
    id: Date.now(),
    inp: inp,
    pri: pri,
    todoimg: todoimg.filename,
    done: "pending",
  };

  saveTodoInFile(todo, function (err, data) {
    if (err) {
      console.error("Error saving todo:", err);
      res.status(500).send("Internal Server Error");
    } else {
      res.status(200).json(data);
    }
  });
});

app.get("/tododata", function (req, res) {
  readAllTodos(function (err, data) {
    if (err) {
      res.status(500).send("Internal Server Error");
      return;
    }
    // res.status(200).send(json.stringify(data));
    res.status(200).json(data);
  });
});

app.put("/todo", function (req, res) {
  console.log(req.body);
  statusUpdate(req, res);
});

app.delete("/todo", function (req, res) {
  console.log(req.body);
  deleteTodoFromList(req, res);
});

app.listen(3000, () => {
  console.log("server started at http://localhost:3000");
});

function readAllTodos(callback) {
  fs.readFile("./new.mp4", "utf-8", function (err, data) {
    if (err) {
      callback(err);
      return;
    }
    if (data === "") {
      data = "[]";
    }
    try {
      data = JSON.parse(data);
      callback(null, data);
    } catch (error) {
      callback(error);
    }
  });
}

function saveTodoInFile(todo, callback) {
  readAllTodos(function (err, data) {
    if (err) {
      callback(err);
      return;
    }
    data.push(todo);

    fs.writeFile("./new.mp4", JSON.stringify(data), function (err) {
      if (err) {
        callback(err);
        return;
      }
      callback(null, todo);
    });
  });
}

function statusUpdate(req, res) {
  readAllTodos(function (err, data) {
    if (err) {
      res.status(500).send("Internal Server Error");
      return;
    }
    const todo = data.find(function (todo) {
      return todo.id === req.body.id;
    });
    if (todo) {
      todo.done = req.body.done;
      fs.writeFile("./new.mp4", JSON.stringify(data), function (err) {
        if (err) {
          res.status(500).send("Internal Server Error");
          return;
        }
        res.status(200).send("Success");
      });
    } else {
      res.status(404).send("Not Found");
    }
  });
}

function deleteTodoFromList(req, res) {
  readAllTodos(function (err, data) {
    if (err) {
      res.status(500).send("Internal Server Error");
      return;
    }
    const todo = data.find(function (todo) {
      return todo.id === req.body.id;
    });
    if (todo) {
      data.splice(data.indexOf(todo), 1);
      fs.writeFile("./new.mp4", JSON.stringify(data), function (err) {
        if (err) {
          res.status(500).send("Internal Server Error");
          return;
        }
        res.status(200).send("Success");
      });
    } else {
      res.status(404).send("Not Found");
    }
  });
}