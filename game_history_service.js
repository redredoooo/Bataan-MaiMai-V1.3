<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MaiMai Bataan</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.socket.io/4.0.1/socket.io.min.js"></script>
    <style>
        /* Monochromatic gradient background */
        body {
            background: linear-gradient(120deg, #000000, #1a1a1a, #333333);
            background-size: 300% 300%;
            animation: gradientMove 10s ease infinite;
        }

        @keyframes gradientMove {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }

        /* Custom animations and effects */
        .fade-in {
            animation: fadeIn 0.5s ease-in-out;
        }

        @keyframes fadeIn {
            from {
                opacity: 0;
            }
            to {
                opacity: 1;
            }
        }

        .hover-scale:hover {
            transform: scale(1.05);
            transition: transform 0.2s ease-in-out;
        }

        .shadow-hover:hover {
            box-shadow: 0 4px 15px rgba(255, 255, 255, 0.2);
            transition: box-shadow 0.2s ease-in-out;
        }

        /* Soft glow effect */
        .soft-glow {
            box-shadow: 0 0 10px rgba(255, 255, 255, 0.2), 0 0 20px rgba(255, 255, 255, 0.1);
            border-radius: 12px;
        }

        .soft-glow:hover {
            box-shadow: 0 0 15px rgba(255, 255, 255, 0.3), 0 0 25px rgba(255, 255, 255, 0.2);
        }

        /* Horizontal scroll styling */
        .scroll-container {
            display: flex;
            overflow-x: hidden;
            gap: 0;
            width: 100%;
            scroll-snap-type: x mandatory;
        }

        .scroll-container::-webkit-scrollbar {
            display: none; /* Hide scrollbar for better mobile experience */
        }

        .scroll-item {
            flex: 0 0 100%; /* Take full width of the container */
            scroll-snap-align: center;
            display: flex;
            justify-content: center;
            align-items: center;
        }

        .scroll-container img {
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
        }

        /* Page transition effects */
        .hidden {
            display: none;
        }

        .fade-in {
            animation: fadeIn 0.5s ease-in-out;
        }

        .fade-out {
            animation: fadeOut 0.5s ease-in-out;
        }

        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
        }
    </style>
