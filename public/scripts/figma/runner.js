(async (selector = "body") => {
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const withTimeout = (promise, ms) =>
    Promise.race([
      promise,
      new Promise((resolve) => setTimeout(resolve, ms)),
    ]);

  async function ensureCaptureScript() {
    if (window.figma?.captureForDesign) return;

    if (window.__figmaCaptureLoading) {
      await window.__figmaCaptureLoading;
      return;
    }

    window.__figmaCaptureLoading = (async () => {
      const res = await fetch("/scripts/figma/capture.js");
      if (!res.ok) {
        throw new Error(`Failed to load capture.js: ${res.status}`);
      }

      const scriptText = await res.text();
      const scriptEl = document.createElement("script");
      scriptEl.textContent = scriptText;
      document.head.appendChild(scriptEl);

      await withTimeout(
        new Promise((resolve, reject) => {
          const start = Date.now();

          (function check() {
            if (window.figma?.captureForDesign) return resolve();
            if (Date.now() - start > 5000) {
              return reject(new Error("captureForDesign did not initialize in time"));
            }
            setTimeout(check, 50);
          })();
        }),
        5500
      );
    })();

    try {
      await window.__figmaCaptureLoading;
    } finally {
      delete window.__figmaCaptureLoading;
    }
  }

  async function triggerLazyLoad(container) {
    const originalX = window.scrollX;
    const originalY = window.scrollY;
    const step = Math.max(400, Math.floor((container?.clientHeight || window.innerHeight) * 0.8));

    let lastHeight = 0;
    let stableRounds = 0;
    let y = 0;

    const scrollContainer = container || window;
    const getScrollHeight = () => {
      if (container) {
        return container.scrollHeight;
      }
      return Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight
      );
    };

    while (stableRounds < 2) {
      const currentHeight = getScrollHeight();

      if (currentHeight === lastHeight) {
        stableRounds += 1;
      } else {
        stableRounds = 0;
        lastHeight = currentHeight;
      }

      for (; y < currentHeight; y += step) {
        if (container) {
          container.scrollTo({ top: y, behavior: "auto" });
        } else {
          window.scrollTo({ top: y, behavior: "auto" });
        }
        await sleep(180);
      }

      await sleep(500);
    }

    if (container) {
      container.scrollTo({ top: 0, behavior: "auto" });
    } else {
      window.scrollTo({ top: 0, behavior: "auto" });
    }
    await sleep(300);

    return { originalX, originalY };
  }

  async function waitForImages(container) {
    const images = container 
      ? Array.from(container.querySelectorAll("img") || [])
      : Array.from(document.images || []);

    await Promise.allSettled(
      images.map((img) => {
        if (img.complete) return Promise.resolve();

        return withTimeout(
          new Promise((resolve) => {
            img.addEventListener("load", resolve, { once: true });
            img.addEventListener("error", resolve, { once: true });
          }),
          4000
        );
      })
    );
  }

  async function waitForFonts() {
    if (!document.fonts?.ready) return;
    await withTimeout(document.fonts.ready, 3000);
  }

  try {
    await ensureCaptureScript();

    const container = selector ? document.querySelector(selector) : null;
    const { originalX, originalY } = await triggerLazyLoad(container);
    await waitForImages(container);
    await waitForFonts();
    await sleep(500);

    const result = await window.figma.captureForDesign({
      selector: selector,
    });

    window.scrollTo({ left: originalX, top: originalY, behavior: "auto" });

    return result;
  } catch (error) {
    console.error("[captureForDesign] failed:", error);
    throw error;
  }
});
