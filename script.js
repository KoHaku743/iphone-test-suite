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
  const audio = new Audio();
  audio.src =
    "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGGa77OmfTRAMUKbj8LZjHQU3kdXyy3krBSJ3xu/ekEIKE161OepUFQlBnN7xwXUlBi6Dzv";

  alert("Prehráva sa zvuk cez horný reproduktor (earpiece). Počuj ho?");
  audio.play();

  setTimeout(() => {
    const passed = confirm("Funguje horný reproduktor?");
    updateTestResult("speaker-top", passed);
    audio.pause();
  }, 2000);
}

function testBottomSpeaker() {
  const audio = new Audio();
  // Generate a test tone
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  const audioContext = new AudioContext();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.frequency.value = 440;
  oscillator.type = "sine";
  gainNode.gain.value = 0.3;

  alert("Prehráva sa tón 440Hz cez dolný reproduktor. Počuj ho?");
  oscillator.start();

  setTimeout(() => {
    oscillator.stop();
    const passed = confirm("Funguje dolný reproduktor?");
    updateTestResult("speaker-bottom", passed);
  }, 2000);
}

function testMicrophone() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    alert("Mikrofón API nie je podporované v tomto prehliadači");
    return;
  }

  navigator.mediaDevices
    .getUserMedia({ audio: true })
    .then((stream) => {
      const mediaRecorder = new MediaRecorder(stream);
      const chunks = [];

      mediaRecorder.ondataavailable = (e) => {
        chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        const audioURL = URL.createObjectURL(blob);
        const audio = new Audio(audioURL);

        const content = `
                    <div class="audio-recorder">
                        <h2>Nahrávka dokončená</h2>
                        <p>Prehraj si nahrávku:</p>
                        <audio controls src="${audioURL}" style="width: 100%; max-width: 400px;"></audio>
                        <button onclick="completeMicTest(true)">✓ Mikrofón funguje</button>
                        <button onclick="completeMicTest(false)">✗ Problém s mikrofónom</button>
                    </div>
                `;
        openModal(content);

        stream.getTracks().forEach((track) => track.stop());
      };

      alert("Začína nahrávanie. Povedz niečo do mikrofónu...");
      mediaRecorder.start();

      setTimeout(() => {
        mediaRecorder.stop();
      }, 3000);
    })
    .catch((error) => {
      alert("Chyba prístupu k mikrofónu: " + error.message);
      updateTestResult("microphone", false);
    });

  window.completeMicTest = (passed) => {
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
  // Modern approach: Use Proximity Sensor API if available
  if ("ProximitySensor" in window) {
    try {
      const sensor = new ProximitySensor();
      sensor.addEventListener("reading", () => {
        showStatus(
          "proximity-status",
          `✓ Proximity aktívny - Vzdialenosť: ${sensor.distance}cm`,
          "success"
        );
      });
      sensor.addEventListener("error", (error) => {
        showStatus(
          "proximity-status",
          `Chyba senzora: ${error.message}`,
          "error"
        );
      });
      sensor.start();

      setTimeout(() => {
        sensor.stop();
        const passed = confirm("Fungoval proximity senzor?");
        updateTestResult("proximity", passed);
      }, 5000);
    } catch (error) {
      showStatus("proximity-status", `Chyba: ${error.message}`, "error");
      manualProximityTest();
    }
  } else if ("ondeviceproximity" in window) {
    // Fallback to older API
    let proximityDetected = false;
    const handler = (event) => {
      proximityDetected = true;
      showStatus(
        "proximity-status",
        `✓ Proximity detekovaný - ${event.near ? "Blízko" : "Ďaleko"} (${
          event.value
        }cm)`,
        "success"
      );
    };

    window.addEventListener("deviceproximity", handler);

    showStatus(
      "proximity-status",
      "Zakry proximity senzor (horná časť displeja)...",
      "info"
    );

    setTimeout(() => {
      window.removeEventListener("deviceproximity", handler);
      if (proximityDetected) {
        updateTestResult("proximity", true);
      } else {
        manualProximityTest();
      }
    }, 5000);
  } else {
    manualProximityTest();
  }

  function manualProximityTest() {
    showStatus(
      "proximity-status",
      "Proximity API nie je podporované. Otestuj manuálne pri hovore.",
      "warning"
    );
    alert(
      "Zavolaj niekomu a skontroluj či sa displej zhasne pri priložení k uchu."
    );
    const passed = confirm("Zhasne obrazovka pri priložení k uchu?");
    updateTestResult("proximity", passed);
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
