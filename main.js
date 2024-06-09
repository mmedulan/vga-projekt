let lives = 10;  // Počet životů hráče
let initialPositions = {};  // Objekt pro uložení počátečních pozic míčků
let reactionTimes = [];  // Pole pro uložení reakcí hráče
let startTime;  // Proměnná pro uložení počátečního času reakce
let globalAverageReactionTime = 999999;  // Proměnná pro globální průměrnou reakční dobu (počáteční hodnota je vysoká)

function startReactionTimer() {
    startTime = Date.now(); // Uloží aktuální čas (v milisekundách) do proměnné startTime pro pozdější výpočet reakční doby.
}

function stopReactionTimer() {
    if (!startTime) return; // Pokud startTime není nastaven (tj. reakční timer nebyl spuštěn), funkce se ukončí.

    let reactionTime = Date.now() - startTime; // Vypočítá reakční dobu jako rozdíl mezi aktuálním časem a startTime.

    reactionTimes.push(reactionTime); // Přidá vypočítanou reakční dobu do pole reactionTimes.

    let lastReactionTimeDisplay = document.querySelector('#lastReactionTimeDisplay'); // Vyhledá prvek pro zobrazení reakční doby.
    lastReactionTimeDisplay.setAttribute('text', 'value', 'Reaction Time: ' + reactionTime.toFixed(2) + 'ms'); // Aktualizuje text v prvku s poslední reakční dobou.

    startTime = null; // Resetuje startTime na null, aby indikoval, že timer není spuštěn.

    console.log("Reaction Time: " + reactionTime + "ms"); // Vypíše reakční dobu do konzole.
    calculateAverageReactionTime(); // Zavolá funkci pro výpočet a zobrazení průměrné reakční doby.
}

function calculateAverageReactionTime() {
    let sum = reactionTimes.reduce((a, b) => a + b, 0); // Sečte všechny hodnoty v poli reactionTimes.
    let avg = sum / reactionTimes.length; // Vypočítá průměrnou reakční dobu jako součet všech hodnot dělený počtem hodnot v poli.
    globalAverageReactionTime = avg;  // Uloží průměrnou reakční dobu do globální proměnné
    let reactionTimeDisplay = document.querySelector('#reactionTimeDisplay'); // Vyhledá prvek pro zobrazení průměrné reakční doby.
    reactionTimeDisplay.setAttribute('text', 'value', 'Average Reaction Time: ' + avg.toFixed(2) + 'ms'); // Aktualizuje text v prvku s průměrnou reakční dobou.

    console.log("Average Reaction Time: " + avg.toFixed(2) + "ms"); // Vypíše průměrnou reakční dobu (zaokrouhlenou na dvě desetinná místa) do konzole.
}

// Funkce pro přidání bodu při zásahu míčku
function addScore(ball) {
    if (ball.hasAttribute('processed')) return;  // Pokud míček již byl zpracován, nic nedělej
    ball.setAttribute('processed', true);  // Nastaví atribut "processed" na míčku

    if (ball.getAttribute('material').color === 'red') {  // Pokud je barva míčku červená
        var hitSoundEntity = document.querySelector('#correctHitSound');  // Vyhledá element se zvukem správného zásahu
        hitSoundEntity.components.sound.playSound();  // Přehrát zvuk správného zásahu

        var scoreboard = document.querySelector('#scoreboard');  // Vyhledá element se skóre
        var score = parseInt(scoreboard.getAttribute('text').value.split(': ')[1]) + 1;  // Zvýší skóre o 1
        scoreboard.setAttribute('text', 'value', 'Score: ' + score);  // Aktualizuje text se skóre

        stopReactionTimer();  // Zastaví měření reakční doby
    } else if (ball.getAttribute('material').color === 'green') {  // Pokud je barva míčku zelená
        var badHitSoundEntity = document.querySelector('#incorrectHitSound');  // Vyhledá element se zvukem špatného zásahu
        badHitSoundEntity.components.sound.playSound();  // Přehrát zvuk špatného zásahu

        lives--;  // Sníží počet životů o 1
        if (lives >= 0) {  // Pokud hráč má stále nějaké životy
            let hearts = document.querySelectorAll('#hearts a-image');  // Vyhledá všechny srdce (ukazatele životů)
            hearts[lives].setAttribute('visible', 'false');  // Skryje jedno srdce
        }
        if (lives === 0) {  // Pokud došly životy
            gameOver();  // Spustí funkci gameOver
        }
    }
    setTimeout(() => ball.removeAttribute('processed'), 500);  // Po 500 ms odstraní atribut "processed" z míčku
}

