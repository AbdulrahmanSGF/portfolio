const studentLabel = "IT STUDENT";
const securityLabel = "CYBERSECURITY";
const hexCharacters = "0123456789ABCDEF";
const securityQuery = `index=KingAbdulazizUniversity sourcetype=SecurityProfile
| search major="Information Technology"
| eval interests=mvappend("Defensive Cybersecurity", "Digital Forensics")
| table Certificates Contact`;

const PROFILE_PREVIEW_DELAY = 350;
const PROFILE_PREVIEW_CLOSE_DELAY = 320;
const PROFILE_PREVIEW_ANIMATION_DURATION = 850;

// Edit this single object when you have real profile images, statistics, or posts.
// Empty optional fields stay hidden rather than showing invented information.
const socialProfiles = {
  linkedin: {
    platform: "LinkedIn",
    url: "https://www.linkedin.com/in/abdulrahmansgf/",
    name: "Abdulrahman Alssaggaf",
    handle: "@AbdulrahmanSGF",
    headline: "Information Technology Student at KAU | Cybersecurity | eCTHPv3 | eJPTv2 |",
    bio: null,
    location: null,
    connections: "500+ connections",
    followers: null,
    following: null,
    avatar: "assets/linkedin-icon.jpg",
    banner: "assets/linkedin-header.jpg",
    latestPost: null,
  },
  x: {
    platform: "X",
    url: "https://x.com/AbdulrahmannSGF",
    name: "Abdulrahman",
    handle: "@AbdulrahmannSGF",
    headline: null,
    bio: "IT’24 @FCITKAU | Cybersecurity | {وَمَا أُوتِيتُم مِّنَ الْعِلْمِ إِلَّا قَلِيلًا}",
    location: null,
    connections: null,
    followers: "188",
    following: "140",
    avatar: "assets/x-icon.jpg",
    banner: "assets/x-header.jpg",
    latestPost: null,
  },
};

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const studentElement = document.querySelector("#student-label");
const securityElement = document.querySelector("#security-label");
const queryElement = document.querySelector("#security-query");
const searchButton = document.querySelector("#splunk-search-button");
const timeRangeElement = document.querySelector("#splunk-time-range");
const searchStatusElement = document.querySelector("#splunk-search-status");
const searchStatusText = searchStatusElement?.querySelector("span");
const menuButton = document.querySelector(".menu-button");
const navigation = document.querySelector("#primary-navigation");
const scrollProgressBar = document.querySelector("#scroll-progress-bar");
const cursorGlow = document.querySelector("#cursor-glow");
const scrollRoot = document.querySelector("main");

let scrollProgressFrame;

function updateScrollProgress() {
  scrollProgressFrame = undefined;
  if (!scrollRoot) return;
  const maximumScroll = scrollRoot.scrollHeight - scrollRoot.clientHeight;
  const progress = maximumScroll > 0 ? Math.min(1, Math.max(0, scrollRoot.scrollTop / maximumScroll)) : 0;
  if (scrollProgressBar) scrollProgressBar.style.transform = `scaleX(${progress})`;
}

function requestScrollProgressUpdate() {
  if (!scrollProgressFrame) scrollProgressFrame = window.requestAnimationFrame(updateScrollProgress);
}

updateScrollProgress();
scrollRoot?.addEventListener("scroll", requestScrollProgressUpdate, { passive: true });
window.addEventListener("resize", requestScrollProgressUpdate);

if (cursorGlow && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
  window.addEventListener("pointermove", (event) => {
    cursorGlow.style.transform = `translate3d(${event.clientX - 36}px, ${event.clientY - 36}px, 0)`;
    cursorGlow.style.opacity = "1";
  }, { passive: true });

  window.addEventListener("pointerout", (event) => {
    if (!event.relatedTarget) cursorGlow.style.opacity = "0";
  });
}

