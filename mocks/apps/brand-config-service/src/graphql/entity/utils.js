function getEtld(hostname) {
  return hostname.split(".").slice(1).join(".");
}

module.exports = {
  getEtld,
};