// Funkce pro náhodné blikání míčku
function flashRandomBall() {
    var balls = document.querySelectorAll('.ball');  // Vyhledá všechny míčky
    var randomIndex = Math.floor(Math.random() * balls.length);  // Vybere náhodný index míčku
    var randomBall = balls[randomIndex];  // Vybere náhodný míček

    // Změna barvy míčku na červenou
    randomBall.setAttribute('material', {
        shader: 'standard',
        metalness: 0.8,
        roughness: 0,
        color: 'red',
        emissive: 'red',
        emissiveIntensity: 5,
        specular: '#FFF'
    });
    randomBall.setAttribute('shadow', 'cast', true);  // Nastaví míček tak, aby vrhal stín
    randomBall.setAttribute('light', {
        type: 'point',
        color: 'red',
        intensity: 2,
        distance: 5,
        decay: 2
    });

    startReactionTimer();  // Spustí měření reakční doby

    // Po krátké chvíli (700 ms) vrátíme barvu zpět na zelenou
    setTimeout(function () {
        randomBall.setAttribute('material', {
            shader: 'standard',
            metalness: 0.8,
            roughness: 0,
            color: 'green',
            emissive: 'green',
            emissiveIntensity: 5,
            specular: '#FFF'
        });
        randomBall.setAttribute('light', {
            type: 'point',
            color: 'green',
            intensity: 2,
            distance: 5,
            decay: 2
        });
    }, 700);
}

// Přidání událostí pro každý míček
document.querySelectorAll('.ball').forEach(function(ball, index) {
    initialPositions[index] = ball.getAttribute('position');  // Uloží počáteční pozici každého míčku
    ball.addEventListener('click', function() { addScore(ball); });  // Přidá událost kliknutí pro každý míček
    ball.addEventListener('grab-start', function() { addScore(ball); });  // Přidá událost uchopení pro každý míček
});

// Přidání kolizních detektorů k rukám
document.querySelectorAll('[hand-controls]').forEach(function(hand) {
    hand.addEventListener('hit', function(evt) {
        var hitEl = evt.detail.el;
        if (hitEl && hitEl.classList.contains('ball')) {  // Pokud kolidující objekt je míček
            hitEl.emit('click');  // Spustí událost kliknutí na míček
        }
    });
});

// Přidání události pro restartovací tlačítko
document.querySelector('#restartButton').addEventListener('click', function() {
    restartGame();  // Spustí funkci restartGame při kliknutí na tlačítko
});

// Funkce pro zobrazení Game Over
function gameOver() {
    document.querySelector('#balls').setAttribute('visible', 'false');  // Skryje všechny míčky
    document.querySelector('#hearts').setAttribute('visible', 'false');  // Skryje všechny srdce
    document.querySelector('#scoreboard').setAttribute('visible', 'false');  // Skryje ukazatel skóre

    var score = document.querySelector('#scoreboard').getAttribute('text').value.split(': ')[1];  // Získá aktuální skóre
    document.querySelector('#gameOver').setAttribute('visible', 'true');  // Zobrazí text "Game Over"
    document.querySelector('#finalScore').setAttribute('text', 'value', 'YOUR SCORE: ' + score);  // Zobrazí konečné skóre
    document.querySelector('#finalScore').setAttribute('visible', 'true');  // Zviditelní konečné skóre

    document.querySelector('#restartButton').setAttribute('visible', 'true');  // Zviditelní tlačítko restartu

    document.querySelector('#reactionTimeDisplay').setAttribute('visible', 'false');  // Zneviditelní průměrný čas reakce
    document.querySelector('#lastReactionTimeDisplay').setAttribute('visible', 'false');  // Zneviditelní poslední reakční čas

    // Aktualizuje a zviditelní prvek pro zobrazení průměrné reakční doby
    let finalAverageReactionTimeDisplay = document.querySelector('#finalAverageReactionTime');
    finalAverageReactionTimeDisplay.setAttribute('text', 'value', 'AVERAGE REACTION TIME: ' + globalAverageReactionTime.toFixed(2) + 'ms');
    finalAverageReactionTimeDisplay.setAttribute('visible', 'true');
}