if (studentElement && securityElement) {
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

let queryTypingTimer;
let searchResultTimer;
let automaticTypingStopped = false;

function setSearchStatus(message, isRunning = false) {
  if (searchStatusText) searchStatusText.textContent = message;
  searchStatusElement?.classList.toggle("running", isRunning);
  searchButton?.classList.toggle("running", isRunning);
  if (searchButton) searchButton.disabled = isRunning;
}

function updateQueryRows() {
  if (!queryElement) return;
  queryElement.rows = Math.max(1, queryElement.value.split("\n").length);
}

function startQueryTyping() {
  if (!queryElement) return;

  window.clearTimeout(queryTypingTimer);
  queryElement.value = "";
  updateQueryRows();
  setSearchStatus("Typing SPL query...");
  let position = 0;

  const typeNextCharacter = () => {
    if (automaticTypingStopped) return;
    position += 1;
    queryElement.value = securityQuery.slice(0, position);
    updateQueryRows();

    if (position >= securityQuery.length) {
      setSearchStatus("Ready · Select a time range, then search");
      return;
    }

    const previousCharacter = securityQuery[position - 1];
    queryTypingTimer = window.setTimeout(typeNextCharacter, previousCharacter === "\n" ? 260 : 44);
  };

  queryTypingTimer = window.setTimeout(typeNextCharacter, 750);
}

if (queryElement) {
  if (document.readyState === "complete") {
    startQueryTyping();
  } else {
    queryElement.value = "";
    window.addEventListener("load", startQueryTyping, { once: true });
  }
}

function stopAutomaticTyping() {
  automaticTypingStopped = true;
  window.clearTimeout(queryTypingTimer);
}

function runSearch() {
  stopAutomaticTyping();
  if (queryElement && queryElement.value !== securityQuery) {
    queryElement.value = securityQuery;
    updateQueryRows();
  }
  window.clearTimeout(searchResultTimer);
  const timeRange = timeRangeElement?.value ?? "All time";
  setSearchStatus(`Searching SecurityProfile · ${timeRange}`, true);
  searchResultTimer = window.setTimeout(() => {
    setSearchStatus("Search complete · 1 profile matched");
  }, 850);
}

searchButton?.addEventListener("click", runSearch);
timeRangeElement?.addEventListener("change", () => setSearchStatus("Ready · Select a time range, then search"));

const revealElements = Array.from(document.querySelectorAll(".reveal"));

{
  let revealFrame = 0;
  const revealVisibleElements = () => {
    revealFrame = 0;
    const triggerPoint = window.innerHeight * 0.76;

    revealElements.forEach((element) => {
      if (element.classList.contains("visible")) return;
      const bounds = element.getBoundingClientRect();
      if (bounds.top > triggerPoint || bounds.bottom < 0) return;
      element.classList.add("visible");
    });
  };
  const requestReveal = () => {
    if (!revealFrame) revealFrame = window.requestAnimationFrame(revealVisibleElements);
  };

  revealFrame = window.requestAnimationFrame(revealVisibleElements);
  scrollRoot?.addEventListener("scroll", requestReveal, { passive: true });
  window.addEventListener("resize", requestReveal);
}

if (scrollRoot) {
  const snapSections = Array.from(document.querySelectorAll(".hero, .section-transition"));
  const snapDuration = 950;
  let settleTimer;
  let animationFrame;
  let isAnimating = false;
  let lastScrollTop = scrollRoot.scrollTop;
  let scrollDirection = 0;

  const cancelSnapAnimation = () => {
    if (!isAnimating) return;
    window.cancelAnimationFrame(animationFrame);
    isAnimating = false;
  };

  const animateTo = (target) => {
    const start = scrollRoot.scrollTop;
    const distance = target - start;
    if (Math.abs(distance) < 2) return;

    cancelSnapAnimation();
    isAnimating = true;
    const startedAt = window.performance.now();

    const step = (timestamp) => {
      const progress = Math.min(1, (timestamp - startedAt) / snapDuration);
      const eased = progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;
      scrollRoot.scrollTop = start + distance * eased;

      if (progress < 1) {
        animationFrame = window.requestAnimationFrame(step);
      } else {
        isAnimating = false;
      }
    };

    animationFrame = window.requestAnimationFrame(step);
  };

  const settleSection = () => {
    settleTimer = undefined;
    if (isAnimating || scrollDirection !== 1) return;

    const viewportHeight = scrollRoot.clientHeight;
    for (let index = 1; index < snapSections.length; index += 1) {
      const nextSection = snapSections[index];
      const distanceToNext = nextSection.offsetTop - scrollRoot.scrollTop;
      if (distanceToNext <= 0 || distanceToNext >= viewportHeight) continue;

      if (distanceToNext <= viewportHeight * 0.4) {
        animateTo(nextSection.offsetTop);
      }
      return;
    }
  };

  const requestSettle = () => {
    if (isAnimating) return;
    const currentScrollTop = scrollRoot.scrollTop;
    if (currentScrollTop > lastScrollTop + 1) scrollDirection = 1;
    if (currentScrollTop < lastScrollTop - 1) scrollDirection = -1;
    lastScrollTop = currentScrollTop;
    window.clearTimeout(settleTimer);
    settleTimer = window.setTimeout(settleSection, 130);
  };

  scrollRoot.addEventListener("scroll", requestSettle, { passive: true });
  scrollRoot.addEventListener("wheel", cancelSnapAnimation, { passive: true });
  scrollRoot.addEventListener("touchstart", cancelSnapAnimation, { passive: true });
  window.addEventListener("keydown", cancelSnapAnimation);
}

const profilePreviewCard = document.createElement("article");
profilePreviewCard.id = "social-profile-preview";
profilePreviewCard.className = "social-profile-card";
profilePreviewCard.setAttribute("role", "dialog");
profilePreviewCard.setAttribute("aria-hidden", "true");
document.body.append(profilePreviewCard);

let activeProfileKey = null;
let activeProfileTrigger = null;
let profileShowTimer;
let profileCloseTimer;
let profilePositionFrame;
let profileAnimationTimer;
let profileOpenFrame;
const hoveredProfileTriggers = new Set();
let profileCardHovered = false;

function createProfileElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined && text !== null) element.textContent = text;
  return element;
}

