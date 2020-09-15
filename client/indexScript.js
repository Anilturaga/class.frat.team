
	const firebaseConfig = {
		apiKey: "AIzaSyA_9vMyUjwZ_jW4Ns5OHtCfani6JEZ96gk",
		authDomain: "fir-rtc-926a7.firebaseapp.com",
		databaseURL: "https://fir-rtc-926a7.firebaseio.com",
		projectId: "fir-rtc-926a7",
		storageBucket: "fir-rtc-926a7.appspot.com",
		messagingSenderId: "144707184991",
		appId: "1:144707184991:web:09998d930d448166776eea",
		measurementId: "G-JXS9N4TYGH"
	};
	// Initialize Firebase
	firebase.initializeApp(firebaseConfig);

	const urlParams = new URLSearchParams(window.location.search);
	if (urlParams.get("c") === null || urlParams.get("r") === null || urlParams.get("w") === null || urlParams.get("j") === null || urlParams.get("u") === null || urlParams.get("roll") === null) {
		if (localStorage.className === undefined || localStorage.roomID === undefined || localStorage.whiteboard === undefined || localStorage.jitsi === undefined || localStorage.username === undefined || localStorage.roll === undefined) {
			console.log("/////////////*************************")
			console.log(localStorage.c, urlParams.get("c"), urlParams.get("r"), urlParams.get("w"), urlParams.get("j"), urlParams.get("u"), urlParams.get("roll"))
			//window.location.replace("https://frat.team/join.html");
		}
	} else {
		localStorage.setItem("className", urlParams.get("c"));
		localStorage.setItem("roomID", urlParams.get("r"));
		localStorage.setItem("whiteboard", urlParams.get("w"));
		localStorage.setItem("jitsi", urlParams.get("j"));
		console.log("hey", localStorage.jitsi)
		localStorage.setItem("username", urlParams.get("u"));
		localStorage.setItem("roll", urlParams.get("roll"));
		localStorage.att = 0
		console.log(typeof (localStorage.roomID))
		console.log("////////-----------------------")
	}
	console.log(localStorage.className)
	

	var USER_CRED, quizFormBit, attIntervalListener
	var reloadBit = "none"
	var db = firebase.firestore();
	const player = document.getElementById('player');
	const canvas = document.getElementById('canvas');
	const context = canvas.getContext('2d');
	//ctx = canvas.getContext('2d');
	//ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
	const constraints = {
		video: true,
	};
	firebase.auth().onAuthStateChanged(function (user) {
		if (user) {
			USER_CRED = user;
			//alert("hey guy")
			console.log(localStorage.username, "{{{{{{{{{{{{{{{{{")
			api.executeCommand('displayName', localStorage.getItem("username"));
			//email = user.email;
			//photoUrl = user.photoURL;;


		} else {
			//alert("Dwight, get out of my nook")
			firebase
				.auth()
				.signInAnonymously()
				.catch(function (error) {
					console.log("error");
					// Handle Errors here.
					var errorCode = error.code;
					var errorMessage = error.message;
					// ...
				});
			//window.location.replace("/join.html");
		}
	});
    /*
    window.addEventListener('beforeunload', function (e) {
        localStorage.removeItem("roomID");
        localStorage.removeItem("className");
        localStorage.removeItem("jitsi");
        localStorage.removeItem("whiteboard");
        localStorage.removeItem("username");
        localStorage.removeItem("roll");
        e.preventDefault();
        e.returnValue = '';
	});*/

	//FIX THIS
	var clientHeight = document.documentElement.scrollHeight - 100;
	document.getElementById("view-source").style.display = "none"
	db.collection("rooms").doc(localStorage.getItem("roomID"))
		.onSnapshot(function (snapshot) {
			console.log("|||||||||||||||||||||||||||||||||||||||||||||||||", snapshot.data())
			//quizFormBit
			try {
				var form = snapshot.data().quizForm
				console.log("try", form)
				if (form === undefined) {
					document.getElementById("view-source").style.display = "none"
				} else {
					document.getElementById("view-source").href = form
					document.getElementById("view-source").style.display = "block"
				}
			} catch (e) {
				console.log("not yet form", e)
			}
			try {
				var startClass = snapshot.data().startClass
				if (startClass === false) {
					console.log("class not started")
					if (reloadBit === "none") {

					}
					if (reloadBit === true) {
						var uName = Math.floor(Math.random() * 10000).toString();

						console.log("Sending in attendance", localStorage.att, localStorage.getItem("roomID"))
						db.collection("rooms")
							.doc(localStorage.getItem("roomID"))
							.collection("meta")
							.doc("attendance")
							.set(
								{
									[uName]: { username: localStorage.getItem("username"), roll: localStorage.getItem("roll"), att: localStorage.att },
								},
								{ merge: true }
							)
							.then(function () {
								console.log("db success")
								localStorage.att = 0;
							})
							.catch(function (error) {
								console.error("Error writing document: ", error);
								res.send({ status: 2 });
							});
						window.clearInterval(attIntervalListener)

					}
				} else if (startClass === true) {
					reloadBit = true
					attIntervalListener = setInterval(smartAttendance, 3000);

					//document.getElementById("view-source1").style.display = "none"
					//document.getElementById("view-source2").style.display = "block"
				}
			} catch (e) {
				console.log("not yet")
			}
		});
	setTimeout(function () {
		const domain = 'meet.jit.si';
		const options = {
			roomName: localStorage.getItem("jitsi"),
			height: clientHeight,
			parentNode: document.querySelector('#meet'),
			configOverwrite: { startWithAudioMuted: true, startWithVideoMuted: true, disableDeepLinking: true },
			interfaceConfigOverwrite: {
				TOOLBAR_BUTTONS: [
					'microphone', 'fullscreen',
					'fodeviceselection', 'profile', 'chat', 'settings', 'raisehand',
					'videoquality'
				],
				DEFAULT_BACKGROUND: 'white',
				MOBILE_APP_PROMO: false, HIDE_INVITE_MORE_HEADER: true, SHOW_CHROME_EXTENSION_BANNER: false,
				DEFAULT_REMOTE_DISPLAY_NAME: 'Student', DISPLAY_WELCOME_PAGE_CONTENT: false, ENABLE_DIAL_OUT: false,

			},
		};
		console.log(localStorage.jitsi, "bye")
		const api = new JitsiMeetExternalAPI(domain, options);
		document.getElementById('jitsiConferenceFrame0').allow = "microphone"
		//document.getElementById('jitsiConferenceFrame0').style.overflow = "none"
	}, 3000)
	var d1 = document.getElementById("whiteboard");
	d1.insertAdjacentHTML(
		"beforeend", '<iframe id="wbo" width="100%" height="' + clientHeight + '" src="https://wbo.ophir.dev/boards/' + localStorage.getItem("whiteboard") + '" title="whiteboard">')
	document.getElementById("wbo").seamless = true;
	function conductQuizFunction() {
		var x = document.getElementById("professsion").value;
		var cityRef = db.collection("rooms").doc(localStorage.getItem("roomID"));
		var setWithMerge = cityRef.set({
			quizForm: x
		}, { merge: true });

	}
	setTimeout(function () {
		document.getElementById("overlay").style.width = "35%";
		document.getElementById("overlay").style.height = "100%";
		console.log("Overlay enabled", document.getElementById("overlay").style.width, document.getElementById("whiteboard").style.width)
	}, 7000)

	function hideQuizButton() {
		document.getElementById("view-source").style.display = "none"
	}
	function smartAttendance() {
		console.log("7777777777777777777777777777777777777777777777777777777")
		context.drawImage(player, 0, 0, canvas.width, canvas.height);
		main();
	}
	navigator.mediaDevices.getUserMedia(constraints)
		.then((stream) => {
			player.srcObject = stream;
		}).catch(e => {
			console.log("Can't access camera bro")
		});
	async function main() {
		// Load the model.
		const model = await blazeface.load();
		const returnTensors = false; // Pass in `true` to get tensors back, rather than values.
		const predictions = await model.estimateFaces(document.getElementById('canvas'), returnTensors);
		console.log(localStorage.att, "predictions")

		if (predictions.length > 0) {
			if (document.visibilityState == "visible") {
				localStorage.att = Number(localStorage.att) + 1;
			}
			console.log(localStorage.att, "predictions")
		}
	}