// Funkce pro restart hry
function restartGame() {
    lives = 10;  // Resetuje počet životů na 10
    document.querySelector('#scoreboard').setAttribute('text', 'value', 'Score: 0');  // Resetuje skóre

    document.querySelector('#balls').setAttribute('visible', 'true');  // Zviditelní všechny míčky
    document.querySelector('#hearts').setAttribute('visible', 'true');  // Zviditelní všechny srdce
    document.querySelector('#scoreboard').setAttribute('visible', 'true');  // Zviditelní ukazatel skóre
    document.querySelector('#leftHand').setAttribute('visible', 'true');  // Zviditelní levou ruku
    document.querySelector('#rightHand').setAttribute('visible', 'true');  // Zviditelní pravou ruku

    document.querySelector('#gameOver').setAttribute('visible', 'false');  // Skryje text "Game Over"
    document.querySelector('#finalScore').setAttribute('visible', 'false');  // Skryje konečné skóre
    document.querySelector('#restartButton').setAttribute('visible', 'false');  // Skryje tlačítko restartu

    document.querySelectorAll('#hearts a-image').forEach(function(heart) {
        heart.setAttribute('visible', 'true');  // Zviditelní všechna srdce (ukazatele životů)
    });
    document.querySelector('#finalAverageReactionTime').setAttribute('visible', 'false');  // Skryje průměrný reakční čas
    document.querySelector('#reactionTimeDisplay').setAttribute('visible', 'true');  // Zneviditelní průměrný čas reakce
    document.querySelector('#lastReactionTimeDisplay').setAttribute('visible', 'true');  // Zneviditelní poslední reakční čas
    reactionTimes = [];
    globalAverageReactionTime = 0;

    document.querySelector('#reactionTimeDisplay').setAttribute('text', 'value', 'Average Reaction Time: 0ms');  // Zneviditelní průměrný čas reakce
    document.querySelector('#lastReactionTimeDisplay').setAttribute('text', 'value', 'Reaction Time: 0ms');  // Zneviditelní poslední reakční čas

}

// Spuštění blikání míčků v náhodných intervalech 1-3 sekundy
function startFlashing() {
    flashRandomBall();  // Spustí funkci pro náhodné blikání míčku
    var randomInterval = Math.floor(Math.random() * 2000) + 1000;  // Nastaví náhodný interval mezi 1 a 3 sekundami
    setTimeout(startFlashing, randomInterval);  // Opakuje funkci startFlashing po náhodném intervalu
}

startFlashing();  // Zahájí blikání míčků

// Funkce pro generování náhodného čísla v rozsahu
function getRandomNumber(min, max) {
    return Math.random() * (max - min) + min;  // Vrátí náhodné číslo v daném rozsahu
}

// Funkce pro uložení počátečních pozic míčků
document.querySelectorAll('.ball').forEach(function(ball, index) {
    initialPositions[index] = ball.getAttribute('position');  // Uloží počáteční pozici každého míčku
});

// Funkce pro nastavení nové náhodné pozice s omezením
function setNewRandomPosition(ball, index) {
    let initialPosition = initialPositions[index];  // Získá počáteční pozici míčku
    let newPosition;
    let isColliding;
    const maxDistance = 0.01; // Maximální vzdálenost, kterou se míček může posunout od své počáteční pozice
    const boundaries = {
        xMin: initialPosition.x - maxDistance,
        xMax: initialPosition.x + maxDistance,
        yMin: initialPosition.y,  //nahoru se nesmí posouvat
        yMax: initialPosition.y,  //nahoru se nesmí posouvat
    };

    do {
        newPosition = {
            x: initialPosition.x + getRandomNumber(-0.1, 0.1),  // Nastaví novou náhodnou pozici v ose X
            y: initialPosition.y + getRandomNumber(-0.1, 0.1),  // Nastaví novou náhodnou pozici v ose Y
            z: initialPosition.z  // Zanechá původní pozici v ose Z
        };

        // Zkontroluje, zda nová pozice nepřekračuje hranice
        if (newPosition.x < boundaries.xMin) newPosition.x = boundaries.xMin;
        if (newPosition.x > boundaries.xMax) newPosition.x = boundaries.xMax;
        if (newPosition.y < boundaries.yMin) newPosition.y = boundaries.yMin;
        if (newPosition.y > boundaries.yMax) newPosition.y = boundaries.yMax;

        isColliding = false;

        document.querySelectorAll('.ball').forEach(otherBall => {
            if (otherBall !== ball) {  // Pokud to není stejný míček
                let otherPosition = otherBall.getAttribute('position');  // Získá pozici jiného míčku
                let distance = Math.sqrt(
                    Math.pow(newPosition.x - otherPosition.x, 2) +
                    Math.pow(newPosition.y - otherPosition.y, 2)
                );

                if (distance < 0.1) {  // Pokud je vzdálenost menší než 0.1 (detekce kolize)
                    isColliding = true;
                }
            }
        });
    } while (isColliding);  // Opakuje, dokud nejsou pozice bez kolize

    ball.setAttribute('animation__position', {
        property: 'position',
        to: `${newPosition.x} ${newPosition.y} ${newPosition.z}`,  // Nastaví novou pozici
        dur: getRandomNumber(2000, 4000),  // Trvání animace mezi 2 a 4 sekundami
        easing: 'easeInOutSine',  // Typ easing animace
        loop: false  // Animace se neopakuje
    });
}

