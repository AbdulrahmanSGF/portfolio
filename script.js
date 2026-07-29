const studentLabel = "IT STUDENT";
const securityLabel = "CYBERSECURITY";
const hexCharacters = "0123456789ABCDEF";
const securityQuery = `index=KingAbdulazizUniversity sourcetype=SecurityProfile
| search major="Information Technology"
| eval interests=mvappend("Defensive Cybersecurity", "Digital Forensics")
| table Certificates Contact`;

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const studentElement = document.querySelector("#student-label");
const securityElement = document.querySelector("#security-label");
const queryElement = document.querySelector("#security-query");
const cursorElement = document.querySelector(".typing-cursor");
const menuButton = document.querySelector(".menu-button");
const navigation = document.querySelector("#primary-navigation");

document.querySelector("#current-year").textContent = new Date().getFullYear();

if (!reducedMotion && studentElement && securityElement) {
  let scrambled = false;
  let activeTarget = studentElement;
  let activeSource = studentLabel;

  window.setInterval(() => {
    if (!scrambled) {
      const useStudent = Math.random() > 0.5;
      activeTarget = useStudent ? studentElement : securityElement;
      activeSource = useStudent ? studentLabel : securityLabel;
      const characters = activeSource.split("");
      let position;

      do {
        position = Math.floor(Math.random() * characters.length);
      } while (characters[position] === " ");

      characters[position] = hexCharacters[Math.floor(Math.random() * hexCharacters.length)];
      activeTarget.textContent = characters.join("");
    } else {
      activeTarget.textContent = activeSource;
    }

    scrambled = !scrambled;
  }, 140);
}

if (queryElement && !reducedMotion) {
  queryElement.textContent = "";
  let position = 0;

  const typingTimer = window.setInterval(() => {
    position += 1;
    queryElement.textContent = securityQuery.slice(0, position);

    if (position >= securityQuery.length) {
      window.clearInterval(typingTimer);
      cursorElement?.classList.add("complete");
    }
  }, 28);
}

if ("IntersectionObserver" in window && !reducedMotion) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("visible");
      entry.target.closest(".section-transition")?.classList.add("active");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.14 });

  document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));
} else {
  document.querySelectorAll(".reveal").forEach((element) => element.classList.add("visible"));
  document.querySelectorAll(".section-transition").forEach((element) => element.classList.add("active"));
}

menuButton?.addEventListener("click", () => {
  const isOpen = navigation?.classList.toggle("open") ?? false;
  menuButton.setAttribute("aria-expanded", String(isOpen));
});

navigation?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    navigation.classList.remove("open");
    menuButton?.setAttribute("aria-expanded", "false");
  });
});
