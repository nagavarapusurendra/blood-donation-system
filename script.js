// Load donors from localStorage
let donors = JSON.parse(localStorage.getItem("donors")) || [];

// Save donor
function saveDonor(event) {
    event.preventDefault();

    const donor = {
        name: document.getElementById("name").value,
        blood: document.getElementById("blood").value,
        phone: document.getElementById("phone").value
    };

    donors.push(donor);

    // Save permanently
    localStorage.setItem("donors", JSON.stringify(donors));

    alert("Donor added successfully!");

    displayDonors();
}

// Display donors
function displayDonors() {
    const donorList = document.getElementById("donorList");

    if (donorList) {
        donorList.innerHTML = "";

        donors.forEach((d) => {
            donorList.innerHTML += `
                <div>
                    <h3>${d.name}</h3>
                    <p>${d.blood}</p>
                    <p>${d.phone}</p>
                </div>
            `;
        });
    }

    // Update total donors
    const total = document.getElementById("totalDonors");

    if (total) {
        total.innerText = donors.length;
    }
}

// Run automatically when page opens
displayDonors();