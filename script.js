/*********
 * ROLE HELPER
 *********/
function getUserRole() {
    return localStorage.getItem("USER_ROLE");
}

/*********
 * GLOBAL
 *********/
let chart = null;

/*********
 * ROLE BASED UI
 *********/
function applyRoleUI() {

    const role = getUserRole();

    // DONOR VIEW
    if (role === "donor") {

        document.querySelector(".dashboard")?.remove();

        document.getElementById("searchBloodGroup")?.remove();

        document.getElementById("donorTable")?.remove();

        // Hide emergency button
        document.querySelectorAll(".donate-btn").forEach(btn => {

            if (btn.innerText.includes("Emergency")) {
                btn.remove();
            }

        });
    }

    // ADMIN VIEW
    if (role === "admin") {

        document.getElementById("donorForm")?.remove();
    }
}

/*********
 * MESSAGE HANDLER
 *********/
function showMessage(text, type) {

    const box = document.getElementById("messageBox");

    if (!box) return;

    box.className = type;

    box.innerText = text;

    setTimeout(() => {

        box.innerText = "";

        box.className = "";

    }, 3000);
}

/*********
 * REGISTER DONOR
 *********/
const donorForm = document.getElementById("donorForm");

donorForm?.addEventListener("submit", function (e) {

    e.preventDefault();

    const donor = {

        name: document.getElementById("name").value.trim(),

        age: document.getElementById("age").value,

        bloodGroup: document.getElementById("bloodGroup").value,

        city: document.getElementById("city").value.trim(),

        phone: document.getElementById("phone").value.trim(),

        email: document.getElementById("email").value.trim(),

        status: "Available"
    };

    // VALIDATION
    if (
        !donor.name ||
        !donor.age ||
        !donor.bloodGroup ||
        !donor.city ||
        !donor.phone ||
        !donor.email
    ) {

        showMessage("❌ Please fill all fields", "error");

        return;
    }

    // GET EXISTING DONORS
    const donors = JSON.parse(localStorage.getItem("donors")) || [];

    // ADD NEW DONOR
    donors.push(donor);

    // SAVE DONORS
    localStorage.setItem("donors", JSON.stringify(donors));

    // RESET FORM
    this.reset();

    showMessage("✅ Donor registered successfully", "success");

    refreshAdminUI();
});

/*********
 * DISPLAY DONORS
 *********/
function displayDonors(filter = "") {

    const table = document.getElementById("donorTable");

    const donorList = document.getElementById("donorList");

    if (!table) return;

    const tbody = table.querySelector("tbody");

    tbody.innerHTML = "";

    if (donorList) {
        donorList.innerHTML = "";
    }

    let donors = JSON.parse(localStorage.getItem("donors")) || [];

    // FILTER BLOOD GROUP
    if (filter) {

        donors = donors.filter(d => d.bloodGroup === filter);
    }

    // NO DONORS
    if (donors.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="6">No donors found.</td>
            </tr>
        `;

        return;
    }

    // DISPLAY DONORS
    donors.forEach((d, i) => {

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${d.name}</td>

            <td>${d.age}</td>

            <td>${d.bloodGroup}</td>

            <td>${d.city}</td>

            <td>
                <strong class="${
                    d.status === "Available"
                    ? "status-available"
                    : "status-unavailable"
                }">
                    ${d.status}
                </strong>

                <br><br>

                📞 ${d.phone}

                <br>

                <a href="https://wa.me/91${d.phone}" target="_blank">
                    💬 WhatsApp
                </a>

                <br>

                <a href="mailto:${d.email}">
                    📧 Email
                </a>
            </td>

            <td>

                <button onclick="toggleStatus(${i})">
                    Toggle
                </button>

                <br><br>

                <button class="delete-btn" onclick="deleteDonor(${i})">
                    Delete
                </button>

            </td>
        `;

        tbody.appendChild(row);

        // SAVED DONOR RECORDS
        if (donorList) {

            donorList.innerHTML += `

                <div class="card">

                    <h3>${d.name}</h3>

                    <p><b>Age:</b> ${d.age}</p>

                    <p><b>Blood Group:</b> ${d.bloodGroup}</p>

                    <p><b>City:</b> ${d.city}</p>

                    <p><b>Phone:</b> ${d.phone}</p>

                    <p><b>Email:</b> ${d.email}</p>

                    <p><b>Status:</b> ${d.status}</p>

                </div>

                <br>
            `;
        }
    });
}

