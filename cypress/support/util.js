module.exports.generateTestEmail = function() {
  const rand = Math.round(Math.random() * 1000);

  return `cypress_test${rand}@test.com`
}