function renderProfilePreview(profileKey) {
  const profile = socialProfiles[profileKey];
  profilePreviewCard.replaceChildren();
  profilePreviewCard.className = `social-profile-card social-profile-${profileKey}`;
  profilePreviewCard.setAttribute("aria-label", `${profile.platform} profile preview for ${profile.name}`);

  const banner = createProfileElement("div", "social-profile-banner");
  if (profile.banner) {
    const bannerImage = document.createElement("img");
    bannerImage.src = profile.banner;
    bannerImage.alt = `${profile.name} ${profile.platform} cover`;
    banner.append(bannerImage);
  }

  const body = createProfileElement("div", "social-profile-body");
  let avatar;
  if (profile.avatar) {
    avatar = document.createElement("img");
    avatar.className = "social-profile-avatar";
    avatar.src = profile.avatar;
    avatar.alt = `${profile.name}'s ${profile.platform} profile photo`;
  } else {
    avatar = createProfileElement("span", "social-profile-avatar social-profile-avatar-fallback", "AS");
    avatar.setAttribute("role", "img");
    avatar.setAttribute("aria-label", `${profile.name} profile photo placeholder`);
  }

  const identity = createProfileElement("header", "social-profile-identity");
  identity.append(createProfileElement("strong", "", profile.name));
  if (profile.platform === "X") identity.append(createProfileElement("span", "", profile.handle));

  body.append(avatar, identity);
  if (profile.headline) body.append(createProfileElement("p", "social-profile-headline", profile.headline));

  if (profile.platform === "LinkedIn") {
    const meta = [profile.location, profile.connections].filter(Boolean);
    if (meta.length) body.append(createProfileElement("p", "social-profile-meta", meta.join(" · ")));
  }

  if (profile.bio) body.append(createProfileElement("p", "social-profile-bio", profile.bio));

  if (profile.platform === "X") {
    const stats = [
      profile.following && `${profile.following} Following`,
      profile.followers && `${profile.followers} Followers`,
    ].filter(Boolean);
    if (stats.length) {
      const statsRow = createProfileElement("p", "social-profile-stats");
      stats.forEach((stat) => statsRow.append(createProfileElement("span", "", stat)));
      body.append(statsRow);
    }
  }

  if (profile.latestPost) {
    const post = createProfileElement("section", "social-profile-post");
    post.setAttribute("aria-label", `Most recent ${profile.platform} post`);
    const postLabel = profile.platform === "LinkedIn" ? "MOST RECENT POST" : "LATEST POST";
    post.append(
      createProfileElement("small", "", `${postLabel} · ${profile.latestPost.date}`),
      createProfileElement("p", "", profile.latestPost.text),
    );
    const metrics = [
      profile.latestPost.replies && `Reply ${profile.latestPost.replies}`,
      profile.latestPost.reposts && `Repost ${profile.latestPost.reposts}`,
      profile.latestPost.likes && `Like ${profile.latestPost.likes}`,
      profile.latestPost.views && `View ${profile.latestPost.views}`,
    ].filter(Boolean);
    if (metrics.length) {
      const metricsRow = createProfileElement("div", "social-profile-post-stats");
      metrics.forEach((metric) => metricsRow.append(createProfileElement("span", "", metric)));
      post.append(metricsRow);
    }
    body.append(post);
  }

  const profileButton = createProfileElement("a", "social-profile-button", `Open ${profile.platform} profile ↗`);
  profileButton.href = profile.url;
  profileButton.target = "_blank";
  profileButton.rel = "noopener noreferrer";
  profileButton.tabIndex = 0;
  body.append(profileButton);
  profilePreviewCard.append(banner, body);
}

