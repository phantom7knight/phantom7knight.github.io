/* Terminal typing hero.
   Reads a JSON array of {cmd, out[]} from #term-script and types each
   command character-by-character, then prints its output lines. */
(function () {
  const scriptTag = document.getElementById("term-script");
  const body = document.getElementById("term-body");
  if (!scriptTag || !body) return;

  const entries = JSON.parse(scriptTag.textContent);
  const PROMPT = "rohit@tolety:~$ ";
  const CHAR_DELAY = 45;
  const LINE_PAUSE = 350;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function makeLine() {
    const line = document.createElement("div");
    line.className = "t-line";
    const prompt = document.createElement("span");
    prompt.className = "t-prompt";
    prompt.textContent = PROMPT;
    const cmd = document.createElement("span");
    cmd.className = "t-cmd";
    line.appendChild(prompt);
    line.appendChild(cmd);
    body.appendChild(line);
    return cmd;
  }

  // Output lines may contain safe, hand-authored HTML (links).
  function printOutputs(outs) {
    outs.forEach(function (html) {
      const out = document.createElement("div");
      out.className = "t-line t-out";
      out.innerHTML = html;
      body.appendChild(out);
    });
  }

  function finalPrompt() {
    const cmd = makeLine();
    const cursor = document.createElement("span");
    cursor.className = "cursor";
    cursor.setAttribute("aria-hidden", "true");
    cmd.appendChild(cursor);
  }

  if (reducedMotion) {
    entries.forEach(function (e) {
      makeLine().textContent = e.cmd;
      printOutputs(e.out);
    });
    finalPrompt();
    return;
  }

  let entryIdx = 0;

  function typeEntry() {
    if (entryIdx >= entries.length) {
      finalPrompt();
      return;
    }
    const entry = entries[entryIdx++];
    const cmdSpan = makeLine();
    const cursor = document.createElement("span");
    cursor.className = "cursor";
    cursor.setAttribute("aria-hidden", "true");
    cmdSpan.appendChild(cursor);

    let charIdx = 0;
    (function typeChar() {
      if (charIdx < entry.cmd.length) {
        cursor.insertAdjacentText("beforebegin", entry.cmd.charAt(charIdx++));
        setTimeout(typeChar, CHAR_DELAY);
      } else {
        cursor.remove();
        printOutputs(entry.out);
        setTimeout(typeEntry, LINE_PAUSE);
      }
    })();
  }

  typeEntry();
})();
