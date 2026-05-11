// inventory.js - Module voor inventarisbeheer in Infinite IKEA app

// Karakter data
const characterData = [
    { id: "bob", name: "Böb", img: "BOB_Bob.png" },
    { id: "carl", name: "Cärl", img: "CARL_Carl.png" },
    { id: "danny", name: "Dänny", img: "DANNY_Danny.png" },
    { id: "peter", name: "Pëter", img: "Peter_Peter.png" }
];

// Item definities
const groteItems = ["hamer", "schroevendraaier"];
const kleineItems = ["schroef", "houteding", "imbus"];

// Tiers voor elke kaart (prob: waarschijnlijkheid)
const witteTiers = [
    { tier: 1, prob: 0.25 }, // 2 kleine
    { tier: 2, prob: 0.5 },  // 1 groot + 3 kleine
    { tier: 3, prob: 0.25 }  // 2 grote + 4 kleine
];

const zwarteTiers = [
    { tier: 1, prob: 0.4 },  // 2 kleine
    { tier: 2, prob: 0.35 }, // 1 groot + 2 kleine
    { tier: 3, prob: 0.25 }  // 1 groot + 3 kleine
];

const kollegaTiers = [
    { tier: 1, prob: 0.5 }, // 3 grote + 4 kleine
    { tier: 2, prob: 0.5 }  // 3 grote + 5 kleine
];

// Inventaris object
let inventory = {
    hamer: 0,
    schroevendraaier: 0,
    schroef: 0,
    houteding: 0,
    imbus: 0
};

// Huidig karakter
let currentCharacter = null;

// DOM elementen
const elAvatar = document.querySelector('#avatar');
const elName = document.querySelector('#playerName');
const popup = document.querySelector('#popup');
const popupTitle = document.querySelector('#popup-title');
const popupItems = document.querySelector('#popup-items');
const popupButton = document.querySelector('#popup-button');

// Laad karakter uit URL
function loadCharacter() {
    const params = new URLSearchParams(document.location.search);
    const charId = params.get("character");
    currentCharacter = characterData.find(({ id }) => id === charId);
    if (currentCharacter) {
        elAvatar.src = "../Beelden/" + currentCharacter.img;
        elName.innerHTML = currentCharacter.name;
    }
}

// Laad inventaris uit localStorage
function loadInventory() {
    const key = `inventory_${currentCharacter.id}`;
    const stored = localStorage.getItem(key);
    if (stored) {
        inventory = JSON.parse(stored);
    }
    updateDisplay();
}

// Sla inventaris op in localStorage
function saveInventory() {
    const key = `inventory_${currentCharacter.id}`;
    localStorage.setItem(key, JSON.stringify(inventory));
}

// Update de weergave van aantallen
function updateDisplay() {
    document.querySelector('#hamer_amount').textContent = inventory.hamer;
    document.querySelector('#schroevendraaier_amount').textContent = inventory.schroevendraaier;
    document.querySelector('#schroef_amount').textContent = inventory.schroef;
    document.querySelector('#houteding_amount').textContent = inventory.houteding;
    document.querySelector('#imbus_amount').textContent = inventory.imbus;
}

// Kies random tier gebaseerd op waarschijnlijkheden
function chooseTier(tiers) {
    const rand = Math.random();
    let cumulative = 0;
    for (const t of tiers) {
        cumulative += t.prob;
        if (rand <= cumulative) {
            return t.tier;
        }
    }
    return tiers[tiers.length - 1].tier; // fallback
}

// Genereer lijst items gebaseerd op tier en type (add/remove)
function generateItems(tier, type, isAdd) {
    let items = [];
    if (type === 'witte') {
        if (tier === 1) {
            items = pickRandom(kleineItems, 2);
        } else if (tier === 2) {
            items = [pickRandom(groteItems, 1)[0], ...pickRandom(kleineItems, 3)];
        } else if (tier === 3) {
            items = [...pickRandom(groteItems, 2), ...pickRandom(kleineItems, 4)];
        }
    } else if (type === 'zwarte') {
        if (tier === 1) {
            items = pickRandom(kleineItems, 2);
        } else if (tier === 2) {
            items = [pickRandom(groteItems, 1)[0], ...pickRandom(kleineItems, 2)];
        } else if (tier === 3) {
            items = [pickRandom(groteItems, 1)[0], ...pickRandom(kleineItems, 3)];
        }
    } else if (type === 'kollega') {
        if (tier === 1) {
            items = [...pickRandom(groteItems, 3), ...pickRandom(kleineItems, 4)];
        } else if (tier === 2) {
            items = [...pickRandom(groteItems, 3), ...pickRandom(kleineItems, 5)];
        }
    }
    return items;
}