</head>
<body class="text-white min-h-screen flex flex-col items-center py-10 px-4">
    <!-- LANDING PAGE -->
    <section id="landing-page" class="fade-in">
        <h1 class="text-4xl font-extrabold mb-6 text-center">Welcome to MaiMai Bataan</h1>
        <div class="w-full max-w-2xl mt-6">
            <h2 class="text-2xl font-semibold mb-4 text-center">Announcements</h2>
            <div class="scroll-container relative">
                <div class="scroll-item">
                    <img src="announcement01.png" alt="Announcement 1" class="w-auto h-auto max-w-full max-h-full object-contain rounded-lg">
                </div>
                <div class="scroll-item">
                    <img src="announcement02.png" alt="Announcement 2" class="w-auto h-auto max-w-full max-h-full object-contain rounded-lg">
                </div>
                <div class="scroll-item">
                    <img src="announcement03.png" alt="Announcement 3" class="w-auto h-auto max-w-full max-h-full object-contain rounded-lg">
                </div>
                <div class="scroll-item">
                    <img src="announcement04.png" alt="Announcement 4" class="w-auto h-auto max-w-full max-h-full object-contain rounded-lg">
                </div>
                <div class="scroll-item">
                    <img src="announcement05.png" alt="Announcement 5" class="w-auto h-auto max-w-full max-h-full object-contain rounded-lg">
                </div>
            </div>
        </div>
        <div class="mt-6 flex flex-col gap-4">
            <button onclick="navigateTo('queue-page')" class="bg-gray-700 hover:bg-gray-600 text-white py-3 px-6 rounded shadow-hover">Queue Page</button>
            <button onclick="navigateTo('history-page')" class="bg-gray-700 hover:bg-gray-600 text-white py-3 px-6 rounded shadow-hover">History Page</button>
            <button onclick="navigateTo('admin-page')" class="bg-gray-700 hover:bg-gray-600 text-white py-3 px-6 rounded shadow-hover">Admin Page</button>
        </div>
    </section>

    <!-- QUEUE PAGE -->
    <section id="queue-page" class="hidden">
        <h1 class="text-4xl font-extrabold mb-6 text-center">Queue Page</h1>
        <div class="w-full max-w-2xl bg-gray-900 p-6 rounded-lg shadow-lg mt-6">
            <h2 class="text-2xl font-semibold mb-4 text-center">Currently Playing</h2>
            <div id="playingList" class="grid grid-cols-1 sm:grid-cols-2 gap-4"></div>
        </div>
        <div class="w-full max-w-2xl bg-gray-900 p-6 rounded-lg shadow-lg mt-6">
            <h2 class="text-2xl font-semibold mb-4 text-center">Current Queue</h2>
            <p class="mb-4 text-gray-400 text-center">Total Queued Players: <span id="queueCount" class="font-bold text-white">0</span></p>
            <div id="queueList" class="grid grid-cols-1 sm:grid-cols-2 gap-4"></div>
        </div>
        <button onclick="navigateTo('landing-page')" class="mt-6 bg-gray-700 hover:bg-gray-600 text-white py-3 px-6 rounded shadow-hover">Back to Landing</button>
    </section>

    <!-- HISTORY PAGE -->
    <section id="history-page" class="hidden">
        <h1 class="text-4xl font-extrabold mb-6 text-center">History Page</h1>
        <div class="w-full max-w-2xl bg-gray-900 p-6 rounded-lg shadow-lg mt-6">
            <h2 class="text-2xl font-semibold mb-4 text-center">Game History</h2>
            <div id="gameHistoryList" class="grid grid-cols-1 gap-4"></div>
        </div>
        <button onclick="navigateTo('landing-page')" class="mt-6 bg-gray-700 hover:bg-gray-600 text-white py-3 px-6 rounded shadow-hover">Back to Landing</button>
    </section>

    <!-- ADMIN PAGE -->
    <section id="admin-page" class="hidden">
        <h1 class="text-4xl font-extrabold mb-6 text-center">Admin Page</h1>
        <div id="admin-login" class="w-full max-w-md">
            <input type="password" id="adminPassword" placeholder="Enter Admin Password" class="p-3 rounded bg-gray-800 text-white w-full mb-4 soft-glow">
            <button onclick="adminLogin()" class="bg-gray-700 hover:bg-gray-600 text-white py-3 px-6 rounded w-full shadow-hover">Admin Login</button>
        </div>
        <div id="admin-controls" class="hidden">
            <button onclick="adminLogout()" class="bg-gray-700 hover:bg-gray-600 text-white py-3 px-6 rounded w-full shadow-hover soft-glow">Logout</button>
            <div class="w-full max-w-2xl bg-gray-900 p-6 rounded-lg shadow-lg mt-6 fade-in soft-glow">
                <h2 class="text-2xl font-semibold mb-4 text-center">Currently Playing</h2>
                <div id="adminPlayingList" class="grid grid-cols-1 sm:grid-cols-2 gap-4"></div>
            </div>
            <div class="w-full max-w-2xl bg-gray-900 p-6 rounded-lg shadow-lg mt-6 fade-in soft-glow">
                <h2 class="text-2xl font-semibold mb-4 text-center">Current Queue</h2>
                <p class="mb-4 text-gray-400 text-center">Total Queued Players: <span id="adminQueueCount" class="font-bold text-white">0</span></p>
                <div id="adminQueueList" class="grid grid-cols-1 sm:grid-cols-2 gap-4"></div>
            </div>
            <div class="mt-6 w-full max-w-2xl fade-in">
                <div class="mb-4">
                    <input type="text" id="playerName" placeholder="Enter player name" class="p-3 rounded bg-gray-800 text-white w-full mb-2 soft-glow">
                    <button onclick="addPlayer()" class="bg-gray-700 hover:bg-gray-600 text-white py-3 px-6 rounded w-full shadow-hover soft-glow">Add Player</button>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                        <input type="number" id="pos1" placeholder="Position 1" class="p-3 rounded bg-gray-800 text-white w-full mb-2 soft-glow">
                        <input type="number" id="pos2" placeholder="Position 2" class="p-3 rounded bg-gray-800 text-white w-full soft-glow">
                    </div>
                    <button onclick="swapPlayers()" class="bg-gray-700 hover:bg-gray-600 text-white py-3 px-6 rounded w-full shadow-hover soft-glow">Swap</button>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                        <input type="number" id="deletePos" placeholder="Position to Delete" class="p-3 rounded bg-gray-800 text-white w-full soft-glow">
                    </div>
                    <button onclick="deletePlayerByPosition()" class="bg-gray-700 hover:bg-gray-600 text-white py-3 px-6 rounded w-full shadow-hover soft-glow">Delete Player</button>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                        <input type="number" id="paidPos" placeholder="Position to Mark Paid" class="p-3 rounded bg-gray-800 text-white w-full soft-glow">
                    </div>
                    <button onclick="markPlayerPaid()" class="bg-gray-700 hover:bg-gray-600 text-white py-3 px-6 rounded w-full shadow-hover soft-glow">Mark Paid</button>
                </div>

                <div class="flex flex-wrap gap-4 justify-center">
                    <button onclick="deleteTopPair()" class="bg-gray-700 hover:bg-gray-600 text-white py-3 px-6 rounded shadow-hover soft-glow">Delete Top Pair</button>
                    <button onclick="nextPairPlaying()" class="bg-gray-700 hover:bg-gray-600 text-white py-3 px-6 rounded shadow-hover soft-glow">Next Pair Playing</button>
                    <button onclick="deleteCurrentlyPlaying()" class="bg-gray-700 hover:bg-gray-600 text-white py-3 px-6 rounded shadow-hover soft-glow">Clear Currently Playing</button>
                    <button onclick="restartBackend()" class="bg-gray-700 hover:bg-gray-600 text-white py-3 px-6 rounded shadow-hover soft-glow">Server Restart</button>
                </div>
            </div>
        </div>
        <button onclick="navigateTo('landing-page')" class="mt-6 bg-gray-700 hover:bg-gray-600 text-white py-3 px-6 rounded shadow-hover">Back to Landing</button>
    </section>

    <script>
        const socket = io("https://bataan-maimai-v1-3.onrender.com");

        function toggleAdminControls(show) {
            document.getElementById('admin-login').classList.toggle('hidden', show);
            document.getElementById('admin-controls').classList.toggle('hidden', !show);
        }

        function adminLogin() {
            const password = document.getElementById('adminPassword').value;
            if (password === 'Nachi') {
                toggleAdminControls(true);
                alert('Admin login successful!');
            } else {
                alert('Incorrect password!');
            }
        }

        function adminLogout() {
            toggleAdminControls(false);
            alert('Logged out successfully!');
        }

        function updateQueueDisplay(queue) {
            const queueList = document.getElementById("queueList");
            const queueCount = document.getElementById("queueCount");
            queueList.innerHTML = queue.map((player, index) =>
                `<div class="p-2 bg-gray-700 rounded text-center">${index + 1}. ${player.name} ${player.paid ? "(Paid)" : "(Unpaid)"}</div>`
            ).join(''); // Ensure player names are displayed
            queueCount.textContent = queue.length;
        }

        function updatePlayingDisplay(playing) {
            const playingList = document.getElementById("playingList");
            playingList.innerHTML = playing.map((player, index) =>
                `<div class="p-2 bg-green-700 rounded text-center">${index + 1}. ${player.name} (Playing)</div>`
            ).join(''); // Ensure currently playing names are displayed
        }

        function addPlayer() {
            const name = document.getElementById("playerName").value.trim();
            if (name) {
                socket.emit("addPlayer", name);
                document.getElementById("playerName").value = "";
            }
        }

        function swapPlayers() {
            socket.emit("swapPlayers", {
                pos1: parseInt(document.getElementById("pos1").value) - 1,
                pos2: parseInt(document.getElementById("pos2").value) - 1
            });
        }

        function deletePlayerByPosition() {
            socket.emit('deletePlayerByPosition', parseInt(document.getElementById('deletePos').value) - 1);
        }

        function markPlayerPaid() {
            socket.emit('markPlayerPaid', parseInt(document.getElementById('paidPos').value) - 1);
        }

        function restartBackend() {
            fetch("https://api.render.com/deploy/srv-cvcdpupu0jms73eqmvag?key=nLT66_CWs3M", { method: "POST" })
            .then(response => alert(response.ok ? "Backend restart triggered!" : "Failed to restart backend."))
            .catch(console.error);
        }

        function deleteTopPair() {
            socket.emit("deleteTopPair");
        }

        function showCurrentPair() {
            socket.emit('getCurrentPair');
        }

        function nextPairPlaying() {
            socket.emit("nextPairPlaying");
        }

        function deleteCurrentlyPlaying() {
            socket.emit("deleteCurrentlyPlaying");
        }

        function restartBackend() {
            fetch("https://api.render.com/deploy/srv-cvcdpupu0jms73eqmvag?key=nLT66_CWs3M", {
                method: "POST"
            })
            .then(response => {
                if (response.ok) {
                    alert("Backend restart triggered!");
                } else {
                    alert("Failed to restart backend.");
                }
            })
            .catch(error => {
                console.error("Error restarting backend:", error);
            });
        }

        // Function to update game history display
        function updateGameHistoryDisplay(history) {
            const gameHistoryList = document.getElementById("gameHistoryList");
            gameHistoryList.innerHTML = "";
            history.forEach((entry, index) => {
                const div = document.createElement("div");
                div.className = "p-2 bg-gray-700 rounded text-center";
                div.textContent = `Game ${index + 1}: ${entry.players.join(" vs ")} - Started at ${new Date(entry.timestamp).toLocaleString()}`;
                gameHistoryList.appendChild(div);
            });
        }
        
        // Listen for game history updates
        socket.on("gameHistoryUpdate", (history) => {
            updateGameHistoryDisplay(history);
        });

        // Request game history when the page loads
        window.onload = function() {
            socket.emit("requestGameHistory");
        };

        socket.on("queueUpdate", (queue) => {
            updateQueueDisplay(queue); // Update queue page
            updateAdminQueueDisplay(queue); // Update admin panel
        });

        socket.on("playingUpdate", (playing) => {
            updatePlayingDisplay(playing); // Update queue page
            updateAdminPlayingDisplay(playing); // Update admin panel
        });

        // Smooth scrolling for announcements with one image per slide
        const scrollContainer = document.querySelector('.scroll-container');
        let currentIndex = 0;

        function scrollToNextSlide() {
            const items = document.querySelectorAll('.scroll-item');
            currentIndex = (currentIndex + 1) % items.length;
            scrollContainer.scrollTo({
                left: items[currentIndex].offsetLeft,
                behavior: 'smooth'
            });
        }

        setInterval(scrollToNextSlide, 3000); // Change slide every 3 seconds

        function navigateTo(pageId) {
            const sections = document.querySelectorAll("section");
            sections.forEach(section => {
                if (section.id === pageId) {
                    section.classList.remove("hidden");
                    section.classList.add("fade-in");
                } else {
                    section.classList.add("hidden");
                    section.classList.remove("fade-in");
                }
            });
        }

        function adminLogin() {
            const password = document.getElementById("adminPassword").value;
            if (password === "Nachi") {
                document.getElementById("admin-login").classList.add("hidden");
                document.getElementById("admin-controls").classList.remove("hidden");
                alert("Admin login successful!");
            } else {
                alert("Incorrect password!");
            }
        }

        // Update Queue Display for Admin Panel
        function updateAdminQueueDisplay(queue) {
            const adminQueueList = document.getElementById("adminQueueList");
            const adminQueueCount = document.getElementById("adminQueueCount");
            adminQueueList.innerHTML = queue.map((player, index) =>
                `<div class="p-2 bg-gray-700 rounded text-center">${index + 1}. ${player.name} ${player.paid ? "(Paid)" : "(Unpaid)"}</div>`
            ).join('');
            adminQueueCount.textContent = queue.length;
        }

        // Update Currently Playing Display for Admin Panel
        function updateAdminPlayingDisplay(playing) {
            const adminPlayingList = document.getElementById("adminPlayingList");
            adminPlayingList.innerHTML = playing.map((player, index) =>
                `<div class="p-2 bg-green-700 rounded text-center">${index + 1}. ${player.name} (Playing)</div>`
            ).join('');
        }
    </script>
</body>
</html>
