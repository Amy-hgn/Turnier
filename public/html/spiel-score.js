document.addEventListener("DOMContentLoaded", async function () {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const turnierId = urlParams.get('turnierId');
        const spielId = urlParams.get('spiel');
        const turnierDetails = await fetchTurnierDetails(turnierId);
        const spielDetails = await fetchSpielDetails(spielId);
        displayTurnierDetails(turnierDetails);
        console.log(spielDetails.team1);
        document.getElementById('team1name').innerText =spielDetails.team1 ? await fetchTeamName(spielDetails.team1) : 'Noch Offen';
        document.getElementById('team2name').innerText =spielDetails.team2 ? await fetchTeamName(spielDetails.team2) : 'Noch Offen';
    } catch (error) {
        console.error("Fehler:", error);
    }
});

    

async function fetchTurnierDetails(turnierId) {
    // Implementieren Sie die Funktion zum Abrufen von Turnierdetails vom Server
    const response = await fetch(`/turnier-ID?id=${turnierId}`);
    const turnierDetails = await response.json();
    return turnierDetails;
}
async function fetchSpielDetails(spielId) {
    const response = await fetch(`/spiel-ID?id=${spielId}`);
    const spielDetails = await response.json();
    return spielDetails;
}
async function fetchTeamName(teamId) {
    // Implementieren Sie die Funktion zum Abrufen des Team-Namens vom Server
    const response = await fetch(`/team-ID?id=${teamId}`);
    const team = await response.json();
    return team.name;}

function displayTurnierDetails(turnierDetails) {
        document.getElementById('turnier-name').innerText = turnierDetails.turnierName;
        document.getElementById('veranstaltungsort').innerText = `${turnierDetails.veranstaltungsort}`;
        document.getElementById('start-datum').innerText = `${formatiereDatum(turnierDetails.startDatum)}`;
}
    // Funktion zum Abrufen der Spielinformationen aus den URL-Parametern
    function getSpielInformationen() {
        const urlParams = new URLSearchParams(window.location.search);
        const spielId = urlParams.get('spiel');
        const turnierId = urlParams.get('turnierId');

        // Annahme: Hier wird eine API aufgerufen, um die Spielinformationen abzurufen
        // Passen Sie dies an Ihre Implementierung an
        fetchSpielDetails(turnierId, spielId)
            .then(spielDetails => {
                // Aktualisieren Sie Ihr HTML mit den Spielinformationen
                // Beispiel: Annahme, dass spielDetails ein Objekt mit den Spielinformationen ist
                console.log('Spielinformationen:', spielDetails);

                // Hier können Sie die Spielinformationen in Ihr HTML einfügen
                // ...
            })
            .catch(error => {
                console.error('Fehler beim Abrufen der Spielinformationen:', error);
            });
    }

    async function updateSpiel(spielData) {
        try {
          const response = await fetch("/api/create-spiel", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(spielData),
          });
      
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
      
          const data = await response.json();
          if (!data._id) {
            throw new Error("Spiel wurde nicht erfolgreich erstellt.");
          }
      
          console.log("Spiel erstellt:", data);
          return data;
        } catch (error) {
          console.error("Fehler beim Erstellen des Spiels:", error);
          alert("Fehler beim Erstellen des Spiels. Bitte versuche es erneut.");
        }
      }

      const ergebnisseAbsendenBtn = document.getElementById('ergebnisse-absenden-btn');
      ergebnisseAbsendenBtn.addEventListener('click', submitErgebnisse);

    async function submitErgebnisse() {
        const team1Ergebnis = document.getElementById('team1-ergebnis').value;
        const team2Ergebnis = document.getElementById('team2-ergebnis').value;
        const urlParams = new URLSearchParams(window.location.search);
        const spielId = urlParams.get('spiel');
        const turnierId = urlParams.get('turnierId');
        const rundeId = urlParams.get('koRundeId');
        const spielDetails = await fetchSpielDetails(spielId);
        console.log('SpielDetails vor dem Update:', spielDetails);
        if (parseInt(team1Ergebnis) > parseInt(team2Ergebnis)){
            spielDetails.punkteGewinner = 1;
        } else if(parseInt(team1Ergebnis) < parseInt(team2Ergebnis)){
            spielDetails.punkteGewinner = 2;
        }else{
            console.log("Die Ergebnisse sind gleich.");
            return;
        }

        spielDetails.spielStatus = 'completed';
        console.log(spielDetails);
        const gameObjekt = { spielDetails, turnierId, rundeId };
        try {
        const response = await fetch("/api/set-game-score", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(gameObjekt),
        });
        if(response.status === 200){console.log("Spiel erfolgreich aktualisiert:", response);
        redirectToTurnierThisTurnier(turnierId);
        }else{alert("Fehler");}
        
        } catch (error) {
            console.error("Fehler beim Updaten des Spiels:", error);
            alert("Fehler beim Updaten des Spiels. Bitte versuche es erneut.");
          }
    }

function redirectToTurnierThisTurnier(turnierId) {
    window.location.href = `/turnier-byID?id=${turnierId}`;
}

    function formatiereDatum(datumString) {
        const wochentage = [
          "Sonntag",
          "Montag",
          "Dienstag",
          "Mittwoch",
          "Donnerstag",
          "Freitag",
          "Samstag",
        ];
        const datum = new Date(datumString);
        const tag = datum.getDate().toString().padStart(2, "0");
        const monatsname = [
          "Januar",
          "Februar",
          "März",
          "April",
          "Mai",
          "Juni",
          "Juli",
          "August",
          "September",
          "Oktober",
          "November",
          "Dezember",
        ][datum.getMonth()];
        const jahr = datum.getFullYear();
        const stunde = datum.getHours().toString().padStart(2, "0");
        const minute = datum.getMinutes().toString().padStart(2, "0");
      
        return `${stunde}:${minute} Uhr ${tag}.${monatsname}.${jahr}`;
      }