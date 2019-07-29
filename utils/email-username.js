module.exports = (email, maxLength = 32) => {
  return email
    .split('@').shift()
    .split('+').shift()
    .slice(0, maxLength)
}