function updateProfilePreviewPosition() {
  profilePositionFrame = undefined;
  if (!activeProfileTrigger || !activeProfileKey) return;
  const margin = 12;
  const gap = 12;
  const triggerBounds = activeProfileTrigger.getBoundingClientRect();
  const cardBounds = profilePreviewCard.getBoundingClientRect();
  const placement = triggerBounds.top - gap - margin >= cardBounds.height ? "above" : "below";
  const idealTop = placement === "above"
    ? triggerBounds.top - cardBounds.height - gap
    : triggerBounds.bottom + gap;
  const top = Math.max(margin, Math.min(idealTop, window.innerHeight - cardBounds.height - margin));
  const left = Math.max(margin, Math.min(triggerBounds.left, window.innerWidth - cardBounds.width - margin));

  profilePreviewCard.style.top = `${top}px`;
  profilePreviewCard.style.left = `${left}px`;
  profilePreviewCard.classList.toggle("is-above", placement === "above");
  profilePreviewCard.classList.toggle("is-below", placement === "below");
  profilePreviewCard.classList.add("is-visible");
  profilePreviewCard.classList.remove("is-closing");
  window.cancelAnimationFrame(profileOpenFrame);
  profileOpenFrame = window.requestAnimationFrame(() => {
    profileOpenFrame = window.requestAnimationFrame(() => profilePreviewCard.classList.add("is-open"));
  });
}

function requestProfilePreviewPosition() {
  if (!profilePositionFrame) profilePositionFrame = window.requestAnimationFrame(updateProfilePreviewPosition);
}

function clearProfileTimers() {
  window.clearTimeout(profileShowTimer);
  window.clearTimeout(profileCloseTimer);
}

function clearProfileAnimation() {
  window.clearTimeout(profileAnimationTimer);
  window.cancelAnimationFrame(profileOpenFrame);
}

function openProfilePreview(profileKey, trigger) {
  clearProfileTimers();
  clearProfileAnimation();
  if (activeProfileTrigger && activeProfileTrigger !== trigger) {
    activeProfileTrigger.setAttribute("aria-expanded", "false");
  }
  activeProfileKey = profileKey;
  activeProfileTrigger = trigger;
  renderProfilePreview(profileKey);
  trigger.setAttribute("aria-controls", profilePreviewCard.id);
  trigger.setAttribute("aria-expanded", "true");
  profilePreviewCard.setAttribute("aria-hidden", "false");
  requestProfilePreviewPosition();
}

function closeProfilePreview() {
  clearProfileTimers();
  clearProfileAnimation();
  activeProfileTrigger?.setAttribute("aria-expanded", "false");
  profilePreviewCard.classList.remove("is-open");
  profilePreviewCard.classList.add("is-closing");
  profilePreviewCard.setAttribute("aria-hidden", "true");
  profilePreviewCard.querySelector(".social-profile-button")?.setAttribute("tabindex", "-1");
  activeProfileKey = null;
  activeProfileTrigger = null;
  profileAnimationTimer = window.setTimeout(() => {
    profilePreviewCard.classList.remove("is-visible", "is-closing");
  }, PROFILE_PREVIEW_ANIMATION_DURATION);
}