// Helper: Pick random items uit array, met duplicates indien nodig
function pickRandom(arr, count) {
    const result = [];
    for (let i = 0; i < count; i++) {
        result.push(arr[Math.floor(Math.random() * arr.length)]);
    }
    return result;
}

// Controleer of genoeg items zijn voor verwijdering
function hasEnoughItems(items) {
    const count = {};
    items.forEach(item => {
        count[item] = (count[item] || 0) + 1;
    });
    for (const item in count) {
        if (inventory[item] < count[item]) {
            return false;
        }
    }
    return true;
}

// Helper: Animeer item tekst met random letters
function animateItemText(li, finalText) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const duration = 600;
    const steps = 20;
    const stepDuration = duration / steps;
    let currentStep = 0;

    li.classList.add('animating');
    
    const interval = setInterval(() => {
        if (currentStep < steps) {
            let displayText = '';
            for (let i = 0; i < finalText.length; i++) {
                // Gradueeel meer letters revealen
                if (i < (currentStep / steps) * finalText.length) {
                    displayText += finalText[i];
                } else {
                    displayText += chars[Math.floor(Math.random() * chars.length)];
                }
            }
            li.textContent = displayText;
            currentStep++;
        } else {
            li.textContent = finalText;
            li.classList.remove('animating');
            clearInterval(interval);
        }
    }, stepDuration);
}

// Toon popup met items
function showPopup(items, buttonText, title) {
    popupTitle.textContent = title;
    popupItems.innerHTML = '';
    popup.classList.remove('hidden');
    
    items.forEach((item, index) => {
        const li = document.createElement('li');
        const finalText = item.charAt(0).toUpperCase() + item.slice(1);
        
        // Stagger animatie: elke item start iets later
        setTimeout(() => {
            popupItems.appendChild(li);
            animateItemText(li, finalText);
        }, index * 200);
    });
    
    popupButton.textContent = buttonText;
}

// Verberg popup
function hidePopup() {
    popup.classList.add('hidden');
}

// Update inventaris
function updateInventory(items, isAdd) {
    items.forEach(item => {
        if (isAdd) {
            inventory[item]++;
        } else {
            inventory[item]--;
        }
    });
    saveInventory();
    updateDisplay();
}

// Event listeners
document.querySelector('#Wittekaart').addEventListener('click', () => {
    const tier = chooseTier(witteTiers);
    const items = generateItems(tier, 'witte', true);
    showPopup(items, 'Toevoegen', 'Gevonden Items');
    popupButton.onclick = () => {
        updateInventory(items, true);
        hidePopup();
    };
});

document.querySelector('#Zwartekaart').addEventListener('click', () => {
    const tier = chooseTier(zwarteTiers);
    const items = generateItems(tier, 'zwarte', false);
    if (!hasEnoughItems(items)) {
        showPopup(['Niet genoeg items om obstakel te overwinnen'], 'Probeer volgende ronde opnieuw', 'Uh-oh');
        popupButton.onclick = () => hidePopup();
        return;
    }
    showPopup(items, 'Gebruiken', 'Te Verwijderen Items');
    popupButton.onclick = () => {
        updateInventory(items, false);
        hidePopup();
    };
});

document.querySelector('#Monster').addEventListener('click', () => {
    const tier = chooseTier(kollegaTiers);
    const items = generateItems(tier, 'kollega', false);
    if (!hasEnoughItems(items)) {
        showPopup(['Niet genoeg items!'], 'Vlucht!', 'Oh nee, niet genoeg!');
        popupButton.onclick = () => hidePopup();
        return;
    }
    showPopup(items, 'Vechten!', 'Te Verwijderen Items');
    popupButton.onclick = () => {
        updateInventory(items, false);
        hidePopup();
    };
});

// Init
loadCharacter();
loadInventory();