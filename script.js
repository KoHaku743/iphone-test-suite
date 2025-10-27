// Test state management
const testResults = {};
let currentTest = null;

// Utility functions
function showStatus(elementId, message, type = "info") {
  const element = document.getElementById(elementId);
  if (element) {
    element.textContent = message;
    element.className = `sensor-status show ${type}`;
  }
}

function updateTestResult(testName, passed) {
  testResults[testName] = passed;
  updateSummary();
}

function updateSummary() {
  const summaryContent = document.getElementById("summary-content");
  const total = Object.keys(testResults).length;
  const passed = Object.values(testResults).filter((r) => r).length;
  const failed = total - passed;

  if (total === 0) {
    summaryContent.innerHTML = "<p>Spusti testy pre zobrazenie výsledkov</p>";
    return;
  }

  summaryContent.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; text-align: center;">
            <div>
                <div style="font-size: 2rem; font-weight: bold; color: var(--primary-color);">${total}</div>
                <div style="color: var(--text-secondary);">Celkom</div>
            </div>
            <div>
                <div style="font-size: 2rem; font-weight: bold; color: var(--success-color);">${passed}</div>
                <div style="color: var(--text-secondary);">Úspešné</div>
            </div>
            <div>
                <div style="font-size: 2rem; font-weight: bold; color: var(--danger-color);">${failed}</div>
                <div style="color: var(--text-secondary);">Neúspešné</div>
            </div>
        </div>
    `;
}

function resetAllTests() {
  if (confirm("Naozaj chceš resetovať všetky testy?")) {
    Object.keys(testResults).forEach((key) => delete testResults[key]);
    updateSummary();

    // Clear all status displays
    document.querySelectorAll(".sensor-status").forEach((el) => {
      el.classList.remove("show");
    });

    alert("Všetky testy boli resetované");
  }
}

// Modal functions
function openModal(content) {
  const modal = document.getElementById("test-modal");
  const modalBody = document.getElementById("modal-body");
  modalBody.innerHTML = content;
  modal.classList.add("show");
}

function closeModal() {
  const modal = document.getElementById("test-modal");
  modal.classList.remove("show");

  // Clean up any active streams
  if (currentTest) {
    if (currentTest.stream) {
      currentTest.stream.getTracks().forEach((track) => track.stop());
    }
    currentTest = null;
  }
}

// LCD Tests
function startLCDTest() {
  const colors = [
    "#FFFFFF",
    "#000000",
    "#FF0000",
    "#00FF00",
    "#0000FF",
    "#FFFF00",
    "#FF00FF",
    "#00FFFF",
  ];
  let currentColorIndex = 0;

  const content = `
        <div class="lcd-test-screen" id="lcd-screen" style="background: ${colors[0]};">
            <div class="lcd-controls">
                <button onclick="changeLCDColor(-1)">◀ Predošlá</button>
                <button onclick="changeLCDColor(1)">Ďalšia ▶</button>
                <button onclick="completeLCDTest(true)">✓ V poriadku</button>
                <button onclick="completeLCDTest(false)">✗ Problém</button>
            </div>
        </div>
    `;

  openModal(content);

  window.changeLCDColor = (direction) => {
    currentColorIndex =
      (currentColorIndex + direction + colors.length) % colors.length;
    document.getElementById("lcd-screen").style.background =
      colors[currentColorIndex];
  };

  window.completeLCDTest = (passed) => {
    updateTestResult("lcd", passed);
    closeModal();
    alert(passed ? "LCD test úspešný! ✓" : "LCD test zistil problém ✗");
  };
}

function startCornerTest() {
  const content = `
        <div class="lcd-test-screen" style="background: white; color: black;">
            <div style="position: absolute; top: 20px; left: 20px; width: 40px; height: 40px; background: red; border-radius: 50%;"></div>
            <div style="position: absolute; top: 20px; right: 20px; width: 40px; height: 40px; background: green; border-radius: 50%;"></div>
            <div style="position: absolute; bottom: 80px; left: 20px; width: 40px; height: 40px; background: blue; border-radius: 50%;"></div>
            <div style="position: absolute; bottom: 80px; right: 20px; width: 40px; height: 40px; background: yellow; border-radius: 50%;"></div>
            <div style="text-align: center;">
                <h2>Skontroluj všetky 4 rohy</h2>
                <p style="margin: 20px;">Vidíš všetky farebné kruhy v rohoch?</p>
            </div>
            <div class="lcd-controls">
                <button onclick="completeCornerTest(true)">✓ Áno, všetky vidím</button>
                <button onclick="completeCornerTest(false)">✗ Problém</button>
            </div>
        </div>
    `;

  openModal(content);

  window.completeCornerTest = (passed) => {
    updateTestResult("corners", passed);
    closeModal();
  };
}

function startSpotTest() {
  alert(
    "Pozorne si prezri displej pri bielom pozadí. Hľadaj škvrny, škrabance alebo iné poškodenia."
  );
  const passed = confirm("Je displej bez viditeľných škrtov a škvrn?");
  updateTestResult("spots", passed);
}

// Touch Tests
function startTouchTest() {
  const content = `
        <canvas id="touch-canvas"></canvas>
        <div class="touch-instructions">
            Ťahaj prstom/prstami po celej obrazovke<br>
            Otestuj multi-touch (viac prstov naraz)
        </div>
    `;

  openModal(content);

  setTimeout(() => {
    const canvas = document.getElementById("touch-canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const touches = new Map();
    const colors = [
      "#FF6B6B",
      "#4ECDC4",
      "#45B7D1",
      "#FFA07A",
      "#98D8C8",
      "#F7DC6F",
    ];

    function drawTouch(x, y, id) {
      ctx.fillStyle = colors[id % colors.length];
      ctx.beginPath();
      ctx.arc(x, y, 30, 0, Math.PI * 2);
      ctx.fill();
    }

    canvas.addEventListener("touchstart", (e) => {
      e.preventDefault();
      for (let touch of e.changedTouches) {
        touches.set(touch.identifier, { x: touch.clientX, y: touch.clientY });
        drawTouch(touch.clientX, touch.clientY, touch.identifier);
      }
    });

    canvas.addEventListener("touchmove", (e) => {
      e.preventDefault();
      for (let touch of e.changedTouches) {
        drawTouch(touch.clientX, touch.clientY, touch.identifier);
      }
    });

    canvas.addEventListener("touchend", (e) => {
      e.preventDefault();
      for (let touch of e.changedTouches) {
        touches.delete(touch.identifier);
      }

      if (touches.size === 0) {
        setTimeout(() => {
          const passed = confirm("Fungoval dotyk na celej obrazovke?");
          updateTestResult("touch", passed);
          closeModal();
        }, 500);
      }
    });
  }, 100);
}

function start3DTouchTest() {
  if ("ontouchforcechange" in window) {
    alert("3D Touch detekovaný! Skús stlačiť obrazovku s rôznou silou.");
    const content = `
            <div class="gyro-test">
                <h2>3D Touch Test</h2>
                <div id="force-indicator" style="width: 200px; height: 200px; background: var(--primary-color); border-radius: 50%; transition: transform 0.1s;"></div>
                <p>Stlač obrazovku s rôznou silou</p>
                <div id="force-value" style="font-size: 2rem; font-weight: bold;">0%</div>
                <button onclick="complete3DTouchTest(true)">✓ Funguje</button>
                <button onclick="complete3DTouchTest(false)">✗ Nefunguje</button>
            </div>
        `;
    openModal(content);

    const indicator = document.getElementById("force-indicator");
    const valueDisplay = document.getElementById("force-value");

    document.addEventListener("touchforcechange", (e) => {
      const force = e.touches[0].force;
      const scale = 1 + force;
      indicator.style.transform = `scale(${scale})`;
      valueDisplay.textContent = `${Math.round(force * 100)}%`;
    });
  } else {
    alert(
      "3D Touch není na tomto zařízení k dispozici. Zkus Haptic Touch - dlouhé stlačení."
    );
    updateTestResult("3dtouch", null);
  }

  window.complete3DTouchTest = (passed) => {
    updateTestResult("3dtouch", passed);
    closeModal();
  };
}

function checkDisplayFeatures() {
  const info = `
        <div style="padding: 40px;">
            <h2>TrueTone & NightShift</h2>
            <p style="margin: 20px 0;">
                TrueTone a NightShift sa testujú v Nastavenia:
            </p>
            <ol style="text-align: left; margin: 20px; line-height: 2;">
                <li>Otvor <strong>Nastavenia > Displej a jas</strong></li>
                <li>Skontroluj či je <strong>True Tone</strong> prepínateľný</li>
                <li>Skontroluj či je <strong>Night Shift</strong> dostupný</li>
            </ol>
            <button onclick="completeDisplayTest(true)" style="margin: 10px; padding: 15px 30px; background: var(--success-color); border: none; border-radius: 12px; color: white; font-size: 1rem;">✓ Oboje funguje</button>
            <button onclick="completeDisplayTest(false)" style="margin: 10px; padding: 15px 30px; background: var(--danger-color); border: none; border-radius: 12px; color: white; font-size: 1rem;">✗ Problém</button>
        </div>
    `;
  openModal(info);

  window.completeDisplayTest = (passed) => {
    updateTestResult("display-features", passed);
    closeModal();
  };
}

// Audio Tests
function testTopSpeaker() {
  const content = `
    <div style="padding: 40px; text-align: center;">
      <h2>🔊 Horný reproduktor (Earpiece)</h2>
      <p style="margin: 20px 0;">
        Tento reproduktor sa používa pri telefonovaní.<br>
        Priloži telefón k uchu ako pri hovore.
      </p>
      
      <div id="top-speaker-visual" style="width: 150px; height: 150px; background: var(--primary-color); 
           border-radius: 50%; margin: 30px auto; display: flex; align-items: center; 
           justify-content: center; font-size: 3rem;">
        🎵
      </div>
      
      <div id="volume-bars" style="display: flex; gap: 5px; justify-content: center; margin: 20px 0; height: 60px; align-items: flex-end;">
        ${Array.from(
          { length: 10 },
          (_, i) => `
          <div style="width: 20px; background: var(--primary-color); border-radius: 3px; 
               transition: height 0.1s; height: ${(i + 1) * 10}%;" 
               class="volume-bar"></div>
        `
        ).join("")}
      </div>
      
      <button onclick="playTopSpeaker()" 
              style="margin: 10px; padding: 20px 40px; background: var(--success-color); 
                     border: none; border-radius: 12px; color: white; font-size: 1.1rem; font-weight: 600;">
        ▶ Prehrať zvuk
      </button>
      <button onclick="stopTopSpeaker()" 
              style="margin: 10px; padding: 20px 40px; background: var(--danger-color); 
                     border: none; border-radius: 12px; color: white; font-size: 1.1rem; font-weight: 600;">
        ⏹ Zastaviť
      </button>
      
      <div id="top-speaker-status" style="margin: 20px 0; padding: 15px; background: rgba(255,255,255,0.1); border-radius: 8px; font-size: 1.1rem;">
        Stlač tlačidlo ▶ Prehrať zvuk
      </div>
      
      <div style="margin-top: 30px;">
        <p style="margin: 10px 0;">Počuješ zvuk cez horný reproduktor?</p>
        <button onclick="completeTopSpeakerTest(true)" 
                style="margin: 10px; padding: 15px 30px; background: var(--success-color); 
                       border: none; border-radius: 12px; color: white; font-size: 1rem;">
          ✓ Áno, počujem
        </button>
        <button onclick="completeTopSpeakerTest(false)" 
                style="margin: 10px; padding: 15px 30px; background: var(--danger-color); 
                       border: none; border-radius: 12px; color: white; font-size: 1rem;">
          ✗ Nepočujem / Slabý zvuk
        </button>
      </div>
    </div>
  `;

  openModal(content);

  let audioContext = null;
  let oscillator = null;
  let gainNode = null;

  window.playTopSpeaker = async () => {
    try {
      // Stop any existing audio first
      window.stopTopSpeaker();

      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) {
        alert("Web Audio API nie je podporované v tomto prehliadači");
        return;
      }

      audioContext = new AudioContext();

      // Critical for iOS Safari - must resume in user gesture
      if (audioContext.state === "suspended") {
        await audioContext.resume();
      }

      // iOS Safari: Create a silent buffer first to "unlock" audio
      const buffer = audioContext.createBuffer(1, 1, 22050);
      const source = audioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContext.destination);
      source.start(0);

      // Wait for unlock
      await new Promise((resolve) => setTimeout(resolve, 100));

      oscillator = audioContext.createOscillator();
      gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // 1000Hz tone for earpiece - MAX volume
      oscillator.frequency.value = 1000;
      oscillator.type = "sine";

      // Set gain immediately for Safari
      gainNode.gain.value = 1.0;

      // Start oscillator
      oscillator.start(0);

      // Animate volume bars
      animateVolumeBars();

      const visual = document.getElementById("top-speaker-visual");
      if (visual) {
        visual.style.transform = "scale(1.2)";
        visual.style.background = "var(--success-color)";
      }

      // Show playing status without alert (alert breaks iOS audio!)
      const statusDiv = document.getElementById("top-speaker-status");
      if (statusDiv) {
        statusDiv.innerHTML =
          '<strong style="color: var(--success-color);">▶ PREHRÁVA SA - Prilož k uchu!</strong><br><small>Zvýš hlasitosť tlačidlami na boku!</small>';
      }

      console.log(
        "Top speaker audio started successfully",
        "Context state:",
        audioContext.state
      );
    } catch (error) {
      console.error("Top speaker error:", error);
      const statusDiv = document.getElementById("top-speaker-status");
      if (statusDiv) {
        statusDiv.innerHTML = `<strong style="color: var(--danger-color);">❌ Chyba: ${error.message}</strong>`;
      }
    }
  };

  window.stopTopSpeaker = () => {
    try {
      if (oscillator) {
        try {
          oscillator.stop();
          oscillator.disconnect();
        } catch (e) {
          console.log("Oscillator already stopped");
        }
        oscillator = null;
      }
      if (gainNode) {
        try {
          gainNode.disconnect();
        } catch (e) {
          console.log("Gain node already disconnected");
        }
        gainNode = null;
      }
      if (audioContext) {
        audioContext.close();
        audioContext = null;
      }
      const visual = document.getElementById("top-speaker-visual");
      if (visual) {
        visual.style.transform = "scale(1)";
        visual.style.background = "var(--primary-color)";
      }
      stopVolumeBars();
    } catch (error) {
      console.error("Error stopping top speaker:", error);
    }
  };

  function animateVolumeBars() {
    const bars = document.querySelectorAll(".volume-bar");
    let interval = setInterval(() => {
      if (!oscillator) {
        clearInterval(interval);
        return;
      }
      bars.forEach((bar, i) => {
        const randomHeight = Math.random() * 100;
        bar.style.height = randomHeight + "%";
      });
    }, 100);
  }

  function stopVolumeBars() {
    const bars = document.querySelectorAll(".volume-bar");
    bars.forEach((bar, i) => {
      bar.style.height = (i + 1) * 10 + "%";
    });
  }

  window.completeTopSpeakerTest = (passed) => {
    window.stopTopSpeaker();
    updateTestResult("speaker-top", passed);
    closeModal();
  };

  // Auto cleanup on modal close
  const originalClose = window.closeModal;
  window.closeModal = function () {
    window.stopTopSpeaker();
    originalClose();
    window.closeModal = originalClose;
  };
}

function testBottomSpeaker() {
  const content = `
    <div style="padding: 40px; text-align: center;">
      <h2>🔊 Dolný reproduktor (Stereo)</h2>
      <p style="margin: 20px 0;">
        Tento reproduktor sa používa pre médiá a zvonenie.<br>
        Zvýš hlasitosť na maximum!
      </p>
      
      <div id="bottom-speaker-visual" style="width: 150px; height: 150px; background: var(--primary-color); 
           border-radius: 50%; margin: 30px auto; display: flex; align-items: center; 
           justify-content: center; font-size: 3rem;">
        🔈
      </div>
      
      <div id="volume-bars-bottom" style="display: flex; gap: 5px; justify-content: center; margin: 20px 0; height: 80px; align-items: flex-end;">
        ${Array.from(
          { length: 15 },
          (_, i) => `
          <div style="width: 15px; background: var(--primary-color); border-radius: 3px; 
               transition: height 0.1s; height: ${(i + 1) * 6}%;" 
               class="volume-bar-bottom"></div>
        `
        ).join("")}
      </div>
      
      <div style="margin: 20px 0;">
        <label for="freq-slider" style="display: block; margin-bottom: 10px;">
          Frekvencia: <span id="freq-value">440</span> Hz
        </label>
        <input type="range" id="freq-slider" min="200" max="2000" value="440" 
               style="width: 80%; max-width: 400px;" 
               onchange="updateFrequency(this.value)">
      </div>
      
      <button onclick="playBottomSpeaker()" 
              style="margin: 10px; padding: 20px 40px; background: var(--success-color); 
                     border: none; border-radius: 12px; color: white; font-size: 1.1rem; font-weight: 600;">
        ▶ Prehrať zvuk
      </button>
      <button onclick="stopBottomSpeaker()" 
              style="margin: 10px; padding: 20px 40px; background: var(--danger-color); 
                     border: none; border-radius: 12px; color: white; font-size: 1.1rem; font-weight: 600;">
        ⏹ Zastaviť
      </button>
      
      <div id="bottom-speaker-status" style="margin: 20px 0; padding: 15px; background: rgba(255,255,255,0.1); border-radius: 8px; font-size: 1.1rem;">
        Stlač tlačidlo ▶ Prehrať zvuk
      </div>
      
      <div style="margin-top: 30px;">
        <p style="margin: 10px 0;">Počuješ hlasný, čistý zvuk?</p>
        <button onclick="completeBottomSpeakerTest(true)" 
                style="margin: 10px; padding: 15px 30px; background: var(--success-color); 
                       border: none; border-radius: 12px; color: white; font-size: 1rem;">
          ✓ Áno, hlasný a čistý
        </button>
        <button onclick="completeBottomSpeakerTest(false)" 
                style="margin: 10px; padding: 15px 30px; background: var(--danger-color); 
                       border: none; border-radius: 12px; color: white; font-size: 1rem;">
          ✗ Slabý / Praskanie / Ticho
        </button>
      </div>
    </div>
  `;

  openModal(content);

  let audioContext = null;
  let oscillator = null;
  let gainNode = null;
  let currentFreq = 440;

  window.updateFrequency = (freq) => {
    currentFreq = freq;
    document.getElementById("freq-value").textContent = freq;
    if (oscillator) {
      oscillator.frequency.value = freq;
    }
  };

  window.playBottomSpeaker = async () => {
    try {
      // Stop any existing audio first
      window.stopBottomSpeaker();

      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) {
        alert("Web Audio API nie je podporované v tomto prehliadači");
        return;
      }

      audioContext = new AudioContext();

      // Critical for iOS Safari - must resume in user gesture
      if (audioContext.state === "suspended") {
        await audioContext.resume();
      }

      // iOS Safari: Create a silent buffer first to "unlock" audio
      const buffer = audioContext.createBuffer(1, 1, 22050);
      const source = audioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContext.destination);
      source.start(0);

      // Wait for unlock
      await new Promise((resolve) => setTimeout(resolve, 100));

      oscillator = audioContext.createOscillator();
      gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = currentFreq;
      oscillator.type = "sine";

      // Set gain immediately for Safari
      gainNode.gain.value = 1.0;

      // Start oscillator
      oscillator.start(0);

      // Animate volume bars
      animateVolumeBars();

      const visual = document.getElementById("bottom-speaker-visual");
      if (visual) {
        visual.style.transform = "scale(1.2)";
        visual.style.background = "var(--success-color)";
        visual.innerHTML = "🔊";
      }

      // Show playing status without alert (alert breaks iOS audio!)
      const statusDiv = document.getElementById("bottom-speaker-status");
      if (statusDiv) {
        statusDiv.innerHTML = `<strong style="color: var(--success-color);">▶ PREHRÁVA SA ${currentFreq}Hz</strong><br><small>Zvýš hlasitosť tlačidlami na boku!</small>`;
      }

      console.log(
        "Bottom speaker audio started successfully",
        "Context state:",
        audioContext.state
      );
    } catch (error) {
      console.error("Bottom speaker error:", error);
      const statusDiv = document.getElementById("bottom-speaker-status");
      if (statusDiv) {
        statusDiv.innerHTML = `<strong style="color: var(--danger-color);">❌ Chyba: ${error.message}</strong>`;
      }
    }
  };

  window.stopBottomSpeaker = () => {
    try {
      if (oscillator) {
        try {
          oscillator.stop();
          oscillator.disconnect();
        } catch (e) {
          console.log("Oscillator already stopped");
        }
        oscillator = null;
      }
      if (gainNode) {
        try {
          gainNode.disconnect();
        } catch (e) {
          console.log("Gain node already disconnected");
        }
        gainNode = null;
      }
      if (audioContext) {
        audioContext.close();
        audioContext = null;
      }
      const visual = document.getElementById("bottom-speaker-visual");
      if (visual) {
        visual.style.transform = "scale(1)";
        visual.style.background = "var(--primary-color)";
        visual.innerHTML = "🔈";
      }
      stopVolumeBars();
    } catch (error) {
      console.error("Error stopping bottom speaker:", error);
    }
  };

  function animateVolumeBars() {
    const bars = document.querySelectorAll(".volume-bar-bottom");
    let interval = setInterval(() => {
      if (!oscillator) {
        clearInterval(interval);
        return;
      }
      bars.forEach((bar, i) => {
        const randomHeight = 20 + Math.random() * 80;
        bar.style.height = randomHeight + "%";
        bar.style.background = `hsl(${200 + randomHeight}, 70%, 50%)`;
      });
    }, 50);
  }

  function stopVolumeBars() {
    const bars = document.querySelectorAll(".volume-bar-bottom");
    bars.forEach((bar, i) => {
      bar.style.height = (i + 1) * 6 + "%";
      bar.style.background = "var(--primary-color)";
    });
  }

  window.completeBottomSpeakerTest = (passed) => {
    window.stopBottomSpeaker();
    updateTestResult("speaker-bottom", passed);
    closeModal();
  };

  // Auto cleanup on modal close
  const originalClose = window.closeModal;
  window.closeModal = function () {
    window.stopBottomSpeaker();
    originalClose();
    window.closeModal = originalClose;
  };
}

function testMicrophone() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    alert("Mikrofón API nie je podporované v tomto prehliadači");
    return;
  }

  const content = `
    <div style="padding: 40px; text-align: center;">
      <h2>🎤 Test mikrofónu</h2>
      <p style="margin: 20px 0;">
        Nahraj svoju správu a potom si ju prehraj
      </p>
      
      <div id="mic-visual" style="width: 150px; height: 150px; background: var(--danger-color); 
           border-radius: 50%; margin: 30px auto; display: flex; align-items: center; 
           justify-content: center; font-size: 3rem;">
        🎤
      </div>
      
      <div id="waveform" style="display: flex; gap: 3px; justify-content: center; margin: 20px 0; height: 100px; align-items: center;">
        ${Array.from(
          { length: 30 },
          () => `
          <div style="width: 6px; background: var(--danger-color); border-radius: 3px; 
               transition: height 0.05s; height: 5px;" 
               class="wave-bar"></div>
        `
        ).join("")}
      </div>
      
      <div id="timer" style="font-size: 2rem; font-weight: bold; color: var(--danger-color); margin: 20px 0;">
        00:00
      </div>
      
      <div id="recording-controls">
        <button onclick="startRecording()" 
                style="margin: 10px; padding: 20px 40px; background: var(--danger-color); 
                       border: none; border-radius: 12px; color: white; font-size: 1.1rem; font-weight: 600;">
          ⏺ Začať nahrávanie
        </button>
      </div>
      
      <div id="playback-area" style="display: none; margin-top: 30px;">
        <h3>Nahrávka dokončená!</h3>
        <audio id="playback-audio" controls style="width: 100%; max-width: 400px; margin: 20px 0;"></audio>
        
        <div>
          <button onclick="completeMicTest(true)" 
                  style="margin: 10px; padding: 15px 30px; background: var(--success-color); 
                         border: none; border-radius: 12px; color: white; font-size: 1rem;">
            ✓ Mikrofón funguje dobre
          </button>
          <button onclick="completeMicTest(false)" 
                  style="margin: 10px; padding: 15px 30px; background: var(--danger-color); 
                         border: none; border-radius: 12px; color: white; font-size: 1rem;">
            ✗ Slabý / Šum / Nefunguje
          </button>
        </div>
      </div>
    </div>
  `;

  openModal(content);

  let mediaRecorder = null;
  let audioChunks = [];
  let stream = null;
  let recordingTime = 0;
  let timerInterval = null;
  let audioContext = null;
  let analyser = null;
  let animationFrame = null;

  window.startRecording = () => {
    navigator.mediaDevices
      .getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      })
      .then((audioStream) => {
        stream = audioStream;

        // Use audio/mp4 for better iOS compatibility
        const options = { mimeType: "audio/webm" };

        // Try different formats for iOS compatibility
        if (MediaRecorder.isTypeSupported("audio/mp4")) {
          options.mimeType = "audio/mp4";
        } else if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
          options.mimeType = "audio/webm;codecs=opus";
        } else if (MediaRecorder.isTypeSupported("audio/ogg;codecs=opus")) {
          options.mimeType = "audio/ogg;codecs=opus";
        }

        try {
          mediaRecorder = new MediaRecorder(stream, options);
        } catch (e) {
          // Fallback without options
          mediaRecorder = new MediaRecorder(stream);
        }

        audioChunks = [];

        // Setup audio analysis for waveform
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioContext = new AudioContext();
        const source = audioContext.createMediaStreamSource(stream);
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 64;
        source.connect(analyser);

        visualizeAudio();

        mediaRecorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            audioChunks.push(e.data);
          }
        };

        mediaRecorder.onstop = () => {
          // Determine the correct MIME type
          let mimeType = mediaRecorder.mimeType || "audio/webm";

          const blob = new Blob(audioChunks, { type: mimeType });
          const audioURL = URL.createObjectURL(blob);

          const audioElement = document.getElementById("playback-audio");
          if (audioElement) {
            audioElement.src = audioURL;
            audioElement.load(); // Force reload

            // Show success message
            alert("Nahrávka dokončená! Klikni na PLAY tlačidlo pre prehratie.");
          }

          document.getElementById("playback-area").style.display = "block";
          document.getElementById("recording-controls").style.display = "none";

          // Stop visualization
          if (animationFrame) {
            cancelAnimationFrame(animationFrame);
          }
          if (audioContext) {
            audioContext.close();
          }

          const visual = document.getElementById("mic-visual");
          if (visual) {
            visual.style.background = "var(--success-color)";
            visual.innerHTML = "✓";
            visual.style.animation = "none";
          }

          stream.getTracks().forEach((track) => track.stop());
        };

        mediaRecorder.onerror = (event) => {
          console.error("MediaRecorder error:", event.error);
          alert("Chyba nahrávaniа: " + event.error);
        };

        // Start recording with timeslice for better compatibility
        mediaRecorder.start(100);

        const visual = document.getElementById("mic-visual");
        if (visual) {
          visual.style.animation = "pulse 1s ease-in-out infinite";
        }

        // Update timer
        recordingTime = 0;
        timerInterval = setInterval(() => {
          recordingTime++;
          const minutes = Math.floor(recordingTime / 60)
            .toString()
            .padStart(2, "0");
          const seconds = (recordingTime % 60).toString().padStart(2, "0");
          const timerEl = document.getElementById("timer");
          if (timerEl) {
            timerEl.textContent = `${minutes}:${seconds}`;
          }

          // Auto-stop after 10 seconds
          if (recordingTime >= 10) {
            window.stopRecording();
          }
        }, 1000);

        document.getElementById("recording-controls").innerHTML = `
          <p style="color: var(--success-color); margin: 10px;">⏺ NAHRÁVAM... Povedz niečo!</p>
          <button onclick="stopRecording()" 
                  style="margin: 10px; padding: 20px 40px; background: var(--danger-color); 
                         border: none; border-radius: 12px; color: white; font-size: 1.1rem; font-weight: 600;">
            ⏹ Zastaviť nahrávanie
          </button>
        `;
      })
      .catch((error) => {
        alert(
          "Chyba prístupu k mikrofónu: " +
            error.message +
            "\n\nUisti sa, že si povolil prístup k mikrofónu v nastaveniach Safari."
        );
        closeModal();
      });
  };

  window.stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
      clearInterval(timerInterval);
    }
  };

  function visualizeAudio() {
    if (!analyser) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const bars = document.querySelectorAll(".wave-bar");

    function draw() {
      animationFrame = requestAnimationFrame(draw);

      analyser.getByteFrequencyData(dataArray);

      bars.forEach((bar, i) => {
        const index = Math.floor((i * bufferLength) / bars.length);
        const value = dataArray[index];
        const height = (value / 255) * 100;
        bar.style.height = Math.max(5, height) + "px";
        bar.style.background = `hsl(${height * 1.2}, 70%, 50%)`;
      });
    }

    draw();
  }

  window.completeMicTest = (passed) => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    if (timerInterval) {
      clearInterval(timerInterval);
    }
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
    }
    if (audioContext) {
      audioContext.close();
    }
    updateTestResult("microphone", passed);
    closeModal();
  };
}

// Camera Tests
function testRearCamera() {
  testCamera("environment", "rear-camera", "Zadná kamera");
}

function testFrontCamera() {
  testCamera("user", "front-camera", "Predná kamera");
}

function testCamera(facingMode, testName, title) {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    alert("Kamera API nie je podporované");
    return;
  }

  const content = `
        <div style="width: 100%; height: 100vh; background: black; position: relative;">
            <video id="camera-view" autoplay playsinline></video>
            <div class="camera-controls">
                <button onclick="completeCameraTest('${testName}', true)">✓</button>
                <button onclick="completeCameraTest('${testName}', false)">✗</button>
            </div>
            <div style="position: fixed; top: 20px; left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.7); padding: 15px; border-radius: 12px; color: white;">
                ${title} - Funguje ostrenie a obraz?
            </div>
        </div>
    `;

  openModal(content);

  setTimeout(() => {
    const video = document.getElementById("camera-view");

    navigator.mediaDevices
      .getUserMedia({
        video: { facingMode: facingMode },
      })
      .then((stream) => {
        currentTest = { stream };
        video.srcObject = stream;
      })
      .catch((error) => {
        alert("Chyba prístupu ku kamere: " + error.message);
        updateTestResult(testName, false);
        closeModal();
      });
  }, 100);

  window.completeCameraTest = (name, passed) => {
    updateTestResult(name, passed);
    closeModal();
  };
}

// Sensor Tests
function testProximity() {
  // Safari/iOS has NO API access to the proximity sensor
  // The ONLY way to test it is during an actual phone call
  showStatus(
    "proximity-status",
    "⚠️ Web prehliadače nemajú prístup k proximity senzoru.\nJediný spôsob testovania je počas hovoru.",
    "warning"
  );

  manualProximityTest();
}

function manualProximityTest() {
  showStatus(
    "proximity-status",
    "⚠️ Proximity API nie je v Safari dostupné.\nSpustím manuálny test...",
    "warning"
  );

  const content = `
      <div style="padding: 40px; text-align: center;">
        <h2>🔍 Proximity Sensor Test</h2>
        <p style="margin: 20px 0; font-size: 1.1rem;">
          Proximity senzor sa používa pri telefonovaní,<br>
          aby sa vypol displej keď telefón priložíš k uchu.
        </p>
        
        <div style="background: var(--card-bg); padding: 30px; border-radius: 15px; margin: 20px 0;">
          <h3 style="color: var(--primary-color); margin-bottom: 15px;">Test:</h3>
          <ol style="text-align: left; line-height: 2; font-size: 1rem;">
            <li>Zavolaj na iný telefón (alebo sa nechaj zavolať)</li>
            <li>Počas hovoru priloži iPhone k uchu</li>
            <li>Displej by sa mal ZHASNÚŤ</li>
            <li>Odlož telefón od ucha</li>
            <li>Displej by sa mal ROZSVIETI</li>
          </ol>
        </div>
        
        <p style="margin: 20px 0; color: var(--warning-color);">
          ⚡ Tip: Môžeš zavolať na vlastné číslo cez FaceTime
        </p>
        
        <div style="margin-top: 30px;">
          <button onclick="completeProximityTest(true)" 
                  style="margin: 10px; padding: 20px 40px; background: var(--success-color); 
                         border: none; border-radius: 12px; color: white; font-size: 1.1rem; font-weight: 600;">
            ✓ Displej sa vypína/zapína správne
          </button>
          <button onclick="completeProximityTest(false)" 
                  style="margin: 10px; padding: 20px 40px; background: var(--danger-color); 
                         border: none; border-radius: 12px; color: white; font-size: 1.1rem; font-weight: 600;">
            ✗ Displej nereaguje
          </button>
        </div>
      </div>
    `;

  openModal(content);

  function manualProximityTest() {
    const content = `
      <div style="padding: 40px; text-align: center;">
        <h2>🔍 Proximity Sensor Test</h2>
        <p style="margin: 20px 0; font-size: 1.1rem; color: var(--warning-color);">
          ⚠️ Proximity senzor sa dá otestovať LEN počas skutočného hovoru
        </p>
        
        <div style="background: var(--card-bg); padding: 30px; border-radius: 15px; margin: 20px 0;">
          <h3 style="color: var(--primary-color); margin-bottom: 15px;">📞 Ako testovať:</h3>
          <ol style="text-align: left; line-height: 2.5; font-size: 1.05rem;">
            <li><strong>Zavolaj na iný telefón</strong> (alebo sa nechaj zavolať)</li>
            <li><strong>Počas aktívneho hovoru</strong> priloži iPhone k uchu</li>
            <li>Displej by sa mal <strong style="color: var(--danger-color);">ZHASNÚŤ</strong> ⚫</li>
            <li>Odlož telefón od ucha (5-10 cm)</li>
            <li>Displej by sa mal <strong style="color: var(--success-color);">ROZSVIETI</strong> ✨</li>
            <li>Opakuj 2-3x pre istotu</li>
          </ol>
        </div>
        
        <div style="background: rgba(66, 135, 245, 0.2); padding: 20px; border-radius: 12px; margin: 20px 0; border-left: 4px solid var(--primary-color);">
          <p style="margin: 10px 0; font-size: 1rem;">
            💡 <strong>Tip:</strong> Môžeš zavolať na vlastné číslo cez <strong>FaceTime Audio</strong>
            alebo použiť službu ako <strong>Echo Test</strong>
          </p>
        </div>
        
        <div style="background: rgba(255, 193, 7, 0.2); padding: 20px; border-radius: 12px; margin: 20px 0; border-left: 4px solid var(--warning-color);">
          <p style="margin: 10px 0; font-size: 0.95rem;">
            ⚡ <strong>Prečo to funguje len počas hovoru?</strong><br>
            iOS aktivuje proximity senzor len počas hovorov kvôli šetreniu batérie.
            Webové aplikácie nemajú prístup k tomuto senzoru.
          </p>
        </div>
        
        <div style="margin-top: 30px;">
          <button onclick="completeProximityTest(true)" 
                  style="margin: 10px; padding: 20px 40px; background: var(--success-color); 
                         border: none; border-radius: 12px; color: white; font-size: 1.1rem; font-weight: 600;">
            ✓ Displej sa vypína/zapína správne
          </button>
          <button onclick="completeProximityTest(false)" 
                  style="margin: 10px; padding: 20px 40px; background: var(--danger-color); 
                         border: none; border-radius: 12px; color: white; font-size: 1.1rem; font-weight: 600;">
            ✗ Displej nereaguje na priloženie
          </button>
          <button onclick="closeModal()" 
                  style="margin: 10px; padding: 20px 40px; background: var(--card-bg); 
                         border: 2px solid var(--text-secondary); border-radius: 12px; color: white; font-size: 1rem;">
            Otestujem neskôr
          </button>
        </div>
      </div>
    `;

    openModal(content);

    window.completeProximityTest = (passed) => {
      updateTestResult("proximity", passed);
      closeModal();
      showStatus(
        "proximity-status",
        passed ? "✓ Proximity senzor funguje" : "✗ Proximity senzor nefunguje",
        passed ? "success" : "error"
      );
    };
  }
}

function testBiometric() {
  if (
    window.PublicKeyCredential &&
    PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable
  ) {
    PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
      .then((available) => {
        if (available) {
          showStatus(
            "biometric-status",
            "✓ Biometrická autentifikácia je dostupná",
            "success"
          );

          // Try to create a credential (this will trigger FaceID/TouchID)
          const challenge = new Uint8Array(32);
          window.crypto.getRandomValues(challenge);

          const publicKeyCredentialCreationOptions = {
            challenge: challenge,
            rp: {
              name: "iPhone Test Suite",
              id: window.location.hostname || "localhost",
            },
            user: {
              id: new Uint8Array(16),
              name: "testuser@test.com",
              displayName: "Test User",
            },
            pubKeyCredParams: [{ alg: -7, type: "public-key" }],
            authenticatorSelection: {
              authenticatorAttachment: "platform",
              userVerification: "required",
            },
            timeout: 60000,
            attestation: "none",
          };

          navigator.credentials
            .create({
              publicKey: publicKeyCredentialCreationOptions,
            })
            .then((credential) => {
              showStatus(
                "biometric-status",
                "✓ FaceID/TouchID test úspešný!",
                "success"
              );
              updateTestResult("biometric", true);
            })
            .catch((error) => {
              showStatus(
                "biometric-status",
                `Test preskočený: ${error.message}`,
                "warning"
              );
              const passed = confirm(
                "Otestuj odomknutie telefónu pomocou FaceID/TouchID. Funguje?"
              );
              updateTestResult("biometric", passed);
            });
        } else {
          showStatus(
            "biometric-status",
            "Biometrická autentifikácia nie je dostupná",
            "warning"
          );
          const passed = confirm(
            "Skús odomknúť telefón cez FaceID/TouchID. Funguje?"
          );
          updateTestResult("biometric", passed);
        }
      })
      .catch((error) => {
        showStatus("biometric-status", "Chyba pri kontrole biometrie", "error");
        const passed = confirm(
          "Skús odomknúť telefón cez FaceID/TouchID. Funguje?"
        );
        updateTestResult("biometric", passed);
      });
  } else {
    showStatus(
      "biometric-status",
      "Web Authentication API nie je podporované",
      "error"
    );
    const passed = confirm(
      "Skús odomknúť telefón cez FaceID/TouchID. Funguje?"
    );
    updateTestResult("biometric", passed);
  }
}

function testGyroscope() {
  if (window.DeviceOrientationEvent) {
    const content = `
            <div class="gyro-test">
                <h2>Gyroskop Test</h2>
                <div class="gyro-ball" id="gyro-ball"></div>
                <div class="gyro-data">
                    <div class="gyro-data-item">
                        <span>Alpha (Z):</span>
                        <span id="alpha">0°</span>
                    </div>
                    <div class="gyro-data-item">
                        <span>Beta (X):</span>
                        <span id="beta">0°</span>
                    </div>
                    <div class="gyro-data-item">
                        <span>Gamma (Y):</span>
                        <span id="gamma">0°</span>
                    </div>
                </div>
                <p style="margin-top: 20px;">Nakloni zariadenie rôznymi smermi</p>
                <button onclick="requestGyroPermission()">🔓 Povoliť prístup</button>
                <button onclick="completeGyroTest(true)">✓ Funguje</button>
                <button onclick="completeGyroTest(false)">✗ Nefunguje</button>
            </div>
        `;

    openModal(content);

    // Auto-request permission or start reading
    requestGyroPermission();

    function requestGyroPermission() {
      if (typeof DeviceOrientationEvent.requestPermission === "function") {
        DeviceOrientationEvent.requestPermission()
          .then((permissionState) => {
            if (permissionState === "granted") {
              startGyroReading();
              showStatus("gyro-status", "✓ Povolenie udelené", "success");
            } else {
              showStatus("gyro-status", "✗ Povolenie zamietnuté", "error");
            }
          })
          .catch((error) => {
            showStatus("gyro-status", "Chyba: " + error.message, "error");
          });
      } else {
        startGyroReading();
      }
    }

    window.requestGyroPermission = requestGyroPermission;

    function startGyroReading() {
      const handler = (event) => {
        const alphaEl = document.getElementById("alpha");
        const betaEl = document.getElementById("beta");
        const gammaEl = document.getElementById("gamma");
        const ball = document.getElementById("gyro-ball");

        if (alphaEl && event.alpha !== null) {
          alphaEl.textContent = Math.round(event.alpha) + "°";
        }
        if (betaEl && event.beta !== null) {
          betaEl.textContent = Math.round(event.beta) + "°";
        }
        if (gammaEl && event.gamma !== null) {
          gammaEl.textContent = Math.round(event.gamma) + "°";
        }

        if (ball && event.gamma !== null && event.beta !== null) {
          const x = event.gamma * 2;
          const y = event.beta * 2;
          ball.style.transform = `translate(${x}px, ${y}px)`;
        }
      };

      window.addEventListener("deviceorientation", handler);
      currentTest = { handler: handler, type: "orientation" };
    }
  } else {
    showStatus("gyro-status", "Gyroskop nie je podporovaný", "error");
    alert("Gyroskop API nie je dostupné v tomto zariadení alebo prehliadači");
  }

  window.completeGyroTest = (passed) => {
    if (currentTest && currentTest.handler) {
      window.removeEventListener("deviceorientation", currentTest.handler);
    }
    updateTestResult("gyroscope", passed);
    closeModal();
  };
}

function testAccelerometer() {
  if (window.DeviceMotionEvent) {
    const content = `
            <div class="gyro-test">
                <h2>Akcelerometer Test</h2>
                <div class="gyro-data">
                    <div class="gyro-data-item">
                        <span>X:</span>
                        <span id="accel-x">0</span>
                    </div>
                    <div class="gyro-data-item">
                        <span>Y:</span>
                        <span id="accel-y">0</span>
                    </div>
                    <div class="gyro-data-item">
                        <span>Z:</span>
                        <span id="accel-z">0</span>
                    </div>
                    <div class="gyro-data-item">
                        <span>Magnitude:</span>
                        <span id="accel-mag">0</span>
                    </div>
                </div>
                <div id="shake-indicator" style="width: 100px; height: 100px; background: var(--primary-color); border-radius: 50%; margin: 20px auto; transition: transform 0.1s;"></div>
                <p style="margin: 20px;">Potrás telefónom</p>
                <button onclick="requestAccelPermission()">🔓 Povoliť prístup</button>
                <button onclick="completeAccelTest(true)">✓ Funguje</button>
                <button onclick="completeAccelTest(false)">✗ Nefunguje</button>
            </div>
        `;

    openModal(content);

    // Auto-request permission or start reading
    requestAccelPermission();

    function requestAccelPermission() {
      if (typeof DeviceMotionEvent.requestPermission === "function") {
        DeviceMotionEvent.requestPermission()
          .then((permissionState) => {
            if (permissionState === "granted") {
              startAccelReading();
              showStatus("accel-status", "✓ Povolenie udelené", "success");
            } else {
              showStatus("accel-status", "✗ Povolenie zamietnuté", "error");
            }
          })
          .catch((error) => {
            showStatus("accel-status", "Chyba: " + error.message, "error");
          });
      } else {
        startAccelReading();
      }
    }

    window.requestAccelPermission = requestAccelPermission;

    function startAccelReading() {
      let lastShake = 0;
      const handler = (event) => {
        const acc = event.accelerationIncludingGravity;
        if (acc && acc.x !== null && acc.y !== null && acc.z !== null) {
          const xEl = document.getElementById("accel-x");
          const yEl = document.getElementById("accel-y");
          const zEl = document.getElementById("accel-z");
          const magEl = document.getElementById("accel-mag");
          const indicator = document.getElementById("shake-indicator");

          if (xEl) xEl.textContent = acc.x.toFixed(2);
          if (yEl) yEl.textContent = acc.y.toFixed(2);
          if (zEl) zEl.textContent = acc.z.toFixed(2);

          // Calculate magnitude
          const magnitude = Math.sqrt(
            acc.x * acc.x + acc.y * acc.y + acc.z * acc.z
          );
          if (magEl) magEl.textContent = magnitude.toFixed(2);

          // Detect shake
          if (magnitude > 20 && Date.now() - lastShake > 500) {
            lastShake = Date.now();
            if (indicator) {
              indicator.style.transform = "scale(1.5)";
              indicator.style.background = "var(--success-color)";
              setTimeout(() => {
                indicator.style.transform = "scale(1)";
                indicator.style.background = "var(--primary-color)";
              }, 200);
            }
          }
        }
      };

      window.addEventListener("devicemotion", handler);
      currentTest = { handler: handler, type: "motion" };
    }
  } else {
    showStatus("accel-status", "Akcelerometer nie je podporovaný", "error");
    alert(
      "Akcelerometer API nie je dostupné v tomto zariadení alebo prehliadači"
    );
  }

  window.completeAccelTest = (passed) => {
    if (currentTest && currentTest.handler) {
      window.removeEventListener("devicemotion", currentTest.handler);
    }
    updateTestResult("accelerometer", passed);
    closeModal();
  };
}

// Connectivity Tests
function testWiFi() {
  const online = navigator.onLine;
  const connection =
    navigator.connection ||
    navigator.mozConnection ||
    navigator.webkitConnection;

  let message = online ? "✓ Online pripojenie aktívne" : "✗ Žiadne pripojenie";

  if (connection) {
    const effectiveType = connection.effectiveType || "neznámy";
    const downlink = connection.downlink
      ? connection.downlink.toFixed(2)
      : "N/A";
    const rtt = connection.rtt || "N/A";
    const saveData = connection.saveData ? "Áno" : "Nie";

    message += `\n\nTyp: ${effectiveType}`;
    message += `\nRýchlosť: ${downlink} Mbps`;
    message += `\nLatencia (RTT): ${rtt} ms`;
    message += `\nÚspora dát: ${saveData}`;

    // Detect connection type
    if (connection.type) {
      message += `\nPripojenie: ${connection.type}`;
    }
  }

  // Perform actual connectivity test
  fetch("https://www.google.com/favicon.ico", {
    mode: "no-cors",
    cache: "no-store",
  })
    .then(() => {
      showStatus(
        "wifi-status",
        message + "\n\n✓ Internetové pripojenie funguje",
        online ? "success" : "error"
      );
      updateTestResult("wifi", true);
    })
    .catch(() => {
      showStatus(
        "wifi-status",
        message + "\n\n✗ Problém s pripojením",
        "error"
      );
      updateTestResult("wifi", false);
    });

  // Monitor connection changes
  window.addEventListener("online", () => {
    showStatus("wifi-status", "✓ Pripojenie obnovené", "success");
  });

  window.addEventListener("offline", () => {
    showStatus("wifi-status", "✗ Pripojenie stratené", "error");
  });

  showStatus("wifi-status", message + "\n\nTestujem pripojenie...", "info");
}

function testBluetooth() {
  if (navigator.bluetooth) {
    showStatus(
      "bluetooth-status",
      "Bluetooth API je dostupné. Skúšam vyhľadať zariadenia...",
      "info"
    );

    // Try to scan for Bluetooth devices
    navigator.bluetooth
      .requestDevice({
        acceptAllDevices: true,
        optionalServices: ["battery_service", "device_information"],
      })
      .then((device) => {
        showStatus(
          "bluetooth-status",
          `✓ Bluetooth funguje! Nájdené zariadenie: ${
            device.name || "Neznáme"
          }`,
          "success"
        );
        updateTestResult("bluetooth", true);
      })
      .catch((error) => {
        if (error.name === "NotFoundError") {
          showStatus(
            "bluetooth-status",
            "Žiadne Bluetooth zariadenia nenájdené. Skontroluj v Nastaveniach.",
            "warning"
          );
        } else {
          showStatus(
            "bluetooth-status",
            `Bluetooth test: ${error.message}`,
            "warning"
          );
        }
        const passed = confirm("Je Bluetooth funkčný v nastaveniach?");
        updateTestResult("bluetooth", passed);
      });
  } else {
    showStatus(
      "bluetooth-status",
      "Bluetooth Web API nie je podporované. Skontroluj v Nastaveniach.",
      "warning"
    );
    const passed = confirm("Je Bluetooth funkčný v nastaveniach?");
    updateTestResult("bluetooth", passed);
  }
}

function testGPS() {
  if (navigator.geolocation) {
    showStatus("gps-status", "Získavam polohu...", "info");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude.toFixed(6);
        const lon = position.coords.longitude.toFixed(6);
        const acc = position.coords.accuracy.toFixed(0);

        showStatus(
          "gps-status",
          `✓ GPS funguje!\nŠírka: ${lat}\nDĺžka: ${lon}\nPresnosť: ${acc}m`,
          "success"
        );
        updateTestResult("gps", true);
      },
      (error) => {
        showStatus("gps-status", `✗ Chyba GPS: ${error.message}`, "error");
        updateTestResult("gps", false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  } else {
    showStatus("gps-status", "GPS API nie je podporované", "error");
    updateTestResult("gps", false);
  }
}

function testNFC() {
  if ("NDEFReader" in window) {
    showStatus(
      "nfc-status",
      "NFC je podporované! Inicializujem čítačku...",
      "info"
    );

    try {
      const ndef = new NDEFReader();

      // Try to scan for NFC tags
      ndef
        .scan()
        .then(() => {
          showStatus(
            "nfc-status",
            "✓ NFC je aktívne a pripravené na čítanie tagov. Skús Apple Pay!",
            "success"
          );

          ndef.addEventListener("reading", ({ message, serialNumber }) => {
            showStatus(
              "nfc-status",
              `✓ NFC tag detekovaný!\nSériové číslo: ${serialNumber}`,
              "success"
            );
          });

          ndef.addEventListener("readingerror", () => {
            showStatus("nfc-status", "Chyba pri čítaní NFC tagu", "error");
          });

          setTimeout(() => {
            const passed = confirm("Funguje NFC / Apple Pay?");
            updateTestResult("nfc", passed);
          }, 3000);
        })
        .catch((error) => {
          showStatus(
            "nfc-status",
            `NFC: ${error.message}. Otestuj Apple Pay manuálne.`,
            "warning"
          );
          const passed = confirm("Funguje Apple Pay / NFC platby?");
          updateTestResult("nfc", passed);
        });
    } catch (error) {
      showStatus(
        "nfc-status",
        "NFC API chyba. Otestuj Apple Pay v Nastaveniach.",
        "warning"
      );
      const passed = confirm("Funguje Apple Pay / NFC platby?");
      updateTestResult("nfc", passed);
    }
  } else {
    showStatus(
      "nfc-status",
      "NFC Web API nie je podporované v Safari. Otestuj Apple Pay manuálne.",
      "warning"
    );
    alert(
      "Otvor Nastavenia > Wallet & Apple Pay a skontroluj či je Apple Pay funkčný.\n\nAlebo skús doubletap na bočné tlačidlo pre Apple Pay."
    );
    const passed = confirm("Funguje Apple Pay / NFC platby?");
    updateTestResult("nfc", passed);
  }
}

function testCellular() {
  const connection =
    navigator.connection ||
    navigator.mozConnection ||
    navigator.webkitConnection;

  let message =
    "Manuálny test: Skús zavolať, poslať SMS a použiť mobilné dáta\n\n";

  if (connection) {
    const type = connection.type || connection.effectiveType;
    message += `Detekovaný typ pripojenia: ${type}\n`;

    if (
      type &&
      (type.includes("cellular") ||
        type.includes("4g") ||
        type.includes("5g") ||
        type.includes("3g") ||
        type.includes("2g"))
    ) {
      message += "✓ Mobilné dáta sú pravdepodobne aktívne";
      showStatus("cellular-status", message, "success");
    } else if (type === "wifi") {
      message += "⚠ Pripojený cez WiFi. Vypni WiFi pre test mobilných dát.";
      showStatus("cellular-status", message, "warning");
    } else {
      showStatus("cellular-status", message, "info");
    }
  } else {
    showStatus("cellular-status", message, "info");
  }

  // Test mobile data by trying to fetch when WiFi might be off
  alert(
    "Pre kompletný test:\n\n1. Zavolaj na iný telefón\n2. Pošli SMS\n3. Vypni WiFi a načítaj webovú stránku\n\nVšetko musí fungovať."
  );

  const passed = confirm("Fungujú hovory, SMS a mobilné dáta?");
  updateTestResult("cellular", passed);
}

// Battery Tests
function checkBattery() {
  if (navigator.getBattery) {
    navigator.getBattery().then((battery) => {
      const level = (battery.level * 100).toFixed(0);
      const charging = battery.charging ? "⚡ Nabíja sa" : "🔋 Nenabíja sa";

      let timeInfo = "";
      if (battery.charging && battery.chargingTime !== Infinity) {
        const hours = Math.floor(battery.chargingTime / 3600);
        const minutes = Math.floor((battery.chargingTime % 3600) / 60);
        timeInfo = `\nČas do nabitia: ${hours}h ${minutes}m`;
      } else if (!battery.charging && battery.dischargingTime !== Infinity) {
        const hours = Math.floor(battery.dischargingTime / 3600);
        const minutes = Math.floor((battery.dischargingTime % 3600) / 60);
        timeInfo = `\nZostávajúci čas: ${hours}h ${minutes}m`;
      }

      let status = `Úroveň batérie: ${level}%\n${charging}${timeInfo}\n\n`;
      status +=
        "📊 Pre Battery Health:\nNastavenia > Batéria > Stav batérie\n\n";
      status += "Skontroluj:\n";
      status += "• Maximum Capacity (malo by byť > 80%)\n";
      status += "• Peak Performance Capability";

      // Add battery event listeners
      battery.addEventListener("chargingchange", () => {
        const newStatus = battery.charging
          ? "⚡ Začalo nabíjanie"
          : "🔋 Nabíjanie zastavené";
        showStatus("battery-status", status + `\n\n${newStatus}`, "info");
      });

      battery.addEventListener("levelchange", () => {
        const newLevel = (battery.level * 100).toFixed(0);
        showStatus(
          "battery-status",
          status.replace(/\d+%/, newLevel + "%"),
          "success"
        );
      });

      showStatus("battery-status", status, level > 20 ? "success" : "warning");

      const passed = confirm(
        "Je stav batérie v poriadku? (Skontroluj aj Battery Health v Nastaveniach)"
      );
      updateTestResult("battery", passed);
    });
  } else {
    showStatus(
      "battery-status",
      "Battery API nie je podporované v Safari.\n\nSkontroluj manuálne:\nNastavenia > Batéria > Stav batérie",
      "warning"
    );
    alert(
      "Otvor Nastavenia > Batéria > Stav batérie a skontroluj:\n• Maximum Capacity\n• Peak Performance Capability"
    );
    const passed = confirm("Je Battery Health v poriadku?");
    updateTestResult("battery", passed);
  }
}

function testCableCharging() {
  showStatus(
    "charging-status",
    "Pripoj nabíjací kábel a skontroluj či sa začne nabíjať...",
    "info"
  );

  if (navigator.getBattery) {
    navigator.getBattery().then((battery) => {
      const initialCharging = battery.charging;

      if (initialCharging) {
        showStatus(
          "charging-status",
          "✓ Káblové nabíjanie je aktívne!",
          "success"
        );
        updateTestResult("cable-charging", true);
      } else {
        showStatus(
          "charging-status",
          "⚠ Káblové nabíjanie nie je detekované. Pripoj kábel...",
          "warning"
        );

        // Wait for charging to start
        const chargingHandler = () => {
          if (battery.charging) {
            showStatus(
              "charging-status",
              "✓ Káblové nabíjanie funguje! Nabíjanie začalo.",
              "success"
            );
            updateTestResult("cable-charging", true);
            battery.removeEventListener("chargingchange", chargingHandler);
          }
        };

        battery.addEventListener("chargingchange", chargingHandler);

        // Timeout after 10 seconds
        setTimeout(() => {
          battery.removeEventListener("chargingchange", chargingHandler);
          if (!battery.charging) {
            showStatus(
              "charging-status",
              "✗ Nabíjanie nezistené po 10 sekundách",
              "error"
            );
            const passed = confirm("Pripojil si kábel a telefón sa nabíja?");
            updateTestResult("cable-charging", passed);
          }
        }, 10000);
      }
    });
  } else {
    setTimeout(() => {
      alert(
        "Pripoj Lightning/USB-C kábel a skontroluj či sa zobrazuje ikona nabíjania."
      );
      const passed = confirm("Nabíja sa telefón cez kábel?");
      updateTestResult("cable-charging", passed);
      showStatus(
        "charging-status",
        passed ? "✓ Káblové nabíjanie funguje" : "✗ Problém s nabíjaním",
        passed ? "success" : "error"
      );
    }, 1000);
  }
}

function testWirelessCharging() {
  showStatus(
    "wireless-status",
    "Polož telefón na bezdrôtovú nabíjačku (ak je podporované)",
    "info"
  );

  setTimeout(() => {
    const passed = confirm("Funguje bezdrôtové nabíjanie?");
    updateTestResult("wireless-charging", passed);

    if (!passed) {
      const notSupported = confirm("Zariadenie nepodporuje wireless charging?");
      if (notSupported) {
        showStatus(
          "wireless-status",
          "Zariadenie nepodporuje wireless charging",
          "info"
        );
      }
    }
  }, 2000);
}

// Final Tests
function showRestartInstructions() {
  alert(`Reštart zariadenia:
    
iPhone X a novší:
1. Stlač a rýchlo uvoľni Hlasitosť +
2. Stlač a rýchlo uvoľni Hlasitosť -
3. Drž bočné tlačidlo kým sa nezobrazí logo Apple

iPhone 8 a starší:
Drž Vypínač + Home tlačidlo

Po reštarte skontroluj či sa telefón zapne normálne.`);

  const passed = confirm("Prešiel telefón reštartom úspešne?");
  updateTestResult("restart", passed);
}

function showCallInstructions() {
  alert(`Test hovorov:
    
1. Zavolaj na toto číslo z iného telefónu
2. Skontroluj či zazvoní
3. Zdvihni hovor a skontroluj či počuješ
4. Skontroluj či ťa druhá strana počuje
5. Zober a polož hovor niekoľkokrát

Všetko musí fungovať správne.`);

  const passed = confirm("Fungujú hovory správne?");
  updateTestResult("calls", passed);
}

function testMobileData() {
  alert("Vypni WiFi a skús načítať webovú stránku cez mobilné dáta");

  setTimeout(() => {
    const passed = confirm("Fungujú mobilné dáta?");
    updateTestResult("mobile-data", passed);
  }, 1000);
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  updateSummary();

  // Add service worker for offline functionality
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  }
});

// Handle modal close on background click
document.getElementById("test-modal").addEventListener("click", (e) => {
  if (e.target.id === "test-modal") {
    closeModal();
  }
});