// Přidání plynulých náhodných pohybů k jednotlivým míčkům
document.querySelectorAll('.ball').forEach(function(ball, index) {
    setInterval(function() {
        setNewRandomPosition(ball, index);  // Nastaví novou náhodnou pozici pro každý míček
    }, getRandomNumber(2000, 4000));  // Interval mezi 2 a 4 sekundami
});

// Komponenta pro omezení pohybu
AFRAME.registerComponent('movement-limiter', {
    schema: {
        xmin: {type: 'number', default: -5},
        xmax: {type: 'number', default: 5},
        zmin: {type: 'number', default: -5},
        zmax: {type: 'number', default: 5}
    },
    tick: function () {
        var position = this.el.getAttribute('position');  // Získá aktuální pozici
        if (position.x < this.data.xmin) position.x = this.data.xmin;  // Omezení pohybu v ose X (minimální hodnota)
        if (position.x > this.data.xmax) position.x = this.data.xmax;  // Omezení pohybu v ose X (maximální hodnota)
        if (position.z < this.data.zmin) position.z = this.data.zmin;  // Omezení pohybu v ose Z (minimální hodnota)
        if (position.z > this.data.zmax) position.z = this.data.zmax;  // Omezení pohybu v ose Z (maximální hodnota)
        this.el.setAttribute('position', position);  // Nastaví novou pozici
    }
});

// Komponenta pro ovládání pohybu pomocí palcových joysticků na ovladačích Oculus Touch
AFRAME.registerComponent('oculus-thumbstick-controls', {
    schema: {
        acceleration: { default: 45 },  // Rychlost zrychlení
        rigSelector: { default: "#cameraRig" },  // Selektor pro hlavní entitu kamery
        fly: { default: false },  // Povoluje létání (nejen pohyb po zemi)
        controllerOriented: { default: false },  // Použití orientace ovladače pro pohyb
        adAxis: { default: 'x' },  // Osa pro pohyb vlevo/vpravo
        wsAxis: { default: 'z' },  // Osa pro pohyb vpřed/vzad
        enabled: { default: true },  // Povolit/zakázat komponentu
        adEnabled: { default: true },  // Povolit/zakázat pohyb vlevo/vpravo
        adInverted: { default: false },  // Inverze osy vlevo/vpravo
        wsEnabled: { default: true },  // Povolit/zakázat pohyb vpřed/vzad
        wsInverted: { default: false }  // Inverze osy vpřed/vzad
    },
    init: function () {
        this.easing = 1.1;  // Koeficient pro plynulé zpomalení
        this.velocity = new THREE.Vector3(0, 0, 0);  // Vektor pro uložení aktuální rychlosti
        this.tsData = new THREE.Vector2(0, 0);  // Vektor pro uložení dat z joysticku
        this.el.addEventListener('axismove', this.onAxisMove.bind(this));  // Přidání event listeneru pro pohyb joysticku
    },
    onAxisMove: function (event) {
        const axis = event.detail.axis;
        const cameraRig = document.querySelector(this.data.rigSelector);

        if (event.target.components['oculus-touch-controls'].data.hand === 'left') {
            cameraRig.object3D.position.x += axis[2] * 0.01; // Pohyb vlevo/vpravo
            cameraRig.object3D.position.z += axis[3] * 0.01; // Pohyb vpřed/vzad
        }

        if (event.target.components['oculus-touch-controls'].data.hand === 'right') {
            cameraRig.object3D.rotation.y -= axis[2] * 0.01; // Otáčení
        }
    }
});

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[oculus-touch-controls]').forEach(el => {
        el.setAttribute('oculus-thumbstick-controls', '');  // Přidání komponenty oculus-thumbstick-controls pro každý ovladač
    });
});

// Přidání události pro tlačítko A na levém ovladači pro restart hry
document.querySelector('[oculus-touch-controls="hand: left"]').addEventListener('abuttondown', function(evt) {
    restartGame();
});

// Přidání události pro tlačítko A na pravém ovladači pro restart hry
document.querySelector('[oculus-touch-controls="hand: right"]').addEventListener('abuttondown', function(evt) {
    restartGame();
});
