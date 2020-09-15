const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const util = require("util");

app.use(express.static("./client"));

//app.use(express.static('../../public_html/blockland/v3'));
app.get("/", function (req, res) {
  res.sendFile(__dirname + "/client/index.html");
});

const nsp = io.of("/");

nsp.on("connection", function (socket) {
  socket.userData = { x: 0, y: 0, z: 0, heading: 0 }; //Default values;

  socket.on("new room", function (room) {
    if (room === null) {
      room = "frat";
    } else {
      const nsp = io.of("/");
      var bit = 0;
      var check = room;
      while (true) {
        try {
          const rooms = nsp.adapter.rooms[check + bit];
          if (Object.keys(rooms.sockets).length <= 6) {
            //check = check + bit;
            //console.log("check final", check+bit);
            break;
          } else {
            bit = bit + 1;
            //console.log("increment", bit);
          }
        } catch (e) {
          e = "";
          //console.log("error");
          //check = room + bit;
          break;
        }
      }
    }
    check = room + bit;
    //console.warn("erfreferf", check);
    socket.room = check;
    socket.join(check);
    io.emit("rooms", getRooms("new room"));
  });

  io.to(socket.id).emit("setId", { id: socket.id });

  socket.on("disconnect", function () {
    socket.broadcast.emit("deletePlayer", { id: socket.id });
  });

  setInterval(function () {
    try {
      const nsp = io.of("/");
      let pack = [];
      const room = nsp.adapter.rooms[socket.room];
      for (let id in room.sockets) {
        const socket = nsp.connected[id];
        //Only push sockets that have been initialised

        if (socket.userData.model !== undefined) {
          pack.push({
            id: socket.id,
            model: socket.userData.model,
            colour: socket.userData.colour,
            x: socket.userData.x,
            y: socket.userData.y,
            z: socket.userData.z,
            heading: socket.userData.heading,
            pb: socket.userData.pb,
            action: socket.userData.action,
          });
        }
      }
      if (pack.length > 0) io.in(socket.room).emit("remoteData", pack);
    } catch (e) {
      //console.log(e);
      e = "";
    }
  }, 40);

  socket.on("init", function (data) {
    //io.in(socket.room).emit('setId', { id: socket.id });
    socket.userData.model = data.model;
    socket.userData.colour = data.colour;
    socket.userData.x = data.x;
    socket.userData.y = data.y;
    socket.userData.z = data.z;
    socket.userData.heading = data.h;
    (socket.userData.pb = data.pb), (socket.userData.action = "Idle");
    //console.log(room,nsp.adapter.rooms);
    /*
		try {
			for (let id in room.sockets) {
				const socket = nsp.connected[id];
				//Only push sockets that have been initialised
				if (socket.userData.model !== undefined) {
					pack.push({
						id: socket.id,
						model: socket.userData.model,
						colour: socket.userData.colour,
						x: socket.userData.x,
						y: socket.userData.y,
						z: socket.userData.z,
						heading: socket.userData.heading,
						pb: socket.userData.pb,
						action: socket.userData.action
					});
				}
			}

			console.log(pack);
			if (pack.length > 0) {
				io.in(socket.room).emit('remoteData', pack);
			}
		}
		catch(e)
		{
			console.log(e);
		}
		*/
  });

  socket.on("update", function (data) {
    socket.userData.x = data.x;
    socket.userData.y = data.y;
    socket.userData.z = data.z;
    socket.userData.heading = data.h;
    (socket.userData.pb = data.pb), (socket.userData.action = data.action);
    /*
		const nsp = io.of('/');
		const room = nsp.adapter.rooms[socket.room];
		console.log(room, nsp.adapter.rooms);
		let pack = [];
		try {
			for (let id in room.sockets) {
				const socket = nsp.connected[id];
				//Only push sockets that have been initialised
				if (socket.userData.model !== undefined) {
					pack.push({
						id: socket.id,
						model: socket.userData.model,
						colour: socket.userData.colour,
						x: socket.userData.x,
						y: socket.userData.y,
						z: socket.userData.z,
						heading: socket.userData.heading,
						pb: socket.userData.pb,
						action: socket.userData.action
					});
				}
			}

			console.log(pack);
			if (pack.length > 0) {
				io.in(socket.room).emit('remoteData', pack);
			}
	}
	catch(e)
		{
			console.log(e);
		}
		*/
  });

  socket.on("chat message", function (data) {
    io.to(data.id).emit("chat message", {
      id: socket.id,
      message: data.message,
    });
  });
});
const port = process.env.PORT || 8080;
http.listen(port, function () {
  console.log("listening on *:", port);
});

function getRooms(msg) {
  const nsp = io.of("/");
  const rooms = nsp.adapter.rooms;
  const list = {};

  for (let roomId in rooms) {
    const room = rooms[roomId];
    if (room === undefined) continue;
    const sockets = [];
    let roomName = "";
    //console.log('getRooms room>>' + util.inspect(room));

    try {
      for (let socketId in room.sockets) {
        const socket = nsp.connected[socketId];
        if (
          socket === undefined ||
          socket.username === undefined ||
          socket.room === undefined
        )
          continue;
        //console.log(`getRooms socket(${socketId})>>${socket.username}:${socket.room}`);
        sockets.push(socket.username);
        if (roomName == "") roomName = socket.room;
      }
      if (roomName != "") list[roomName] = sockets;
    } catch (e) {
      //console.log(e);
      e = "";
    }
  }

  return list;
}

/*
setInterval(function () {
	const nsp = io.of('/');
	let pack = [];

	for (let id in io.sockets.sockets) {
		const socket = nsp.connected[id];
		//Only push sockets that have been initialised
		if (socket.userData.model !== undefined) {
			pack.push({
				id: socket.id,
				model: socket.userData.model,
				colour: socket.userData.colour,
				x: socket.userData.x,
				y: socket.userData.y,
				z: socket.userData.z,
				heading: socket.userData.heading,
				pb: socket.userData.pb,
				action: socket.userData.action
			});
		}
	}
	if (pack.length > 0) io.emit('remoteData', pack);
}, 40);
*/
