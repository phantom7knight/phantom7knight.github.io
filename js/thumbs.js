/* Crossfade cycler for .cycle-thumb containers.
   Each container holds stacked <img>s; this fades between them every few
   seconds ("breathing" thumbnails). Pure CSS opacity transition + a class
   toggle here. */
(function () {
  const INTERVAL = 3000;

  document.querySelectorAll(".cycle-thumb").forEach(function (box) {
    const imgs = Array.from(box.querySelectorAll("img"));
    if (imgs.length < 2) {
      if (imgs[0]) imgs[0].classList.add("on");
      return;
    }
    let i = 0;
    imgs.forEach(function (im, idx) { im.classList.toggle("on", idx === 0); });
    setInterval(function () {
      imgs[i].classList.remove("on");
      i = (i + 1) % imgs.length;
      imgs[i].classList.add("on");
    }, INTERVAL);
  });
})();