function scheduleProfilePreviewClose() {
  window.clearTimeout(profileCloseTimer);
  profileCloseTimer = window.setTimeout(() => {
    const activeElement = document.activeElement;
    const focusIsInside = activeProfileTrigger?.contains(activeElement) || profilePreviewCard.contains(activeElement);
    if (profileCardHovered || hoveredProfileTriggers.has(activeProfileTrigger) || focusIsInside) return;
    closeProfilePreview();
  }, PROFILE_PREVIEW_CLOSE_DELAY);
}

function closePreviewIfFocusLeft() {
  window.setTimeout(() => {
    const activeElement = document.activeElement;
    if (activeProfileTrigger?.contains(activeElement) || profilePreviewCard.contains(activeElement)) return;
    closeProfilePreview();
  }, 0);
}

document.querySelectorAll("[data-social-profile]").forEach((row) => {
  const profileKey = row.dataset.socialProfile;
  const trigger = row.querySelector(".social-link");
  if (!socialProfiles[profileKey] || !trigger) return;
  let touchActivation = false;

  trigger.addEventListener("mouseenter", () => {
    hoveredProfileTriggers.add(trigger);
    clearProfileTimers();
    if (activeProfileKey === profileKey && activeProfileTrigger === trigger) return;
    profileShowTimer = window.setTimeout(
      () => openProfilePreview(profileKey, trigger),
      PROFILE_PREVIEW_DELAY,
    );
  });
  trigger.addEventListener("mouseleave", () => {
    hoveredProfileTriggers.delete(trigger);
    scheduleProfilePreviewClose();
  });
  trigger.addEventListener("focus", () => openProfilePreview(profileKey, trigger));
  trigger.addEventListener("blur", closePreviewIfFocusLeft);
  trigger.addEventListener("pointerdown", (event) => {
    touchActivation = event.pointerType === "touch" || event.pointerType === "pen";
  });
  trigger.addEventListener("click", (event) => {
    if (!touchActivation || (activeProfileKey === profileKey && activeProfileTrigger === trigger)) return;
    event.preventDefault();
    openProfilePreview(profileKey, trigger);
  });
});

profilePreviewCard.addEventListener("mouseenter", () => {
  profileCardHovered = true;
  clearProfileTimers();
});
profilePreviewCard.addEventListener("mouseleave", () => {
  profileCardHovered = false;
  scheduleProfilePreviewClose();
});
profilePreviewCard.addEventListener("focusin", clearProfileTimers);
profilePreviewCard.addEventListener("focusout", closePreviewIfFocusLeft);
scrollRoot?.addEventListener("scroll", requestProfilePreviewPosition, { passive: true });
window.addEventListener("resize", requestProfilePreviewPosition);
document.addEventListener("pointerdown", (event) => {
  if (!activeProfileKey) return;
  if (activeProfileTrigger?.contains(event.target) || profilePreviewCard.contains(event.target)) return;
  closeProfilePreview();
});
document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape" || !activeProfileKey) return;
  event.preventDefault();
  const trigger = activeProfileTrigger;
  trigger?.focus();
  closeProfilePreview();
});

menuButton?.addEventListener("click", () => {
  const isOpen = navigation?.classList.toggle("open") ?? false;
  menuButton.setAttribute("aria-expanded", String(isOpen));
});

let navigationFrame;

document.querySelectorAll('.site-header a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const sectionId = link.getAttribute("href")?.slice(1);
    const target = sectionId ? document.getElementById(sectionId) : null;
    if (!scrollRoot || !target) return;

    event.preventDefault();
    navigation.classList.remove("open");
    menuButton?.setAttribute("aria-expanded", "false");
    window.cancelAnimationFrame(navigationFrame);

    const start = scrollRoot.scrollTop;
    const distance = target.offsetTop - start;
    const duration = Math.min(1600, Math.max(900, Math.abs(distance) / 2.2));
    const startedAt = window.performance.now();

    window.history.pushState(null, "", `#${sectionId}`);
    const step = (timestamp) => {
      const progress = Math.min(1, (timestamp - startedAt) / duration);
      const eased = progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;
      scrollRoot.scrollTop = start + distance * eased;
      if (progress < 1) navigationFrame = window.requestAnimationFrame(step);
    };

    navigationFrame = window.requestAnimationFrame(step);
  });
});