/*********
 * TOGGLE STATUS
 *********/
function toggleStatus(index) {

    if (getUserRole() !== "admin") return;

    const donors = JSON.parse(localStorage.getItem("donors")) || [];

    donors[index].status =
        donors[index].status === "Available"
        ? "Not Available"
        : "Available";

    localStorage.setItem("donors", JSON.stringify(donors));

    refreshAdminUI();
}

/*********
 * DELETE DONOR
 *********/
function deleteDonor(index) {

    if (getUserRole() !== "admin") return;

    if (!confirm("Are you sure?")) return;

    const donors = JSON.parse(localStorage.getItem("donors")) || [];

    donors.splice(index, 1);

    localStorage.setItem("donors", JSON.stringify(donors));

    showMessage("❌ Donor deleted", "error");

    refreshAdminUI();
}

/*********
 * SEARCH DONORS
 *********/
function searchDonors() {

    const select = document.getElementById("searchBloodGroup");

    if (!select) return;

    displayDonors(select.value);
}

/*********
 * DASHBOARD
 *********/
function updateDashboard() {

    const total = document.getElementById("totalDonors");

    const list = document.getElementById("bloodStats");

    if (!total || !list) return;

    const donors = JSON.parse(localStorage.getItem("donors")) || [];

    total.innerText = donors.length;

    const stats = {};

    donors.forEach(d => {

        stats[d.bloodGroup] =
            (stats[d.bloodGroup] || 0) + 1;
    });

    list.innerHTML = "";

    Object.keys(stats).forEach(group => {

        const li = document.createElement("li");

        li.innerText = `${group} : ${stats[group]}`;

        list.appendChild(li);
    });
}

/*********
 * CHART
 *********/
function updateChart() {

    const canvas = document.getElementById("bloodChart");

    if (!canvas || typeof Chart === "undefined") return;

    const donors = JSON.parse(localStorage.getItem("donors")) || [];

    const counts = {};

    donors.forEach(d => {

        counts[d.bloodGroup] =
            (counts[d.bloodGroup] || 0) + 1;
    });

    if (chart) {
        chart.destroy();
    }

    chart = new Chart(canvas, {

        type: "pie",

        data: {

            labels: Object.keys(counts),

            datasets: [{

                data: Object.values(counts),

                backgroundColor: [
                    "#e53935",
                    "#1e88e5",
                    "#43a047",
                    "#fbc02d",
                    "#8e24aa",
                    "#fb8c00"
                ]
            }]
        }
    });
}

/*********
 * EMERGENCY ALERT
 *********/
function sendEmergencyAlert() {

    if (getUserRole() !== "admin") return;

    const donors = JSON.parse(localStorage.getItem("donors")) || [];

    const available =
        donors.filter(d => d.status === "Available");

    if (!available.length) {

        alert("No available donors.");

        return;
    }

    window.open(
        `mailto:${available.map(d => d.email).join(",")}`
    );

    window.open(
        `https://wa.me/91${available[0].phone}`,
        "_blank"
    );
}

/*********
 * REFRESH UI
 *********/
function refreshAdminUI() {

    displayDonors();

    updateDashboard();

    updateChart();
}

/*********
 * LOGOUT ADMIN
 *********/
function logoutAdmin() {

    // REMOVE ONLY LOGIN SESSION
    localStorage.removeItem("USER_ROLE");

    localStorage.removeItem("ADMIN_EMAIL");

    // DONOR DATA WILL STAY SAFE
    window.location.href = "admin-login.html";
}

/*********
 * LOAD
 *********/
window.addEventListener("load", () => {

    applyRoleUI();

    refreshAdminUI();
});